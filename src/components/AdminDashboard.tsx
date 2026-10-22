import React, { useState } from 'react';
import { 
  UserProfile, 
  UserRole, 
  BusService, 
  TripUpdate, 
  AuditLog, 
  PassengerReport, 
  Language, 
  BusStop 
} from '../types';
import { getTranslation } from '../i18n/translations';
import { 
  ShieldCheck, 
  Users, 
  FileText, 
  ShieldAlert, 
  Activity, 
  RotateCcw, 
  Check, 
  Database 
} from 'lucide-react';

interface AdminDashboardProps {
  users: UserProfile[];
  services: BusService[];
  tripUpdates: TripUpdate[];
  auditLogs: AuditLog[];
  reports: PassengerReport[];
  stops: BusStop[];
  onUpdateUserRole: (userId: string, newRole: UserRole) => void;
  onResolveTripUpdate: (updateId: string) => void;
  onOpenSchemaModal: () => void;
  onResetSeedData: () => void;
  lang: Language;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  users,
  services,
  tripUpdates,
  auditLogs,
  reports,
  stops,
  onUpdateUserRole,
  onResolveTripUpdate,
  onOpenSchemaModal,
  onResetSeedData,
  lang,
}) => {
  const t = getTranslation(lang);
  const [activeSection, setActiveSection] = useState<'roles' | 'updates' | 'audit' | 'reports'>('roles');

  const getStopName = (id: string) => {
    const s = stops.find(item => item.id === id);
    return s ? (lang === 'ta' ? s.nameTa : s.nameEn) : id;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200">
            {lang === 'ta' ? 'நிர்வாக தளம்' : 'System Administration Portal'}
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            {t.adminTitle}
          </h2>
          <p className="text-xs text-slate-500">
            {lang === 'ta'
              ? 'பயனர் உரிமைகள் மேலாண்மை, தணிக்கை குறிப்புகள் (Audit Trail), மற்றும் அவசர எச்சரிக்கைகளின் தீர்வு.'
              : 'User role management, immutable audit trail records, and urgent disruption management.'
            }
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenSchemaModal}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Database className="w-3.5 h-3.5" />
            <span>{t.schemaViewer}</span>
          </button>

          <button
            type="button"
            onClick={onResetSeedData}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-2 rounded-lg text-xs border border-slate-300 transition flex items-center gap-1 cursor-pointer"
            title="Reset data back to initial seed state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveSection('roles')}
          className={`px-4 py-2 rounded-lg transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeSection === 'roles' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-purple-600" />
          <span>{t.roleManagement} ({users.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('updates')}
          className={`px-4 py-2 rounded-lg transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeSection === 'updates' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
          <span>{t.urgentAlerts} ({tripUpdates.filter(u => u.status === 'active').length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('reports')}
          className={`px-4 py-2 rounded-lg transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeSection === 'reports' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-blue-600" />
          <span>Passenger Reports ({reports.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('audit')}
          className={`px-4 py-2 rounded-lg transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeSection === 'audit' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-emerald-600" />
          <span>{t.auditLogs} ({auditLogs.length})</span>
        </button>
      </div>

      {/* Section 1: User Roles Management */}
      {activeSection === 'roles' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-600">
            {lang === 'ta'
              ? 'பயனர்களின் அதிகார நிலையை மாற்றவும். Supabase Row Level Security (RLS) மூலம் சர்வர் மட்டத்தில் விதிகள் அமல்படுத்தப்படுகின்றன.'
              : 'Manage permissions enforced by PostgreSQL Row Level Security (RLS). Changes immediately update permission policies.'
            }
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
            {users.map(u => (
              <div key={u.id} className="p-4 flex flex-wrap items-center justify-between gap-3 text-xs bg-white hover:bg-slate-50">
                <div>
                  <div className="font-bold text-slate-900 text-sm">
                    {u.fullName}
                  </div>
                  <div className="text-slate-500 font-mono text-[11px]">
                    {u.email} {u.depot ? `• Depot: ${u.depot}` : ''}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-slate-400 font-medium">Role:</span>
                  <select
                    value={u.role}
                    onChange={e => onUpdateUserRole(u.id, e.target.value as UserRole)}
                    className="bg-slate-100 border border-slate-300 rounded-lg p-1.5 font-bold text-xs text-slate-800 cursor-pointer"
                  >
                    <option value="passenger">Passenger</option>
                    <option value="staff">Staff Member</option>
                    <option value="verifier">Timetable Verifier</option>
                    <option value="admin">System Admin</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 2: Urgent Disruption Management */}
      {activeSection === 'updates' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-600">
            {lang === 'ta'
              ? 'ஊழியர்கள் வெளியிட்ட அவசர எச்சரிக்கைகளை மேற்பார்வையிட்டு, சேவை சீரானதும் "முடிந்தது" என குறிக்கவும்.'
              : 'Review urgent delay / cancellation alerts published by station staff. Mark as resolved once services resume normal schedule.'
            }
          </div>

          <div className="space-y-3">
            {tripUpdates.length > 0 ? (
              tripUpdates.map(upd => (
                <div key={upd.id} className="border border-slate-200 rounded-xl p-4 bg-white space-y-2 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        upd.status === 'active' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {upd.status}
                      </span>
                      <span className="font-bold text-slate-900">
                        {upd.updateType.toUpperCase()} {upd.delayMinutes ? `(+${upd.delayMinutes} mins)` : ''}
                      </span>
                    </div>

                    {upd.status === 'active' && (
                      <button
                        type="button"
                        onClick={() => onResolveTripUpdate(upd.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1 rounded text-xs transition cursor-pointer"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>

                  <div className="text-slate-800 font-medium">
                    {upd.reasonEn}
                  </div>

                  <div className="text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2">
                    <span>Published by {upd.publisherName} ({upd.source})</span>
                    <span>Reported: {new Date(upd.reportedAt).toLocaleString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                No active trip alerts.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Section 3: Passenger Reports */}
      {activeSection === 'reports' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-600">
            Crowdsourced feedback and missing bus inquiries submitted by passengers.
          </div>

          <div className="space-y-3">
            {reports.length > 0 ? (
              reports.map(rep => (
                <div key={rep.id} className="border border-slate-200 rounded-xl p-4 bg-white text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">
                      {rep.routeOrService} ({rep.reportType})
                    </span>
                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold">
                      {rep.status}
                    </span>
                  </div>
                  <p className="text-slate-700">{rep.details}</p>
                  <div className="text-[11px] text-slate-400">
                    From: {rep.userEmail || 'Anonymous Commuter'} • {new Date(rep.createdAt).toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                No passenger reports submitted yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Section 4: Audit Trail */}
      {activeSection === 'audit' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-600">
            Immutable system audit logs tracking timetable submissions, verifier decisions, and role alterations.
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <div className="bg-slate-100 p-3 font-bold text-slate-700 grid grid-cols-12 gap-2">
              <span className="col-span-3">Timestamp & Action</span>
              <span className="col-span-3">Actor & Role</span>
              <span className="col-span-6">Audit Details</span>
            </div>
            <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
              {auditLogs.map(log => (
                <div key={log.id} className="p-3 grid grid-cols-12 gap-2 hover:bg-slate-50 items-start">
                  <div className="col-span-3">
                    <div className="font-mono text-[10px] text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                    <span className="font-bold text-slate-900">
                      {log.action}
                    </span>
                  </div>

                  <div className="col-span-3">
                    <div className="font-semibold text-slate-800">{log.actorName}</div>
                    <span className="inline-block text-[10px] uppercase font-bold text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200">
                      {log.actorRole}
                    </span>
                  </div>

                  <div className="col-span-6 text-slate-600">
                    {log.details}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
