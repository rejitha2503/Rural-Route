import { Language } from '../types';

export const TRANSLATIONS = {
  en: {
    appTitle: 'RuralRoute',
    appSubtitle: 'Tamil Nadu Rural Bus Transit',
    pilotAreaBadge: 'Pilot Corridor: Kovilpatti ↔ Sankarankovil',
    pilotDisclaimer: 'Pilot Demo: Timetables and boarding points shown are illustrative sample records. Confirm at the bus stand timekeeper before traveling.',
    
    // Header navigation
    navHome: 'Home',
    navRoutes: 'Bus Routes',
    navSaved: 'Saved Buses',
    navHelp: 'Help & Policy',
    navLogin: 'Sign In',
    navSignUp: 'Sign Up',
    navProfile: 'My Account',
    navLogout: 'Sign Out',
    navStaffLogin: 'Staff Login',
    
    // Hero Section
    heroTitle: 'Your Bus Journey, Made Simple',
    heroSubtitle: 'Find bus timings, routes and verified boarding information for your journey.',
    
    // Search Panel
    searchPanelTitle: 'Search Bus Timetables',
    searchTitle: 'Find Bus Timetables',
    searchSubtitle: 'Check departure times, intermediate stops and boarding bays.',
    fromStop: 'From Location',
    toStop: 'To Location',
    travelDate: 'Travel Date',
    searchBuses: 'Search Buses',
    swapStops: 'Swap locations',
    quickRoutes: 'Popular Corridor Routes:',
    allStops: 'All Corridor Stops',
    
    // Platform & Boarding
    boardingBay: 'Boarding Bay / Platform',
    platformNotConfirmed: 'Platform not confirmed',
    boardingPoint: 'Boarding Point',
    
    // Status Badges
    statusVerified: 'Verified Schedule',
    statusPending: 'Pending Review',
    statusNeedsReverification: 'Expired • Re-verification Required',
    statusExpired: 'Expired Schedule',
    statusUnverified: 'Sample Schedule • Not Verified',
    sampleDataNotice: 'Sample / Unverified Data',
    
    // Results
    directServicesTab: 'Direct Buses',
    connectingJourneysTab: '1-Transfer Connections',
    servicesFound: 'services found',
    connectionsFound: 'connecting options found',
    noDirectFound: 'No direct bus services recorded for this corridor on this date.',
    noConnectingFound: 'No connecting routes found between these stops.',
    unavailableNoticeTitle: 'Verified Bus Information Unavailable',
    unavailableNoticeDesc: 'We do not invent schedules. If a bus service has not been physically audited or confirmed with depot authorities, it is excluded to protect passengers.',
    reportMissingBtn: 'Report Missing or Changed Timetable',
    
    // Card info
    departure: 'Departs',
    arrival: 'Arrives',
    serviceDays: 'Runs on',
    source: 'Information Source',
    lastVerified: 'Last Reviewed',
    verifiedBy: 'Reviewer',
    validUntil: 'Valid Until',
    viewDetails: 'Full Route & Stops',
    indicativeConnectionWarning: 'Sample connecting calculation based on stage arrival. Connecting bus availability depends on running conditions — not guaranteed.',
    transferAt: 'Transfer At',
    waitingTime: 'Est. Transfer Wait',
    totalDuration: 'Total Journey Time',
    
    // Alerts
    urgentAlerts: 'Corridor Disruption Alerts',
    delayNotice: 'Reported Delay',
    cancellationNotice: 'Service Cancelled',
    reportedAt: 'Reported',
    
    // Auth Modal
    authTitleSignIn: 'Sign In to RuralRoute',
    authTitleSignUp: 'Create Your Account',
    authSubtitle: 'Save your daily routes, track preferred buses, and report schedule updates.',
    email: 'Email Address',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    fullName: 'Full Name',
    forgotPassword: 'Forgot Password?',
    sendResetLink: 'Send Reset Instructions',
    alreadyAccount: 'Already have an account? Sign In',
    dontHaveAccount: "Don't have an account? Sign Up",
    guestContinue: 'Continue searching without signing in',
    passwordMatchError: 'Passwords do not match.',
    authDemoNotice: 'Demo Mode: User accounts and sessions are saved locally in your browser. Real production authentication will connect to Supabase Auth.',
    loggedInAs: 'Logged in as',
    
    // Navigation & Portals
    officerPortalBtn: 'Staff Portal',
    portalTitle: 'Staff & Timetable Management (Demo Mode)',
    portalDisclaimer: 'DEMO SIMULATION ONLY: Changes are saved in local browser storage. No Supabase Auth or server-side security is currently active.',
    backendStatus: 'Backend Storage',
    backendLocal: 'Local Demo Cache (Supabase Not Connected)',
    backendConnected: 'Connected to Supabase PostgreSQL',
    devSettings: 'Developer & Supabase Settings',
    
    // Roles
    rolePassenger: 'Passenger',
    roleStaff: 'Station Staff',
    roleVerifier: 'Timetable Verifier',
    roleAdmin: 'System Admin',
    
    // Actions
    viewMap: 'Corridor Map',
    recentSearches: 'Recent Searches',
    cachedLabel: 'Offline Cached',
    favorites: 'Saved Buses',
    noFavorites: 'No saved bus routes. Click the heart icon on any bus card to save it.',
    reportSuccess: 'Thank you! Your report has been submitted to the review queue.',
    
    // Staff & Verifier & Admin
    staffTitle: 'Staff Timetable Submission & Disruption Alerts',
    submitService: 'Submit Bus Timetable',
    postUrgentAlert: 'Post Delay / Cancellation Alert',
    pendingVerificationQueue: 'Pending Timetable Submissions',
    approveService: 'Approve & Publish',
    rejectService: 'Reject',
    returnService: 'Return for Correction',
    adminTitle: 'Administrative Management & Audit Trail',
    auditLogs: 'Audit History',
    roleManagement: 'User Roles & Access (Demo)',
    schemaViewer: 'PostgreSQL Schema & Security',
    officerLoginTitle: 'Staff & Officer Portal Access',
    officerLoginDesc: 'Sign in with official credentials or demo one-click profiles to manage corridor timetables and alerts.',
    quickFillStaff: 'Station Staff Demo Sign-In',
    quickFillVerifier: 'Timetable Verifier Demo Sign-In',
    quickFillAdmin: 'System Administrator Demo Sign-In',
    officialEmail: 'Official Email Address',
    signInAsOfficer: 'Sign In as Officer',
    logout: 'Sign Out',
    
    // General
    close: 'Close',
    save: 'Save',
    cancel: 'Cancel',
    loading: 'Loading schedules...',
  },
  ta: {
    appTitle: 'ரூரல்ரூட் (RuralRoute)',
    appSubtitle: 'தமிழ்நாடு கிராமப்புற பேருந்து தகவல்',
    pilotAreaBadge: 'முன்னோடி வழித்தடம்: கோவில்பட்டி ↔ சங்கரன்கோவில்',
    pilotDisclaimer: 'முன்னோடி மாதிரி தளம்: இங்கு காட்டப்பட்டுள்ள நேரங்கள் மாதிரி விவரங்கள் மட்டுமே. பயணத்திற்கு முன் பேருந்து நிலைய அலுவலகத்தில் உறுதி செய்யவும்.',
    
    // Header navigation
    navHome: 'முகப்பு',
    navRoutes: 'வழித்தடங்கள்',
    navSaved: 'சேமிக்கப்பட்டவை',
    navHelp: 'உதவி & கொள்கை',
    navLogin: 'உள்நுழைக',
    navSignUp: 'பதிவு செய்க',
    navProfile: 'எனது கணக்கு',
    navLogout: 'வெளியேறு',
    navStaffLogin: 'ஊழியர் உள்நுழைவு',
    
    // Hero Section
    heroTitle: 'உங்கள் பேருந்து பயணம் இனி எளிது',
    heroSubtitle: 'பேருந்து புறப்படும் நேரம், வழித்தடம் மற்றும் ஏறும் நடைமேடை தகவல்களை எளிதாக அறியுங்கள்.',
    
    // Search Panel
    searchPanelTitle: 'பேருந்து நேரங்களைத் தேடுக',
    searchTitle: 'பேருந்து நேரங்களைத் தேடுக',
    searchSubtitle: 'புறப்படும் நேரம், வழித்தட நிறுத்தங்கள் மற்றும் ஏறும் நடைமேடை தகவல்கள்.',
    fromStop: 'புறப்படும் இடம் (From)',
    toStop: 'சென்றடையும் இடம் (To)',
    travelDate: 'பயண தேதி',
    searchBuses: 'பேருந்துகளைத் தேடுக',
    swapStops: 'இடங்களை மாற்றுக',
    quickRoutes: 'முக்கிய வழித்தடங்கள்:',
    allStops: 'அனைத்து பேருந்து நிறுத்தங்கள்',
    
    // Platform & Boarding
    boardingBay: 'பேருந்து ஏறும் இடம் / நடைமேடை',
    platformNotConfirmed: 'நடைமேடை உறுதிசெய்யப்படவில்லை',
    boardingPoint: 'ஏறும் இடம்',
    
    // Status Badges
    statusVerified: 'உறுதிசெய்யப்பட்ட கால அட்டவணை',
    statusPending: 'சரிபார்ப்பு நிலுவையில் உள்ளது',
    statusNeedsReverification: 'காலாவதியானது • மறு ஆய்வு தேவை',
    statusExpired: 'காலாவதியான அட்டவணை',
    statusUnverified: 'மாதிரி அட்டவணை • சரிபார்க்கப்படாதது',
    sampleDataNotice: 'மாதிரி / சரிபார்க்கப்படாத தகவல்',
    
    // Results
    directServicesTab: 'நேரடி பேருந்துகள்',
    connectingJourneysTab: 'இணைப்புப் பேருந்துகள் (1 மாற்று நிறுத்தம்)',
    servicesFound: 'பேருந்துகள் உள்ளன',
    connectionsFound: 'இணைப்பு வழிகள் உள்ளன',
    noDirectFound: 'இந்த வழித்தடத்தில் நேரடிப் பேருந்து விவரம் இல்லை.',
    noConnectingFound: 'சரிபார்க்கப்பட்ட இணைப்புப் பேருந்து வழிகள் கிடைக்கவில்லை.',
    unavailableNoticeTitle: 'உறுதிசெய்யப்பட்ட பேருந்து தகவல் இல்லை',
    unavailableNoticeDesc: 'நாங்கள் உத்தேச நேரங்களை உருவாக்குவதில்லை. பணிமனை அல்லது காலக்காப்பாளர் பதிவேட்டில் உறுதிசெய்யப்படாத தகவல்கள் பயணியர் நலன் கருதி தவிர்க்கப்பட்டுள்ளன.',
    reportMissingBtn: 'விடுபட்ட / மாறிய நேரத்தைப் பதிவு செய்க',
    
    // Card info
    departure: 'புறப்பாடு',
    arrival: 'சென்றடையும் நேரம்',
    serviceDays: 'இயங்கும் நாட்கள்',
    source: 'தகவல் ஆதாரம்',
    lastVerified: 'கடைசியாக ஆய்வு செய்யப்பட்டது',
    verifiedBy: 'ஆய்வு செய்தவர்',
    validUntil: 'செல்லுபடியாகும் காலம்',
    viewDetails: 'முழு வழித்தட நிறுத்தம் காண்க',
    indicativeConnectionWarning: 'இணைப்புப் பேருந்து தகவல் மாதிரி வருகை நேரத்தின் அடிப்படையிலானது. பேருந்து இயக்கம் தாமதமாக வாய்ப்புள்ளதால் உத்தரவாதம் இல்லை.',
    transferAt: 'பேருந்து மாறும் இடம்',
    waitingTime: 'காத்திருக்கும் நேரம்',
    totalDuration: 'மொத்த பயண நேரம்',
    
    // Alerts
    urgentAlerts: 'வழித்தட அவசர அறிவிப்புகள்',
    delayNotice: 'பேருந்து தாமத அறிவிப்பு',
    cancellationNotice: 'பேருந்து ரத்து அறிவிப்பு',
    reportedAt: 'அறிவிக்கப்பட்ட நேரம்',
    
    // Auth Modal
    authTitleSignIn: 'ரூரல்ரூட் கணக்கில் உள்நுழைக',
    authTitleSignUp: 'புதிய பயணியர் கணக்கு தொடங்க',
    authSubtitle: 'தினசரி பேருந்துகளை சேமிக்கவும், முக்கிய வழித்தடங்களை கண்காணிக்கவும்.',
    email: 'மின்னஞ்சல் முகவரி',
    password: 'கடவுச்சொல்',
    confirmPassword: 'கடவுச்சொல்லை உறுதி செய்க',
    fullName: 'முழு பெயர்',
    forgotPassword: 'கடவுச்சொல் மறந்துவிட்டதா?',
    sendResetLink: 'மீட்டமைப்பு வழிமுறைகளை அனுப்புக',
    alreadyAccount: 'ஏற்கனவே கணக்கு உள்ளதா? உள்நுழைக',
    dontHaveAccount: 'கணக்கு இல்லையா? புதிய கணக்கு தொடங்க',
    guestContinue: 'உள்நுழையாமல் பேருந்துகளைத் தேட தொடரவும்',
    passwordMatchError: 'கடவுச்சொற்கள் பொருந்தவில்லை.',
    authDemoNotice: 'டெமோ பயன்பாடு: உங்கள் கணக்கு விவரங்கள் உலாவியில் மட்டுமே சேமிக்கப்படும்.',
    loggedInAs: 'உள்நுழைந்துள்ள பயனர்:',
    
    // Navigation & Portals
    officerPortalBtn: 'ஊழியர் தளம்',
    portalTitle: 'பணிமனை ஊழியர் & சரிபார்ப்பாளர் தளம் (டெமோ)',
    portalDisclaimer: 'டெமோ பயன்பாடு மட்டுமே: மாற்றங்கள் உங்கள் உலாவியில் மட்டுமே சேமிக்கப்படும் (Local Storage). சர்வர் பாதுகாப்பு இன்னும் அமல்படுத்தப்படவில்லை.',
    backendStatus: 'சேமிப்பக நிலை',
    backendLocal: 'உள்ளூர் டெமோ சேமிப்பகம் (Supabase இணைக்கப்படவில்லை)',
    backendConnected: 'Supabase PostgreSQL இணைக்கப்பட்டுள்ளது',
    devSettings: 'டெவலப்பர் & Supabase அமைப்புகள்',
    
    // Roles
    rolePassenger: 'பயணியர்',
    roleStaff: 'பணிமனை ஊழியர்',
    roleVerifier: 'சரிபார்ப்பாளர்',
    roleAdmin: 'நிர்வாகி',
    
    // Actions
    viewMap: 'வரைபடம்',
    recentSearches: 'சமீபத்திய தேடல்கள்',
    cachedLabel: 'சேமிக்கப்பட்ட தரவு (ஆஃப்லைன்)',
    favorites: 'விருப்பப் பேருந்துகள்',
    noFavorites: 'சேமிக்கப்பட்ட பேருந்துகள் இல்லை.',
    reportSuccess: 'நன்றி! உங்கள் தகவல் சரிபார்ப்பு வரிசைக்கு அனுப்பப்பட்டுள்ளது.',
    
    // Staff & Verifier & Admin
    staffTitle: 'ஊழியர் படிவம்: பேருந்து அட்டவணை சமர்ப்பிப்பு & தாமத எச்சரிக்கை',
    submitService: 'புதிய பேருந்து சேர்க்க',
    postUrgentAlert: 'தாமதம் / ரத்து அறிவிக்க',
    pendingVerificationQueue: 'சரிபார்ப்புக்காக காத்திருக்கும் பேருந்துகள்',
    approveService: 'ஒப்புதல் அளித்து வெளியிடு',
    rejectService: 'நிராகரி',
    returnService: 'திருத்தத்திற்கு திருப்பி அனுப்பு',
    adminTitle: 'நிர்வாக தளம் & தணிக்கை குறிப்பேடு (Audit Logs)',
    auditLogs: 'தணிக்கை வரலாறு',
    roleManagement: 'பயனர் உரிமைகள் மேலாண்மை',
    schemaViewer: 'Supabase SQL ஸ்கீமா',
    officerLoginTitle: 'ஊழியர் & அதிகாரி தளம்',
    officerLoginDesc: 'அதிகாரப்பூர்வ மின்னஞ்சல் அல்லது டெமோ கணக்கு மூலம் உள்நுழைக.',
    quickFillStaff: 'பணிமனை ஊழியர் டெமோ',
    quickFillVerifier: 'கால அட்டவணை சரிபார்ப்பாளர் டெமோ',
    quickFillAdmin: 'கணினி நிர்வாகி டெமோ',
    officialEmail: 'அதிகாரப்பூர்வ மின்னஞ்சல்',
    signInAsOfficer: 'அதிகாரியாக உள்நுழைக',
    logout: 'வெளியேறு',
    
    // General
    close: 'மூடுக',
    save: 'சேமி',
    cancel: 'ரத்து செய்',
    loading: 'பேருந்து விவரங்கள் ஏற்றப்படுகின்றன...',
  }
};

export function getTranslation(lang: Language) {
  return TRANSLATIONS[lang] || TRANSLATIONS.en;
}
