import { router } from 'expo-router';
import { Alert, Linking } from 'react-native';

import { CompanionProfileScreen, DEMO_COMPANIONS } from '../../App';

const companion = DEMO_COMPANIONS[0];

export default function CompanionRoute() {
  const callCompanion = async () => {
    try {
      await Linking.openURL(`tel:${companion.phone}`);
    } catch {
      Alert.alert('Contacto', `Acompañante: ${companion.phone}`);
    }
  };

  return (
    <CompanionProfileScreen
      companion={companion}
      context="account"
      onBack={() => router.replace('/prototype')}
      onCall={callCompanion}
    />
  );
}