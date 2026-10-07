import { router } from 'expo-router';
import { useEffect, useSyncExternalStore } from 'react';
import { Alert, Linking } from 'react-native';

import { CompanionAccountScreen, DEMO_COMPANIONS } from '../../App';
import {
  getDemoServices,
  initializeDemoServices,
  subscribeDemoServices,
  updateDemoServices,
} from '../lib/demo-service-store';

export default function CompanionRoute() {
  const services = useSyncExternalStore(
    subscribeDemoServices,
    getDemoServices,
    getDemoServices,
  );

  useEffect(() => {
    void initializeDemoServices();
  }, []);

  const callCompanion = async (companion: (typeof DEMO_COMPANIONS)[number]) => {
    try {
      await Linking.openURL(`tel:${companion.phone}`);
    } catch {
      Alert.alert('Contacto', `Acompañante: ${companion.phone}`);
    }
  };

  const acceptRequest = (serviceId: string, companionId: string) => {
    const companion = DEMO_COMPANIONS.find((candidate) => candidate.id === companionId);
    if (!companion) return;

    updateDemoServices((current) => current.map((service) => {
      if (service.id !== serviceId || service.status !== 'PENDIENTE') return service;
      if (service.preferredCompanionId !== companionId) return service;

      const now = new Date().toISOString();
      return {
        ...service,
        status: 'ASIGNADO',
        companion,
        timeline: [
          ...service.timeline,
          { status: 'ASIGNADO', text: `${companion.name} aceptó la solicitud de ${service.requesterName}`, date: now },
        ],
      };
    }));
    Alert.alert('Solicitud aceptada', `El servicio de Carmen quedó asignado a ${companion.name}.`);
  };

  return (
    <CompanionAccountScreen
      services={services}
      onAccept={acceptRequest}
      onOpen={(service) => router.push({ pathname: '/prototype', params: { serviceId: service.id } })}
      onCall={callCompanion}
    />
  );
}