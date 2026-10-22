import React from 'react';
import { BusService, BusStop, Operator, DataSource, TripUpdate, Language } from '../types';
import { getTranslation } from '../i18n/translations';
import { LeafletRouteMap } from './LeafletRouteMap';
import { isTimetableExpired } from '../utils/routeSearch';
import { 
  X, 
  MapPin, 
  Clock, 
  Calendar, 
  FileCheck, 
  AlertTriangle, 
  ShieldAlert,
  Info 
} from 'lucide-react';

interface ServiceDetailModalProps {
  service: BusService | null;
  stops: BusStop[];
  operators: Operator[];
  sources: DataSource[];
  tripUpdates: TripUpdate[];
  lang: Language;
  onClose: () => void;
}

export const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  service,
  stops,
  operators,
  sources,
  tripUpdates,
  lang,
  onClose,
}) => {
  if (!service) return null;

  const t = getTranslation(lang);
  const operator = operators.find(o => o.id === service.operatorId);
  const source = sources.find(s => s.id === service.sourceId);
  const activeUpdate = tripUpdates.find(u => u.serviceId === service.id && u.status === 'active');
  const isExpired = isTimetableExpired(service.validUntil);

  const operatorName = operator ? (lang === 'ta' ? operator.nameTa : operator.name) : service.operatorId;
  const boardingBay = service.boardingBay || (lang === 'ta' ? 'பொது நடைமேடை' : 'General Platform');
  const boardingPoint = lang === 'ta' ? service.boardingPointTa : service.boardingPointEn;
  const viaText = lang === 'ta' ? service.viaSummaryTa : service.viaSummaryEn;

  const stopIdsInSequence = service.intermediateStops.map(s => s.stopId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs overflow-y-auto">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full shadow-xl overflow-hidden border border-slate-200 my-8 animate-in fade-in duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-service-title"
      >
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-lg font-black text-xs bg-slate-900 text-white">
              {service.serviceNumber}
            </span>
            <div>
              <h3 id="modal-service-title" className="text-base font-bold text-slate-900">
                {operatorName}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {service.serviceType} • {service.serviceDays.join(', ')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
            aria-label={t.close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Active Disruption Banner */}
          {activeUpdate && (
            <div className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
              activeUpdate.updateType === 'cancellation'
                ? 'bg-rose-50 text-rose-900 border border-rose-200'
                : 'bg-amber-50 text-amber-900 border border-amber-200'
            }`}>
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <div>
                <div className="font-bold">
                  {activeUpdate.updateType === 'cancellation' ? t.cancellationNotice : t.delayNotice}
                  {activeUpdate.delayMinutes ? ` (+${activeUpdate.delayMinutes} mins delay)` : ''}
                </div>
                <div className="text-slate-700 mt-0.5">
                  {lang === 'ta' ? activeUpdate.reasonTa : activeUpdate.reasonEn}
                </div>
              </div>
            </div>
          )}

          {/* Time & Boarding Points */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-500 font-semibold mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>{lang === 'ta' ? 'திட்டமிடப்பட்ட நேரம்' : 'Timing Schedule'}</span>
              </div>
              <div className="text-xl font-black text-slate-900">
                {service.departureTime} <span className="text-slate-400 font-normal">→</span> {service.estimatedArrivalTime}
              </div>
              <div className="text-xs text-slate-600 mt-1">
                {viaText}
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-500 font-semibold mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t.boardingPoint}</span>
              </div>
              <div className="font-bold text-slate-900 text-xs">
                {boardingBay}
              </div>
              <div className="text-xs text-slate-600 mt-0.5">
                {boardingPoint}
              </div>
            </div>
          </div>

          {/* Route Map */}
          <div>
            <div className="text-xs font-bold text-slate-800 mb-2 flex items-center justify-between">
              <span>{lang === 'ta' ? 'வழித்தட வரைபடம்' : 'Corridor Route Map (Leaflet)'}</span>
              <span className="text-[11px] text-slate-500">
                {service.intermediateStops.length} {lang === 'ta' ? 'நிறுத்தங்கள்' : 'Stops'}
              </span>
            </div>
            <LeafletRouteMap
              stops={stops}
              selectedStopIds={stopIdsInSequence}
              highlightOriginId={service.originStopId}
              highlightDestinationId={service.destinationStopId}
              lang={lang}
              height="240px"
            />
          </div>

          {/* Sequential Stops List */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
              {lang === 'ta' ? 'நிறுத்தங்களின் வரிசை' : 'Sequential Stops & Timings'}
            </h4>
            <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
              {service.intermediateStops.map((stopItem, index) => {
                const stop = stops.find(s => s.id === stopItem.stopId);
                const isFirst = index === 0;
                const isLast = index === service.intermediateStops.length - 1;

                return (
                  <div key={stopItem.stopId} className="p-3 text-xs flex items-center justify-between hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                        isFirst ? 'bg-emerald-600 text-white' : isLast ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {stopItem.stopSequence}
                      </span>
                      <div>
                        <div className="font-semibold text-slate-900">
                          {stop ? (lang === 'ta' ? stop.nameTa : stop.nameEn) : stopItem.stopId}
                        </div>
                        {stop && stop.landmarkEn && (
                          <div className="text-[11px] text-slate-500">
                            {lang === 'ta' ? stop.landmarkTa : stop.landmarkEn}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      {stopItem.scheduledTime && (
                        <div className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                          {stopItem.scheduledTime}
                        </div>
                      )}
                      {stopItem.distanceKm !== undefined && (
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {stopItem.distanceKm} km
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Data Reliability Notice */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-600 space-y-1.5">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-slate-500" />
              <span>Data Origin & Reliability Status</span>
            </div>
            <div>
              <strong>Source:</strong> {source ? source.name : service.sourceId}
            </div>
            <div>
              <strong>Status:</strong> <span className="capitalize">{service.verificationStatus.replace('_', ' ')} (Pilot Sample)</span>
            </div>
            {service.verifierNotes && (
              <div className="bg-white p-2 rounded-lg border border-slate-200 text-slate-600 italic mt-1">
                "{service.verifierNotes}"
              </div>
            )}
            {isExpired && (
              <div className="bg-amber-100 text-amber-900 p-2 rounded-lg border border-amber-300 flex items-center gap-2 mt-2">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  <strong>Validity Expired:</strong> This schedule requires depot reverification. Confirm timings at the bus stand before departing.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
