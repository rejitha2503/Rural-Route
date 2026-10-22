import type { BusService, ConnectingJourney, TripUpdate } from '../types/index.ts';

/**
 * Converts a "HH:MM" (24h) string to minutes since midnight.
 */
export function timeToMinutes(timeStr: string): number {
  if (!timeStr || !timeStr.includes(':')) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

/**
 * Converts minutes since midnight to "HH:MM".
 */
export function minutesToTime(mins: number): string {
  const normalized = ((mins % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Checks if a timetable validity date has expired.
 */
export function isTimetableExpired(validUntil?: string, referenceIso?: string): boolean {
  if (!validUntil) return false;
  const refDate = referenceIso ? new Date(referenceIso) : new Date();
  const validDate = new Date(validUntil);
  return refDate.getTime() > validDate.getTime();
}

/**
 * Checks if a service operates on a given day of the week (e.g. 'Mon', 'Daily').
 */
export function operatesOnDay(serviceDays: string[], dayAbbr: string): boolean {
  if (!serviceDays || serviceDays.length === 0) return true;
  if (serviceDays.includes('Daily') || serviceDays.includes('All Days')) return true;
  return serviceDays.includes(dayAbbr);
}

/**
 * Gets the scheduled departure/arrival time at a specific stop for a service.
 */
export function getTimeAtStop(service: BusService, stopId: string): { departureTime?: string; arrivalTime?: string; sequence: number } | null {
  const stopIndex = service.intermediateStops.findIndex(s => s.stopId === stopId);
  if (stopIndex === -1) return null;
  const item = service.intermediateStops[stopIndex];
  
  // If first stop, its scheduledTime is departureTime
  if (stopIndex === 0) {
    return {
      departureTime: item.scheduledTime || service.departureTime,
      sequence: item.stopSequence,
    };
  }
  
  // If last stop, its scheduledTime is arrivalTime
  if (stopIndex === service.intermediateStops.length - 1) {
    return {
      arrivalTime: item.scheduledTime || service.estimatedArrivalTime,
      sequence: item.stopSequence,
    };
  }

  // Intermediate
  return {
    departureTime: item.scheduledTime,
    arrivalTime: item.scheduledTime,
    sequence: item.stopSequence,
  };
}

/**
 * Finds direct bus services between fromStopId and toStopId.
 * Prioritizes verified services first.
 */
export function findDirectServices(
  services: BusService[],
  fromStopId: string,
  toStopId: string,
  targetDay = 'Daily'
): BusService[] {
  if (!fromStopId || !toStopId || fromStopId === toStopId) {
    return [];
  }

  const matches: BusService[] = [];

  for (const srv of services) {
    // Only search active published services (verified or needs_reverification)
    if (srv.verificationStatus === 'pending_verification') {
      continue;
    }

    if (targetDay !== 'Daily' && !operatesOnDay(srv.serviceDays, targetDay)) {
      continue;
    }

    const fromInfo = getTimeAtStop(srv, fromStopId);
    const toInfo = getTimeAtStop(srv, toStopId);

    if (fromInfo && toInfo && fromInfo.sequence < toInfo.sequence) {
      matches.push(srv);
    }
  }

  // Sort: verified first, then by departure time
  return matches.sort((a, b) => {
    if (a.verificationStatus === 'verified' && b.verificationStatus !== 'verified') return -1;
    if (a.verificationStatus !== 'verified' && b.verificationStatus === 'verified') return 1;
    return timeToMinutes(a.departureTime) - timeToMinutes(b.departureTime);
  });
}

/**
 * Finds verified one-transfer journeys between fromStopId and toStopId.
 * Criteria:
 * - Bus 1 travels from fromStopId -> TransferStop T
 * - Bus 2 travels from TransferStop T -> toStopId
 * - Bus 2 departs after Bus 1 arrives with buffer (minBufferMins <= wait <= maxWaitMins)
 * - Returns only when enough data exists (no invented connections)
 */
export function findConnectingJourneys(
  services: BusService[],
  fromStopId: string,
  toStopId: string,
  minBufferMins = 10,
  maxWaitMins = 120,
  targetDay = 'Daily'
): ConnectingJourney[] {
  if (!fromStopId || !toStopId || fromStopId === toStopId) {
    return [];
  }

  // Consider non-pending candidate services for connecting routes
  const candidateServices = services.filter(
    s => s.verificationStatus !== 'pending_verification' && (targetDay === 'Daily' || operatesOnDay(s.serviceDays, targetDay))
  );

  const directServices = findDirectServices(candidateServices, fromStopId, toStopId, targetDay);
  const directServiceIds = new Set(directServices.map(s => s.id));

  const connections: ConnectingJourney[] = [];

  // Look for potential transfer stops
  for (const bus1 of candidateServices) {
    if (directServiceIds.has(bus1.id)) continue;

    const bus1From = getTimeAtStop(bus1, fromStopId);
    if (!bus1From) continue;

    // Intermediate stops after fromStopId
    const candidateTransfers = bus1.intermediateStops.filter(s => s.stopSequence > bus1From.sequence && s.stopId !== toStopId);

    for (const transferStop of candidateTransfers) {
      const bus1ArrivalAtT = transferStop.scheduledTime || bus1.estimatedArrivalTime;
      const bus1ArrivalMins = timeToMinutes(bus1ArrivalAtT);

      // Now search for bus 2 starting at transferStop.stopId and reaching toStopId
      for (const bus2 of candidateServices) {
        if (bus2.id === bus1.id) continue;

        const bus2AtT = getTimeAtStop(bus2, transferStop.stopId);
        const bus2To = getTimeAtStop(bus2, toStopId);

        if (!bus2AtT || !bus2To || bus2AtT.sequence >= bus2To.sequence) {
          continue;
        }

        const bus2DepartureAtT = bus2AtT.departureTime || bus2.departureTime;
        const bus2DepartureMins = timeToMinutes(bus2DepartureAtT);

        const waitTime = bus2DepartureMins - bus1ArrivalMins;

        // Valid transfer window
        if (waitTime >= minBufferMins && waitTime <= maxWaitMins) {
          const bus1DepartureFromOrigin = bus1From.departureTime || bus1.departureTime;
          const bus2ArrivalAtDest = bus2To.arrivalTime || bus2.estimatedArrivalTime;
          const totalDuration = timeToMinutes(bus2ArrivalAtDest) - timeToMinutes(bus1DepartureFromOrigin);

          // Only add if totalDuration > 0
          if (totalDuration > 0) {
            connections.push({
              firstService: bus1,
              secondService: bus2,
              transferStopId: transferStop.stopId,
              waitingTimeMinutes: waitTime,
              totalDurationMinutes: totalDuration,
              isIndicative: true,
            });
          }
        }
      }
    }
  }

  // Sort by shortest total duration
  return connections.sort((a, b) => a.totalDurationMinutes - b.totalDurationMinutes);
}

/**
 * Finds active trip update (delay / cancellation) for a given service.
 */
export function getActiveTripUpdate(updates: TripUpdate[], serviceId: string): TripUpdate | undefined {
  return updates.find(u => u.serviceId === serviceId && u.status === 'active');
}
