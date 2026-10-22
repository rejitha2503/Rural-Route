import React from 'react';
import { BusService, BusStop, Operator, DataSource, TripUpdate, Language } from '../types';
import { getTranslation } from '../i18n/translations';
import { DirectServiceCard } from './ServiceCard';
import { getActiveTripUpdate } from '../utils/routeSearch';
import { Heart, Search, ShieldAlert, Bus } from 'lucide-react';

interface SavedBusesViewProps {
  favorites: string[];
  services: BusService[];
  stops: BusStop[];
  operators: Operator[];
  sources: DataSource[];
  tripUpdates: TripUpdate[];
  onToggleFavorite: (serviceId: string) => void;
  onSelectService: (service: BusService) => void;
  onNavigateToSearch: () => void;
  lang: Language;
}

export const SavedBusesView: React.FC<SavedBusesViewProps> = ({
  favorites,
  services,
  stops,
  operators,
  sources,
  tripUpdates,
  onToggleFavorite,
  onSelectService,
  onNavigateToSearch,
  lang,
}) => {
  const t = getTranslation(lang);
  const favoriteServices = services.filter(s => favorites.includes(s.id));

  // Check for any alerts affecting saved buses
  const affectedSavedBuses = favoriteServices.filter(s => 
    tripUpdates.some(u => u.serviceId === s.id && u.status === 'active')
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wider mb-1">
              <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
              <span>{t.favorites}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {lang === 'ta' ? 'நீங்கள் சேமித்த பேருந்துகள்' : 'Your Bookmarked Buses'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              {lang === 'ta'
                ? 'உங்கள் தினசரி பயணத்திற்கான விரைவு பேருந்து அட்டவணை மற்றும் நிகழ்நேர தாமத அறிவிப்புகள்.'
                : 'Quickly access timings, platform boarding bays, and disruption notices for your frequent buses.'}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700">
            <span>{favoriteServices.length} {lang === 'ta' ? 'சேமிக்கப்பட்ட பேருந்துகள்' : 'Saved Services'}</span>
          </div>
        </div>
      </div>

      {/* Disruption Warning for Saved Buses */}
      {affectedSavedBuses.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-950">
            <strong className="font-bold">
              {lang === 'ta' ? 'உங்கள் சேமிக்கப்பட்ட பேருந்துகளில் அவசர அறிவிப்பு உள்ளது!' : 'Urgent Alert for Your Saved Buses!'}
            </strong>
            <p className="mt-0.5 text-slate-700">
              {lang === 'ta'
                ? `${affectedSavedBuses.length} பேருந்துகள் தாமதம் அல்லது ரத்து செய்யப்பட்டுள்ளதாக பணிமனை மூலம் அறிவிக்கப்பட்டுள்ளது.`
                : `${affectedSavedBuses.length} of your bookmarked buses have active delay or cancellation notices.`}
            </p>
          </div>
        </div>
      )}

      {/* Saved Services List or Empty State */}
      {favoriteServices.length > 0 ? (
        <div className="space-y-4">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            {lang === 'ta' ? 'தினசரி அட்டவணை வரிசை:' : 'Daily Schedule List:'}
          </div>

          <div className="space-y-3">
            {favoriteServices.map(service => {
              const operator = operators.find(o => o.id === service.operatorId);
              const source = sources.find(s => s.id === service.sourceId);
              const fromStop = stops.find(s => s.id === service.originStopId);
              const toStop = stops.find(s => s.id === service.destinationStopId);
              const update = getActiveTripUpdate(tripUpdates, service.id);

              return (
                <DirectServiceCard
                  key={service.id}
                  service={service}
                  operator={operator}
                  source={source}
                  fromStop={fromStop}
                  toStop={toStop}
                  stops={stops}
                  activeUpdate={update}
                  isFavorite={true}
                  onToggleFavorite={onToggleFavorite}
                  onSelectService={onSelectService}
                  lang={lang}
                />
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center max-w-lg mx-auto shadow-2xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              {lang === 'ta' ? 'சேமிக்கப்பட்ட பேருந்துகள் எதுவும் இல்லை' : 'No Saved Buses Yet'}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {lang === 'ta'
                ? 'நீங்கள் அடிக்கடி செல்லும் பேருந்தின் கார்டில் உள்ள இதயக்குறியை (Heart) அழுத்தி இங்கு விரைவு பார்வைக்காக சேமிக்கலாம்.'
                : 'Click the heart icon on any bus result to bookmark it here for quick daily access and disruption alerts.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onNavigateToSearch}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition cursor-pointer inline-flex items-center gap-2 shadow-xs"
          >
            <Search className="w-4 h-4" />
            <span>{lang === 'ta' ? 'பேருந்துகளைத் தேட முகப்புக்குச் செல்க' : 'Search Buses in Corridor'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
