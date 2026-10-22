import React, { useState } from 'react';
import { 
  BusStop, 
  Operator, 
  DataSource, 
  BusService, 
  TripUpdate, 
  Language, 
  IntermediateStop 
} from '../types';
import { getTranslation } from '../i18n/translations';
import { 
  PlusCircle, 
  ShieldAlert, 
  Clock, 
  Send, 
  Plus, 
  Trash2, 
  CheckCircle, 
  AlertCircle 
} from 'lucide-react';

interface StaffDashboardProps {
  stops: BusStop[];
  operators: Operator[];
  sources: DataSource[];
  services: BusService[];
  onSubmitService: (service: Omit<BusService, 'id' | 'createdAt' | 'updatedAt' | 'verificationStatus'>) => void;
  onPublishTripUpdate: (update: Omit<TripUpdate, 'id' | 'reportedAt' | 'status' | 'adminReviewed'>) => void;
  lang: Language;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({
  stops,
  operators,
  sources,
  services,
  onSubmitService,
  onPublishTripUpdate,
  lang,
}) => {
  const t = getTranslation(lang);
  const [subTab, setSubTab] = useState<'submit' | 'alert'>('submit');

  // New Service Form State
  const [serviceNumber, setServiceNumber] = useState('');
  const [routeNumber, setRouteNumber] = useState('');
  const [operatorId, setOperatorId] = useState(operators[0]?.id || '');
  const [originStopId, setOriginStopId] = useState(stops[0]?.id || '');
  const [destinationStopId, setDestinationStopId] = useState(stops[1]?.id || '');
  const [viaSummaryEn, setViaSummaryEn] = useState('via Kalugumalai, Kuruvikulam');
  const [viaSummaryTa, setViaSummaryTa] = useState('வழியாக: கழுகுமலை, குருவிகுளம்');
  const [serviceType, setServiceType] = useState<BusService['serviceType']>('Ordinary');
  const [departureTime, setDepartureTime] = useState('08:30');
  const [estimatedArrivalTime, setEstimatedArrivalTime] = useState('09:50');
  const [boardingPointEn, setBoardingPointEn] = useState('Kovilpatti New Bus Stand - Bay 3');
  const [boardingPointTa, setBoardingPointTa] = useState('கோவில்பட்டி புதிய பேருந்து நிலையம் - நடைமேடை 3');
  const [boardingBay, setBoardingBay] = useState('Bay 3');
  const [sourceId, setSourceId] = useState(sources[0]?.id || '');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [validUntil, setValidUntil] = useState('2026-12-31');

  // Intermediate stops builder
  const [interStops, setInterStops] = useState<IntermediateStop[]>([
    { stopId: stops[0]?.id || 'stp_kvp_new', stopSequence: 1, scheduledTime: '08:30', distanceKm: 0 },
    { stopId: 'stp_kalugumalai', stopSequence: 2, scheduledTime: '09:05', distanceKm: 22 },
    { stopId: stops[1]?.id || 'stp_snkl_new', stopSequence: 3, scheduledTime: '09:50', distanceKm: 48 },
  ]);

  // Urgent Alert Form State
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id || '');
  const [updateType, setUpdateType] = useState<'delay' | 'cancellation' | 'route_diverted'>('delay');
  const [delayMinutes, setDelayMinutes] = useState(20);
  const [reasonEn, setReasonEn] = useState('');
  const [reasonTa, setReasonTa] = useState('');
  const [alertSource, setAlertSource] = useState('Kovilpatti Depot Master Station Diary');
  const [expiresInHours, setExpiresInHours] = useState(2);

  const [notification, setNotification] = useState<string | null>(null);

  const handleAddIntermediateStop = () => {
    setInterStops([
      ...interStops,
      {
        stopId: stops[0]?.id || '',
        stopSequence: interStops.length + 1,
        scheduledTime: '',
        distanceKm: 0,
      },
    ]);
  };

  const handleRemoveIntermediateStop = (idx: number) => {
    const updated = interStops.filter((_, i) => i !== idx).map((item, newIdx) => ({
      ...item,
      stopSequence: newIdx + 1,
    }));
    setInterStops(updated);
  };

  const handleServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceNumber || !originStopId || !destinationStopId) return;

    onSubmitService({
      serviceNumber,
      routeNumber: routeNumber || serviceNumber,
      operatorId,
      originStopId,
      destinationStopId,
      viaSummaryEn,
      viaSummaryTa,
      serviceType,
      serviceDays: ['Daily'],
      departureTime,
      estimatedArrivalTime,
      boardingPointEn,
      boardingPointTa,
      boardingBay,
      intermediateStops: interStops,
      sourceId,
      lastVerifiedAt: new Date().toISOString(),
      validUntil: new Date(validUntil).toISOString(),
      submissionNotes,
    });

    setNotification(
      lang === 'ta'
        ? `பேருந்து ${serviceNumber} சரிபார்ப்புக்காக வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது! (Pending Verification)`
        : `Service ${serviceNumber} submitted successfully for verifier review!`
    );
    setServiceNumber('');
    setSubmissionNotes('');
  };

  const handleAlertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServiceId || !reasonEn) return;

    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + Number(expiresInHours));

    onPublishTripUpdate({
      serviceId: selectedServiceId,
      updateType,
      delayMinutes: updateType === 'delay' ? Number(delayMinutes) : undefined,
      reasonEn,
      reasonTa: reasonTa || reasonEn,
      publisherName: 'K. Murugesan (Station Staff)',
      publisherRole: 'staff',
      source: alertSource,
      expiresAt: expiryDate.toISOString(),
    });

    setNotification(
      lang === 'ta'
        ? 'அவசர அறிவிப்பு உடனடியாக வெளியிடப்பட்டது! (Admin review audit logged)'
        : 'Urgent delay/cancellation alert published live to passengers!'
    );
    setReasonEn('');
    setReasonTa('');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      <div className="border-b border-slate-200 pb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
            {lang === 'ta' ? 'பணிமனை ஊழியர் இடைமுகம்' : 'Authorized Staff Portal'}
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            {t.staffTitle}
          </h2>
          <p className="text-xs text-slate-500">
            {lang === 'ta'
              ? 'அட்டவணை மாற்றங்களை சமர்ப்பிக்கவும் மற்றும் பயணிகளுக்கான அவசர தாமத/ரத்து எச்சரிக்கைகளை வெளியிடவும்.'
              : 'Submit verified timetable entries to the Verifier Queue, or publish authorized corridor delay alerts.'
            }
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => { setSubTab('submit'); setNotification(null); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              subTab === 'submit' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PlusCircle className="w-4 h-4 text-emerald-600" />
            <span>{t.submitService}</span>
          </button>
          <button
            type="button"
            onClick={() => { setSubTab('alert'); setNotification(null); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              subTab === 'alert' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>{t.postUrgentAlert}</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Tab 1: Submit Bus Service */}
      {subTab === 'submit' && (
        <form onSubmit={handleServiceSubmit} className="space-y-6">
          <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-3 text-xs text-blue-900 flex items-start gap-2">
            <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong>{lang === 'ta' ? 'சரிபார்ப்பு பணிப்பாய்வு:' : 'Verification Workflow:'}</strong>{' '}
              {lang === 'ta'
                ? 'ஊழியர் சமர்ப்பிப்பு → சரிபார்ப்பாளர் ஒப்புதல் அல்லது நிராகரிப்பு → பொது அட்டவணையில் வெளியீடு.'
                : 'Staff submission enters "Pending Verification". Only verified and approved services are promoted to verified passenger search.'
              }
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'ta' ? 'பேருந்து எண் / பெயர் *' : 'Bus Service Number *'}
              </label>
              <input
                type="text"
                required
                placeholder="e.g. TNSTC 114A"
                value={serviceNumber}
                onChange={e => setServiceNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'ta' ? 'போக்குவரத்து கழகம் / ஆபரேட்டர் *' : 'Operator / Carrier *'}
              </label>
              <select
                value={operatorId}
                onChange={e => setOperatorId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500"
              >
                {operators.map(op => (
                  <option key={op.id} value={op.id}>
                    {lang === 'ta' ? op.nameTa : op.name} ({op.type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'ta' ? 'சேவை வகை' : 'Service Type'}
              </label>
              <select
                value={serviceType}
                onChange={e => setServiceType(e.target.value as BusService['serviceType'])}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500"
              >
                <option value="Ordinary">Ordinary</option>
                <option value="Express">Express</option>
                <option value="Deluxe / Point-to-Point">Deluxe / Point-to-Point</option>
                <option value="Town Bus">Town Bus</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'ta' ? 'புறப்படும் இடம் (Origin)' : 'Origin Stop *'}
              </label>
              <select
                value={originStopId}
                onChange={e => setOriginStopId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500"
              >
                {stops.map(s => (
                  <option key={s.id} value={s.id}>
                    {lang === 'ta' ? s.nameTa : s.nameEn}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'ta' ? 'சென்றடையும் இடம் (Destination)' : 'Destination Stop *'}
              </label>
              <select
                value={destinationStopId}
                onChange={e => setDestinationStopId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500"
              >
                {stops.map(s => (
                  <option key={s.id} value={s.id}>
                    {lang === 'ta' ? s.nameTa : s.nameEn}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'ta' ? 'தகவல் ஆதாரம் (Source)' : 'Data Source *'}
              </label>
              <select
                value={sourceId}
                onChange={e => setSourceId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500"
              >
                {sources.map(src => (
                  <option key={src.id} value={src.id}>
                    {src.name} (Trust {src.trustScore}/5)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'ta' ? 'புறப்படும் நேரம் (Departure)' : 'Departure Time (HH:MM) *'}
              </label>
              <input
                type="text"
                required
                value={departureTime}
                onChange={e => setDepartureTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500"
                placeholder="08:30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'ta' ? 'சென்றடையும் நேரம் (Arrival)' : 'Estimated Arrival (HH:MM)'}
              </label>
              <input
                type="text"
                value={estimatedArrivalTime}
                onChange={e => setEstimatedArrivalTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500"
                placeholder="09:50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'ta' ? 'செல்லுபடியாகும் தேதி' : 'Validity Date'}
              </label>
              <input
                type="date"
                value={validUntil}
                onChange={e => setValidUntil(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'ta' ? 'பேருந்து ஏறும் நடைமேடை (Bay)' : 'Boarding Bay'}
              </label>
              <input
                type="text"
                value={boardingBay}
                onChange={e => setBoardingBay(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-semibold"
                placeholder="Bay 3"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'ta' ? 'ஏறும் இடம் (விளக்கம்)' : 'Boarding Point Description'}
              </label>
              <input
                type="text"
                value={boardingPointEn}
                onChange={e => setBoardingPointEn(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900"
                placeholder="Kovilpatti New Bus Stand - Bay 3"
              />
            </div>
          </div>

          {/* Sequential Stops Section */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-slate-800">
                {lang === 'ta' ? 'இடைநிறுத்தங்களின் வரிசை & நேரங்கள்' : 'Ordered Intermediate Stops & Timings'}
              </div>
              <button
                type="button"
                onClick={handleAddIntermediateStop}
                className="bg-white hover:bg-slate-100 text-slate-800 px-3 py-1 rounded-md text-xs font-bold border border-slate-300 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{lang === 'ta' ? 'நிறுத்தம் சேர்க்க' : 'Add Stop'}</span>
              </button>
            </div>

            <div className="space-y-2">
              {interStops.map((st, idx) => (
                <div key={idx} className="flex flex-wrap items-center gap-2 bg-white p-2.5 rounded-lg border border-slate-200 text-xs">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">
                    {idx + 1}
                  </span>
                  <select
                    value={st.stopId}
                    onChange={e => {
                      const updated = [...interStops];
                      updated[idx].stopId = e.target.value;
                      setInterStops(updated);
                    }}
                    className="bg-slate-50 border border-slate-300 rounded p-1.5 text-xs font-medium flex-1 min-w-[150px]"
                  >
                    {stops.map(s => (
                      <option key={s.id} value={s.id}>
                        {lang === 'ta' ? s.nameTa : s.nameEn}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="HH:MM"
                    value={st.scheduledTime || ''}
                    onChange={e => {
                      const updated = [...interStops];
                      updated[idx].scheduledTime = e.target.value;
                      setInterStops(updated);
                    }}
                    className="w-20 bg-slate-50 border border-slate-300 rounded p-1.5 text-xs"
                  />
                  <input
                    type="number"
                    placeholder="km"
                    value={st.distanceKm ?? 0}
                    onChange={e => {
                      const updated = [...interStops];
                      updated[idx].distanceKm = Number(e.target.value);
                      setInterStops(updated);
                    }}
                    className="w-16 bg-slate-50 border border-slate-300 rounded p-1.5 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveIntermediateStop(idx)}
                    disabled={interStops.length <= 2}
                    className="p-1 text-slate-400 hover:text-red-600 disabled:opacity-30 cursor-pointer"
                    aria-label="Remove Stop"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {lang === 'ta' ? 'ஊழியர் குறிப்பு / ஆவண ஆதாரம்' : 'Staff Submission Notes (Verification Proof / Permit Reference)'}
            </label>
            <textarea
              rows={2}
              value={submissionNotes}
              onChange={e => setSubmissionNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900"
              placeholder="e.g. Cross-checked with Kovilpatti depot trip register book page 42"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <Send className="w-4 h-4" />
            <span>{t.submitService} (Send to Verifier Queue)</span>
          </button>
        </form>
      )}

      {/* Tab 2: Publish Urgent Alert */}
      {subTab === 'alert' && (
        <form onSubmit={handleAlertSubmit} className="space-y-4 max-w-xl">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>{lang === 'ta' ? 'உடனடி பயணிகள் எச்சரிக்கை:' : 'Immediate Passenger Delay Notification:'}</strong>{' '}
              {lang === 'ta'
                ? 'அங்கீகரிக்கப்பட்ட ஊழியர் அறிவிப்புகள் உடனடியாக தளத்தில் தோன்றும்; தணிக்கை குறிப்பேட்டில் பதிவு செய்யப்படும்.'
                : 'Urgent alerts reflect immediately in live search results and notify passengers with a recheck expiry.'
              }
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {lang === 'ta' ? 'பேருந்து தேர்வு செய்க' : 'Select Affected Bus Service'}
            </label>
            <select
              value={selectedServiceId}
              onChange={e => setSelectedServiceId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-semibold"
            >
              {services.map(s => (
                <option key={s.id} value={s.id}>
                  {s.serviceNumber} ({s.departureTime}) - {s.viaSummaryEn}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'ta' ? 'அறிவிப்பு வகை' : 'Update Type'}
              </label>
              <select
                value={updateType}
                onChange={e => setUpdateType(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-semibold"
              >
                <option value="delay">Service Delay</option>
                <option value="cancellation">Trip Cancellation</option>
                <option value="route_diverted">Route Diverted</option>
              </select>
            </div>

            {updateType === 'delay' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'ta' ? 'தாமத நேரம் (நிமிடங்கள்)' : 'Delay (Minutes)'}
                </label>
                <input
                  type="number"
                  value={delayMinutes}
                  onChange={e => setDelayMinutes(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-semibold"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {lang === 'ta' ? 'காரணம் (ஆங்கிலம்) *' : 'Reason / Operational Cause (English) *'}
            </label>
            <input
              type="text"
              required
              value={reasonEn}
              onChange={e => setReasonEn(e.target.value)}
              placeholder="e.g. Mechanical inspection at Kovilpatti Depot"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {lang === 'ta' ? 'காரணம் (தமிழ்)' : 'Reason (Tamil)'}
            </label>
            <input
              type="text"
              value={reasonTa}
              onChange={e => setReasonTa(e.target.value)}
              placeholder="எ.கா: கோவில்பட்டி பணிமனை பராமரிப்பு ஆய்வு காரணமாக தாமதம்"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'ta' ? 'அறிவிப்பு ஆதாரம்' : 'Official Source Reference'}
              </label>
              <input
                type="text"
                value={alertSource}
                onChange={e => setAlertSource(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'ta' ? 'தானாக காலாவதியாகும் நேரம்' : 'Auto-Expiry (Hours)'}
              </label>
              <select
                value={expiresInHours}
                onChange={e => setExpiresInHours(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs"
              >
                <option value={1}>1 Hour</option>
                <option value={2}>2 Hours</option>
                <option value={4}>4 Hours</option>
                <option value={8}>8 Hours</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{t.postUrgentAlert}</span>
          </button>
        </form>
      )}
    </div>
  );
};
