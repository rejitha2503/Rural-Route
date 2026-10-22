import React, { useState } from 'react';
import { BusStop, BusService, Operator, Language } from '../types';
import { getTranslation } from '../i18n/translations';
import { LeafletRouteMap } from './LeafletRouteMap';
import { Route, MapPin, Clock, ArrowRight, Bus, Search, ShieldCheck } from 'lucide-react';

interface BusRoutesViewProps {
  stops: BusStop[];
  services: BusService[];
  operators: Operator[];
  onSelectRouteSearch: (fromId: string, toId: string) => void;
  lang: Language;
}

interface CorridorRouteItem {
  id: string;
  nameEn: string;
  nameTa: string;
  fromStopId: string;
  toStopId: string;
  distanceKm: number;
  durationText: string;
  frequencyTextEn: string;
  frequencyTextTa: string;
  keyStopsEn: string[];
  keyStopsTa: string[];
  descriptionEn: string;
  descriptionTa: string;
}

export const BusRoutesView: React.FC<BusRoutesViewProps> = ({
  stops,
  services,
  operators,
  onSelectRouteSearch,
  lang,
}) => {
  const t = getTranslation(lang);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('route_kvp_snkl');

  const CORRIDOR_ROUTES: CorridorRouteItem[] = [
    {
      id: 'route_kvp_snkl',
      nameEn: 'Kovilpatti ↔ Sankarankovil Express Corridor',
      nameTa: 'கோவில்பட்டி ↔ சங்கரன்கோவில் விரைவு வழித்தடம்',
      fromStopId: 'stp_kvp_new',
      toStopId: 'stp_snkl_new',
      distanceKm: 48,
      durationText: '1h 15m - 1h 25m',
      frequencyTextEn: 'Every 20-30 mins',
      frequencyTextTa: 'ஒவ்வொரு 20-30 நிமிடங்களுக்கும்',
      keyStopsEn: ['Kovilpatti New BS', 'Kalugumalai', 'Kuruvikulam', 'Sankarankovil New BS'],
      keyStopsTa: ['கோவில்பட்டி அண்ணா BS', 'கழுகுமலை BS', 'குருவிகுளம்', 'சங்கரன்கோவில் BS'],
      descriptionEn: 'The primary inter-district link between Thoothukudi and Tenkasi districts, serving major pilgrimage sites and commercial hubs.',
      descriptionTa: 'தூத்துக்குடி மற்றும் தென்காசி மாவட்டங்களை இணைக்கும் முக்கிய வழித்தடம். கழுகுமலை சமணர் படுகை மற்றும் சங்கரன்கோவில் கோமதி அம்மன் கோவிலை இணைக்கிறது.',
    },
    {
      id: 'route_kvp_klg',
      nameEn: 'Kovilpatti ↔ Kalugumalai Shuttle',
      nameTa: 'கோவில்பட்டி ↔ கழுகுமலை வழித்தடம்',
      fromStopId: 'stp_kvp_new',
      toStopId: 'stp_kalugumalai',
      distanceKm: 22,
      durationText: '35 mins',
      frequencyTextEn: 'Every 15-20 mins',
      frequencyTextTa: 'ஒவ்வொரு 15-20 நிமிடங்களுக்கும்',
      keyStopsEn: ['Kovilpatti New BS', 'Old Bus Stand', 'Kalugumalai BS'],
      keyStopsTa: ['கோவில்பட்டி அண்ணா BS', 'பழைய BS', 'கழுகுமலை BS'],
      descriptionEn: 'High-frequency stage route with frequent TNSTC Ordinary Town and Moffussil buses. White-board buses eligible for Free Travel for Women.',
      descriptionTa: 'அதிக அதிர்வெண் கொண்ட டவுன் பஸ் வழித்தடம். விடியல் பயணம் திட்டத்தின் கீழ் பெண்களுக்கு கட்டணமில்லா சாதாரண பேருந்துகள் இயங்குகின்றன.',
    },
    {
      id: 'route_klg_snkl',
      nameEn: 'Kalugumalai ↔ Sankarankovil Link',
      nameTa: 'கழுகுமலை ↔ சங்கரன்கோவில் வழித்தடம்',
      fromStopId: 'stp_kalugumalai',
      toStopId: 'stp_snkl_new',
      distanceKm: 26,
      durationText: '40 mins',
      frequencyTextEn: 'Every 25-35 mins',
      frequencyTextTa: 'ஒவ்வொரு 25-35 நிமிடங்களுக்கும்',
      keyStopsEn: ['Kalugumalai BS', 'Kuruvikulam Junction', 'Sankarankovil New BS'],
      keyStopsTa: ['கழுகுமலை BS', 'குருவிகுளம் சந்திப்பு', 'சங்கரன்கோவில் BS'],
      descriptionEn: 'Connecting Tenkasi district agricultural markets with Kalugumalai. Primary transfer point for cross-corridor journeys.',
      descriptionTa: 'கழுகுமலையிலிருந்து சங்கரன்கோவில் செல்லும் இணைப்பு வழித்தடம். குருவிகுளம் வழியாக இயங்குகிறது.',
    },
    {
      id: 'route_kvp_kyr',
      nameEn: 'Kovilpatti ↔ Kayathar NH Route',
      nameTa: 'கோவில்பட்டி ↔ கயத்தாறு (தேசிய நெடுஞ்சாலை)',
      fromStopId: 'stp_kvp_new',
      toStopId: 'stp_kayathar',
      distanceKm: 28,
      durationText: '40-45 mins',
      frequencyTextEn: 'Every 30-45 mins',
      frequencyTextTa: 'ஒவ்வொரு 30-45 நிமிடங்களுக்கும்',
      keyStopsEn: ['Kovilpatti New BS', 'Kayathar Bus Stand'],
      keyStopsTa: ['கோவில்பட்டி அண்ணா BS', 'கயத்தாறு BS'],
      descriptionEn: 'Southbound highway corridor towards Tirunelveli district, serving historic Kayathar.',
      descriptionTa: 'திருநெல்வேலி நோக்கி செல்லும் தெற்கு வழித்தடம்.',
    },
  ];

  const selectedRoute = CORRIDOR_ROUTES.find(r => r.id === selectedRouteId) || CORRIDOR_ROUTES[0];

  // Count services on this route
  const servicesOnRoute = services.filter(s => 
    (s.originStopId === selectedRoute.fromStopId && s.destinationStopId === selectedRoute.toStopId) ||
    (s.intermediateStops.some(i => i.stopId === selectedRoute.fromStopId) && s.intermediateStops.some(i => i.stopId === selectedRoute.toStopId))
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-1">
              <Route className="w-4 h-4" />
              <span>{lang === 'ta' ? 'அங்கீகரிக்கப்பட்ட வழித்தடங்கள்' : 'Corridor Directory'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {lang === 'ta' ? 'முன்னோடி பேருந்து வழித்தடங்கள்' : 'Pilot Corridor Bus Routes'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              {lang === 'ta'
                ? 'தூத்துக்குடி - தென்காசி மாவட்டங்களுக்கு இடையேயான கோவில்பட்டி ↔ சங்கரன்கோவில் முன்னோடி வழித்தடங்களின் விரிவான வரைபடம் மற்றும் நிறுத்த விவரங்கள்.'
                : 'Browse all supported pilot bus routes across Kovilpatti, Kalugumalai, Kuruvikulam, and Sankarankovil.'}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs text-emerald-900 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{CORRIDOR_ROUTES.length} {lang === 'ta' ? 'முக்கிய வழித்தடங்கள்' : 'Verified Pilot Corridors'}</span>
          </div>
        </div>
      </div>

      {/* Corridor Map */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-800">
              {lang === 'ta' ? 'வழித்தட வரைபடம் (Leaflet & OpenStreetMap)' : 'Interactive Corridor Map'}
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
            {lang === 'ta' ? 'உறுதிசெய்யப்பட்ட நிறுத்தங்கள் மட்டுமே' : 'Verified Physical Stops Only'}
          </span>
        </div>

        <LeafletRouteMap
          stops={stops}
          selectedStopIds={[selectedRoute.fromStopId, 'stp_kalugumalai', 'stp_kuruvikulam', selectedRoute.toStopId]}
          highlightOriginId={selectedRoute.fromStopId}
          highlightDestinationId={selectedRoute.toStopId}
          lang={lang}
          height="320px"
        />
      </div>

      {/* Routes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CORRIDOR_ROUTES.map(route => {
          const isSelected = route.id === selectedRouteId;
          const matchingServices = services.filter(s => 
            (s.originStopId === route.fromStopId && s.destinationStopId === route.toStopId)
          );

          return (
            <div
              key={route.id}
              onClick={() => setSelectedRouteId(route.id)}
              className={`rounded-2xl border p-5 transition cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                      isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}>
                      <Bus className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 leading-tight">
                        {lang === 'ta' ? route.nameTa : route.nameEn}
                      </h3>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>{route.distanceKm} km</span>
                        <span>•</span>
                        <span>{route.durationText}</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {matchingServices.length} {lang === 'ta' ? 'பேருந்துகள்' : 'buses'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed my-3">
                  {lang === 'ta' ? route.descriptionTa : route.descriptionEn}
                </p>

                {/* Stop sequence tags */}
                <div className="mb-4">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">
                    {lang === 'ta' ? 'நிறுத்தங்கள் வரிசை:' : 'Stage Stops:'}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(lang === 'ta' ? route.keyStopsTa : route.keyStopsEn).map((st, i, arr) => (
                      <React.Fragment key={st}>
                        <span className="text-[11px] bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md font-medium text-slate-700">
                          {st}
                        </span>
                        {i < arr.length - 1 && (
                          <ArrowRight className="w-3 h-3 text-slate-300 shrink-0" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action row */}
              <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">
                  {lang === 'ta' ? route.frequencyTextTa : route.frequencyTextEn}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectRouteSearch(route.fromStopId, route.toStopId);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{lang === 'ta' ? 'பேருந்துகளைக் காண்க' : 'Search Buses'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
