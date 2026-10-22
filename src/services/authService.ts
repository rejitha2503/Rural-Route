import { createClient, SupabaseClient, User, Session, AuthError } from '@supabase/supabase-js';
import { PassengerAccount } from '../types';
import { validateAndNormalizeIndianPhone } from '../utils/phoneValidation';

export interface AuthResponse {
  success: boolean;
  passenger?: PassengerAccount;
  requiresOtpVerification?: boolean;
  error?: string;
  errorTa?: string;
  errorCode?: string;
  setupGuide?: {
    title: string;
    steps: string[];
  };
}

export interface SupabaseConfigStatus {
  isConfigured: boolean;
  supabaseUrl?: string;
  hasAnonKey: boolean;
  messageEn: string;
  messageTa: string;
}

export type AuthStateListener = (passenger: PassengerAccount | null) => void;

class AuthService {
  private supabase: SupabaseClient | null = null;
  private isConfigured: boolean = false;
  private currentPassenger: PassengerAccount | null = null;
  private listeners: Set<AuthStateListener> = new Set();
  private isInitialized: boolean = false;

  constructor() {
    this.initSupabaseClient();
  }

  private initSupabaseClient() {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (url && anonKey && url.startsWith('http') && !url.includes('your-project') && !anonKey.includes('your-anon-key')) {
      try {
        this.supabase = createClient(url, anonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
          },
        });
        this.isConfigured = true;
        this.setupAuthListener();
      } catch (err) {
        console.error('Failed to initialize Supabase client:', err);
        this.supabase = null;
        this.isConfigured = false;
      }
    } else {
      this.supabase = null;
      this.isConfigured = false;
    }
  }

  private setupAuthListener() {
    if (!this.supabase) return;

    // Check initial session
    this.supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.warn('Supabase getSession notice:', error.message);
      }
      if (session?.user) {
        this.currentPassenger = this.mapUserToPassenger(session.user);
      } else {
        this.currentPassenger = null;
      }
      this.isInitialized = true;
      this.notifyListeners();
    }).catch(err => {
      console.warn('Error fetching initial session:', err);
      this.isInitialized = true;
    });

    // Subscribe to auth state changes
    this.supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        this.currentPassenger = this.mapUserToPassenger(session.user);
      } else {
        this.currentPassenger = null;
      }
      this.notifyListeners();
    });
  }

  private mapUserToPassenger(user: User): PassengerAccount {
    const email = user.email || '';
    const fullName = 
      user.user_metadata?.full_name || 
      user.user_metadata?.name || 
      (email ? email.split('@')[0] : 'Passenger');

    return {
      id: user.id,
      fullName,
      email,
      displayPhone: email || 'Passenger',
      preferredCorridor: user.user_metadata?.preferred_corridor || 'Kovilpatti ↔ Sankarankovil',
      createdAt: user.created_at,
      lastLoginAt: user.last_sign_in_at || user.created_at,
    };
  }

  public subscribe(listener: AuthStateListener): () => void {
    this.listeners.add(listener);
    // Emit immediate current state
    listener(this.currentPassenger);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    for (const listener of this.listeners) {
      try {
        listener(this.currentPassenger);
      } catch (err) {
        console.error('Error notifying auth listener:', err);
      }
    }
  }

  public getSupabaseStatus(): SupabaseConfigStatus {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (this.isConfigured && this.supabase) {
      return {
        isConfigured: true,
        supabaseUrl: url,
        hasAnonKey: !!anonKey,
        messageEn: `Connected to Supabase Project: ${url}`,
        messageTa: `Supabase திட்டத்துடன் இணைக்கப்பட்டுள்ளது: ${url}`,
      };
    }

    return {
      isConfigured: false,
      supabaseUrl: url,
      hasAnonKey: !!anonKey,
      messageEn: 'Supabase credentials are not configured in environment (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).',
      messageTa: 'Supabase சுற்றுச்சூழல் மாறிகள் இன்னும் கட்டமைக்கப்படவில்லை.',
    };
  }

  public getCurrentPassenger(): PassengerAccount | null {
    return this.currentPassenger;
  }

  /**
   * Register a new passenger with Full Name, Email, Password, and Confirm Password.
   * Calls genuine Supabase Auth: supabase.auth.signUp({ email, password, options: { data: { full_name } } })
   */
  async register(
    fullName: string,
    emailInput: string,
    password: string,
    confirmPassword: string
  ): Promise<AuthResponse> {
    // 1. Validate full name
    const cleanName = fullName.trim();
    if (!cleanName || cleanName.length < 2) {
      return {
        success: false,
        error: 'Please enter your full name (at least 2 characters).',
        errorTa: 'உங்கள் முழு பெயரை உள்ளிடவும் (குறைந்தது 2 எழுத்துகள்).',
      };
    }

    // 2. Validate email address
    const cleanEmail = emailInput.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return {
        success: false,
        error: 'Please enter a valid email address.',
        errorTa: 'சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும்.',
      };
    }

    // 3. Validate password length
    if (!password || password.length < 6) {
      return {
        success: false,
        error: 'Password must be at least 6 characters long.',
        errorTa: 'கடவுச்சொல் குறைந்தது 6 எழுத்துகள் கொண்டிருக்க வேண்டும்.',
      };
    }

    // 4. Validate password confirmation
    if (password !== confirmPassword) {
      return {
        success: false,
        error: 'Passwords do not match. Please verify and re-enter.',
        errorTa: 'கடவுச்சொற்கள் பொருந்தவில்லை. மீண்டும் சரிபார்க்கவும்.',
      };
    }

    // 5. Ensure Supabase client is initialized
    if (!this.supabase || !this.isConfigured) {
      return {
        success: false,
        error: 'Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.',
        errorTa: 'Supabase இணைப்பு இல்லை. சூழல் மாறிகளை சரிபார்க்கவும்.',
      };
    }

    try {
      // Real Supabase Auth signUp with email & password
      const { data, error } = await this.supabase.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          data: {
            full_name: cleanName,
            preferred_corridor: 'Kovilpatti ↔ Sankarankovil',
          },
        },
      });

      if (error) {
        return this.handleAuthError(error, 'register');
      }

      if (!data.user) {
        return {
          success: false,
          error: 'No user record returned from Supabase authentication.',
          errorTa: 'Supabase-லிருந்து பயனர் தகவல் பெறப்படவில்லை.',
        };
      }

      // 6. Attempt to synchronize with public.user_profiles table if provisioned
      try {
        await this.supabase.from('user_profiles').upsert({
          id: data.user.id,
          email: cleanEmail,
          full_name: cleanName,
          role: 'passenger',
          updated_at: new Date().toISOString(),
        });
      } catch (profileErr) {
        console.warn('Note: user_profiles table sync notice:', profileErr);
      }

      // Check if session was immediately created
      if (data.session) {
        const passenger = this.mapUserToPassenger(data.user);
        this.currentPassenger = passenger;
        this.notifyListeners();
        return {
          success: true,
          passenger,
        };
      } else {
        // Email verification required or immediate login success
        const passenger = this.mapUserToPassenger(data.user);
        this.currentPassenger = passenger;
        this.notifyListeners();
        return {
          success: true,
          passenger,
        };
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error during registration';
      return {
        success: false,
        error: `Registration request failed: ${message}`,
        errorTa: `பதிவு செய்வதில் பிழை ஏற்பட்டது: ${message}`,
      };
    }
  }

  /**
   * Sign In with Email and Password.
   * Calls genuine Supabase Auth: supabase.auth.signInWithPassword({ email, password })
   */
  async login(emailInput: string, password: string): Promise<AuthResponse> {
    const cleanEmail = emailInput.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return {
        success: false,
        error: 'Please enter a valid email address.',
        errorTa: 'சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும்.',
      };
    }

    if (!password) {
      return {
        success: false,
        error: 'Please enter your password.',
        errorTa: 'உங்கள் கடவுச்சொல்லை உள்ளிடவும்.',
      };
    }

    if (!this.supabase || !this.isConfigured) {
      return {
        success: false,
        error: 'Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
        errorTa: 'Supabase இணைப்பு இல்லை. சூழல் மாறிகளை சரிபார்க்கவும்.',
      };
    }

    try {
      // Real Supabase signInWithPassword
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      });

      if (error) {
        return this.handleAuthError(error, 'login');
      }

      if (!data.user) {
        return {
          success: false,
          error: 'No user session returned from Supabase.',
          errorTa: 'Supabase-லிருந்து அமர்வு பெறப்படவில்லை.',
        };
      }

      const passenger = this.mapUserToPassenger(data.user);
      this.currentPassenger = passenger;
      this.notifyListeners();

      return {
        success: true,
        passenger,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error during sign in';
      return {
        success: false,
        error: `Sign in failed: ${message}`,
        errorTa: `உள்நுழைவதில் பிழை: ${message}`,
      };
    }
  }

  /**
   * Log out active passenger session from Supabase.
   */
  async logout(): Promise<void> {
    if (this.supabase) {
      try {
        await this.supabase.auth.signOut();
      } catch (err) {
        console.warn('Error signing out of Supabase:', err);
      }
    }
    this.currentPassenger = null;
    this.notifyListeners();
  }

  /**
   * Update passenger profile (e.g. preferred corridor or full name)
   */
  async updateProfile(updates: Partial<PassengerAccount>): Promise<PassengerAccount | null> {
    if (!this.supabase || !this.currentPassenger) return null;

    try {
      const metaUpdates: Record<string, string> = {};
      if (updates.fullName) metaUpdates.full_name = updates.fullName;
      if (updates.preferredCorridor) metaUpdates.preferred_corridor = updates.preferredCorridor;

      const { data, error } = await this.supabase.auth.updateUser({
        data: metaUpdates,
      });

      if (error) {
        console.error('Failed to update Supabase user metadata:', error);
      } else if (data.user) {
        this.currentPassenger = this.mapUserToPassenger(data.user);
      }

      // Update public.user_profiles if table exists
      try {
        await this.supabase.from('user_profiles').update({
          full_name: updates.fullName || this.currentPassenger?.fullName,
          updated_at: new Date().toISOString(),
        }).eq('id', this.currentPassenger?.id);
      } catch (profileErr) {
        // Ignore if table not present
      }

      this.notifyListeners();
      return this.currentPassenger;
    } catch (err) {
      console.error('Error updating passenger profile:', err);
      return this.currentPassenger;
    }
  }

  /**
   * Map Supabase Auth errors into user-friendly English & Tamil messages,
   * with exact troubleshooting steps for Phone Auth.
   */
  private handleAuthError(error: AuthError, action: 'login' | 'register'): AuthResponse {
    const rawMsg = error.message || '';
    const code = (error as unknown as { code?: string }).code || '';

    // Case 1: Phone Provider Disabled in Supabase Dashboard
    if (
      code === 'phone_provider_disabled' ||
      rawMsg.toLowerCase().includes('phone signups are disabled') ||
      rawMsg.toLowerCase().includes('phone logins are disabled') ||
      rawMsg.toLowerCase().includes('unsupported phone provider')
    ) {
      return {
        success: false,
        errorCode: 'PHONE_PROVIDER_DISABLED',
        error: 'Phone Provider is disabled in your Supabase project. To enable phone & password authentication:',
        errorTa: 'உங்கள் Supabase திட்டத்தில் கைபேசி வழங்குநர் (Phone Provider) முடக்கப்பட்டுள்ளது. இதை இயக்க:',
        setupGuide: {
          title: 'Supabase Dashboard Configuration Required',
          steps: [
            '1. Open your Supabase Dashboard (https://supabase.com/dashboard/project/lkxndqtpzldhtelafbol)',
            '2. Navigate to Authentication -> Providers',
            '3. Click on "Phone" and toggle "Enable Phone provider" to ON',
            '4. Choose an SMS provider (Twilio / MessageBird / Vonage) OR if testing without SMS costs, toggle OFF "Enable phone confirmations" so phone+password accounts register immediately',
            '5. Click "Save"',
          ],
        },
      };
    }

    // Case 2: SMS Provider Not Configured
    if (
      rawMsg.toLowerCase().includes('sms provider') ||
      rawMsg.toLowerCase().includes('sms_send_failed')
    ) {
      return {
        success: false,
        errorCode: 'SMS_PROVIDER_NOT_CONFIGURED',
        error: 'Supabase requires an SMS provider (Twilio, MessageBird, etc.) or "Enable phone confirmations" should be toggled OFF in your Supabase Auth settings.',
        errorTa: 'Supabase-ல் SMS வழங்குநர் அமைக்கப்படவில்லை அல்லது "Phone confirmations" முடக்கப்பட வேண்டும்.',
        setupGuide: {
          title: 'SMS Provider Configuration',
          steps: [
            '1. In Supabase Dashboard -> Authentication -> Providers -> Phone',
            '2. If you do not have Twilio/MessageBird credentials, toggle OFF "Enable phone confirmations"',
            '3. Alternatively, supply your Twilio Account SID, Auth Token, and Message Service SID',
          ],
        },
      };
    }

    // Case 3: Invalid Credentials / Password
    if (
      code === 'invalid_credentials' ||
      code === 'invalid_grant' ||
      rawMsg.toLowerCase().includes('invalid login credentials') ||
      rawMsg.toLowerCase().includes('invalid grant')
    ) {
      return {
        success: false,
        errorCode: 'INVALID_CREDENTIALS',
        error: 'Incorrect phone number or password. Please check your credentials.',
        errorTa: 'தவறான கைபேசி எண் அல்லது கடவுச்சொல். சரிபார்த்து மீண்டும் முயற்சிக்கவும்.',
      };
    }

    // Case 4: User Already Exists
    if (
      code === 'user_already_exists' ||
      rawMsg.toLowerCase().includes('user already registered') ||
      rawMsg.toLowerCase().includes('already exists')
    ) {
      return {
        success: false,
        errorCode: 'USER_ALREADY_EXISTS',
        error: 'An account with this phone number already exists. Please Sign In instead.',
        errorTa: 'இந்த கைபேசி எண்ணில் ஏற்கனவே கணக்கு உள்ளது. உள்நுழையவும்.',
      };
    }

    // Case 5: Weak Password
    if (
      code === 'weak_password' ||
      rawMsg.toLowerCase().includes('weak') ||
      rawMsg.toLowerCase().includes('password should be at least')
    ) {
      return {
        success: false,
        errorCode: 'WEAK_PASSWORD',
        error: 'Password is too weak. Please enter at least 6 characters.',
        errorTa: 'கடவுச்சொல் போதுமான அளவு வலிமையாக இல்லை. குறைந்தது 6 எழுத்துகள் தேவை.',
      };
    }

    // Default error
    return {
      success: false,
      errorCode: code || 'AUTH_ERROR',
      error: `Supabase Auth Error: ${rawMsg}`,
      errorTa: `Supabase அங்கீகாரப் பிழை: ${rawMsg}`,
    };
  }
}

export const authService = new AuthService();
