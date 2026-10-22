import {
  BusStop,
  Operator,
  DataSource,
  BusService,
  TripUpdate,
  PassengerReport,
  AuditLog,
  UserProfile,
  UserRole,
  PassengerAccount,
} from '../types';
import {
  INITIAL_STOPS,
  INITIAL_OPERATORS,
  INITIAL_SOURCES,
  INITIAL_SERVICES,
  INITIAL_TRIP_UPDATES,
  INITIAL_USERS,
} from '../data/mockData';

export const INITIAL_PASSENGERS: PassengerAccount[] = [
  {
    id: 'pass_01',
    fullName: 'Anitha Ramanathan',
    email: 'anitha@example.com',
    phone: '+919842154321',
    displayPhone: 'anitha@example.com',
    preferredCorridor: 'Kovilpatti ↔ Kalugumalai',
    createdAt: '2026-10-15T08:00:00Z',
  },
  {
    id: 'pass_02',
    fullName: 'Karthik Raja',
    email: 'karthik@example.com',
    phone: '+919786012345',
    displayPhone: 'karthik@example.com',
    preferredCorridor: 'Kovilpatti ↔ Sankarankovil',
    createdAt: '2026-10-16T09:30:00Z',
  }
];

const STORAGE_KEYS = {
  STOPS: 'ruralroute_stops_v1',
  OPERATORS: 'ruralroute_operators_v1',
  SOURCES: 'ruralroute_sources_v1',
  SERVICES: 'ruralroute_services_v1',
  TRIP_UPDATES: 'ruralroute_trip_updates_v1',
  REPORTS: 'ruralroute_reports_v1',
  USERS: 'ruralroute_users_v1',
  AUDIT_LOGS: 'ruralroute_audit_logs_v1',
  FAVORITES: 'ruralroute_favorites_v1',
  CACHED_SEARCHES: 'ruralroute_cached_searches_v1',
  CURRENT_ROLE: 'ruralroute_current_role_v1',
  PASSENGERS: 'ruralroute_passengers_v1',
  CURRENT_PASSENGER: 'ruralroute_current_passenger_v1',
};

class StorageService {
  private stops: BusStop[] = [];
  private operators: Operator[] = [];
  private sources: DataSource[] = [];
  private services: BusService[] = [];
  private tripUpdates: TripUpdate[] = [];
  private reports: PassengerReport[] = [];
  private users: UserProfile[] = [];
  private auditLogs: AuditLog[] = [];
  private favorites: string[] = []; // service IDs
  private cachedSearches: { fromStopId: string; toStopId: string; timestamp: string }[] = [];
  private currentRole: UserRole = 'passenger';
  private passengers: PassengerAccount[] = [];
  private currentPassenger: PassengerAccount | null = null;

  constructor() {
    this.init();
  }

  private init() {
    this.stops = this.load(STORAGE_KEYS.STOPS, INITIAL_STOPS);
    this.operators = this.load(STORAGE_KEYS.OPERATORS, INITIAL_OPERATORS);
    this.sources = this.load(STORAGE_KEYS.SOURCES, INITIAL_SOURCES);
    this.services = this.load(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
    this.tripUpdates = this.load(STORAGE_KEYS.TRIP_UPDATES, INITIAL_TRIP_UPDATES);
    this.users = this.load(STORAGE_KEYS.USERS, INITIAL_USERS);
    this.reports = this.load(STORAGE_KEYS.REPORTS, []);
    this.passengers = this.load(STORAGE_KEYS.PASSENGERS, INITIAL_PASSENGERS);
    this.currentPassenger = this.load(STORAGE_KEYS.CURRENT_PASSENGER, null);
    this.auditLogs = this.load(STORAGE_KEYS.AUDIT_LOGS, [
      {
        id: 'aud_init_01',
        action: 'INITIAL_SEED',
        entityType: 'bus_service',
        entityId: 'srv_kvp_snkl_01',
        actorName: 'System Setup',
        actorRole: 'admin',
        details: 'Seeded initial verified Kovilpatti - Sankarankovil corridor timetables',
        timestamp: '2026-10-15T10:00:00Z',
      }
    ]);
    this.favorites = this.load(STORAGE_KEYS.FAVORITES, ['srv_kvp_snkl_01']);
    this.cachedSearches = this.load(STORAGE_KEYS.CACHED_SEARCHES, [
      { fromStopId: 'stp_kvp_new', toStopId: 'stp_snkl_new', timestamp: '2026-10-18T00:00:00Z' }
    ]);
    this.currentRole = this.load(STORAGE_KEYS.CURRENT_ROLE, 'passenger');
  }

  private load<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      if (data) {
        return JSON.parse(data) as T;
      }
    } catch {
      // LocalStorage error or not available
    }
    return fallback;
  }

  private save(key: string, data: unknown) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch {
      // Ignore in restricted environments
    }
  }

  // Current Role
  getCurrentRole(): UserRole {
    return this.currentRole;
  }

  setCurrentRole(role: UserRole) {
    this.currentRole = role;
    this.save(STORAGE_KEYS.CURRENT_ROLE, role);
  }

  // Getters
  getStops(): BusStop[] {
    return [...this.stops];
  }

  getStopById(id: string): BusStop | undefined {
    return this.stops.find(s => s.id === id);
  }

  getOperators(): Operator[] {
    return [...this.operators];
  }

  getOperatorById(id: string): Operator | undefined {
    return this.operators.find(o => o.id === id);
  }

  getSources(): DataSource[] {
    return [...this.sources];
  }

  getSourceById(id: string): DataSource | undefined {
    return this.sources.find(s => s.id === id);
  }

  getServices(): BusService[] {
    return [...this.services];
  }

  getServiceById(id: string): BusService | undefined {
    return this.services.find(s => s.id === id);
  }

  getTripUpdates(): TripUpdate[] {
    return [...this.tripUpdates];
  }

  getReports(): PassengerReport[] {
    return [...this.reports];
  }

  getUsers(): UserProfile[] {
    return [...this.users];
  }

  getAuditLogs(): AuditLog[] {
    return [...this.auditLogs];
  }

  getFavorites(): string[] {
    return [...this.favorites];
  }

  getCachedSearches() {
    return [...this.cachedSearches];
  }

  // Favorites
  toggleFavorite(serviceId: string): boolean {
    const idx = this.favorites.indexOf(serviceId);
    let isFav = false;
    if (idx >= 0) {
      this.favorites.splice(idx, 1);
      isFav = false;
    } else {
      this.favorites.push(serviceId);
      isFav = true;
    }
    this.save(STORAGE_KEYS.FAVORITES, this.favorites);
    return isFav;
  }

  // Recent searches caching
  addCachedSearch(fromStopId: string, toStopId: string) {
    // Avoid duplicates at head
    this.cachedSearches = this.cachedSearches.filter(
      s => !(s.fromStopId === fromStopId && s.toStopId === toStopId)
    );
    this.cachedSearches.unshift({
      fromStopId,
      toStopId,
      timestamp: new Date().toISOString(),
    });
    if (this.cachedSearches.length > 5) {
      this.cachedSearches = this.cachedSearches.slice(0, 5);
    }
    this.save(STORAGE_KEYS.CACHED_SEARCHES, this.cachedSearches);
  }

  // Staff: Submit new service
  submitService(service: Omit<BusService, 'id' | 'createdAt' | 'updatedAt' | 'verificationStatus'>, actorName: string): BusService {
    const newService: BusService = {
      ...service,
      id: `srv_${Date.now()}`,
      verificationStatus: 'pending_verification',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      submittedBy: actorName,
    };

    this.services.unshift(newService);
    this.save(STORAGE_KEYS.SERVICES, this.services);

    this.addAuditLog({
      action: 'SERVICE_SUBMITTED',
      entityType: 'bus_service',
      entityId: newService.id,
      actorName,
      actorRole: 'staff',
      details: `Submitted new bus service ${newService.serviceNumber} (${newService.viaSummaryEn}) for verifier review`,
    });

    return newService;
  }

  // Verifier: Update service status
  updateServiceStatus(
    serviceId: string,
    status: 'verified' | 'needs_reverification' | 'unverified',
    actorName: string,
    verifierNotes: string
  ): boolean {
    const service = this.services.find(s => s.id === serviceId);
    if (!service) return false;

    service.verificationStatus = status;
    service.verifiedBy = actorName;
    service.verifierNotes = verifierNotes;
    service.lastVerifiedAt = new Date().toISOString();
    service.updatedAt = new Date().toISOString();

    this.save(STORAGE_KEYS.SERVICES, this.services);

    this.addAuditLog({
      action: `SERVICE_${status.toUpperCase()}`,
      entityType: 'bus_service',
      entityId: service.id,
      actorName,
      actorRole: 'verifier',
      details: `Updated verification status of ${service.serviceNumber} to ${status}. Notes: ${verifierNotes}`,
    });

    return true;
  }

  // Staff: Publish Urgent Trip Update (delay / cancellation)
  publishTripUpdate(
    update: Omit<TripUpdate, 'id' | 'reportedAt' | 'status' | 'adminReviewed'>,
    actorName: string,
    actorRole: UserRole
  ): TripUpdate {
    const newUpdate: TripUpdate = {
      ...update,
      id: `upd_${Date.now()}`,
      reportedAt: new Date().toISOString(),
      status: 'active',
      adminReviewed: actorRole === 'admin',
    };

    this.tripUpdates.unshift(newUpdate);
    this.save(STORAGE_KEYS.TRIP_UPDATES, this.tripUpdates);

    this.addAuditLog({
      action: 'TRIP_UPDATE_PUBLISHED',
      entityType: 'trip_update',
      entityId: newUpdate.id,
      actorName,
      actorRole,
      details: `Published urgent ${newUpdate.updateType.toUpperCase()} for service. Reason: ${newUpdate.reasonEn}`,
    });

    return newUpdate;
  }

  // Admin: Resolve or review trip update
  resolveTripUpdate(updateId: string, actorName: string) {
    const update = this.tripUpdates.find(u => u.id === updateId);
    if (update) {
      update.status = 'resolved';
      update.adminReviewed = true;
      this.save(STORAGE_KEYS.TRIP_UPDATES, this.tripUpdates);

      this.addAuditLog({
        action: 'TRIP_UPDATE_RESOLVED',
        entityType: 'trip_update',
        entityId: updateId,
        actorName,
        actorRole: 'admin',
        details: `Marked trip update as resolved`,
      });
    }
  }

  // Passenger: Submit Report
  submitPassengerReport(report: Omit<PassengerReport, 'id' | 'createdAt' | 'status'>): PassengerReport {
    const newReport: PassengerReport = {
      ...report,
      id: `rep_${Date.now()}`,
      status: 'new',
      createdAt: new Date().toISOString(),
    };

    this.reports.unshift(newReport);
    this.save(STORAGE_KEYS.REPORTS, this.reports);

    this.addAuditLog({
      action: 'PASSENGER_REPORT_SUBMITTED',
      entityType: 'passenger_report',
      entityId: newReport.id,
      actorName: report.userEmail || 'Guest Passenger',
      actorRole: 'passenger',
      details: `Reported issue with ${report.routeOrService}: ${report.reportType} - ${report.details}`,
    });

    return newReport;
  }

  // Admin: Update User Role
  updateUserRole(userId: string, newRole: UserRole, adminName: string) {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      const oldRole = user.role;
      user.role = newRole;
      this.save(STORAGE_KEYS.USERS, this.users);

      this.addAuditLog({
        action: 'USER_ROLE_CHANGED',
        entityType: 'user_role',
        entityId: userId,
        actorName: adminName,
        actorRole: 'admin',
        details: `Changed role of ${user.fullName} (${user.email}) from ${oldRole} to ${newRole}`,
      });
    }
  }

  // Audit Log helper
  private addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>) {
    const entry: AuditLog = {
      ...log,
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.unshift(entry);
    this.save(STORAGE_KEYS.AUDIT_LOGS, this.auditLogs);
  }

  // Passenger Authentication & Profile (Local demo mode)
  getCurrentPassenger(): PassengerAccount | null {
    return this.currentPassenger;
  }

  getPassengers(): PassengerAccount[] {
    return [...this.passengers];
  }

  loginPassenger(phone: string): { success: boolean; passenger?: PassengerAccount; error?: string } {
    const clean = phone.trim();
    const existing = this.passengers.find(
      p => p.phone === clean || p.displayPhone === clean || p.fullName.toLowerCase() === clean.toLowerCase()
    );
    if (existing) {
      this.currentPassenger = existing;
      this.save(STORAGE_KEYS.CURRENT_PASSENGER, existing);
      return { success: true, passenger: existing };
    }
    const newPassenger: PassengerAccount = {
      id: `pass_${Date.now()}`,
      fullName: clean,
      email: clean.includes('@') ? clean : `${clean.replace(/\D/g, '') || 'user'}@example.com`,
      phone: clean,
      displayPhone: clean,
      preferredCorridor: 'Kovilpatti ↔ Sankarankovil',
      createdAt: new Date().toISOString(),
    };
    this.passengers.push(newPassenger);
    this.save(STORAGE_KEYS.PASSENGERS, this.passengers);
    this.currentPassenger = newPassenger;
    this.save(STORAGE_KEYS.CURRENT_PASSENGER, newPassenger);
    return { success: true, passenger: newPassenger };
  }

  registerPassenger(fullName: string, emailOrPhone: string, preferredCorridor?: string): { success: boolean; passenger?: PassengerAccount; error?: string } {
    const clean = emailOrPhone.trim();
    const existing = this.passengers.find(p => p.phone === clean || p.email === clean);
    if (existing) {
      this.currentPassenger = existing;
      this.save(STORAGE_KEYS.CURRENT_PASSENGER, existing);
      return { success: true, passenger: existing };
    }
    const newPassenger: PassengerAccount = {
      id: `pass_${Date.now()}`,
      fullName: fullName.trim() || 'Passenger',
      email: clean.includes('@') ? clean : `${clean.replace(/\D/g, '') || 'user'}@example.com`,
      phone: clean,
      displayPhone: clean,
      preferredCorridor: preferredCorridor || 'Kovilpatti ↔ Sankarankovil',
      createdAt: new Date().toISOString(),
    };
    this.passengers.push(newPassenger);
    this.save(STORAGE_KEYS.PASSENGERS, this.passengers);
    this.currentPassenger = newPassenger;
    this.save(STORAGE_KEYS.CURRENT_PASSENGER, newPassenger);
    return { success: true, passenger: newPassenger };
  }

  logoutPassenger() {
    this.currentPassenger = null;
    try {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_PASSENGER);
    } catch {
      // Ignore
    }
  }

  updatePassengerProfile(updates: Partial<PassengerAccount>): PassengerAccount | null {
    if (!this.currentPassenger) return null;
    const updated = { ...this.currentPassenger, ...updates };
    this.currentPassenger = updated;
    this.save(STORAGE_KEYS.CURRENT_PASSENGER, updated);
    const idx = this.passengers.findIndex(p => p.id === updated.id);
    if (idx >= 0) {
      this.passengers[idx] = updated;
      this.save(STORAGE_KEYS.PASSENGERS, this.passengers);
    }
    return updated;
  }

  // Reset to initial seed data
  resetAllToSeed() {
    localStorage.removeItem(STORAGE_KEYS.SERVICES);
    localStorage.removeItem(STORAGE_KEYS.TRIP_UPDATES);
    localStorage.removeItem(STORAGE_KEYS.REPORTS);
    localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.PASSENGERS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_PASSENGER);
    this.init();
  }
}

export const storageService = new StorageService();
