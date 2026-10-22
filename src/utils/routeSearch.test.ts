import test from 'node:test';
import assert from 'node:assert/strict';
import {
  timeToMinutes,
  minutesToTime,
  isTimetableExpired,
  findDirectServices,
  findConnectingJourneys,
  operatesOnDay
} from './routeSearch.ts';
import type { BusService } from '../types/index.ts';

const mockTestServices: BusService[] = [
  {
    id: 's1',
    serviceNumber: '114A',
    routeNumber: '114A',
    operatorId: 'op1',
    originStopId: 'stp_kvp_new',
    destinationStopId: 'stp_snkl_new',
    viaSummaryEn: 'via Kalugumalai',
    viaSummaryTa: 'கழுகுமலை வழியாக',
    serviceType: 'Ordinary',
    serviceDays: ['Daily'],
    departureTime: '06:15',
    estimatedArrivalTime: '07:35',
    boardingPointEn: 'KVP Bay 3',
    boardingPointTa: 'கோவில்பட்டி நடைமேடை 3',
    intermediateStops: [
      { stopId: 'stp_kvp_new', stopSequence: 1, scheduledTime: '06:15' },
      { stopId: 'stp_kalugumalai', stopSequence: 2, scheduledTime: '06:55' },
      { stopId: 'stp_snkl_new', stopSequence: 3, scheduledTime: '07:35' },
    ],
    sourceId: 'src1',
    verificationStatus: 'verified',
    lastVerifiedAt: '2026-10-15T10:00:00Z',
    validUntil: '2026-12-31T23:59:59Z',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-10-15T10:00:00Z',
  },
  {
    id: 's2_expired',
    serviceNumber: '22C',
    routeNumber: '22C',
    operatorId: 'op1',
    originStopId: 'stp_kvp_new',
    destinationStopId: 'stp_snkl_new',
    viaSummaryEn: 'via Thiruvenkadam',
    viaSummaryTa: 'திருவேங்கடம் வழியாக',
    serviceType: 'Ordinary',
    serviceDays: ['Daily'],
    departureTime: '14:20',
    estimatedArrivalTime: '15:55',
    boardingPointEn: 'KVP Bay 2',
    boardingPointTa: 'கோவில்பட்டி நடைமேடை 2',
    intermediateStops: [
      { stopId: 'stp_kvp_new', stopSequence: 1, scheduledTime: '14:20' },
      { stopId: 'stp_snkl_new', stopSequence: 2, scheduledTime: '15:55' },
    ],
    sourceId: 'src2',
    verificationStatus: 'needs_reverification',
    lastVerifiedAt: '2026-05-01T10:00:00Z',
    validUntil: '2026-08-01T23:59:59Z', // Expired
    createdAt: '2026-05-01T08:00:00Z',
    updatedAt: '2026-05-01T10:00:00Z',
  },
  // Connecting leg A
  {
    id: 's_conn_a',
    serviceNumber: '33',
    routeNumber: '33',
    operatorId: 'op1',
    originStopId: 'stp_kvp_new',
    destinationStopId: 'stp_kalugumalai',
    viaSummaryEn: 'Direct',
    viaSummaryTa: 'நேரடி',
    serviceType: 'Town Bus',
    serviceDays: ['Daily'],
    departureTime: '10:00',
    estimatedArrivalTime: '10:40',
    boardingPointEn: 'KVP Bay 1',
    boardingPointTa: 'கோவில்பட்டி நடைமேடை 1',
    intermediateStops: [
      { stopId: 'stp_kvp_new', stopSequence: 1, scheduledTime: '10:00' },
      { stopId: 'stp_kalugumalai', stopSequence: 2, scheduledTime: '10:40' },
    ],
    sourceId: 'src1',
    verificationStatus: 'verified',
    lastVerifiedAt: '2026-10-15T10:00:00Z',
    validUntil: '2026-12-31T23:59:59Z',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-10-15T10:00:00Z',
  },
  // Connecting leg B
  {
    id: 's_conn_b',
    serviceNumber: '81A',
    routeNumber: '81A',
    operatorId: 'op2',
    originStopId: 'stp_kalugumalai',
    destinationStopId: 'stp_snkl_new',
    viaSummaryEn: 'via Kuruvikulam',
    viaSummaryTa: 'குருவிகுளம் வழியாக',
    serviceType: 'Ordinary',
    serviceDays: ['Daily'],
    departureTime: '11:05',
    estimatedArrivalTime: '11:45',
    boardingPointEn: 'Kalugumalai Shelter',
    boardingPointTa: 'கழுகுமலை நிறுத்தம்',
    intermediateStops: [
      { stopId: 'stp_kalugumalai', stopSequence: 1, scheduledTime: '11:05' },
      { stopId: 'stp_snkl_new', stopSequence: 2, scheduledTime: '11:45' },
    ],
    sourceId: 'src1',
    verificationStatus: 'verified',
    lastVerifiedAt: '2026-10-15T10:00:00Z',
    validUntil: '2026-12-31T23:59:59Z',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-10-15T10:00:00Z',
  }
];

test('timeToMinutes converts HH:MM properly', () => {
  assert.equal(timeToMinutes('06:15'), 375);
  assert.equal(timeToMinutes('00:00'), 0);
  assert.equal(timeToMinutes('23:59'), 1439);
});

test('minutesToTime formats correctly', () => {
  assert.equal(minutesToTime(375), '06:15');
  assert.equal(minutesToTime(0), '00:00');
  assert.equal(minutesToTime(1439), '23:59');
});

test('isTimetableExpired detects past valid dates', () => {
  const expired = isTimetableExpired('2026-08-01T00:00:00Z', '2026-10-18T00:00:00Z');
  const valid = isTimetableExpired('2026-12-31T00:00:00Z', '2026-10-18T00:00:00Z');
  assert.equal(expired, true);
  assert.equal(valid, false);
});

test('operatesOnDay checks service days', () => {
  assert.equal(operatesOnDay(['Daily'], 'Mon'), true);
  assert.equal(operatesOnDay(['Mon', 'Tue'], 'Mon'), true);
  assert.equal(operatesOnDay(['Mon', 'Tue'], 'Wed'), false);
});

test('findDirectServices finds services between origin and destination in order', () => {
  const direct = findDirectServices(mockTestServices, 'stp_kvp_new', 'stp_snkl_new');
  assert.equal(direct.length, 2);
  // Verified should come first
  assert.equal(direct[0].id, 's1');
  assert.equal(direct[1].id, 's2_expired');
});

test('findDirectServices returns empty for reverse or invalid stops', () => {
  const direct = findDirectServices(mockTestServices, 'stp_snkl_new', 'stp_kvp_new');
  assert.equal(direct.length, 0); // None of these test services go reverse
});

test('findConnectingJourneys finds 1-transfer connection at Kalugumalai', () => {
  const connections = findConnectingJourneys(mockTestServices, 'stp_kvp_new', 'stp_snkl_new', 10, 60);
  assert.equal(connections.length, 1);
  assert.equal(connections[0].firstService.id, 's_conn_a');
  assert.equal(connections[0].secondService.id, 's_conn_b');
  assert.equal(connections[0].transferStopId, 'stp_kalugumalai');
  // 10:40 arrival, 11:05 departure -> 25 mins wait
  assert.equal(connections[0].waitingTimeMinutes, 25);
  // 10:00 to 11:45 -> 105 mins total
  assert.equal(connections[0].totalDurationMinutes, 105);
});
