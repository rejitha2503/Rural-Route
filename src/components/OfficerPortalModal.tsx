import React, { useState } from 'react';
import { UserRole, Language, BusStop, Operator, DataSource, BusService, TripUpdate, UserProfile, AuditLog, PassengerReport } from '../types';
import { getTranslation } from '../i18n/translations';
import { StaffDashboard } from './StaffDashboard';
import { VerifierDashboard } from './VerifierDashboard';
import { AdminDashboard } from './AdminDashboard';
import { X, ShieldAlert, ArrowLeft, UserCheck, ShieldCheck, Database, Lock, LogOut, KeyRound, Building2 } from 'lucide-react';

interface OfficerPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  currentOfficer?: UserProfile | null;
  onRoleChange: (role: UserRole) => void;
  onLoginOfficer?: (role: UserRole, email: string, name: string, depot?: string) => void;
  onLogoutOfficer?: () => void;
  stops: BusStop[];
  operators: Operator[];
  sources: DataSource[];
  services: BusService[];
  tripUpdates: TripUpdate[];
  users: UserProfile[];
  auditLogs: AuditLog[];
  reports: PassengerReport[];
  onSubmitService: (service: Omit<BusService, 'id' | 'createdAt' | 'updatedAt' | 'verificationStatus'>) => void;
  onPublishTripUpdate: (update: Omit<TripUpdate, 'id' | 'reportedAt' | 'status' | 'adminReviewed'>) => void;
  onUpdateStatus: (serviceId: string, status: 'verified' | 'needs_reverification' | 'unverified', notes: string) => void;
  onUpdateUserRole: (userId: string, newRole: UserRole) => void;
  onResolveTripUpdate: (updateId: string) => void;
  onOpenSchemaModal: () => void;
  onResetSeedData: () => void;
  lang: Language;
}

export const OfficerPortalModal: React.FC<OfficerPortalModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  currentOfficer,
  onRoleChange,
  onLoginOfficer,
  onLogoutOfficer,
  stops,
  operators,
  sources,
  services,
  tripUpdates,
  users,
  auditLogs,
  reports,
  onSubmitService,
  onPublishTripUpdate,
  onUpdateStatus,
  onUpdateUserRole,
  onResolveTripUpdate,
  onOpenSchemaModal,
  onResetSeedData,
  lang,
}) => {
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('staff');
  const [authError, setAuthError] = useState<string | null>(null);

  if (!isOpen) return null;
  const t = getTranslation(lang);

  const isOfficerAuthenticated = currentRole !== 'passenger' && currentOfficer !== null;

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!emailInput.trim()) {
      setAuthError('Please enter an official departmental email.');
      return;
    }

    const defaultNames: Record<UserRole, string> = {
      staff: 'Station Staff (Kovilpatti)',
      verifier: 'Timetable Verifier (Regional)',
      admin: 'State Operations Admin',
      passenger: 'Passenger',
    };

    if (onLoginOfficer) {
      onLoginOfficer(selectedRole, emailInput.trim(), defaultNames[selectedRole]);
    } else {
      onRoleChange(selectedRole);
    }
  };

  const handleQuickDemoLogin = (role: UserRole, email: string, name: string, depot: string) => {
    setAuthError(null);
    if (onLoginOfficer) {
      onLoginOfficer(role, email, name, depot);
    } else {
      onRoleChange(role);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-2xs overflow-y-auto">
      <div 
        className="bg-slate-50 rounded-2xl max-w-5xl w-full shadow-2xl overflow-hidden border border-slate-200 my-6 animate-in fade-in duration-150 flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="portal-title"
      >
        {/* Top Header */}
        <div className="bg-slate-900 text-white px-5 sm:px-6 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 id="portal-title" className="text-sm sm:text-base font-bold text-white">
                {t.portalTitle}
              </h3>
              <p className="text-[11px] text-slate-300">
                TNSTC Staff, Verifier & Administrator Workflows
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition font-medium flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Passenger View</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-white transition cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Demo Security Disclaimer Banner */}
        <div className="bg-amber-50 border-b border-amber-200 px-5 py-2.5 text-xs text-amber-950 flex items-start gap-2 shrink-0">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="leading-snug">
            <strong>DEMO SIMULATION ONLY:</strong> Changes made here are saved in your browser session (localStorage) to test workflows. Real user authorization and immutable access control require connected Supabase Auth and Row Level Security.
          </div>
        </div>

        {/* Content: Auth Gate or Authenticated Officer Dashboard */}
        {!isOfficerAuthenticated ? (
          <div className="p-6 sm:p-8 overflow-y-auto max-w-xl mx-auto w-full space-y-6">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl mx-auto flex items-center justify-center shadow-xs">
                <Lock className="w-6 h-6 text-emerald-400" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mt-2">
                {t.officerLoginTitle}
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {t.officerLoginDesc}
              </p>
            </div>

            {authError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-xl">
                {authError}
              </div>
            )}

            {/* Quick 1-Click Demo Profiles */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-emerald-600" />
                <span>One-Click Demo Officer Access</span>
              </div>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('staff', 'staff.kovilpatti@ruralroute.tn.gov.in', 'K. Arumugam (Station Staff)', 'Kovilpatti Depot')}
                  className="w-full text-left bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-xl p-3 transition cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      <span>{t.quickFillStaff}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Can submit new bus services and authorized urgent delay alerts.
                    </div>
                  </div>
                  <span className="text-xs text-emerald-700 font-bold ml-2 shrink-0">Sign In →</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('verifier', 'verifier.desk@ruralroute.tn.gov.in', 'S. Ramanathan (Timetable Verifier)', 'Regional Desk')}
                  className="w-full text-left bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-xl p-3 transition cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                      <span>{t.quickFillVerifier}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Can review, approve, reject, or return timetable submissions.
                    </div>
                  </div>
                  <span className="text-xs text-emerald-700 font-bold ml-2 shrink-0">Sign In →</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('admin', 'admin@ruralroute.tn.gov.in', 'M. Sundaram (System Admin)', 'State Operations Desk')}
                  className="w-full text-left bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-xl p-3 transition cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                      <span>{t.quickFillAdmin}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Full access to user role management, published data, and audit records.
                    </div>
                  </div>
                  <span className="text-xs text-emerald-700 font-bold ml-2 shrink-0">Sign In →</span>
                </button>
              </div>
            </div>

            {/* Custom Departmental Credentials Form */}
            <form onSubmit={handleManualLogin} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Or Sign In with Official Credentials
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Department Role Target
                </label>
                <select
                  value={selectedRole}
                  onChange={e => setSelectedRole(e.target.value as UserRole)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                >
                  <option value="staff">Station Staff (பேருந்து நிலைய ஊழியர்)</option>
                  <option value="verifier">Timetable Verifier (அட்டவணை சரிபார்ப்பாளர்)</option>
                  <option value="admin">System Administrator (கணினி நிர்வாகி)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.officialEmail}
                </label>
                <input
                  type="email"
                  placeholder="officer@tnstc.gov.in"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.password}
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer"
              >
                {t.signInAsOfficer}
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* Authenticated Officer Session Bar */}
            <div className="bg-white border-b border-slate-200 px-5 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
                  {currentRole.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      {currentOfficer?.fullName || 'Officer'}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-900 text-white">
                      {currentRole === 'staff' ? t.roleStaff : currentRole === 'verifier' ? t.roleVerifier : t.roleAdmin}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <Building2 className="w-3 h-3 text-slate-400" />
                    <span>{currentOfficer?.depot || 'Kovilpatti Branch'}</span>
                    <span className="text-slate-300">•</span>
                    <span>{currentOfficer?.email}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Admin Role Switcher (Admin can test other roles) */}
                {currentOfficer?.role === 'admin' && (
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
                    <span className="text-[10px] font-semibold text-slate-500 px-1">Switch View:</span>
                    <button
                      type="button"
                      onClick={() => onRoleChange('staff')}
                      className={`px-2 py-1 rounded text-xs font-bold transition cursor-pointer ${currentRole === 'staff' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-600'}`}
                    >
                      Staff
                    </button>
                    <button
                      type="button"
                      onClick={() => onRoleChange('verifier')}
                      className={`px-2 py-1 rounded text-xs font-bold transition cursor-pointer ${currentRole === 'verifier' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-600'}`}
                    >
                      Verifier
                    </button>
                    <button
                      type="button"
                      onClick={() => onRoleChange('admin')}
                      className={`px-2 py-1 rounded text-xs font-bold transition cursor-pointer ${currentRole === 'admin' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-600'}`}
                    >
                      Admin
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (onLogoutOfficer) {
                      onLogoutOfficer();
                    } else {
                      onRoleChange('passenger');
                    }
                  }}
                  className="text-xs text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer"
                  title="Sign out of Officer Portal"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{t.logout}</span>
                </button>
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1">
              {currentRole === 'staff' && (
                <StaffDashboard
                  stops={stops}
                  operators={operators}
                  sources={sources}
                  services={services}
                  onSubmitService={onSubmitService}
                  onPublishTripUpdate={onPublishTripUpdate}
                  lang={lang}
                />
              )}

              {currentRole === 'verifier' && (
                <VerifierDashboard
                  services={services}
                  stops={stops}
                  operators={operators}
                  sources={sources}
                  onUpdateStatus={onUpdateStatus}
                  lang={lang}
                />
              )}

              {currentRole === 'admin' && (
                <AdminDashboard
                  users={users}
                  services={services}
                  tripUpdates={tripUpdates}
                  auditLogs={auditLogs}
                  reports={reports}
                  stops={stops}
                  onUpdateUserRole={onUpdateUserRole}
                  onResolveTripUpdate={onResolveTripUpdate}
                  onOpenSchemaModal={onOpenSchemaModal}
                  onResetSeedData={onResetSeedData}
                  lang={lang}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
