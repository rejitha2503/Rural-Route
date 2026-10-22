import React, { useState } from 'react';
import { Language, PassengerAccount } from '../types';
import { getTranslation } from '../i18n/translations';
import { X, User, Heart, Bell, Shield, LogOut, Check, MapPin } from 'lucide-react';

interface PassengerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  passenger: PassengerAccount | null;
  savedBusesCount: number;
  onLogout: () => void;
  onUpdateProfile: (updates: Partial<PassengerAccount>) => void;
  onNavigateToSaved: () => void;
  lang: Language;
}

export const PassengerProfileModal: React.FC<PassengerProfileModalProps> = ({
  isOpen,
  onClose,
  passenger,
  savedBusesCount,
  onLogout,
  onUpdateProfile,
  onNavigateToSaved,
  lang,
}) => {
  if (!isOpen || !passenger) return null;

  const t = getTranslation(lang);
  const [preferredCorridor, setPreferredCorridor] = useState(passenger.preferredCorridor || 'Kovilpatti ↔ Sankarankovil');
  const [appAlerts, setAppAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSavePreferences = () => {
    onUpdateProfile({
      preferredCorridor,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs overflow-y-auto">
      <div 
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 my-6 animate-in fade-in duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
              {passenger.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 id="profile-modal-title" className="text-base font-bold text-white leading-tight">
                {passenger.fullName}
              </h3>
              <p className="text-[11px] text-slate-300 font-medium">
                {passenger.displayPhone || passenger.phone}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Content */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateToSaved();
              }}
              className="bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 rounded-xl p-3 text-left transition cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-1">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                <span>{t.favorites}</span>
              </div>
              <div className="text-xl font-black text-slate-900">
                {savedBusesCount} {lang === 'ta' ? 'பேருந்துகள்' : 'Buses'}
              </div>
              <div className="text-[10px] text-emerald-700 font-bold mt-0.5">
                {lang === 'ta' ? 'காண கிளிக் செய்க →' : 'Click to view →'}
              </div>
            </button>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-1">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                <span>{lang === 'ta' ? 'பயணியர் நிலை' : 'Passenger Tier'}</span>
              </div>
              <div className="text-sm font-black text-slate-900 mt-1">
                {lang === 'ta' ? 'தினசரி பயணி' : 'Daily Commuter'}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Pilot Corridor
              </div>
            </div>
          </div>

          {/* Preferences Form */}
          <div className="border-t border-slate-100 pt-4 space-y-3">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {lang === 'ta' ? 'பயண விருப்பங்கள் & அறிவிப்புகள்:' : 'Travel Preferences & Alerts:'}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>{lang === 'ta' ? 'முதன்மை வழித்தடம்:' : 'Frequent Corridor:'}</span>
              </label>
              <select
                value={preferredCorridor}
                onChange={e => setPreferredCorridor(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden transition"
              >
                <option value="Kovilpatti ↔ Sankarankovil">Kovilpatti ↔ Sankarankovil</option>
                <option value="Kovilpatti ↔ Kalugumalai">Kovilpatti ↔ Kalugumalai</option>
                <option value="Kalugumalai ↔ Sankarankovil">Kalugumalai ↔ Sankarankovil</option>
                <option value="Kovilpatti ↔ Kayathar">Kovilpatti ↔ Kayathar</option>
              </select>
            </div>

            <div className="space-y-2 pt-1">
              <label className="flex items-center justify-between text-xs font-medium text-slate-700 cursor-pointer">
                <span className="flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-slate-400" />
                  <span>{lang === 'ta' ? 'தாமத அறிவிப்புகள் (In-App)' : 'Bus Delay & Disruption Alerts'}</span>
                </span>
                <input
                  type="checkbox"
                  checked={appAlerts}
                  onChange={e => setAppAlerts(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between text-xs font-medium text-slate-700 cursor-pointer">
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-slate-400" />
                  <span>{lang === 'ta' ? 'கால அட்டவணை மறுஆய்வு அறிவிப்பு' : 'Schedule Verification Alerts'}</span>
                </span>
                <input
                  type="checkbox"
                  checked={smsAlerts}
                  onChange={e => setSmsAlerts(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={handleSavePreferences}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5 mt-2"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{lang === 'ta' ? 'விருப்பங்கள் சேமிக்கப்பட்டன!' : 'Preferences Saved!'}</span>
                </>
              ) : (
                <span>{lang === 'ta' ? 'விருப்பங்களை சேமிக்க' : 'Save Preferences'}</span>
              )}
            </button>
          </div>

          {/* Sign Out Button */}
          <div className="border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold py-2 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5 border border-rose-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t.navLogout}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
