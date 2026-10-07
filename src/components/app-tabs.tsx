import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Inicio</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="explore">
        <NativeTabs.Trigger.Label>Explorar</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="search" sf="magnifyingglass" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="main">
        <NativeTabs.Trigger.Label>Solicitar</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="add_circle" sf="plus.circle.fill" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="companion">
        <NativeTabs.Trigger.Label>Acompañante</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="person" sf="person.fill" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="auth">
        <NativeTabs.Trigger.Label>Cuenta</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="account_circle" sf="person.crop.circle" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
