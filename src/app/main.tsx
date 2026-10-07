import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StatusBar, View } from 'react-native';

import MainApp from '../screens/MainApp';
import { supabase } from '../supabaseClient';

type UserProfile = {
  id: string;
  full_name: string;
  email: string;
};

export default function MainRoute() {
  const { type } = useLocalSearchParams<{ type?: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCurrent = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!isCurrent) return;

      const user = data.session?.user;
      if (error || !user) {
        setLoading(false);
        const authHref = type
          ? { pathname: '/auth', params: { type } }
          : '/auth';
        router.replace(authHref as unknown as Href);
        return;
      }

      const fullName = user.user_metadata.full_name;
      setProfile({
        id: user.id,
        email: user.email ?? '',
        full_name: typeof fullName === 'string' && fullName.trim()
          ? fullName
          : user.email?.split('@')[0] ?? 'Usuario',
      });
      setLoading(false);
    });

    return () => {
      isCurrent = false;
    };
  }, [type]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace('/auth' as Href);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator accessibilityLabel="Cargando cuenta" />
      </View>
    );
  }

  if (!profile) return null;

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      <MainApp profile={profile} onSignOut={signOut} initialServiceType={type} />
    </View>
  );
}
