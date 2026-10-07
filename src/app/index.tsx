import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function LogoMark() {
  return (
    <View style={styles.logoShell}>
      <View style={[styles.person, styles.personLeft]} />
      <View style={[styles.person, styles.personRight]} />
      <View style={styles.heartWrap}>
        <View style={styles.heart} />
      </View>
    </View>
  );
}

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.backgroundGlow} />
      <View style={styles.content}>
        <LogoMark />

        <View style={styles.textWrap}>
          <Text style={styles.eyebrow}>JUNTOS</Text>
          <Text style={styles.title}>Acompañamiento humano, simple y cercano</Text>
          <Text style={styles.subtitle}>
            Solicita ayuda para citas médicas, paseos, compras y acompañamiento seguro.
          </Text>
        </View>

        <Link href="/main" asChild>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Iniciar</Text>
          </Pressable>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#05070B',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 26,
    overflow: 'hidden',
  },
  backgroundGlow: {
    position: 'absolute',
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor: 'rgba(31, 169, 244, 0.18)',
    top: 70,
    left: '50%',
    marginLeft: -250,
    shadowColor: '#1FA9F4',
    shadowOpacity: 0.35,
    shadowRadius: 30,
  },
  content: {
    width: '100%',
    maxWidth: 560,
    alignItems: 'center',
    zIndex: 1,
  },
  logoShell: {
    position: 'relative',
    width: 350,
    height: 260,
    marginBottom: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  person: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 4,
    borderColor: '#E44EEA',
    shadowColor: '#1FA9F4',
    shadowOpacity: 0.32,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
  },
  personLeft: {
    left: 28,
    top: 20,
    width: 140,
    height: 140,
    backgroundColor: '#1FA9F4',
  },
  personRight: {
    right: 22,
    top: 20,
    width: 140,
    height: 140,
    backgroundColor: '#76D57C',
  },
  heartWrap: {
    position: 'absolute',
    bottom: -4,
    width: 240,
    height: 205,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heart: {
    width: 214,
    height: 214,
    backgroundColor: '#76D57C',
    transform: [{ rotate: '45deg' }],
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#E44EEA',
    shadowColor: '#76D57C',
    shadowOpacity: 0.38,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
  },
  textWrap: {
    alignItems: 'center',
    marginBottom: 32,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 3.2,
    color: '#91E9B5',
    marginBottom: 14,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
    color: '#F5F7FA',
    marginBottom: 12,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#CFD9E2',
    lineHeight: 26,
    maxWidth: 470,
  },
  button: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 20,
    backgroundColor: '#1FA9F4',
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1FA9F4',
    shadowOpacity: 0.45,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
});
