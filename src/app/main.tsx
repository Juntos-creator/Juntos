import { StatusBar, View } from 'react-native';
import MainApp from '../screens/MainApp';

const demoProfile = {
  id: 'demo-user-1',
  full_name: 'Perfil Demo',
  email: 'demo@juntos.com',
};

export default function MainRoute() {
  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      <MainApp profile={demoProfile} onSignOut={() => {}} />
    </View>
  );
}
