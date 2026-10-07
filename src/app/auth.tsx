import { router, useLocalSearchParams } from 'expo-router';

import AuthScreen from '@/screens/AuthScreen';

export default function AuthRoute() {
  const { type } = useLocalSearchParams<{ type?: string }>();

  const continueToApp = () => {
    router.replace(type ? { pathname: '/main', params: { type } } : '/main');
  };

  return <AuthScreen onAuthenticated={continueToApp} />;
}
