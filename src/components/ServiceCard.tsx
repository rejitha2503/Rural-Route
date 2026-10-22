import React, { useState } from 'react';
import { BusService, ConnectingJourney, TripUpdate, Language, Operator, DataSource, BusStop } from '../types';
import { getTranslation } from '../i18n/translations';
import { isTimetableExpired } from '../utils/routeSearch';
import { 
  AlertTriangle, 
  ArrowRight, 
  MapPin, 
  Heart, 
  ChevronDown, 
  ChevronUp, 
  Shuffle, 
  ShieldAlert,
  Calendar,
  Info
} from 'lucide-react';

interface DirectServiceCardProps {
  service: BusService;
  operator?: Operator;
  source?: DataSource;
  fromStop?: BusStop;
  toStop?: BusStop;
  stops: BusStop[];
  activeUpdate?: TripUpdate;
  isFavorite: boolean;
  onToggleFavorite: (serviceId: string) => void;
  onSelectService: (service: BusService) => void;
  lang: Language;
}

export const DirectServiceCard: React.FC<DirectServiceCardProps> = ({
  service,
  operator,
  source,
  fromStop,
  toStop,
  stops,
  activeUpdate,
  isFavorite,
  onToggleFavorite,
  onSelectService,
  lang,
}) => {
  const t = getTranslation(lang);
  const [showStops, setShowStops] = useState(false);

  const isExpired = isTimetableExpired(service.validUntil);
  const operatorName = operator ? (lang === 'ta' ? operator.nameTa : operator.name) : service.operatorId;
  
  // Platform numbers shown ONLY when verified
  const isPlatformVerified = service.verificationStatus === 'verified' && 
    Boolean(service.boardingBay && 
      !service.boardingBay.toLowerCase().includes('sample') && 
      !service.boardingBay.toLowerCase().includes('unverified'));

  const boardingBay = isPlatformVerified
    ? service.boardingBay!
    : (lang === 'ta' ? 'நடைமேடை உறுதிசெய்யப்படவில்லை' : 'Platform not confirmed');

  const boardingPoint = lang === 'ta' ? service.boardingPointTa : service.boardingPointEn;
  const viaText = lang === 'ta' ? service.viaSummaryTa : service.viaSummaryEn;

  // Status badges: Clearly distinguish verified schedules, sample data, and expired schedules
  let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';
  let badgeText = t.statusUnverified;

  if (isExpired || service.verificationStatus === 'needs_reverification') {
    badgeStyle = 'bg-amber-50 text-amber-900 border-amber-300 font-semibold';
    badgeText = t.statusExpired;
  } else if (service.verificationStatus === 'verified') {
    badgeStyle = 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold';
    badgeText = t.statusVerified;
  } else if (service.verificationStatus === 'pending_verification') {
    badgeStyle = 'bg-blue-50 text-blue-800 border-blue-200 font-medium';
    badgeText = t.statusPending;
  }

  const getStopName = (id: string) => {
    const s = stops.find(item => item.id === id);
    if (!s) return id;
    return lang === 'ta' ? s.nameTa : s.nameEn;
  };

  return (
    <article className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Sample / Demo alert clearly labelled */}
      {activeUpdate && (
        <div className={`px-4 py-2 text-xs flex items-center justify-between font-medium ${
          activeUpdate.updateType === 'cancellation' 
            ? 'bg-rose-50 text-rose-900 border-b border-rose-200' 
            : 'bg-amber-50 text-amber-950 border-b border-amber-200'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200/90 text-amber-950 px-1.5 py-0.2 rounded border border-amber-300">
              Demo Simulation Notice
            </span>
            <span>
              <strong>{activeUpdate.updateType === 'cancellation' ? t.cancellationNotice : t.delayNotice}:</strong>{' '}
              {lang === 'ta' ? activeUpdate.reasonTa : activeUpdate.reasonEn}
              {activeUpdate.delayMinutes ? ` (+${activeUpdate.delayMinutes}m)` : ''}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            {t.reportedAt}: {new Date(activeUpdate.reportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      )}

      {/* Main card body */}
      <div className="p-4 sm:p-5">
        {/* Top header row: Service number, Operator, Badges, Favorite */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-lg font-black text-xs bg-slate-900 text-white tracking-wide">
              {service.serviceNumber}
            </span>
            <span className="text-xs font-bold text-slate-800">
              {operatorName}
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
              {service.serviceType}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${badgeStyle}`}>
              {badgeText}
            </span>
            <button
              type="button"
              onClick={() => onToggleFavorite(service.id)}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-rose-500 transition cursor-pointer"
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              title={isFavorite ? 'Saved bus' : 'Save bus'}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Timings and Corridor flow */}
        <div className="py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-6">
            <div>
              <div className="text-[11px] text-slate-400 font-semibold mb-0.5 uppercase tracking-wider">{t.departure}</div>
              <div className="text-2xl font-black text-slate-900 tracking-tight flex items-baseline gap-1">
                {service.departureTime}
                {activeUpdate && activeUpdate.delayMinutes && (
                  <span className="text-xs font-bold text-amber-600">
                    +{activeUpdate.delayMinutes}m
                  </span>
                )}
              </div>
              <div className="text-xs font-semibold text-slate-700 truncate max-w-[130px] sm:max-w-[190px]">
                {fromStop ? (lang === 'ta' ? fromStop.nameTa : fromStop.nameEn) : getStopName(service.originStopId)}
              </div>
            </div>

            <div className="flex flex-col items-center px-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                Direct
              </span>
              <div className="w-16 sm:w-24 h-0.5 bg-emerald-600 relative flex items-center justify-end">
                <ArrowRight className="w-3.5 h-3.5 text-emerald-700 absolute -right-1" />
              </div>
            </div>

            <div>
              <div className="text-[11px] text-slate-400 font-semibold mb-0.5 uppercase tracking-wider">{t.arrival}</div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {service.estimatedArrivalTime}
              </div>
              <div className="text-xs font-semibold text-slate-700 truncate max-w-[130px] sm:max-w-[190px]">
                {toStop ? (lang === 'ta' ? toStop.nameTa : toStop.nameEn) : getStopName(service.destinationStopId)}
              </div>
            </div>
          </div>

          {/* Boarding Point Info */}
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 text-xs w-full sm:w-auto min-w-[220px]">
            <div className="flex items-center gap-1.5 text-slate-600 font-medium mb-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="font-semibold text-slate-800">{t.boardingBay}:</span>
              <span className={`text-[11px] px-2 py-0.5 rounded border ${
                isPlatformVerified 
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold' 
                  : 'bg-white text-slate-600 border-slate-300 font-medium'
              }`}>
                {boardingBay}
              </span>
            </div>
            <div className="text-slate-600 text-[11px] line-clamp-1">
              {boardingPoint}
            </div>
          </div>
        </div>

        {/* Via & Service days */}
        <div className="pt-2 text-xs flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-700">{lang === 'ta' ? 'வழித்தடம்:' : 'Via:'}</span>
            <span className="text-slate-600">{viaText}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-slate-500 text-[11px]">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>{service.serviceDays.join(', ')}</span>
            </div>

            <button
              type="button"
              onClick={() => onSelectService(service)}
              className="text-emerald-700 hover:text-emerald-800 font-bold text-xs underline underline-offset-2 cursor-pointer"
            >
              {t.viewDetails}
            </button>
          </div>
        </div>

        {/* Expired warning alert if validity passed */}
        {isExpired && (
          <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-xs text-amber-900 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>{lang === 'ta' ? 'காலாவதியான அட்டவணை எச்சரிக்கை:' : 'Expired Schedule Notice:'}</strong>{' '}
              {lang === 'ta' 
                ? `இந்த அட்டவணை ${new Date(service.validUntil).toLocaleDateString()} வரை மட்டுமே குறித்து வைக்கப்பட்டது. நேரடி கள சரிபார்ப்பு நிலுவையில் உள்ளது.`
                : `This timetable was valid until ${new Date(service.validUntil).toLocaleDateString()}. Field re-verification is pending.`
              }
            </div>
          </div>
        )}

        {/* Expandable stops sequence */}
        <div className="mt-2.5">
          <button
            type="button"
            onClick={() => setShowStops(!showStops)}
            className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 font-semibold focus:outline-hidden cursor-pointer"
            aria-expanded={showStops}
          >
            <span>{showStops ? (lang === 'ta' ? 'நிறுத்தங்களை மறைக்க' : 'Hide intermediate stops') : (lang === 'ta' ? `நிறுத்தங்களின் வரிசை (${service.intermediateStops.length})` : `Show ${service.intermediateStops.length} stops in sequence`)}</span>
            {showStops ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {showStops && (
            <div className="mt-2 pt-2 border-t border-slate-100">
              <ol className="relative border-l-2 border-emerald-300 ml-3 space-y-2 py-1">
                {service.intermediateStops.map((stopItem, index) => {
                  const stop = stops.find(s => s.id === stopItem.stopId);
                  const isFirst = index === 0;
                  const isLast = index === service.intermediateStops.length - 1;
                  return (
                    <li key={stopItem.stopId} className="ml-4 text-xs">
                      <div className={`absolute -left-[5px] mt-1.5 w-2.5 h-2.5 rounded-full border border-white ${
                        isFirst ? 'bg-emerald-600' : isLast ? 'bg-red-600' : 'bg-slate-400'
                      }`} />
                      <div className="flex items-center justify-between">
                        <span className={`font-medium ${isFirst || isLast ? 'text-slate-900 font-bold' : 'text-slate-600'}`}>
                          {stop ? (lang === 'ta' ? stop.nameTa : stop.nameEn) : stopItem.stopId}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          {stopItem.distanceKm !== undefined && (
                            <span>{stopItem.distanceKm} km</span>
                          )}
                          {stopItem.scheduledTime && (
                            <span className="font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                              {stopItem.scheduledTime}
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}
        </div>

        {/* Source and transparent sample disclaimer footer */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Info className="w-3 h-3 text-slate-400" />
            <span>{t.source}: {source ? source.name : service.sourceId}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>{t.lastVerified}: {new Date(service.lastVerifiedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </article>
  );
};

interface ConnectingJourneyCardProps {
  journey: ConnectingJourney;
  stops: BusStop[];
  operators: Operator[];
  lang: Language;
  onSelectService: (service: BusService) => void;
}

export const ConnectingJourneyCard: React.FC<ConnectingJourneyCardProps> = ({
  journey,
  stops,
  operators,
  lang,
  onSelectService,
}) => {
  const t = getTranslation(lang);
  const { firstService, secondService, transferStopId, waitingTimeMinutes, totalDurationMinutes } = journey;

  const transferStop = stops.find(s => s.id === transferStopId);
  const transferStopName = transferStop ? (lang === 'ta' ? transferStop.nameTa : transferStop.nameEn) : transferStopId;

  const getOperator = (opId: string) => {
    const op = operators.find(o => o.id === opId);
    return op ? (lang === 'ta' ? op.nameTa : op.name) : opId;
  };

  return (
    <article className="bg-white rounded-2xl border border-indigo-200/90 shadow-2xs hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Header bar */}
      <div className="bg-slate-900 text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <Shuffle className="w-4 h-4 text-emerald-400" />
          <span className="font-bold tracking-wide">
            {lang === 'ta' ? 'மாதிரி 1-இணைப்புப் பயணம் (மாற்று நிறுத்தம்)' : '1-Transfer Connecting Bus Option (Sample)'}
          </span>
        </div>
        <div className="flex items-center gap-3 font-semibold text-slate-300 text-[11px]">
          <span>{t.totalDuration}: ~{Math.floor(totalDurationMinutes / 60)}h {totalDurationMinutes % 60}m</span>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-3.5">
        {/* Bus 1 */}
        <div className="border-l-3 border-emerald-500 pl-3">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-bold text-slate-900">1. {firstService.serviceNumber} ({getOperator(firstService.operatorId)})</span>
            <span className="font-semibold text-emerald-700">{firstService.departureTime} → {firstService.estimatedArrivalTime}</span>
          </div>
          <div className="text-xs text-slate-600">
            {lang === 'ta' ? 'புறப்படும் இடம்:' : 'Departs from:'} <strong className="text-slate-800">{lang === 'ta' ? firstService.boardingPointTa : firstService.boardingPointEn}</strong>
          </div>
        </div>

        {/* Transfer Point Callout */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-[10px]">
              T
            </div>
            <div>
              <div className="font-bold text-slate-900">
                {t.transferAt}: {transferStopName}
              </div>
              <div className="text-[11px] text-slate-500">
                {lang === 'ta' ? 'இணைப்பு மாற்று நிறுத்தம்' : 'Connecting interchange location'}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] text-slate-400 font-semibold uppercase">{t.waitingTime}</div>
            <div className="text-sm font-black text-slate-900">{waitingTimeMinutes} mins</div>
          </div>
        </div>

        {/* Bus 2 */}
        <div className="border-l-3 border-blue-500 pl-3">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-bold text-slate-900">2. {secondService.serviceNumber} ({getOperator(secondService.operatorId)})</span>
            <span className="font-semibold text-blue-700">{secondService.departureTime} → {secondService.estimatedArrivalTime}</span>
          </div>
          <div className="text-xs text-slate-600">
            {lang === 'ta' ? 'இணைப்பு பேருந்து ஏறும் இடம்:' : 'Connecting bus departs from:'} <strong className="text-slate-800">{lang === 'ta' ? secondService.boardingPointTa : secondService.boardingPointEn}</strong>
          </div>
        </div>

        {/* Truthful Connection Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-[11px] text-amber-900 flex items-start gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
          <span>{t.indicativeConnectionWarning}</span>
        </div>

        {/* Details Links */}
        <div className="flex items-center justify-end gap-3 pt-1 border-t border-slate-100">
          <button
            type="button"
            onClick={() => onSelectService(firstService)}
            className="text-xs text-emerald-700 font-bold hover:underline cursor-pointer"
          >
            {lang === 'ta' ? 'முதல் பேருந்து விவரம்' : 'Bus 1 Details'}
          </button>
          <span className="text-slate-300">|</span>
          <button
            type="button"
            onClick={() => onSelectService(secondService)}
            className="text-xs text-blue-700 font-bold hover:underline cursor-pointer"
          >
            {lang === 'ta' ? 'இரண்டாம் பேருந்து விவரம்' : 'Bus 2 Details'}
          </button>
        </div>
      </div>
    </article>
  );
};
