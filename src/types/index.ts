export type UserRole = 'passenger' | 'staff' | 'verifier' | 'admin';

export type Language = 'en' | 'ta';

export type VerificationStatus = 
  | 'verified' 
  | 'pending_verification' 
  | 'needs_reverification' 
  | 'unverified';

export type UpdateType = 'delay' | 'cancellation' | 'route_diverted' | 'platform_change';

export type PassengerNavTab = 'search' | 'routes' | 'saved' | 'help';

export interface PassengerAccount {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  displayPhone: string;
  preferredCorridor?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  depot?: string;
  createdAt: string;
}

export interface Operator {
  id: string;
  name: string;
  nameTa: string;
  type: 'TNSTC' | 'SETC' | 'Private';
  depot: string;
  contactPhone?: string;
}

export interface BusStop {
  id: string;
  nameEn: string;
  nameTa: string;
  code: string;
  latitude?: number;
  longitude?: number;
  isVerified: boolean;
  landmarkEn?: string;
  landmarkTa?: string;
  district: string;
}

export interface DataSource {
  id: string;
  name: string;
  type: 'official_tnstc' | 'depot_notice_board' | 'bus_stand_inquiry' | 'field_survey' | 'passenger_report';
  trustScore: number; // 1 to 5
}

export interface IntermediateStop {
  stopId: string;
  stopSequence: number;
  scheduledTime?: string;
  distanceKm?: number;
}

export interface BusService {
  id: string;
  serviceNumber: string; // e.g. "TNSTC 114A" or "45B"
  routeNumber: string;
  operatorId: string;
  originStopId: string;
  destinationStopId: string;
  viaSummaryEn: string;
  viaSummaryTa: string;
  serviceType: 'Ordinary' | 'Express' | 'Deluxe / Point-to-Point' | 'Town Bus';
  serviceDays: string[]; // ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] or ['Daily']
  departureTime: string; // "06:15" 24h
  estimatedArrivalTime: string; // "07:30" 24h
  boardingPointEn: string;
  boardingPointTa: string;
  boardingBay?: string; // e.g. "Bay 3 (Sankarankovil / Tenkasi Platform)"
  intermediateStops: IntermediateStop[];
  sourceId: string;
  verificationStatus: VerificationStatus;
  lastVerifiedAt: string; // ISO date string
  validUntil: string; // ISO date string
  verifiedBy?: string;
  verifierNotes?: string;
  submissionNotes?: string;
  submittedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TripUpdate {
  id: string;
  serviceId: string;
  updateType: UpdateType;
  delayMinutes?: number;
  reasonEn: string;
  reasonTa: string;
  publisherName: string;
  publisherRole: UserRole;
  source: string;
  reportedAt: string;
  expiresAt: string;
  status: 'active' | 'resolved' | 'expired';
  adminReviewed: boolean;
}

export interface PassengerReport {
  id: string;
  userEmail?: string;
  routeOrService: string;
  reportType: 'missing_bus' | 'wrong_timing' | 'boarding_point_change' | 'cancelled_without_notice';
  details: string;
  status: 'new' | 'under_review' | 'verified_and_updated' | 'rejected';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: 'bus_service' | 'trip_update' | 'user_role' | 'passenger_report';
  entityId: string;
  actorName: string;
  actorRole: UserRole;
  details: string;
  timestamp: string;
}

export interface ConnectingJourney {
  firstService: BusService;
  secondService: BusService;
  transferStopId: string;
  waitingTimeMinutes: number;
  totalDurationMinutes: number;
  isIndicative: boolean;
}

export interface SearchResult {
  directServices: BusService[];
  connectingJourneys: ConnectingJourney[];
  fromStop: BusStop;
  toStop: BusStop;
  travelDate: string;
}
