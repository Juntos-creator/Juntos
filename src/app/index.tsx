import JuntosLogo from '@/components/juntos-logo';
import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.backgroundGlow} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.logoShell}>
            <JuntosLogo />
          </View>

          <View style={styles.textWrap}>
            <Text style={styles.eyebrow}>JUNTOS</Text>
            <Text style={styles.title}>Acompañamiento humano, simple y cercano</Text>
            <Text style={styles.subtitle}>
              Solicita ayuda para citas médicas, paseos, compras y acompañamiento seguro.
            </Text>
          </View>

          <View style={styles.featureRow}>
            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>🩺</Text>
              <Text style={styles.featureLabel}>Médico</Text>
            </View>
            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>🏦</Text>
              <Text style={styles.featureLabel}>Banco</Text>
            </View>
            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>🛒</Text>
              <Text style={styles.featureLabel}>Compras</Text>
            </View>
          </View>

          <Link href="/main" asChild>
            <Pressable style={styles.button}>
              <Text style={styles.buttonText}>Iniciar</Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#05070B',
    padding: 26,
    overflow: 'hidden',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 34,
    paddingBottom: 72,
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
  scrollView: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: 560,
    alignItems: 'center',
  },
  logoShell: {
    width: 320,
    height: 240,
    maxWidth: '100%',
    marginBottom: 18,
  },
  textWrap: {
    alignItems: 'center',
    marginBottom: 26,
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
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 440,
    marginBottom: 28,
    gap: 10,
  },
  featureCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  featureIcon: {
    fontSize: 22,
    marginBottom: 6,
  },
  featureLabel: {
    color: '#F5F7FA',
    fontWeight: '700',
    fontSize: 12,
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
