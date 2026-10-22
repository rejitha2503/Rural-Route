import React, { useState, useMemo } from 'react';
import { 
  BusStop, 
  BusService, 
  TripUpdate, 
  Operator, 
  DataSource, 
  Language, 
  ConnectingJourney 
} from '../types';
import { getTranslation } from '../i18n/translations';
import { findDirectServices, findConnectingJourneys } from '../utils/routeSearch';
import { DirectServiceCard, ConnectingJourneyCard } from './ServiceCard';
import { 
  Search, 
  ArrowLeftRight, 
  Calendar, 
  MapPin, 
  AlertCircle,
  Info,
  Compass
} from 'lucide-react';

interface PassengerSearchProps {
  stops: BusStop[];
  services: BusService[];
  operators: Operator[];
  sources: DataSource[];
  tripUpdates: TripUpdate[];
  favorites: string[];
  cachedSearches: { fromStopId: string; toStopId: string; timestamp: string }[];
  onToggleFavorite: (serviceId: string) => void;
  onAddCachedSearch: (fromId: string, toId: string) => void;
  onOpenReportModal: () => void;
  onSelectService: (service: BusService) => void;
  selectedFromStopId?: string;
  selectedToStopId?: string;
  lang: Language;
}

export const PassengerSearch: React.FC<PassengerSearchProps> = ({
  stops,
  services,
  operators,
  tripUpdates,
  favorites,
  onToggleFavorite,
  onAddCachedSearch,
  onSelectService,
  selectedFromStopId,
  selectedToStopId,
  lang,
}) => {
  const t = getTranslation(lang);

  // Search form state
  const [fromStopId, setFromStopId] = useState<string>(selectedFromStopId || 'stp_kvp_new');
  const [toStopId, setToStopId] = useState<string>(selectedToStopId || 'stp_snkl_new');
  const [travelDate, setTravelDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Sync if external selection changes
  React.useEffect(() => {
    if (selectedFromStopId) setFromStopId(selectedFromStopId);
    if (selectedToStopId) setToStopId(selectedToStopId);
  }, [selectedFromStopId, selectedToStopId]);

  const [hasSearched, setHasSearched] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'direct' | 'connecting'>('direct');
  const [filterType] = useState<string>('all');

  const selectedDayOfWeek = useMemo(() => {
    if (!travelDate) return 'Daily';
    const d = new Date(travelDate);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[d.getDay()] || 'Daily';
  }, [travelDate]);

  const directResults = useMemo(() => {
    if (!hasSearched || !fromStopId || !toStopId) return [];
    let list = findDirectServices(services, fromStopId, toStopId, selectedDayOfWeek);
    if (filterType !== 'all') {
      list = list.filter(s => s.serviceType.toLowerCase().includes(filterType.toLowerCase()));
    }
    return list;
  }, [services, fromStopId, toStopId, selectedDayOfWeek, hasSearched, filterType]);

  const connectingResults: ConnectingJourney[] = useMemo(() => {
    if (!hasSearched || !fromStopId || !toStopId) return [];
    return findConnectingJourneys(services, fromStopId, toStopId, 10, 120, selectedDayOfWeek);
  }, [services, fromStopId, toStopId, selectedDayOfWeek, hasSearched]);

  const handleSwap = () => {
    const temp = fromStopId;
    setFromStopId(toStopId);
    setToStopId(temp);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    if (fromStopId && toStopId && fromStopId !== toStopId) {
      onAddCachedSearch(fromStopId, toStopId);
    }
    const resultsElem = document.getElementById('search-results-section');
    if (resultsElem) {
      resultsElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleQuickSelect = (fromCode: string, toCode: string) => {
    const fStop = stops.find(s => s.code.toLowerCase() === fromCode.toLowerCase() || s.nameEn.toLowerCase().includes(fromCode.toLowerCase()));
    const tStop = stops.find(s => s.code.toLowerCase() === toCode.toLowerCase() || s.nameEn.toLowerCase().includes(toCode.toLowerCase()));
    if (fStop) setFromStopId(fStop.id);
    if (tStop) setToStopId(tStop.id);
    setHasSearched(true);
    if (fStop && tStop) {
      onAddCachedSearch(fStop.id, tStop.id);
    }
  };

  const fromStop = stops.find(s => s.id === fromStopId);
  const toStop = stops.find(s => s.id === toStopId);

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Banner with Rural Bus Photo */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white shadow-xl">
        <div className="absolute inset-0 z-0 opacity-40 mix-blend-overlay">
          <img 
            src="/public/assets/aistudio/RuralRoute_Bus_Journey_Landing_Page_5a3a7d12.png" 
            alt="Rural Tamil Nadu Bus" 
            className="w-full h-full object-cover object-center"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/70 to-transparent z-1"></div>

        <div className="relative z-10 px-6 sm:px-10 py-12 sm:py-16 max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 rounded-full text-emerald-300 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{t.pilotAreaBadge}</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              {t.heroTitle}
            </h1>
            <p className="text-base sm:text-lg text-slate-300 max-w-xl font-medium">
              {t.heroSubtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                const searchCard = document.getElementById('search-card-form');
                searchCard?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg transition flex items-center gap-2 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>{lang === 'ta' ? 'பேருந்துகளைத் தேடுங்கள்' : 'Search buses'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const resultsElem = document.getElementById('search-results-section');
                resultsElem?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-md transition flex items-center gap-2 cursor-pointer border border-white/20"
            >
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'ta' ? 'வழித்தடங்களை ஆராயுங்கள்' : 'Explore routes'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search Card Form */}
      <div id="search-card-form" className="bg-white rounded-2xl border border-slate-200/90 shadow-xl p-6 sm:p-8 -mt-10 relative z-20">
        <form onSubmit={handleSearchSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            {/* From Stop */}
            <div className="md:col-span-4">
              <label htmlFor="from-stop" className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>{t.fromStop}</span>
              </label>
              <select
                id="from-stop"
                value={fromStopId}
                onChange={e => setFromStopId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 px-3.5 text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden transition"
              >
                {stops.map(stop => (
                  <option key={stop.id} value={stop.id}>
                    {lang === 'ta' ? stop.nameTa : stop.nameEn} ({stop.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Swap Button */}
            <div className="md:col-span-1 flex justify-center py-2 md:py-0">
              <button
                type="button"
                onClick={handleSwap}
                className="p-3 rounded-full bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200 transition cursor-pointer shadow-xs"
                title={t.swapStops}
                aria-label={t.swapStops}
              >
                <ArrowLeftRight className="w-4 h-4" />
              </button>
            </div>

            {/* To Stop */}
            <div className="md:col-span-4">
              <label htmlFor="to-stop" className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-600" />
                <span>{t.toStop}</span>
              </label>
              <select
                id="to-stop"
                value={toStopId}
                onChange={e => setToStopId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 px-3.5 text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden transition"
              >
                {stops.map(stop => (
                  <option key={stop.id} value={stop.id}>
                    {lang === 'ta' ? stop.nameTa : stop.nameEn} ({stop.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Travel Date */}
            <div className="md:col-span-3">
              <label htmlFor="travel-date" className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>{lang === 'ta' ? 'பயண தேதி' : 'Travel Date'}</span>
              </label>
              <input
                id="travel-date"
                type="date"
                value={travelDate}
                onChange={e => setTravelDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 px-3.5 text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden transition"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-100">
            {/* Popular Routes Quick Pills */}
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto py-1">
              <span className="text-xs font-bold text-slate-500 shrink-0">
                {lang === 'ta' ? 'பிரபலமான வழித்தடங்கள்:' : 'Popular Routes:'}
              </span>
              <button
                type="button"
                onClick={() => handleQuickSelect('Kovilpatti', 'Sankarankovil')}
                className="text-xs font-semibold bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-full border border-emerald-200 hover:bg-emerald-100 transition shrink-0 cursor-pointer flex items-center gap-1"
              >
                <MapPin className="w-3 h-3 text-emerald-600" />
                <span>Kovilpatti ⇄ Sankarankovil</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickSelect('Sankarankovil', 'Kalugumalai')}
                className="text-xs font-semibold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-200 transition shrink-0 cursor-pointer flex items-center gap-1"
              >
                <MapPin className="w-3 h-3 text-slate-500" />
                <span>Sankarankovil ⇄ Kalugumalai</span>
              </button>
            </div>

            {/* Search Submit Button */}
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>{t.searchBuses}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Search Results Section */}
      <div id="search-results-section" className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>{fromStop ? (lang === 'ta' ? fromStop.nameTa : fromStop.nameEn) : 'From'}</span>
              <span className="text-slate-400 font-normal">→</span>
              <span>{toStop ? (lang === 'ta' ? toStop.nameTa : toStop.nameEn) : 'To'}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {lang === 'ta' ? `தேதி: ${travelDate} (${selectedDayOfWeek})` : `Travel date: ${travelDate} (${selectedDayOfWeek})`} • {directResults.length} {lang === 'ta' ? 'நேரடி சேவைகள்' : 'direct services found'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('direct')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'direct'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {lang === 'ta' ? 'நேரடி சேவைகள்' : 'Direct Buses'} ({directResults.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('connecting')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'connecting'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {lang === 'ta' ? 'மாற்று வழி (1-இணைப்பு)' : 'Connecting (1-Transfer)'} ({connectingResults.length})
            </button>
          </div>
        </div>

        {/* Results List */}
        {activeTab === 'direct' && (
          <div className="space-y-4">
            {directResults.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3 shadow-xs">
                <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">
                  {lang === 'ta' ? 'இந்த வழித்தடத்தில் நேரடி பேருந்துகள் இல்லை' : 'No direct buses found for this route'}
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {lang === 'ta' 
                    ? 'தயவுசெய்து மேலே உள்ள மாற்று வழி (1-இணைப்பு) தாவலைச் சரிபார்க்கவும் அல்லது வேறு தேதியை முயற்சிக்கவும்.' 
                    : 'Try checking the Connecting (1-Transfer) tab above or select an alternate date in the pilot corridor.'}
                </p>
              </div>
            ) : (
              directResults.map(service => {
                const operator = operators.find(o => o.id === service.operatorId);
                const activeUpdate = tripUpdates.find(u => u.serviceId === service.id && u.status === 'active');
                const isFavorite = favorites.includes(service.id);
                return (
                  <DirectServiceCard
                    key={service.id}
                    service={service}
                    operator={operator}
                    stops={stops}
                    activeUpdate={activeUpdate}
                    isFavorite={isFavorite}
                    onToggleFavorite={onToggleFavorite}
                    onSelectService={onSelectService}
                    lang={lang}
                  />
                );
              })
            )}
          </div>
        )}

        {activeTab === 'connecting' && (
          <div className="space-y-4">
            {connectingResults.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3 shadow-xs">
                <Info className="w-10 h-10 text-blue-500 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">
                  {lang === 'ta' ? 'இணைப்பு சேவைகள் கிடைக்கவில்லை' : 'No connecting journeys available'}
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {lang === 'ta' ? 'இந்த நிறுத்தங்களுக்கு இடையே தகுந்த இணைப்புகள் இல்லை.' : 'No verified 1-transfer connections found between these stops in the pilot corridor.'}
                </p>
              </div>
            ) : (
              connectingResults.map((journey, idx) => (
                <ConnectingJourneyCard
                  key={idx}
                  journey={journey}
                  stops={stops}
                  operators={operators}
                  onSelectService={onSelectService}
                  lang={lang}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
