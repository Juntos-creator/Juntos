import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { supabase } from "../supabaseClient";

export default function AuthScreen() {
  const [email, setEmail] = useState("demo@juntos.com");
  const [password, setPassword] = useState("123456");
  const [fullName, setFullName] = useState("Usuario JUNTOS");
  const [loading, setLoading] = useState(false);

  const signIn = async () => {
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }
  };

  const signUp = async () => {
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName.trim() || "Usuario JUNTOS",
        },
      },
    });

    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    if (data.user) {
      Alert.alert(
        "Cuenta creada",
        "Tu usuario fue registrado. Revisa tu correo si el sistema pide confirmación."
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>JUNTOS</Text>
      <TextInput
        style={styles.input}
        value={fullName}
        onChangeText={setFullName}
        placeholder="Nombre completo"
      />
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Correo"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Contraseña"
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={signIn} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Cargando..." : "Iniciar sesión"}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.secondary]} onPress={signUp} disabled={loading}>
        <Text style={styles.buttonText}>Crear cuenta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#F4F7F9",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 24,
    color: "#09263D",
    textAlign: "center",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#DCE5EA",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#0B8F72",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginTop: 10,
  },
  secondary: {
    backgroundColor: "#123B59",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
});