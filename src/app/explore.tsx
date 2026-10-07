import { router } from 'expo-router';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

const serviceTypes = [
  { value: 'MEDICA', icon: '🩺', title: 'Citas médicas', detail: 'Consultas, estudios y centros de salud' },
  { value: 'BANCO', icon: '🏦', title: 'Bancos y pagos', detail: 'Diligencias bancarias con compañía' },
  { value: 'COMPRAS', icon: '🛒', title: 'Compras', detail: 'Supermercado y diligencias cotidianas' },
  { value: 'PASEO', icon: '🌳', title: 'Paseos', detail: 'Actividades, visitas y aire libre' },
  { value: 'CASA / DOMICILIO', icon: '🏠', title: 'En el domicilio', detail: 'Apoyo y compañía en casa' },
] as const;

export default function ExploreScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>JUNTOS · SERVICIOS</Text>
          <Text style={styles.title}>¿Qué necesitas hacer?</Text>
          <Text style={styles.subtitle}>Elige una categoría para comenzar tu solicitud.</Text>
        </View>

        <View style={styles.list}>
          {serviceTypes.map((service) => (
            <Pressable
              key={service.value}
              accessibilityRole="button"
              accessibilityLabel={`Solicitar ${service.title}`}
              onPress={() => router.push({ pathname: '/main', params: { type: service.value } })}
              style={({ pressed }) => [styles.service, pressed && styles.pressed]}
            >
              <View style={styles.iconBox}>
                <Text style={styles.icon}>{service.icon}</Text>
              </View>
              <View style={styles.serviceCopy}>
                <Text style={styles.serviceTitle}>{service.title}</Text>
                <Text style={styles.serviceDetail}>{service.detail}</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.safetyRow}>
          <Text style={styles.safetyMark}>✓</Text>
          <Text style={styles.safetyText}>Acompañamiento coordinado y seguimiento de tu solicitud.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F3F7F5' },
  content: { width: '100%', maxWidth: 640, alignSelf: 'center', padding: 24, paddingBottom: 40 },
  header: { paddingTop: 20, paddingBottom: 24 },
  eyebrow: { color: '#087C68', fontSize: 12, fontWeight: '800', marginBottom: 10 },
  title: { color: '#152B31', fontSize: 30, fontWeight: '800', lineHeight: 38 },
  subtitle: { color: '#53686D', fontSize: 16, lineHeight: 24, marginTop: 8 },
  list: { gap: 10 },
  service: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DFE9E5',
    borderRadius: 8,
  },
  pressed: { opacity: 0.72 },
  iconBox: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E8F5EF', borderRadius: 8 },
  icon: { fontSize: 23 },
  serviceCopy: { flex: 1, minWidth: 0, paddingHorizontal: 14 },
  serviceTitle: { color: '#152B31', fontSize: 16, fontWeight: '700' },
  serviceDetail: { color: '#63767A', fontSize: 13, lineHeight: 18, marginTop: 3 },
  arrow: { color: '#087C68', fontSize: 28, lineHeight: 30, paddingHorizontal: 4 },
  safetyRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 24, paddingVertical: 14, borderTopWidth: 1, borderTopColor: '#DFE9E5' },
  safetyMark: { color: '#087C68', fontSize: 16, fontWeight: '800' },
  safetyText: { flex: 1, color: '#53686D', fontSize: 14, lineHeight: 21 },
});
