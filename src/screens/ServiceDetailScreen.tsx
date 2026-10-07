import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
} from "react-native";
import { supabase } from "../supabaseClient";

export default function ServiceDetailScreen({
  service,
  onBack,
}: {
  service: any;
  onBack: () => void;
}) {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  if (!service) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Servicio no encontrado</Text>
        <TouchableOpacity style={styles.button} onPress={onBack}>
          <Text style={styles.buttonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const startService = async () => {
    if (!service.pin) return;

    if (pin !== String(service.pin)) {
      Alert.alert("PIN incorrecto", "El código no coincide con el del servicio.");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("service_requests")
      .update({
        status: "EN_CURSO",
      })
      .eq("id", service.id);

    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    Alert.alert("Check-in validado", "El servicio ha iniciado correctamente.");
    onBack();
  };

  const finishService = async () => {
    setLoading(true);

    const { error } = await supabase
      .from("service_requests")
      .update({
        status: "COMPLETADO",
      })
      .eq("id", service.id);

    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    Alert.alert("Servicio finalizado", "Se marcó como completado.");
    onBack();
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.back}>← Volver</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Detalle del servicio</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Tipo</Text>
          <Text style={styles.value}>{service.type}</Text>

          <Text style={styles.label}>Destino</Text>
          <Text style={styles.value}>{service.destination}</Text>

          <Text style={styles.label}>Fecha</Text>
          <Text style={styles.value}>{service.service_date || "Sin fecha"}</Text>

          <Text style={styles.label}>Hora</Text>
          <Text style={styles.value}>{service.service_time || "Sin hora"}</Text>

          <Text style={styles.label}>Estado</Text>
          <Text style={styles.value}>{service.status}</Text>

          {service.notes ? (
            <>
              <Text style={styles.label}>Notas</Text>
              <Text style={styles.value}>{service.notes}</Text>
            </>
          ) : null}
        </View>

        {service.status === "PENDIENTE" && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Validar check-in</Text>
            <Text style={styles.pinLabel}>PIN del servicio: {service.pin}</Text>

            <TextInput
              style={styles.input}
              value={pin}
              onChangeText={setPin}
              placeholder="Escribe el PIN"
              keyboardType="number-pad"
              maxLength={4}
            />

            <TouchableOpacity
              style={styles.button}
              onPress={startService}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Validando..." : "Confirmar check-in"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {service.status === "EN_CURSO" && (
          <TouchableOpacity
            style={styles.button}
            onPress={finishService}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Finalizando..." : "Finalizar servicio"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#F4F7F9",
    padding: 20,
  },
  container: {
    flex: 1,
    backgroundColor: "#F4F7F9",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#09263D",
    marginBottom: 16,
  },
  back: {
    color: "#0B8F72",
    fontWeight: "700",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#DCE5EA",
  },
  label: {
    fontSize: 12,
    color: "#6B7C8F",
    marginTop: 8,
    fontWeight: "700",
  },
  value: {
    fontSize: 16,
    color: "#102A43",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#09263D",
    marginBottom: 10,
  },
  pinLabel: {
    color: "#123B59",
    fontWeight: "700",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#F4F7F9",
    borderWidth: 1,
    borderColor: "#DCE5EA",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#0B8F72",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "800",
  },
});
