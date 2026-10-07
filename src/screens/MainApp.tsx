import { useEffect, useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { supabase } from "../supabaseClient";
import ServiceDetailScreen from "./ServiceDetailScreen";

const serviceOptions = [
  { label: "Médica", value: "MEDICA", icon: "🏥" },
  { label: "Banco", value: "BANCO", icon: "🏦" },
  { label: "Compras", value: "COMPRAS", icon: "🛒" },
  { label: "Paseo", value: "PASEO", icon: "🌳" },
  { label: "Domicilio", value: "CASA / DOMICILIO", icon: "🏠" },
];

const statusStyles: Record<string, { bg: string; fg: string }> = {
  PENDIENTE: { bg: "#EAF3FF", fg: "#123B59" },
  ASIGNADO: { bg: "#E8F7F2", fg: "#0B8F72" },
  EN_CURSO: { bg: "#FFF4E5", fg: "#B76B00" },
  COMPLETADO: { bg: "#E9F9F1", fg: "#1E9E70" },
  CANCELADO: { bg: "#FDECEC", fg: "#B23A3A" },
};

export default function MainApp({
  profile,
  onSignOut,
  initialServiceType,
}: {
  profile: any;
  onSignOut: () => void;
  initialServiceType?: string;
}) {
  const [services, setServices] = useState<any[]>([]);
  const [destination, setDestination] = useState("");
  const [notes, setNotes] = useState("");
  const [serviceType, setServiceType] = useState(() =>
    serviceOptions.some((option) => option.value === initialServiceType)
      ? initialServiceType!
      : "MEDICA",
  );
  const [loading, setLoading] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);

  const getServices = (userId: string) =>
    supabase
      .from("service_requests")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

  const fetchServices = async () => {
    if (!profile?.id) return;

    const { data, error } = await getServices(profile.id);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    setServices(data ?? []);
  };

  useEffect(() => {
    if (!profile?.id) return;

    let isCurrent = true;

    getServices(profile.id).then(({ data, error }) => {
      if (!isCurrent) return;

      if (error) {
        Alert.alert("Error", error.message);
        return;
      }

      setServices(data ?? []);
    });

    return () => {
      isCurrent = false;
    };
  }, [profile?.id]);

  const createService = async () => {
    if (!destination.trim()) {
      Alert.alert("Falta el destino", "Escribe a dónde necesitas el acompañamiento.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("service_requests").insert([
      {
        user_id: profile.id,
        type: serviceType,
        mode: "ASISTENCIAL",
        destination: destination.trim(),
        service_date: new Date().toISOString().slice(0, 10),
        service_time: new Date().toLocaleTimeString("es-DO", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        notes: notes.trim(),
        special_needs: "",
        status: "PENDIENTE",
        pin: "1234",
      },
    ]);

    setLoading(false);

    if (error) {
      Alert.alert("Error al crear servicio", error.message);
      return;
    }

    setDestination("");
    setNotes("");
    await fetchServices();

    Alert.alert("Solicitud creada", "Tu servicio fue guardado correctamente.");
  };

  if (selectedService) {
    return (
      <ServiceDetailScreen
        service={selectedService}
        onBack={async () => {
          setSelectedService(null);
          await fetchServices();
        }}
      />
    );
  }

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <View style={styles.container}>
        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.brand}>JUNTOS</Text>
              <Text style={styles.welcome}>Hola, {profile?.full_name || "Usuario"}</Text>
            </View>

            <TouchableOpacity onPress={onSignOut} style={styles.logoutButton}>
              <Text style={styles.logout}>Salir</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.heroRow}>
            <View style={styles.heroTextWrap}>
              <Text style={styles.eyebrow}>Acompañamiento humano</Text>
              <Text style={styles.heroTitle}>¿A dónde necesitas ir hoy?</Text>
            </View>

            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {profile?.full_name?.charAt(0)?.toUpperCase() || "J"}
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{services.length || 0}</Text>
              <Text style={styles.statLabel}>Solicitudes</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>24/7</Text>
              <Text style={styles.statLabel}>Soporte</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>4.9</Text>
              <Text style={styles.statLabel}>Calificación</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nueva solicitud</Text>
            <Text style={styles.sectionPill}>Seguro</Text>
          </View>

          <Text style={styles.label}>Tipo de servicio</Text>
          <View style={styles.typeGrid}>
            {serviceOptions.map((option) => {
              const active = serviceType === option.value;

              return (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.typeButton, active && styles.typeButtonActive]}
                  onPress={() => setServiceType(option.value)}
                >
                  <Text style={styles.typeIcon}>{option.icon}</Text>
                  <Text
                    style={[styles.typeButtonText, active && styles.typeButtonTextActive]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Destino"
            value={destination}
            onChangeText={setDestination}
            placeholderTextColor="#7891A6"
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Notas / necesidades especiales"
            value={notes}
            onChangeText={setNotes}
            multiline
            placeholderTextColor="#7891A6"
          />

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={createService}
            disabled={loading}
          >
            <Text style={styles.primaryButtonText}>
              {loading ? "Guardando..." : "Crear servicio"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Historial</Text>
            <Text style={styles.mutedText}>{services.length} registros</Text>
          </View>

          {services.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyTitle}>Aún no tienes servicios</Text>
              <Text style={styles.emptyText}>
                Tu primera solicitud aparecerá aquí cuando la crees.
              </Text>
            </View>
          ) : (
            <View style={styles.list}>
              {services.map((service) => {
                const serviceState = statusStyles[service.status] || statusStyles.PENDIENTE;

                return (
                  <TouchableOpacity
                    key={service.id}
                    style={styles.serviceItem}
                    onPress={() => setSelectedService(service)}
                  >
                    <View style={styles.serviceHeaderRow}>
                      <View>
                        <Text style={styles.serviceType}>{service.type}</Text>
                        <Text style={styles.serviceDestination}>{service.destination}</Text>
                      </View>

                      <View
                        style={[
                          styles.statusPill,
                          { backgroundColor: serviceState.bg },
                        ]}
                      >
                        <Text style={[styles.statusText, { color: serviceState.fg }]}>
                          {service.status}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.serviceMeta}>
                      {service.service_date || "-"} • {service.service_time || "--:--"}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#EFF6FA",
  },
  scrollContent: {
    paddingBottom: 36,
  },
  container: {
    flex: 1,
    backgroundColor: "#EFF6FA",
    paddingHorizontal: 18,
    paddingTop: 24,
  },
  headerCard: {
    backgroundColor: "#09263D",
    borderRadius: 28,
    padding: 20,
    marginBottom: 18,
    shadowColor: "#09263D",
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 14 },
    elevation: 6,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  brand: {
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 2,
    color: "#D9F9EE",
  },
  welcome: {
    fontSize: 18,
    fontWeight: "700",
    color: "#F5FBFF",
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  logout: {
    color: "#D9F9EE",
    fontWeight: "700",
  },
  heroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  heroTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  eyebrow: {
    color: "#91E9B5",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  heroTitle: {
    color: "#F5F7FA",
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "800",
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#1FA9F4",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  statLabel: {
    fontSize: 11,
    color: "#C6D6E2",
    marginTop: 4,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#DCEAF3",
    shadowColor: "#123B59",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#09263D",
  },
  sectionPill: {
    backgroundColor: "#E8F7F2",
    color: "#0B8F72",
    fontSize: 11,
    fontWeight: "800",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    overflow: "hidden",
  },
  label: {
    fontSize: 12,
    color: "#6B7C8F",
    marginBottom: 10,
    fontWeight: "700",
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
    gap: 8,
  },
  typeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F8FC",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DCEAF3",
    minWidth: "31%",
  },
  typeButtonActive: {
    backgroundColor: "#0B8F72",
    borderColor: "#0B8F72",
  },
  typeIcon: {
    fontSize: 15,
    marginRight: 6,
  },
  typeButtonText: {
    color: "#09263D",
    fontWeight: "700",
    fontSize: 12,
  },
  typeButtonTextActive: {
    color: "#fff",
  },
  input: {
    backgroundColor: "#F4F7F9",
    borderWidth: 1,
    borderColor: "#DCE5EA",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 12,
    color: "#102A43",
    fontSize: 15,
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  primaryButton: {
    backgroundColor: "#0B8F72",
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
    shadowColor: "#0B8F72",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "800",
    letterSpacing: 0.3,
    fontSize: 15,
  },
  mutedText: {
    color: "#6B7C8F",
    fontSize: 12,
    fontWeight: "700",
  },
  list: {
    gap: 10,
  },
  serviceItem: {
    backgroundColor: "#F4F7F9",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E4EDF4",
  },
  serviceHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  serviceType: {
    fontSize: 12,
    fontWeight: "800",
    color: "#123B59",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  serviceDestination: {
    fontSize: 16,
    marginTop: 5,
    color: "#102A43",
    fontWeight: "700",
  },
  serviceMeta: {
    fontSize: 12,
    color: "#6B7C8F",
    marginTop: 10,
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  emptyState: {
    paddingVertical: 18,
    alignItems: "center",
  },
  emptyIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#09263D",
    marginBottom: 6,
  },
  emptyText: {
    color: "#6B7C8F",
    textAlign: "center",
    lineHeight: 20,
  },
});