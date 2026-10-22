import React, { useState } from 'react';
import { Language, PassengerAccount } from '../types';
import { authService, AuthResponse } from '../services/authService';
import { 
  X, 
  Eye, 
  EyeOff, 
  Phone, 
  Lock, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Bus,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Settings,
  Mail
} from 'lucide-react';

interface PassengerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin?: (passenger: PassengerAccount) => void;
  onSuccess?: (passenger: PassengerAccount, isNewRegistration: boolean) => void;
  lang: Language;
}

type AuthViewMode = 'login' | 'register' | 'forgot_password';

export const PassengerAuthModal: React.FC<PassengerAuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  onSuccess,
  lang,
}) => {
  const [mode, setMode] = useState<AuthViewMode>('login');

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & error states
  const [errorMsg, setErrorMsg] = useState('');
  const [setupGuide, setSetupGuide] = useState<{ title: string; steps: string[] } | null>(null);
  const [showGuideDetails, setShowGuideDetails] = useState(true);
  const [successNotice, setSuccessNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const resetFormState = () => {
    setErrorMsg('');
    setSetupGuide(null);
    setSuccessNotice('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleModeSwitch = (newMode: AuthViewMode) => {
    setMode(newMode);
    resetFormState();
  };

  const handleSuccessResult = (passenger: PassengerAccount, isNewRegistration: boolean) => {
    if (onLogin) onLogin(passenger);
    if (onSuccess) onSuccess(passenger, isNewRegistration);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  // 1. Submit Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSetupGuide(null);
    setSuccessNotice('');
    setIsSubmitting(true);

    try {
      const res: AuthResponse = await authService.register(fullName, email, password, confirmPassword);
      if (res.success && res.passenger) {
        setSuccessNotice(
          lang === 'ta'
            ? `வணக்கம் ${res.passenger.fullName}! உங்கள் கணக்கு வெற்றிகரமாக உருவாக்கப்பட்டது.`
            : `Welcome ${res.passenger.fullName}! Your passenger account has been created via Supabase.`
        );
        handleSuccessResult(res.passenger, true);
      } else {
        setErrorMsg(lang === 'ta' ? (res.errorTa || res.error || '') : (res.error || ''));
        if (res.setupGuide) {
          setSetupGuide(res.setupGuide);
          setShowGuideDetails(true);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown registration error';
      setErrorMsg(
        lang === 'ta'
          ? `பதிவு செய்வதில் பிழை ஏற்பட்டது: ${message}`
          : `Registration failed: ${message}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Submit Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSetupGuide(null);
    setSuccessNotice('');
    setIsSubmitting(true);

    try {
      const res: AuthResponse = await authService.login(email, password);
      if (res.success && res.passenger) {
        setSuccessNotice(
          lang === 'ta'
            ? `மீண்டும் வருக, ${res.passenger.fullName}!`
            : `Welcome back, ${res.passenger.fullName}!`
        );
        handleSuccessResult(res.passenger, false);
      } else {
        setErrorMsg(lang === 'ta' ? (res.errorTa || res.error || '') : (res.error || ''));
        if (res.setupGuide) {
          setSetupGuide(res.setupGuide);
          setShowGuideDetails(true);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown login error';
      setErrorMsg(
        lang === 'ta'
          ? `உள்நுழைவதில் பிழை ஏற்பட்டது: ${message}`
          : `Sign in failed: ${message}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const supabaseStatus = authService.getSupabaseStatus();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 my-6 animate-in fade-in duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        {/* Top Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black">
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <h3 id="auth-modal-title" className="text-base font-bold text-white leading-tight">
                {mode === 'login' && (lang === 'ta' ? 'பயணியர் உள்நுழைவு' : 'Passenger Sign In')}
                {mode === 'register' && (lang === 'ta' ? 'புதிய பயணியர் கணக்கு' : 'Create Passenger Account')}
                {mode === 'forgot_password' && (lang === 'ta' ? 'கடவுச்சொல் உதவி' : 'Password Help')}
              </h3>
              <p className="text-[11px] text-slate-300">
                {lang === 'ta' ? 'தமிழ்நாடு பேருந்து தகவல் சேவை' : 'Tamil Nadu Bus Travel Service'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Supabase Connection & Privacy Banner */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-2.5 text-xs text-slate-600 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
              <span>Supabase Authentication</span>
              {supabaseStatus.isConfigured ? (
                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  Missing Config
                </span>
              )}
            </div>
            <div className="text-slate-500 text-[10px]">
              {lang === 'ta' 
                ? 'கடவுச்சொற்கள் Supabase Auth மூலம் பாதுகாப்பாக கையாளப்படுகின்றன. வெற்று உரையாக சேமிக்கப்படுவதில்லை.'
                : 'Secured via Supabase Auth with server-side bcrypt hashing. Plain-text passwords are never stored.'}
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {/* Feedback messages */}
          {errorMsg && (
            <div className="mb-4 bg-rose-50 border border-rose-200 rounded-2xl p-3 text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">{errorMsg}</div>
            </div>
          )}

          {/* Actionable Setup Guide if Phone Provider Needs Dashboard Activation */}
          {setupGuide && (
            <div className="mb-4 bg-amber-50 border border-amber-300 rounded-2xl p-3 text-xs text-amber-950">
              <div 
                className="flex items-center justify-between font-bold cursor-pointer select-none text-amber-900"
                onClick={() => setShowGuideDetails(!showGuideDetails)}
              >
                <div className="flex items-center gap-1.5">
                  <Settings className="w-4 h-4 text-amber-700" />
                  <span>{setupGuide.title}</span>
                </div>
                {showGuideDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>

              {showGuideDetails && (
                <div className="mt-2.5 pt-2 border-t border-amber-200/80 space-y-1.5 text-[11px] text-amber-900">
                  <p className="font-semibold text-slate-800">
                    To enable phone signups and logins in this project:
                  </p>
                  <ol className="list-none space-y-1 pl-1">
                    {setupGuide.steps.map((step, idx) => (
                      <li key={idx} className="leading-snug bg-white/70 p-1.5 rounded border border-amber-200">
                        {step}
                      </li>
                    ))}
                  </ol>
                  <div className="pt-1 text-[10px] text-amber-800 flex items-center justify-between">
                    <span>Project: <code>lkxndqtpzldhtelafbol</code></span>
                    <a 
                      href="https://supabase.com/dashboard/project/lkxndqtpzldhtelafbol/auth/providers" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
                    >
                      Supabase Dashboard <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {successNotice && (
            <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-xs text-emerald-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">{successNotice}</div>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODE 1: LOGIN                                           */}
          {/* ======================================================== */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Email Address Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>{lang === 'ta' ? 'மின்னஞ்சல் முகவரி' : 'Email Address'}</span>
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="passenger@example.com"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden transition"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{lang === 'ta' ? 'கடவுச்சொல்' : 'Password'}</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleModeSwitch('forgot_password')}
                    className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 transition cursor-pointer"
                  >
                    {lang === 'ta' ? 'கடவுச்சொல் மறந்துவிட்டதா?' : 'Forgot Password?'}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden transition"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Sign In Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-400 text-white font-bold py-3 rounded-xl text-xs transition shadow-sm hover:shadow flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                    <span>{lang === 'ta' ? 'உள்நுழைகிறது...' : 'Signing in with Supabase...'}</span>
                  </span>
                ) : (
                  <>
                    <span>{lang === 'ta' ? 'உள்நுழைக' : 'Sign In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Switch to Register */}
              <div className="pt-3 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-500">
                  {lang === 'ta' ? 'ரூரல்ரூட் கணக்கு இல்லையா?' : "Don't have an account yet?"}{' '}
                  <button
                    type="button"
                    onClick={() => handleModeSwitch('register')}
                    className="font-bold text-emerald-700 hover:text-emerald-800 transition cursor-pointer"
                  >
                    {lang === 'ta' ? 'புதிய கணக்கு தொடங்க' : 'Create Account'}
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* MODE 2: REGISTER                                         */}
          {/* ======================================================== */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'ta' ? 'முழு பெயர்' : 'Full Name'}
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder={lang === 'ta' ? 'எ.கா. அனிதா ராமநாதன்' : 'e.g. Anitha Ramanathan'}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden transition"
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>{lang === 'ta' ? 'மின்னஞ்சல் முகவரி' : 'Email Address'}</span>
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="passenger@example.com"
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden transition"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>{lang === 'ta' ? 'கடவுச்சொல்' : 'Password'}</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {lang === 'ta' ? 'குறைந்தது 6 எழுத்துகள்' : 'Min 6 characters'}
                  </span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-4 pr-10 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden transition"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'ta' ? 'கடவுச்சொல்லை உறுதிப்படுத்துக' : 'Confirm Password'}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-4 pr-10 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden transition"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-400 text-white font-bold py-3 rounded-xl text-xs transition shadow-sm hover:shadow flex items-center justify-center gap-2 cursor-pointer mt-3"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                    <span>{lang === 'ta' ? 'பதிவு செய்யப்படுகிறது...' : 'Creating Supabase Account...'}</span>
                  </span>
                ) : (
                  <>
                    <span>{lang === 'ta' ? 'கணக்கை உருவாக்குக' : 'Create Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Switch to Login */}
              <div className="pt-3 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-500">
                  {lang === 'ta' ? 'ஏற்கனவே கணக்கு உள்ளதா?' : 'Already have an account?'}{' '}
                  <button
                    type="button"
                    onClick={() => handleModeSwitch('login')}
                    className="font-bold text-emerald-700 hover:text-emerald-800 transition cursor-pointer"
                  >
                    {lang === 'ta' ? 'உள்நுழைக' : 'Sign In'}
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* MODE 3: FORGOT PASSWORD / HELP                           */}
          {/* ======================================================== */}
          {mode === 'forgot_password' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-700 space-y-2">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  <span>
                    {lang === 'ta' ? 'கடவுச்சொல் மீட்டமைப்பு முறைமை' : 'Password Recovery Procedure'}
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-600">
                  {lang === 'ta' 
                    ? 'Supabase Phone Authentication முறையில் கடவுச்சொல்லை மாற்ற SMS OTP சரிபார்ப்பு தேவைப்படுகிறது. உங்கள் திட்டத்தில் Twilio/SMS சேவை உள்ளமைக்கப்பட்டிருந்தால், கடவுச்சொல் மீட்டமைப்பு OTP உங்கள் கைபேசிக்கு அனுப்பப்படும்.'
                    : 'Supabase Phone Authentication uses SMS OTP verification for password resets. If an SMS provider (Twilio, MessageBird) is configured in your project, OTP codes can be dispatched to your phone.'}
                </p>
                <div className="pt-1 text-[11px] font-semibold text-emerald-800">
                  {lang === 'ta'
                    ? 'உதவிக்கு: புதிய கணக்கை உருவாக்கவும் அல்லது நிர்வாகியை தொடர்பு கொள்ளவும்.'
                    : 'For assistance during development, register a new phone number or update via the Supabase Dashboard.'}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleModeSwitch('login')}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
              >
                {lang === 'ta' ? '← உள்நுழைவுக்கு திரும்புக' : '← Return to Sign In'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
