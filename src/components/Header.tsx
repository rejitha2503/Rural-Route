import React from 'react';
import { Language, UserRole, PassengerNavTab, PassengerAccount } from '../types';
import { getTranslation } from '../i18n/translations';
import { 
  Bus, 
  Languages, 
  Info, 
  ShieldAlert, 
  KeyRound, 
  Wifi, 
  Search, 
  Route, 
  Heart, 
  HelpCircle, 
  User, 
  LogIn 
} from 'lucide-react';

interface HeaderProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  activeTab: PassengerNavTab;
  onTabChange: (tab: PassengerNavTab) => void;
  passenger: PassengerAccount | null;
  savedBusesCount: number;
  onOpenAuthModal: () => void;
  onOpenProfileModal: () => void;
  onOpenPortal: () => void;
  onOpenAboutModal: () => void;
  activeAlertCount: number;
  currentRole: UserRole;
  onReturnToPassenger: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onLanguageChange,
  activeTab,
  onTabChange,
  passenger,
  savedBusesCount,
  onOpenAuthModal,
  onOpenProfileModal,
  onOpenPortal,
  onOpenAboutModal,
  activeAlertCount,
  currentRole,
  onReturnToPassenger,
}) => {
  const t = getTranslation(lang);
  const isPortalMode = currentRole !== 'passenger';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
      {/* Top subtle pilot corridor notification */}
      <div className="bg-slate-50 border-b border-slate-100 px-4 py-1 text-xs text-slate-600 flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-2xl truncate">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
          <span className="font-semibold text-slate-800">{t.pilotAreaBadge}</span>
          <span className="hidden sm:inline text-slate-300">|</span>
          <span className="hidden sm:inline text-slate-500 truncate">
            {lang === 'ta' ? 'மாதிரி முன்னோடி தளம் — நேரங்களை நிலைய அலுவலரிடம் சரிபார்க்கவும்' : 'Illustrative Pilot Corridor — Confirm at bus stand'}
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0 text-[11px]">
          {activeAlertCount > 0 && (
            <span className="flex items-center gap-1 text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              <span>{activeAlertCount} {lang === 'ta' ? 'அறிவிப்பு' : 'Alert'}</span>
            </span>
          )}
          <span className="flex items-center gap-1 text-slate-500 font-medium hidden md:flex">
            <Wifi className="w-3 h-3 text-emerald-600" />
            <span>{t.cachedLabel}</span>
          </span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Brand */}
        <div 
          className="flex items-center gap-2.5 cursor-pointer select-none shrink-0" 
          onClick={() => {
            onReturnToPassenger();
            onTabChange('search');
          }}
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <Bus className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black tracking-tight text-slate-900 leading-tight">
                {t.appTitle}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded border border-emerald-200">
                Pilot
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium -mt-0.5 hidden xs:block">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Center Navigation Links (Passenger First) */}
        {!isPortalMode && (
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80 text-xs font-bold">

            <button
              type="button"
              onClick={() => onTabChange('search')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'search'
                  ? 'bg-white text-slate-900 shadow-2xs font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t.navHome}</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange('routes')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'routes'
                  ? 'bg-white text-slate-900 shadow-2xs font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Route className="w-3.5 h-3.5 text-blue-600" />
              <span>{t.navRoutes}</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange('saved')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'saved'
                  ? 'bg-white text-slate-900 shadow-2xs font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${savedBusesCount > 0 ? 'text-rose-500 fill-rose-500' : 'text-slate-400'}`} />
              <span>{t.navSaved}</span>
              {savedBusesCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {savedBusesCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => onTabChange('help')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'help'
                  ? 'bg-white text-slate-900 shadow-2xs font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>{t.navHelp}</span>
            </button>
          </nav>
        )}

        {/* Right Nav: Auth, Language, Discreet Staff Portal */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Active Portal Mode return */}
          {isPortalMode ? (
            <button
              type="button"
              onClick={onReturnToPassenger}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <span>← {lang === 'ta' ? 'பயணியர் தளம்' : 'Passenger View'}</span>
            </button>
          ) : (
            /* Passenger Auth: Login/SignUp or Profile button */
            passenger ? (
              <button
                type="button"
                onClick={onOpenProfileModal}
                className="flex items-center gap-2 bg-slate-50 hover:bg-emerald-50/80 border border-slate-200 hover:border-emerald-300 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-800 transition cursor-pointer shadow-2xs"
                title="View Passenger Profile & Saved Buses"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">
                  {passenger.fullName.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[100px] truncate hidden sm:inline">
                  {passenger.fullName.split(' ')[0]}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t.navLogin}</span>
              </button>
            )
          )}

          {/* Language Toggle */}
          <button
            type="button"
            onClick={() => onLanguageChange(lang === 'en' ? 'ta' : 'en')}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 transition cursor-pointer shadow-2xs"
            aria-label="Toggle language between English and Tamil"
          >
            <Languages className="w-3.5 h-3.5 text-emerald-600" />
            <span>{lang === 'en' ? 'TA • தமிழ்' : 'EN • English'}</span>
          </button>

          {/* Info Modal Button */}
          <button
            type="button"
            onClick={onOpenAboutModal}
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition cursor-pointer hidden xs:flex"
            title="Corridor details and data reliability policy"
            aria-label="Corridor information"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      {!isPortalMode && (
        <div className="md:hidden border-t border-slate-100 px-3 py-1.5 flex items-center justify-around bg-slate-50 text-xs font-bold">
          <button
            type="button"
            onClick={() => onTabChange('search')}
            className={`flex items-center gap-1 py-1 px-2.5 rounded-lg ${
              activeTab === 'search' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>{t.navHome}</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('routes')}
            className={`flex items-center gap-1 py-1 px-2.5 rounded-lg ${
              activeTab === 'routes' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600'
            }`}
          >
            <Route className="w-3.5 h-3.5" />
            <span>{t.navRoutes}</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('saved')}
            className={`flex items-center gap-1 py-1 px-2.5 rounded-lg ${
              activeTab === 'saved' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${savedBusesCount > 0 ? 'text-rose-500 fill-rose-500' : ''}`} />
            <span>{t.navSaved}</span>
            {savedBusesCount > 0 && (
              <span className="bg-rose-500 text-white text-[9px] px-1 rounded-full font-bold">
                {savedBusesCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onTabChange('help')}
            className={`flex items-center gap-1 py-1 px-2.5 rounded-lg ${
              activeTab === 'help' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{t.navHelp}</span>
          </button>
        </div>
      )}
    </header>
  );
};
