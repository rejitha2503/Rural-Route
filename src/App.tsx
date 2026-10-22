import React, { useState, useEffect } from 'react';
import { 
  Language, 
  UserRole, 
  BusService, 
  BusStop, 
  Operator, 
  DataSource, 
  TripUpdate, 
  PassengerReport, 
  UserProfile, 
  AuditLog,
  PassengerNavTab,
  PassengerAccount
} from './types';
import { storageService } from './services/storageService';
import { authService } from './services/authService';
import { Header } from './components/Header';
import { PassengerSearch } from './components/PassengerSearch';
import { BusRoutesView } from './components/BusRoutesView';
import { SavedBusesView } from './components/SavedBusesView';
import { HelpGuideView } from './components/HelpGuideView';
import { PassengerAuthModal } from './components/PassengerAuthModal';
import { PassengerProfileModal } from './components/PassengerProfileModal';
import { OfficerPortalModal } from './components/OfficerPortalModal';
import { ServiceDetailModal } from './components/ServiceDetailModal';
import { ReportMissingModal } from './components/ReportMissingModal';
import { DatabaseSchemaModal } from './components/DatabaseSchemaModal';
import { CorridorAboutModal } from './components/CorridorAboutModal';
import { getTranslation } from './i18n/translations';
import { Bus, KeyRound, Database, ShieldCheck } from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [currentRole, setCurrentRole] = useState<UserRole>('passenger');
  const [activeTab, setActiveTab] = useState<PassengerNavTab>('search');

  // Application Data State
  const [stops, setStops] = useState<BusStop[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [sources, setSources] = useState<DataSource[]>([]);
  const [services, setServices] = useState<BusService[]>([]);
  const [tripUpdates, setTripUpdates] = useState<TripUpdate[]>([]);
  const [reports, setReports] = useState<PassengerReport[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [cachedSearches, setCachedSearches] = useState<{ fromStopId: string; toStopId: string; timestamp: string }[]>([]);
  
  // Passenger Auth & Profile State
  const [passenger, setPassenger] = useState<PassengerAccount | null>(null);

  // Cross-view Route Selection (when navigating from BusRoutesView to Search)
  const [searchFromStopId, setSearchFromStopId] = useState<string>('stp_kvp_new');
  const [searchToStopId, setSearchToStopId] = useState<string>('stp_snkl_new');

  // Modals
  const [selectedService, setSelectedService] = useState<BusService | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isPortalModalOpen, setIsPortalModalOpen] = useState(false);

  // Load from storageService
  const refreshState = () => {
    setStops(storageService.getStops());
    setOperators(storageService.getOperators());
    setSources(storageService.getSources());
    setServices(storageService.getServices());
    setTripUpdates(storageService.getTripUpdates());
    setReports(storageService.getReports());
    setUsers(storageService.getUsers());
    setAuditLogs(storageService.getAuditLogs());
    setFavorites(storageService.getFavorites());
    setCachedSearches(storageService.getCachedSearches());
    setCurrentRole(storageService.getCurrentRole());
    setPassenger(authService.getCurrentPassenger());
  };

  useEffect(() => {
    refreshState();
    const unsubscribe = authService.subscribe((active) => {
      setPassenger(active);
    });
    return () => unsubscribe();
  }, []);

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    storageService.setCurrentRole(role);
  };

  const handleToggleFavorite = (serviceId: string) => {
    storageService.toggleFavorite(serviceId);
    setFavorites(storageService.getFavorites());
  };

  const handleAddCachedSearch = (fromId: string, toId: string) => {
    storageService.addCachedSearch(fromId, toId);
    setCachedSearches(storageService.getCachedSearches());
  };

  // Passenger Auth handlers
  const handlePassengerLogin = (account: PassengerAccount) => {
    setPassenger(account);
  };

  const handlePassengerLogout = async () => {
    await authService.logout();
    setPassenger(null);
  };

  const handlePassengerUpdateProfile = async (updates: Partial<PassengerAccount>) => {
    const updated = await authService.updateProfile(updates);
    if (updated) {
      setPassenger(updated);
    }
  };

  // Route Directory search shortcut
  const handleSelectRouteFromDirectory = (fromId: string, toId: string) => {
    setSearchFromStopId(fromId);
    setSearchToStopId(toId);
    setActiveTab('search');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitService = (newService: Omit<BusService, 'id' | 'createdAt' | 'updatedAt' | 'verificationStatus'>) => {
    storageService.submitService(newService, 'Demo Station Staff');
    refreshState();
  };

  const handleUpdateStatus = (
    serviceId: string, 
    status: 'verified' | 'needs_reverification' | 'unverified',
    verifierNotes: string
  ) => {
    storageService.updateServiceStatus(serviceId, status, 'Demo Timetable Verifier', verifierNotes);
    refreshState();
  };

  const handlePublishTripUpdate = (update: Omit<TripUpdate, 'id' | 'reportedAt' | 'status' | 'adminReviewed'>) => {
    storageService.publishTripUpdate(update, 'Demo Station Staff', currentRole);
    refreshState();
  };

  const handleResolveTripUpdate = (updateId: string) => {
    storageService.resolveTripUpdate(updateId, 'Demo System Admin');
    refreshState();
  };

  const handleUpdateUserRole = (userId: string, newRole: UserRole) => {
    storageService.updateUserRole(userId, newRole, 'Demo System Admin');
    refreshState();
  };

  const handleSubmitPassengerReport = (report: Omit<PassengerReport, 'id' | 'createdAt' | 'status'>) => {
    storageService.submitPassengerReport(report);
    refreshState();
  };

  const handleResetSeedData = () => {
    storageService.resetAllToSeed();
    refreshState();
  };

  const activeAlertCount = tripUpdates.filter(u => u.status === 'active').length;
  const t = getTranslation(lang);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-600 selection:text-white">
      {/* Upgraded Passenger Header */}
      <Header
        lang={lang}
        onLanguageChange={setLang}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        passenger={passenger}
        savedBusesCount={favorites.length}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenPortal={() => setIsPortalModalOpen(true)}
        onOpenAboutModal={() => setIsAboutModalOpen(true)}
        activeAlertCount={activeAlertCount}
        currentRole={currentRole}
        onReturnToPassenger={() => {
          handleRoleChange('passenger');
          setIsPortalModalOpen(false);
        }}
      />

      {/* Main Passenger Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 w-full">
        {activeTab === 'search' && (
          <PassengerSearch
            stops={stops}
            services={services}
            operators={operators}
            sources={sources}
            tripUpdates={tripUpdates}
            favorites={favorites}
            cachedSearches={cachedSearches}
            onToggleFavorite={handleToggleFavorite}
            onAddCachedSearch={handleAddCachedSearch}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onSelectService={setSelectedService}
            selectedFromStopId={searchFromStopId}
            selectedToStopId={searchToStopId}
            lang={lang}
          />
        )}

        {activeTab === 'routes' && (
          <BusRoutesView
            stops={stops}
            services={services}
            operators={operators}
            onSelectRouteSearch={handleSelectRouteFromDirectory}
            lang={lang}
          />
        )}

        {activeTab === 'saved' && (
          <SavedBusesView
            favorites={favorites}
            services={services}
            stops={stops}
            operators={operators}
            sources={sources}
            tripUpdates={tripUpdates}
            onToggleFavorite={handleToggleFavorite}
            onSelectService={setSelectedService}
            onNavigateToSearch={() => setActiveTab('search')}
            lang={lang}
          />
        )}

        {activeTab === 'help' && (
          <HelpGuideView
            onOpenReportModal={() => setIsReportModalOpen(true)}
            lang={lang}
          />
        )}
      </main>

      {/* Professional Passenger-First Footer */}
      <footer className="bg-white border-t border-slate-200/90 text-slate-500 text-xs py-8 px-4 mt-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Brand Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Bus className="w-4 h-4 text-emerald-600" />
              <span>RuralRoute (ரூரல்ரூட்)</span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Tamil Nadu passenger bus timetable initiative. Pilot corridor: Kovilpatti ↔ Sankarankovil (via Kalugumalai, Kuruvikulam, Ilayarasanendal).
            </p>
            <div className="pt-1 flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Zero Fabricated GPS • Verified Timetables Only</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-1.5">
            <div className="text-slate-900 font-bold text-xs uppercase tracking-wider">
              {lang === 'ta' ? 'பயணியர் இணைப்புகள்' : 'Passenger Links'}
            </div>
            <ul className="space-y-1 text-[11px] text-slate-600">
              <li>
                <button 
                  type="button" 
                  onClick={() => { setActiveTab('search'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-emerald-700 cursor-pointer"
                >
                  • {t.navHome}
                </button>
              </li>
              <li>
                <button 
                  type="button" 
                  onClick={() => { setActiveTab('routes'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-emerald-700 cursor-pointer"
                >
                  • {t.navRoutes}
                </button>
              </li>
              <li>
                <button 
                  type="button" 
                  onClick={() => { setActiveTab('saved'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-emerald-700 cursor-pointer"
                >
                  • {t.navSaved} ({favorites.length})
                </button>
              </li>
              <li>
                <button 
                  type="button" 
                  onClick={() => { setActiveTab('help'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-emerald-700 cursor-pointer"
                >
                  • {t.navHelp}
                </button>
              </li>
            </ul>
          </div>

          {/* Pilot Corridor Stops */}
          <div className="space-y-1.5">
            <div className="text-slate-900 font-bold text-xs uppercase tracking-wider">
              {lang === 'ta' ? 'முன்னோடி நிலையங்கள்' : 'Corridor Terminals'}
            </div>
            <ul className="space-y-1 text-[11px] text-slate-600">
              <li>• Kovilpatti New Bus Stand (Anna BS) - Bay 3, 4</li>
              <li>• Kalugumalai Bus Stand (Interchange Hub)</li>
              <li>• Kuruvikulam Junction Bus Stop</li>
              <li>• Sankarankovil New Bus Stand - Bay 1</li>
            </ul>
          </div>

          {/* Discreet Staff & Administration entry */}
          <div className="space-y-2">
            <div className="text-slate-900 font-bold text-xs uppercase tracking-wider">
              {lang === 'ta' ? 'நிர்வாகம் & தொழில்நுட்பம்' : 'Staff & Administration'}
            </div>
            {/* Truthful backend status indicator */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-[11px] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
              <span className="text-slate-700 font-medium">{t.backendLocal}</span>
            </div>
            
            <div className="flex flex-col gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => setIsPortalModalOpen(true)}
                className="text-slate-700 hover:text-slate-900 font-semibold text-[11px] flex items-center gap-1.5 cursor-pointer"
              >
                <KeyRound className="w-3 h-3 text-slate-400" />
                <span>{t.navStaffLogin} (Demo Simulation)</span>
              </button>
              <button
                type="button"
                onClick={() => setIsSchemaModalOpen(true)}
                className="text-slate-700 hover:text-slate-900 font-semibold text-[11px] flex items-center gap-1.5 cursor-pointer"
              >
                <Database className="w-3 h-3 text-slate-400" />
                <span>{t.devSettings}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-slate-100 mt-6 pt-4 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
          <span>RuralRoute • Tamil Nadu Pilot Bus Information Service</span>
          <span>Version 1.2 (Passenger Edition Prototype)</span>
        </div>
      </footer>

      {/* Passenger Authentication Modal */}
      <PassengerAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handlePassengerLogin}
        lang={lang}
      />

      {/* Passenger Profile Modal */}
      <PassengerProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        passenger={passenger}
        savedBusesCount={favorites.length}
        onLogout={handlePassengerLogout}
        onUpdateProfile={handlePassengerUpdateProfile}
        onNavigateToSaved={() => setActiveTab('saved')}
        lang={lang}
      />

      {/* Discreet Staff & Officer Portal Modal */}
      <OfficerPortalModal
        isOpen={isPortalModalOpen}
        onClose={() => setIsPortalModalOpen(false)}
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        stops={stops}
        operators={operators}
        sources={sources}
        services={services}
        tripUpdates={tripUpdates}
        users={users}
        auditLogs={auditLogs}
        reports={reports}
        onSubmitService={handleSubmitService}
        onPublishTripUpdate={handlePublishTripUpdate}
        onUpdateStatus={handleUpdateStatus}
        onUpdateUserRole={handleUpdateUserRole}
        onResolveTripUpdate={handleResolveTripUpdate}
        onOpenSchemaModal={() => {
          setIsPortalModalOpen(false);
          setIsSchemaModalOpen(true);
        }}
        onResetSeedData={handleResetSeedData}
        lang={lang}
      />

      {/* Journey Detail Modal */}
      <ServiceDetailModal
        service={selectedService}
        stops={stops}
        operators={operators}
        sources={sources}
        tripUpdates={tripUpdates}
        lang={lang}
        onClose={() => setSelectedService(null)}
      />

      {/* Crowdsourced Passenger Report Modal */}
      <ReportMissingModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleSubmitPassengerReport}
        lang={lang}
      />

      {/* Developer & Supabase DDL Settings Modal */}
      <DatabaseSchemaModal
        isOpen={isSchemaModalOpen}
        onClose={() => setIsSchemaModalOpen(false)}
        lang={lang}
      />

      {/* About Corridor & Data Integrity Modal */}
      <CorridorAboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
        lang={lang}
      />
    </div>
  );
}
