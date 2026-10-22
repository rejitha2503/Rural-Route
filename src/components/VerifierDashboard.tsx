import React, { useState } from 'react';
import { BusService, BusStop, Operator, DataSource, Language } from '../types';
import { getTranslation } from '../i18n/translations';
import { 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Clock, 
  FileCheck, 
  MapPin, 
  Calendar, 
  User, 
  AlertCircle 
} from 'lucide-react';

interface VerifierDashboardProps {
  services: BusService[];
  stops: BusStop[];
  operators: Operator[];
  sources: DataSource[];
  onUpdateStatus: (
    serviceId: string, 
    status: 'verified' | 'needs_reverification' | 'unverified',
    verifierNotes: string
  ) => void;
  lang: Language;
}

export const VerifierDashboard: React.FC<VerifierDashboardProps> = ({
  services,
  stops,
  operators,
  sources,
  onUpdateStatus,
  lang,
}) => {
  const t = getTranslation(lang);
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'needs_reverification'>('pending');
  const [activeNotes, setActiveNotes] = useState<Record<string, string>>({});

  const filteredServices = services.filter(s => {
    if (filter === 'pending') return s.verificationStatus === 'pending_verification';
    if (filter === 'verified') return s.verificationStatus === 'verified';
    if (filter === 'needs_reverification') return s.verificationStatus === 'needs_reverification';
    return true;
  });

  const getStopName = (id: string) => {
    const s = stops.find(item => item.id === id);
    return s ? (lang === 'ta' ? s.nameTa : s.nameEn) : id;
  };

  const getOperatorName = (id: string) => {
    const op = operators.find(o => o.id === id);
    return op ? (lang === 'ta' ? op.nameTa : op.name) : id;
  };

  const getSourceName = (id: string) => {
    const src = sources.find(s => s.id === id);
    return src ? `${src.name} (Trust: ${src.trustScore}/5)` : id;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
            {lang === 'ta' ? 'சரிபார்ப்பாளர் சரிபார்ப்பு தளம்' : 'Official Timetable Verification Authority'}
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            {t.pendingVerificationQueue}
          </h2>
          <p className="text-xs text-slate-500">
            {lang === 'ta'
              ? 'பணிமனை ஊழியர்கள் சமர்ப்பித்த அட்டவணைகளை ஆய்வு செய்து, கள ஆதாரங்களுடன் சரிபார்த்து பொதுப் பயணியர் தளத்தில் வெளியிடவும்.'
              : 'Review staff submissions against official depot timekeeper logs before publishing to public search.'
            }
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              filter === 'pending' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Pending ({services.filter(s => s.verificationStatus === 'pending_verification').length})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilter('verified')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              filter === 'verified' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verified</span>
          </button>
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              filter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>All ({services.length})</span>
          </button>
        </div>
      </div>

      {/* Services List */}
      <div className="space-y-4">
        {filteredServices.length > 0 ? (
          filteredServices.map(service => {
            const notes = activeNotes[service.id] ?? '';

            return (
              <div 
                key={service.id} 
                className={`border rounded-xl p-5 space-y-4 transition ${
                  service.verificationStatus === 'pending_verification' 
                    ? 'border-amber-300 bg-amber-50/20' 
                    : service.verificationStatus === 'verified'
                    ? 'border-emerald-200 bg-white'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                {/* Top Info */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded font-black text-sm bg-slate-900 text-white">
                      {service.serviceNumber}
                    </span>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">
                        {getOperatorName(service.operatorId)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {service.serviceType} • {service.viaSummaryEn}
                      </div>
                    </div>
                  </div>

                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                    service.verificationStatus === 'verified'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : service.verificationStatus === 'pending_verification'
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : 'bg-rose-100 text-rose-800 border-rose-300'
                  }`}>
                    {service.verificationStatus.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                {/* Corridor & stops sequence */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-slate-400 font-semibold block mb-1">Timing & Corridor:</span>
                    <div className="text-base font-black text-slate-900">
                      {service.departureTime} → {service.estimatedArrivalTime}
                    </div>
                    <div className="text-slate-600 mt-1">
                      {getStopName(service.originStopId)} → {getStopName(service.destinationStopId)}
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-slate-400 font-semibold block mb-1">Boarding & Source:</span>
                    <div className="font-bold text-slate-800">
                      {service.boardingBay || 'General Bay'}
                    </div>
                    <div className="text-slate-600 mt-1">
                      {getSourceName(service.sourceId)}
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-slate-400 font-semibold block mb-1">Submission Origin:</span>
                    <div className="font-bold text-slate-800 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{service.submittedBy || 'Station Staff'}</span>
                    </div>
                    <div className="text-slate-500 mt-1 text-[11px]">
                      Submitted: {new Date(service.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Submitter Notes */}
                {service.submissionNotes && (
                  <div className="bg-slate-100 p-2.5 rounded-lg text-xs text-slate-700">
                    <strong>Submitter Notes:</strong> {service.submissionNotes}
                  </div>
                )}

                {/* Stops breakdown */}
                <div className="text-xs">
                  <span className="font-bold text-slate-700">Sequence ({service.intermediateStops.length} stops): </span>
                  <span className="text-slate-600">
                    {service.intermediateStops.map(s => getStopName(s.stopId)).join(' → ')}
                  </span>
                </div>

                {/* Verifier Notes input & actions */}
                <div className="pt-2 border-t border-slate-200/80 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {lang === 'ta' ? 'சரிபார்ப்பாளர் தணிக்கைக் குறிப்பு (Verifier Audit Notes) *' : 'Verifier Audit Notes & Verification Basis:'}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Cross-checked with Kovilpatti TNSTC Depot register book, timing confirmed."
                      value={notes}
                      onChange={e => setActiveNotes({ ...activeNotes, [service.id]: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 font-medium"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(service.id, 'unverified', notes || 'Rejected due to mismatch with official timetable')}
                      className="px-3 py-2 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-300 transition flex items-center gap-1 cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>{t.rejectService}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onUpdateStatus(service.id, 'needs_reverification', notes || 'Returned for timetable stage re-check')}
                      className="px-3 py-2 rounded-lg text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 transition flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{t.returnService}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onUpdateStatus(service.id, 'verified', notes || 'Verified against official station master board')}
                      className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t.approveService}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs">
            {lang === 'ta' ? 'வரிசையில் சரிபார்க்க வேண்டிய அட்டவணைகள் இல்லை.' : 'No services in this queue.'}
          </div>
        )}
      </div>
    </div>
  );
};
