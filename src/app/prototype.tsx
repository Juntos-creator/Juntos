import { useLocalSearchParams } from 'expo-router';

import JuntosPrototype from '../../App';

export default function PrototypeRoute() {
  const { serviceId } = useLocalSearchParams<{ serviceId?: string }>();
  return <JuntosPrototype serviceId={serviceId} />;
}