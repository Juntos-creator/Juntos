import AsyncStorage from '@react-native-async-storage/async-storage';

export type DemoServiceStatus =
  | 'PENDIENTE'
  | 'ASIGNADO'
  | 'EN_CURSO'
  | 'COMPLETADO'
  | 'CANCELADO'
  | 'CALIFICADO';

export type DemoCompanion = {
  id: string;
  name: string;
  role: string;
  type: string;
  rating: number;
  services: number;
  phone: string;
  verified: boolean;
  about: string;
  specialties: string[];
  distanceKm: number;
};

export type DemoService = {
  id: string;
  userId: string;
  requesterName: string;
  requesterDistanceKm: number;
  type: string;
  mode: string;
  destination: string;
  date: string;
  time: string;
  notes: string;
  specialNeeds: string;
  status: DemoServiceStatus;
  preferredCompanionId: string | null;
  companion: DemoCompanion | null;
  pin: string;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  rating: number | null;
  timeline: { status: DemoServiceStatus; text: string; date: string }[];
};

const STORAGE_KEY = 'juntos.demo.services.v1';
const listeners = new Set<() => void>();
let services: DemoService[] = [];
let loadPromise: Promise<void> | null = null;
let pendingWrite = Promise.resolve();
let revision = 0;

export function getDemoServices() {
  return services;
}

export function subscribeDemoServices(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function publish() {
  listeners.forEach((listener) => listener());
}

export function initializeDemoServices() {
  if (!loadPromise) {
    const startingRevision = revision;
    loadPromise = AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored && revision === startingRevision) {
          const parsed: unknown = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            services = parsed as DemoService[];
          }
        }
      })
      .catch(() => undefined)
      .then(() => publish());
  }

  return loadPromise;
}

export function updateDemoServices(
  updater: (current: DemoService[]) => DemoService[],
) {
  services = updater(services);
  revision += 1;
  publish();
  pendingWrite = pendingWrite
    .catch(() => undefined)
    .then(() => AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(services)))
    .catch(() => undefined);
}

export function getCompanionReservedDates(
  companionId: string,
  year: number,
  month: number,
  serviceList: DemoService[],
) {
  const demoReservedDays: Record<string, number[]> = {
    'CMP-001': [8, 14, 23],
    'CMP-002': [9, 16, 27],
    'CMP-003': [11, 18, 25],
  };
  const days = new Set<string>();
  const lastDay = new Date(year, month + 1, 0).getDate();

  for (const day of demoReservedDays[companionId] ?? []) {
    if (day <= lastDay) {
      days.add(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
    }
  }

  for (const service of serviceList) {
    const belongsToCompanion =
      service.companion?.id === companionId ||
      (!service.companion && service.preferredCompanionId === companionId);
    const reservesDate = ['PENDIENTE', 'ASIGNADO', 'EN_CURSO'].includes(service.status);

    if (belongsToCompanion && reservesDate) {
      days.add(service.date);
    }
  }

  return days;
}
