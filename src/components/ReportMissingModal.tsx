import React, { useState } from 'react';
import { Language, PassengerReport } from '../types';
import { getTranslation } from '../i18n/translations';
import { X, Send, AlertCircle, CheckCircle } from 'lucide-react';

interface ReportMissingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (report: Omit<PassengerReport, 'id' | 'createdAt' | 'status'>) => void;
  lang: Language;
}

export const ReportMissingModal: React.FC<ReportMissingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  lang,
}) => {
  if (!isOpen) return null;

  const t = getTranslation(lang);
  const [routeOrService, setRouteOrService] = useState('');
  const [reportType, setReportType] = useState<PassengerReport['reportType']>('missing_bus');
  const [details, setDetails] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!routeOrService || !details) return;

    onSubmit({
      routeOrService,
      reportType,
      details,
      userEmail: userEmail || undefined,
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-modal-title"
      >
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-emerald-400" />
            <h3 id="report-modal-title" className="text-sm font-bold text-white">
              {lang === 'ta' ? 'விடுபட்ட / தவறான பேருந்து தகவல் பதிவு' : 'Report Missing / Incorrect Bus Info'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            aria-label={t.close}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">
              {t.reportSuccess}
            </h4>
            <p className="text-xs text-slate-500">
              {lang === 'ta' 
                ? 'எங்கள் கள சரிபார்ப்பாளர்கள் இந்த தகவலை பரிசீலித்து உரிய ஆதாரங்களுடன் பதிவு செய்வார்கள்.'
                : 'Our depot verifiers will cross-check this information against official station logs.'
              }
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
              {lang === 'ta'
                ? 'பயணியர் நலன் கருதி நாங்கள் உத்தேச தகவல்களை காட்டுவதில்லை. உங்கள் தகவல்கள் சரிபார்ப்பாளரால் பரிசோதிக்கப்பட்டு மட்டுமே பதிவேற்றப்படும்.'
                : 'We prioritize reliable information. Passenger submissions are forwarded to the Verifier Queue and will not be displayed until verified.'
              }
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'ta' ? 'வழித்தடம் அல்லது பேருந்து எண் *' : 'Route or Bus Service Number *'}
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Kovilpatti to Sankarankovil 07:15 AM bus"
                value={routeOrService}
                onChange={e => setRouteOrService(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'ta' ? 'அறிக்கை வகை' : 'Report Type'}
              </label>
              <select
                value={reportType}
                onChange={e => setReportType(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-semibold"
              >
                <option value="missing_bus">Missing Bus Service in Schedule</option>
                <option value="wrong_timing">Incorrect Departure / Arrival Time</option>
                <option value="boarding_point_change">Changed Boarding Bay / Stop</option>
                <option value="cancelled_without_notice">Cancelled Without Notice</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'ta' ? 'விவரங்கள் *' : 'Details / What did you observe? *'}
              </label>
              <textarea
                required
                rows={3}
                placeholder="Please describe timing, boarding point, or stage details..."
                value={details}
                onChange={e => setDetails(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'ta' ? 'உங்கள் மின்னஞ்சல் (விரும்பினால்)' : 'Your Email (Optional, for verification updates)'}
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                value={userEmail}
                onChange={e => setUserEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit to Verifiers</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
