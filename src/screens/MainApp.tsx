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

export default function MainApp({
  profile,
  onSignOut,
}: {
  profile: any;
  onSignOut: () => void;
}) {
  const [services, setServices] = useState<any[]>([]);
  const [destination, setDestination] = useState("");
  const [notes, setNotes] = useState("");
  const [serviceType, setServiceType] = useState("MEDICA");
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
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>JUNTOS</Text>
        <TouchableOpacity onPress={onSignOut}>
          <Text style={styles.logout}>Salir</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.welcome}>
        Hola, {profile?.full_name || "Usuario"}
      </Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Nueva solicitud</Text>

        <Text style={styles.label}>Tipo de servicio</Text>
        <View style={styles.typeRow}>
          {["MEDICA", "BANCO", "COMPRAS", "PASEO"].map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.typeButton,
                serviceType === type && styles.typeButtonActive,
              ]}
              onPress={() => setServiceType(type)}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  serviceType === type && styles.typeButtonTextActive,
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={styles.input}
          placeholder="Destino"
          value={destination}
          onChangeText={setDestination}
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Notas / necesidades"
          value={notes}
          onChangeText={setNotes}
          multiline
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
        <Text style={styles.sectionTitle}>Historial</Text>

        {services.length === 0 ? (
          <Text style={styles.emptyText}>No hay servicios aún.</Text>
        ) : (
          <ScrollView style={styles.list}>
            {services.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={styles.serviceItem}
                onPress={() => setSelectedService(service)}
              >
                <Text style={styles.serviceType}>{service.type}</Text>
                <Text style={styles.serviceDestination}>{service.destination}</Text>
                <Text style={styles.serviceMeta}>
                  {service.status} • {service.service_date || "-"}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7F9",
    padding: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#09263D",
  },
  logout: {
    color: "#0B8F72",
    fontWeight: "700",
  },
  welcome: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 18,
    color: "#102A43",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#DDEAF2",
    shadowColor: "#123B59",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 7 },
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
    color: "#09263D",
  },
  label: {
    fontSize: 12,
    color: "#6B7C8F",
    marginBottom: 8,
    fontWeight: "700",
  },
  typeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  typeButton: {
    backgroundColor: "#ECF7FB",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#DCEAF3",
  },
  typeButtonActive: {
    backgroundColor: "#0B8F72",
    borderColor: "#0B8F72",
  },
  typeButtonText: {
    color: "#09263D",
    fontWeight: "700",
  },
  typeButtonTextActive: {
    color: "#fff",
  },
  input: {
    backgroundColor: "#F4F7F9",
    borderWidth: 1,
    borderColor: "#DCE5EA",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    color: "#102A43",
  },
  textArea: {
    minHeight: 84,
    textAlignVertical: "top",
  },
  primaryButton: {
    backgroundColor: "#0B8F72",
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
    shadowColor: "#0B8F72",
    shadowOpacity: 0.24,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  list: {
    maxHeight: 220,
  },
  serviceItem: {
    backgroundColor: "#F4F7F9",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  serviceType: {
    fontSize: 14,
    fontWeight: "800",
    color: "#09263D",
    textTransform: "uppercase",
  },
  serviceDestination: {
    fontSize: 15,
    marginTop: 4,
    color: "#102A43",
  },
  serviceMeta: {
    fontSize: 12,
    color: "#6B7C8F",
    marginTop: 6,
  },
  emptyText: {
    color: "#6B7C8F",
  },
});