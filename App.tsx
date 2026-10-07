import React, { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
    Alert,
    Linking,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleProp,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ViewStyle,
} from "react-native";
import {
    DemoCompanion,
    DemoService,
    getCompanionReservedDates,
    getDemoServices,
    initializeDemoServices,
    subscribeDemoServices,
    updateDemoServices,
} from "./src/lib/demo-service-store";

/*
==========================================================
 JUNTOS SAS / ACOMPAÑAME RD
 MVP NATIVO - EXPO GO
 ---------------------------------------------------------
 App.js autocontenido para prototipo funcional.

 NO requiere:
 - React Navigation
 - Supabase
 - Firebase
 - AsyncStorage
 - librerías externas

 Incluye:
 - Usuario
 - Familiar
 - Acompañante
 - Solicitudes
 - PIN
 - Check-in
 - Seguimiento
 - SOS
 - Historial
 - Calificación
 - Operaciones
==========================================================
*/

// ========================================================
// CONFIGURACIÓN
// ========================================================

const BRAND = {
  navy: "#09263D",
  navy2: "#123B59",
  emerald: "#0B8F72",
  emeraldDark: "#06715A",
  mint: "#E8F7F2",
  white: "#FFFFFF",
  bg: "#F4F7F9",
  text: "#102A43",
  muted: "#6B7C8F",
  border: "#DCE5EA",
  danger: "#D64545",
  warning: "#E69B20",
  success: "#1E9E70",
};

const SERVICE_TYPES = [
  {
    id: "MEDICA",
    title: "Citas médicas",
    icon: "🏥",
    description: "Acompañamiento a consultas, estudios y centros de salud.",
    mode: "ASISTENCIAL",
  },
  {
    id: "BANCO",
    title: "Bancos y pagos",
    icon: "🏦",
    description: "Acompañamiento en diligencias bancarias y pagos.",
    mode: "NO_CLINICO",
  },
  {
    id: "COMPRAS",
    title: "Supermercado",
    icon: "🛒",
    description: "Acompañamiento para compras y diligencias cotidianas.",
    mode: "NO_CLINICO",
  },
  {
    id: "PASEO",
    title: "Paseo / aire libre",
    icon: "🌳",
    description: "Acompañamiento para actividades y paseos.",
    mode: "NO_CLINICO",
  },
  {
    id: "OTRO",
    title: "Otra diligencia",
    icon: "📋",
    description: "Solicita otro tipo de acompañamiento.",
    mode: "NO_CLINICO",
  },
] as const;

type ServiceType = (typeof SERVICE_TYPES)[number];
type ServiceTypeId = ServiceType["id"];
type ServiceMode = ServiceType["mode"];
type Role = "USER" | "COMPANION";
type Screen =
  | "HOME"
  | "REQUEST"
  | "TRACKING"
  | "HISTORY"
  | "PROFILE"
  | "RATING"
  | "OPERATIONS"
  | "COMPANION"
  | "COMPANION_PROFILE";
type ServiceStatus =
  | "PENDIENTE"
  | "ASIGNADO"
  | "EN_CURSO"
  | "COMPLETADO"
  | "CANCELADO"
  | "CALIFICADO";
type Action = () => void;
type UserProfile = {
  id: string;
  name: string;
  phone: string;
  email: string;
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
};
type Companion = DemoCompanion;
type Service = DemoService;
type ServiceRequestInput = {
  type: ServiceTypeId;
  mode: ServiceMode;
  destination: string;
  date: string;
  time: string;
  notes: string;
  specialNeeds: string;
  companionId: string;
};

type HeaderProps = { title: string; subtitle?: string; onBack?: Action };
type ButtonProps = { title: string; onPress: Action; disabled?: boolean };
type HomeScreenProps = {
  user: UserProfile;
  role: Role;
  currentService: Service | null;
  onRequest: Action;
  onTracking: Action;
  onHistory: Action;
  onProfile: Action;
  onOperations: Action;
  onRoleChange: Action;
  onSOS: Action;
};
type RequestScreenProps = {
  onBack: Action;
  services: Service[];
  onSubmit: (serviceData: ServiceRequestInput) => void;
};
type TrackingScreenProps = {
  service: Service | null;
  onBack: Action;
  onAssign: Action;
  onCheckIn: (serviceId: string, enteredPin: string) => void;
  onComplete: Action;
  onCancel: Action;
  onCall: Action;
  onSOS: Action;
  onViewProfile: Action;
};
type CompanionProfileScreenProps = {
  companion: Companion | null;
  onBack: Action;
  onCall: Action;
  context?: "service" | "account";
};
type CompanionAccountScreenProps = {
  services: Service[];
  onAccept: (serviceId: string, companionId: string) => void;
  onOpen: (service: Service) => void;
  onCall: (companion: Companion) => void;
};
type HistoryScreenProps = {
  services: Service[];
  onBack: Action;
  onSelect: (service: Service) => void;
};
type ProfileScreenProps = { user: UserProfile; onBack: Action; onSOS: Action };
type RatingScreenProps = {
  service: Service | null;
  onRate: (rating: number | null) => void;
};
type OperationsScreenProps = {
  services: Service[];
  onBack: Action;
  onAssign: (serviceId: string) => void;
  onOpen: (service: Service) => void;
};
type CompanionScreenProps = {
  services: Service[];
  onBack: Action;
  onOpen: (service: Service) => void;
};
type BottomNavigationProps = {
  screen: Screen;
  role: Role;
  onHome: Action;
  onRequest: Action;
  onTracking: Action;
  onHistory: Action;
  onProfile: Action;
  onOperations: Action;
  onCompanion: Action;
};

export const DEMO_COMPANIONS = [
  {
    id: "CMP-001",
    name: "Ana Martínez",
    role: "Acompañante verificada",
    type: "NO_CLINICO",
    rating: 4.9,
    services: 127,
    phone: "809-555-1001",
    verified: true,
    distanceKm: 1.2,
    about: "Acompañamiento para compras, diligencias y actividades cotidianas. Este perfil contiene datos de demostración.",
    specialties: ["Diligencias", "Compras", "Acompañamiento no clínico"],
  },
  {
    id: "CMP-002",
    name: "Laura Rodríguez",
    role: "Auxiliar / asistencial",
    type: "ASISTENCIAL",
    rating: 4.8,
    services: 94,
    phone: "809-555-1002",
    verified: true,
    distanceKm: 2.4,
    about: "Acompañamiento de demostración para citas y traslados asistenciales, dentro del alcance indicado para este servicio.",
    specialties: ["Citas médicas", "Traslados asistenciales", "Apoyo durante la visita"],
  },
  {
    id: "CMP-003",
    name: "María Fernández",
    role: "Enfermera verificada",
    type: "ASISTENCIAL",
    rating: 5.0,
    services: 156,
    phone: "809-555-1003",
    verified: true,
    distanceKm: 3.1,
    about: "Perfil de demostración para servicios de acompañamiento asistencial. La información real deberá provenir de la cuenta validada.",
    specialties: ["Acompañamiento asistencial", "Citas médicas", "Seguimiento del servicio"],
  },
];

// ========================================================
// HELPERS
// ========================================================

const generatePin = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

const generateId = () => {
  return (
    "JNT-" +
    Date.now().toString().slice(-7) +
    Math.floor(Math.random() * 100)
  );
};

const formatDate = (date: Date | string | null | undefined) => {
  if (!date) return "Pendiente";

  const d = date instanceof Date
    ? date
    : /^\d{4}-\d{2}-\d{2}$/.test(date)
      ? new Date(`${date}T12:00:00`)
      : new Date(date);

  return d.toLocaleDateString("es-DO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const getDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const getTodayDateKey = () => getDateKey(new Date());

const parseDateKey = (dateKey: string) => new Date(`${dateKey}T12:00:00`);

const formatTime = (date: Date | string | null | undefined) => {
  if (!date) return "--:--";

  const d = date instanceof Date ? date : new Date(date);

  return d.toLocaleTimeString("es-DO", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ========================================================
// COMPONENTES GENERALES
// ========================================================

function Header({ title, subtitle, onBack }: HeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerRow}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 42 }} />
        )}

        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>{title}</Text>
          {subtitle ? (
            <Text style={styles.headerSubtitle}>{subtitle}</Text>
          ) : null}
        </View>

        <View style={styles.logoMini}>
          <Text style={styles.logoMiniText}>J</Text>
        </View>
      </View>
    </View>
  );
}

function PrimaryButton({ title, onPress, disabled = false }: ButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.primaryButton,
        disabled && styles.buttonDisabled,
      ]}
      disabled={disabled}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.primaryButtonText}>{title}</Text>
    </TouchableOpacity>
  );
}

function SecondaryButton({ title, onPress }: ButtonProps) {
  return (
    <TouchableOpacity
      style={styles.secondaryButton}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.secondaryButtonText}>{title}</Text>
    </TouchableOpacity>
  );
}

function DangerButton({ title, onPress }: ButtonProps) {
  return (
    <TouchableOpacity
      style={styles.dangerButton}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.dangerButtonText}>{title}</Text>
    </TouchableOpacity>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

function Badge({ children, type = "default" }: {
  children: React.ReactNode;
  type?: "default" | "success" | "warning" | "danger";
}) {
  return (
    <View
      style={[
        styles.badge,
        type === "success" && styles.badgeSuccess,
        type === "warning" && styles.badgeWarning,
        type === "danger" && styles.badgeDanger,
      ]}
    >
      <Text style={styles.badgeText}>{children}</Text>
    </View>
  );
}

function EmptyState({ icon = "📭", title, description }: {
  icon?: string;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>{icon}</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDescription}>{description}</Text>
    </View>
  );
}

// ========================================================
// APP PRINCIPAL
// ========================================================

export default function App({ serviceId }: { serviceId?: string } = {}) {
  // ------------------------------------------------------
  // USUARIO DEMO
  // ------------------------------------------------------

  const [user] = useState({
    id: "USR-001",
    name: "Carmen Peña",
    phone: "809-555-2001",
    email: "carmen@example.com",
    emergencyContact: {
      name: "Manuel Antonio Peña",
      phone: "809-555-2002",
      relation: "Hijo",
    },
  });

  // ------------------------------------------------------
  // ESTADOS
  // ------------------------------------------------------

  const [screen, setScreen] = useState<Screen>(serviceId ? "TRACKING" : "HOME");

  const [role, setRole] = useState<Role>("USER");

  const services = useSyncExternalStore(
    subscribeDemoServices,
    getDemoServices,
    getDemoServices,
  );

  useEffect(() => {
    void initializeDemoServices();
  }, []);

  const [currentServiceId, setCurrentServiceId] = useState<string | null>(serviceId ?? null);

  useEffect(() => {
    if (!serviceId) return;
    setCurrentServiceId(serviceId);
    setScreen("TRACKING");
  }, [serviceId]);

  // ======================================================
  // SERVICIO ACTUAL
  // ======================================================

  const currentService = useMemo(() => {
    return services.find((s) => s.id === currentServiceId) || null;
  }, [services, currentServiceId]);

  // ======================================================
  // CREAR SERVICIO
  // ======================================================

  const createService = (serviceData: ServiceRequestInput) => {
    const id = generateId();

    const pin = generatePin();

    const newService: Service = {
      id,
      userId: user.id,
      requesterName: user.name,
      requesterDistanceKm: 2.4,

      type: serviceData.type,
      mode: serviceData.mode,

      destination: serviceData.destination,
      date: serviceData.date,
      time: serviceData.time,

      notes: serviceData.notes || "",
      specialNeeds: serviceData.specialNeeds || "",

      status: "PENDIENTE",

      preferredCompanionId: serviceData.companionId,
      companion: null,

      pin,

      createdAt: new Date().toISOString(),

      startedAt: null,
      completedAt: null,

      rating: null,

      timeline: [
        {
          status: "PENDIENTE",
          text: "Solicitud creada",
          date: new Date().toISOString(),
        },
      ],
    };

    updateDemoServices((prev) => [newService, ...prev]);

    setCurrentServiceId(id);

    setScreen("TRACKING");

    Alert.alert(
      "Solicitud recibida",
      `Tu solicitud ${id} fue registrada correctamente.`
    );
  };

  // ======================================================
  // ASIGNAR ACOMPAÑANTE
  // ======================================================

  const assignCompanion = (serviceId: string) => {
    const serviceToAssign = services.find((service) => service.id === serviceId);

    if (!serviceToAssign) return;

    if (serviceToAssign.status !== "PENDIENTE") {
      Alert.alert("No se puede asignar", "Solo se pueden asignar solicitudes pendientes.");
      return;
    }

    updateDemoServices((prev) =>
      prev.map((service) => {
        if (service.id !== serviceId) return service;

        const companion =
          DEMO_COMPANIONS.find((candidate) => candidate.id === service.preferredCompanionId) ??
          (service.mode === "ASISTENCIAL" ? DEMO_COMPANIONS[1] : DEMO_COMPANIONS[0]);

        return {
          ...service,

          status: "ASIGNADO",

          companion,

          timeline: [
            ...service.timeline,
            {
              status: "ASIGNADO",
              text: `${companion.name} fue asignada al servicio`,
              date: new Date().toISOString(),
            },
          ],
        };
      })
    );

    Alert.alert(
      "Acompañante asignado",
      "El servicio ya cuenta con un acompañante verificado."
    );
  };

  // ======================================================
  // CHECK-IN
  // ======================================================

  const checkIn = (serviceId: string, enteredPin: string) => {
    const service = services.find((s) => s.id === serviceId);

    if (!service) return;

    if (service.status !== "ASIGNADO") {
      Alert.alert("Servicio no asignado", "El check-in solo está disponible después de asignar un acompañante.");
      return;
    }

    if (enteredPin !== service.pin) {
      Alert.alert(
        "PIN incorrecto",
        "El PIN introducido no coincide con el PIN de este servicio."
      );

      return;
    }

    updateDemoServices((prev) =>
      prev.map((item) => {
        if (item.id !== serviceId) return item;

        return {
          ...item,

          status: "EN_CURSO",

          startedAt: new Date().toISOString(),

          timeline: [
            ...item.timeline,
            {
              status: "EN_CURSO",
              text: "Check-in confirmado mediante PIN",
              date: new Date().toISOString(),
            },
          ],
        };
      })
    );

    Alert.alert(
      "Servicio iniciado",
      "El check-in fue validado correctamente."
    );
  };

  // ======================================================
  // COMPLETAR SERVICIO
  // ======================================================

  const completeService = (serviceId: string) => {
    const serviceToComplete = services.find((service) => service.id === serviceId);

    if (!serviceToComplete) return;

    if (serviceToComplete.status !== "EN_CURSO") {
      Alert.alert("Servicio no iniciado", "Confirma el check-in antes de completar el servicio.");
      return;
    }

    updateDemoServices((prev) =>
      prev.map((service) => {
        if (service.id !== serviceId) return service;

        return {
          ...service,

          status: "COMPLETADO",

          completedAt: new Date().toISOString(),

          timeline: [
            ...service.timeline,
            {
              status: "COMPLETADO",
              text: "Servicio finalizado",
              date: new Date().toISOString(),
            },
          ],
        };
      })
    );

    setScreen("RATING");
  };

  // ======================================================
  // CANCELAR
  // ======================================================

  const cancelService = (serviceId: string) => {
    const serviceToCancel = services.find((service) => service.id === serviceId);

    if (!serviceToCancel) return;

    if (!["PENDIENTE", "ASIGNADO"].includes(serviceToCancel.status)) {
      Alert.alert("No se puede cancelar", "Este servicio ya no está pendiente de inicio.");
      return;
    }

    Alert.alert(
      "Cancelar servicio",
      "¿Deseas cancelar esta solicitud?",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Sí, cancelar",
          style: "destructive",

          onPress: () => {
            updateDemoServices((prev) =>
              prev.map((service) => {
                if (service.id !== serviceId) return service;

                return {
                  ...service,

                  status: "CANCELADO",

                  timeline: [
                    ...service.timeline,
                    {
                      status: "CANCELADO",
                      text: "Servicio cancelado por el usuario",
                      date: new Date().toISOString(),
                    },
                  ],
                };
              })
            );

            setScreen("HOME");
          },
        },
      ]
    );
  };

  // ======================================================
  // CALIFICAR
  // ======================================================

  const rateService = (rating: number | null) => {
    if (!currentService) return;

    if (currentService.status !== "COMPLETADO") {
      setScreen("HOME");
      return;
    }

    updateDemoServices((prev) =>
      prev.map((service) => {
        if (service.id !== currentService.id) return service;

        return {
          ...service,

          rating,

          timeline: [
            ...service.timeline,
            {
              status: "CALIFICADO",
              text: rating === null
                ? "Calificación omitida"
                : `Servicio calificado con ${rating} estrellas`,
              date: new Date().toISOString(),
            },
          ],
        };
      })
    );

    Alert.alert(
      "Gracias",
      "Tu evaluación ayudará a mantener la calidad de JUNTOS."
    );

    setScreen("HOME");
  };

  // ======================================================
  // SOS
  // ======================================================

  const callEmergency = async () => {
    const number = "911";

    const url = Platform.select({
      ios: `tel:${number}`,
      android: `tel:${number}`,
      default: `tel:${number}`,
    });

    try {
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert(
        "Emergencia",
        "No fue posible abrir el marcador. Llama al 911 directamente."
      );
    }
  };

  // ======================================================
  // CONTACTAR ACOMPAÑANTE
  // ======================================================

  const callCompanion = async () => {
    if (!currentService?.companion?.phone) return;

    try {
      await Linking.openURL(
        `tel:${currentService.companion.phone}`
      );
    } catch (error) {
      Alert.alert(
        "Contacto",
        `Acompañante: ${currentService.companion.phone}`
      );
    }
  };

  // ======================================================
  // NAVEGACIÓN
  // ======================================================

  const goHome = () => setScreen("HOME");

  // ======================================================
  // RENDER PRINCIPAL
  // ======================================================

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={BRAND.navy}
      />

      <View style={styles.app}>
        {screen === "HOME" && (
          <HomeScreen
            user={user}
            role={role}
            currentService={currentService}
            onRequest={() => setScreen("REQUEST")}
            onTracking={() => setScreen("TRACKING")}
            onHistory={() => setScreen("HISTORY")}
            onProfile={() => setScreen("PROFILE")}
            onOperations={() => setScreen("OPERATIONS")}
            onRoleChange={() => {
              setRole(role === "USER" ? "COMPANION" : "USER");
              setScreen("HOME");
            }}
            onSOS={callEmergency}
          />
        )}

        {screen === "REQUEST" && (
          <RequestScreen
            onBack={goHome}
            services={services}
            onSubmit={createService}
          />
        )}

        {screen === "COMPANION_PROFILE" && (
          <CompanionProfileScreen
            companion={currentService?.companion ?? null}
            onBack={() => setScreen("TRACKING")}
            onCall={callCompanion}
          />
        )}

        {screen === "TRACKING" && (
          <TrackingScreen
            service={currentService}
            onBack={goHome}
            onAssign={() => {
              if (currentService) {
                assignCompanion(currentService.id);
              }
            }}
            onCheckIn={checkIn}
            onComplete={() => {
              if (currentService) {
                completeService(currentService.id);
              }
            }}
            onCancel={() => {
              if (currentService) {
                cancelService(currentService.id);
              }
            }}
            onCall={callCompanion}
            onSOS={callEmergency}
            onViewProfile={() => setScreen("COMPANION_PROFILE")}
          />
        )}

        {screen === "HISTORY" && (
          <HistoryScreen
            services={services}
            onBack={goHome}
            onSelect={(service) => {
              setCurrentServiceId(service.id);
              setScreen("TRACKING");
            }}
          />
        )}

        {screen === "PROFILE" && (
          <ProfileScreen
            user={user}
            onBack={goHome}
            onSOS={callEmergency}
          />
        )}

        {screen === "RATING" && (
          <RatingScreen
            service={currentService}
            onRate={rateService}
          />
        )}

        {screen === "OPERATIONS" && (
          <OperationsScreen
            services={services}
            onBack={goHome}
            onAssign={assignCompanion}
            onOpen={(service) => {
              setCurrentServiceId(service.id);
              setScreen("TRACKING");
            }}
          />
        )}

        {screen === "COMPANION" && (
          <CompanionScreen
            services={services}
            onBack={goHome}
            onOpen={(service) => {
              setCurrentServiceId(service.id);
              setScreen("TRACKING");
            }}
          />
        )}

        <BottomNavigation
          screen={screen}
          role={role}
          onHome={goHome}
          onRequest={() => setScreen("REQUEST")}
          onTracking={() => {
            if (currentService) {
              setScreen("TRACKING");
            } else {
              Alert.alert(
                "Sin servicio",
                "Todavía no tienes un servicio activo."
              );
            }
          }}
          onHistory={() => setScreen("HISTORY")}
          onProfile={() => setScreen("PROFILE")}
          onOperations={() => setScreen("OPERATIONS")}
          onCompanion={() => setScreen("COMPANION")}
        />
      </View>
    </SafeAreaView>
  );
}

// ========================================================
// HOME
// ========================================================

function HomeScreen({
  user,
  role,
  currentService,
  onRequest,
  onTracking,
  onHistory,
  onProfile,
  onOperations,
  onRoleChange,
  onSOS,
}: HomeScreenProps) {
  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.hero}>
          <View>
            <Text style={styles.heroSmall}>BIENVENIDA A</Text>

            <Text style={styles.logoText}>
              JUNTOS
            </Text>

            <Text style={styles.heroSubtitle}>
              Acompañamiento humano, verificado y trazable.
            </Text>
          </View>

          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.name.charAt(0)}
            </Text>
          </View>
        </View>

        <View style={styles.greeting}>
          <Text style={styles.greetingTitle}>
            Hola, {user.name.split(" ")[0]} 👋
          </Text>

          <Text style={styles.greetingText}>
            ¿Qué necesitas hacer hoy?
          </Text>
        </View>

        {currentService &&
          ["PENDIENTE", "ASIGNADO", "EN_CURSO"].includes(
            currentService.status
          ) && (
            <Card style={styles.activeCard}>
              <View style={styles.activeHeader}>
                <View>
                  <Text style={styles.cardEyebrow}>
                    SERVICIO ACTIVO
                  </Text>

                  <Text style={styles.activeTitle}>
                    {SERVICE_TYPES.find(
                      (x) => x.id === currentService.type
                    )?.title || "Acompañamiento"}
                  </Text>
                </View>

                <Badge type="success">
                  {currentService.status === "EN_CURSO"
                    ? "EN CURSO"
                    : currentService.status}
                </Badge>
              </View>

              <Text style={styles.destination}>
                📍 {currentService.destination}
              </Text>

              <PrimaryButton
                title="VER SERVICIO"
                onPress={onTracking}
              />
            </Card>
          )}

        <PrimaryButton
          title="＋ PEDIR ACOMPAÑANTE AHORA"
          onPress={onRequest}
        />

        <View style={styles.grid}>
          {SERVICE_TYPES.slice(0, 4).map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.categoryCard}
              onPress={onRequest}
            >
              <Text style={styles.categoryIcon}>
                {item.icon}
              </Text>

              <Text style={styles.categoryTitle}>
                {item.title}
              </Text>

              <Text style={styles.categoryDescription}>
                {item.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <SectionTitle>Cómo funciona</SectionTitle>

        <Step
          number="1"
          title="Solicita"
          description="Indica qué necesitas, dónde y cuándo."
        />

        <Step
          number="2"
          title="Te asignamos"
          description="JUNTOS coordina un acompañante verificado."
        />

        <Step
          number="3"
          title="Te acompañamos"
          description="Usamos PIN, seguimiento y trazabilidad."
        />

        <Card>
          <Text style={styles.cardTitle}>
            🛡️ Acompañantes verificados
          </Text>

          <Text style={styles.cardText}>
            Nuestro modelo está diseñado para incorporar
            verificación de identidad, formación y control
            operativo.
          </Text>
        </Card>

        <DangerButton
          title="🚨 EMERGENCIA / 911"
          onPress={onSOS}
        />

        <SectionTitle>Accesos de demostración</SectionTitle>

        <Card>
          <Text style={styles.cardText}>
            Esta versión permite probar diferentes perfiles
            antes de conectar autenticación real.
          </Text>

          <SecondaryButton
            title={
              role === "USER"
                ? "Cambiar a modo ACOMPAÑANTE"
                : "Cambiar a modo USUARIO"
            }
            onPress={onRoleChange}
          />

          <SecondaryButton
            title="Mesa de Operaciones"
            onPress={onOperations}
          />
        </Card>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

// ========================================================
// STEP
// ========================================================

function Step({ number, title, description }: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.step}>
      <View style={styles.stepCircle}>
        <Text style={styles.stepNumber}>{number}</Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.stepTitle}>{title}</Text>

        <Text style={styles.stepDescription}>
          {description}
        </Text>
      </View>
    </View>
  );
}

// ========================================================
// SOLICITAR
// ========================================================

function AvailabilityCalendar({
  month,
  onMonthChange,
  reservedDates,
  selectedDate,
  onSelect,
}: {
  month: Date;
  onMonthChange: (month: Date) => void;
  reservedDates: Set<string>;
  selectedDate?: string;
  onSelect?: (date: string) => void;
}) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const today = getTodayDateKey();
  const monthLabel = month.toLocaleDateString("es-DO", { month: "long", year: "numeric" });

  return (
    <View style={styles.calendarWrap}>
      <View style={styles.calendarHeader}>
        <TouchableOpacity
          accessibilityLabel="Mes anterior"
          onPress={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
          style={styles.calendarArrow}
        >
          <Text style={styles.calendarArrowText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.calendarMonth}>{monthLabel}</Text>
        <TouchableOpacity
          accessibilityLabel="Mes siguiente"
          onPress={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
          style={styles.calendarArrow}
        >
          <Text style={styles.calendarArrowText}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.calendarGrid}>
        {["D", "L", "M", "X", "J", "V", "S"].map((weekday, index) => (
          <View key={`${weekday}-${index}`} style={styles.calendarCell}>
            <Text style={styles.calendarWeekday}>{weekday}</Text>
          </View>
        ))}
        {Array.from({ length: firstDay }, (_, index) => (
          <View key={`empty-${index}`} style={styles.calendarCell} />
        ))}
        {Array.from({ length: daysInMonth }, (_, index) => {
          const date = new Date(month.getFullYear(), month.getMonth(), index + 1);
          const dateKey = getDateKey(date);
          const isReserved = reservedDates.has(dateKey);
          const isPast = dateKey < today;
          const isSelected = selectedDate === dateKey;
          const disabled = !onSelect || isReserved || isPast;

          return (
            <View key={dateKey} style={styles.calendarCell}>
              <TouchableOpacity
                accessibilityLabel={`${index + 1} ${monthLabel}${isReserved ? ", reservado" : ", disponible"}`}
                accessibilityState={{ disabled, selected: isSelected }}
                disabled={disabled}
                onPress={() => onSelect?.(dateKey)}
                style={[
                  styles.calendarDay,
                  isReserved && styles.calendarDayReserved,
                  isPast && styles.calendarDayPast,
                  isSelected && styles.calendarDaySelected,
                ]}
              >
                <Text
                  style={[
                    styles.calendarDayText,
                    isReserved && styles.calendarDayReservedText,
                    isSelected && styles.calendarDaySelectedText,
                  ]}
                >
                  {index + 1}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      <View style={styles.calendarLegend}>
        <View style={styles.calendarLegendItem}>
          <View style={[styles.calendarLegendDot, styles.calendarLegendAvailable]} />
          <Text style={styles.calendarLegendText}>Disponible</Text>
        </View>
        <View style={styles.calendarLegendItem}>
          <View style={[styles.calendarLegendDot, styles.calendarLegendReserved]} />
          <Text style={styles.calendarLegendText}>Con servicio</Text>
        </View>
      </View>
    </View>
  );
}

function RequestScreen({ onBack, services, onSubmit }: RequestScreenProps) {
  const [selectedType, setSelectedType] = useState<ServiceTypeId | null>(null);

  const [destination, setDestination] = useState("");

  const [date, setDate] = useState(getTodayDateKey);

  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const [selectedCompanionId, setSelectedCompanionId] = useState("CMP-002");

  const [time, setTime] = useState("");

  const [notes, setNotes] = useState("");

  const [specialNeeds, setSpecialNeeds] = useState("");

  const selectedService = SERVICE_TYPES.find(
    (item) => item.id === selectedType
  );
  const availableCompanions = selectedService
    ? DEMO_COMPANIONS.filter((item) => item.type === selectedService.mode)
    : DEMO_COMPANIONS;
  const selectedCompanion = DEMO_COMPANIONS.find((item) => item.id === selectedCompanionId);
  const reservedDates = getCompanionReservedDates(
    selectedCompanionId,
    calendarMonth.getFullYear(),
    calendarMonth.getMonth(),
    services,
  );

  useEffect(() => {
    if (date >= getTodayDateKey() && !reservedDates.has(date)) return;

    for (let offset = 0; offset < 90; offset += 1) {
      const candidate = new Date();
      candidate.setDate(candidate.getDate() + offset);
      const candidateKey = getDateKey(candidate);
      const candidateReserved = getCompanionReservedDates(
        selectedCompanionId,
        candidate.getFullYear(),
        candidate.getMonth(),
        services,
      );
      if (!candidateReserved.has(candidateKey)) {
        setDate(candidateKey);
        setCalendarMonth(new Date(candidate.getFullYear(), candidate.getMonth(), 1));
        return;
      }
    }
  }, [date, selectedCompanionId, services]);

  const chooseServiceType = (item: ServiceType) => {
    setSelectedType(item.id);
    if (!DEMO_COMPANIONS.some((companion) => companion.id === selectedCompanionId && companion.type === item.mode)) {
      const defaultCompanion = DEMO_COMPANIONS.find((companion) => companion.type === item.mode);
      if (defaultCompanion) setSelectedCompanionId(defaultCompanion.id);
    }
  };

  const chooseCompanion = (companionId: string) => {
    setSelectedCompanionId(companionId);
    const selectedDateMonth = parseDateKey(date);
    const currentDateIsReserved = getCompanionReservedDates(
      companionId,
      selectedDateMonth.getFullYear(),
      selectedDateMonth.getMonth(),
      services,
    ).has(date);
    if (currentDateIsReserved) {
      for (let offset = 0; offset < 90; offset += 1) {
        const nextAvailable = new Date();
        nextAvailable.setDate(nextAvailable.getDate() + offset);
        const key = getDateKey(nextAvailable);
        const dates = getCompanionReservedDates(
          companionId,
          nextAvailable.getFullYear(),
          nextAvailable.getMonth(),
          services,
        );
        if (!dates.has(key)) {
          setDate(key);
          setCalendarMonth(new Date(nextAvailable.getFullYear(), nextAvailable.getMonth(), 1));
          break;
        }
      }
    }
  };

  const submit = () => {
    if (!selectedService) {
      Alert.alert(
        "Selecciona un servicio",
        "Indica qué tipo de acompañamiento necesitas."
      );

      return;
    }

    if (!destination.trim()) {
      Alert.alert(
        "Falta el destino",
        "Indica dónde necesitas el acompañamiento."
      );

      return;
    }

    if (!selectedCompanion || selectedCompanion.type !== selectedService.mode) {
      Alert.alert("Selecciona un acompañante", "Elige a una persona compatible con el servicio.");
      return;
    }

    if (reservedDates.has(date) || date < getTodayDateKey()) {
      Alert.alert("Fecha no disponible", "Elige un día libre en el calendario.");
      return;
    }

    onSubmit({
      type: selectedService.id,
      mode: selectedService.mode,
      destination: destination.trim(),
      date,
      time: time || formatTime(new Date()),
      notes,
      specialNeeds,
      companionId: selectedCompanionId,
    });
  };

  return (
    <View style={styles.screen}>
      <Header
        title="Solicitar"
        subtitle="Cuéntanos qué necesitas"
        onBack={onBack}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SectionTitle>
          1. ¿Qué tipo de acompañamiento necesitas?
        </SectionTitle>

        {SERVICE_TYPES.map((item) => {
          const active = selectedType === item.id;

          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.serviceOption,
                active && styles.serviceOptionActive,
              ]}
              onPress={() => chooseServiceType(item)}
            >
              <Text style={styles.serviceIcon}>
                {item.icon}
              </Text>

              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.serviceTitle,
                    active && styles.serviceTitleActive,
                  ]}
                >
                  {item.title}
                </Text>

                <Text style={styles.serviceDescription}>
                  {item.description}
                </Text>

                <View style={styles.modeRow}>
                  <Badge>
                    {item.mode === "ASISTENCIAL"
                      ? "ASISTENCIAL"
                      : "NO CLÍNICO"}
                  </Badge>
                </View>
              </View>

              <View
                style={[
                  styles.radio,
                  active && styles.radioActive,
                ]}
              >
                {active && (
                  <View style={styles.radioInner} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        <SectionTitle>2. Acompañantes cercanos</SectionTitle>

        {availableCompanions.map((companion) => {
          const active = selectedCompanionId === companion.id;

          return (
            <TouchableOpacity
              key={companion.id}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              style={[styles.nearbyCompanion, active && styles.nearbyCompanionActive]}
              onPress={() => chooseCompanion(companion.id)}
            >
              <View style={styles.nearbyAvatar}>
                <Text style={styles.nearbyAvatarText}>{companion.name.charAt(0)}</Text>
              </View>
              <View style={styles.nearbyInfo}>
                <Text style={styles.nearbyName}>{companion.name}</Text>
                <Text style={styles.nearbyMeta}>{companion.role} · {companion.distanceKm.toFixed(1)} km</Text>
                <Text style={styles.nearbyMeta}>⭐ {companion.rating.toFixed(1)} · {companion.services} servicios</Text>
              </View>
              <View style={[styles.radio, active && styles.radioActive]}>
                {active && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          );
        })}

        <SectionTitle>3. Elige un día disponible</SectionTitle>
        <Card>
          <Text style={styles.calendarSelectedDate}>
            {selectedCompanion?.name}: {formatDate(date)}
          </Text>
          <AvailabilityCalendar
            month={calendarMonth}
            onMonthChange={setCalendarMonth}
            reservedDates={reservedDates}
            selectedDate={date}
            onSelect={setDate}
          />
        </Card>

        <SectionTitle>4. Destino</SectionTitle>

        <TextInput
          value={destination}
          onChangeText={setDestination}
          placeholder="Ej. Centro de Ginecología y Obstetricia"
          placeholderTextColor={BRAND.muted}
          style={styles.input}
        />

        <SectionTitle>5. Hora</SectionTitle>

        <TextInput
          value={time}
          onChangeText={setTime}
          placeholder="Ej. 08:30 AM"
          placeholderTextColor={BRAND.muted}
          style={styles.input}
        />

        <SectionTitle>6. Información adicional</SectionTitle>

        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Indica cualquier detalle importante..."
          placeholderTextColor={BRAND.muted}
          style={[styles.input, styles.textArea]}
          multiline
        />

        <SectionTitle>
          7. Necesidades especiales
        </SectionTitle>

        <TextInput
          value={specialNeeds}
          onChangeText={setSpecialNeeds}
          placeholder="Movilidad reducida, acompañamiento familiar, etc."
          placeholderTextColor={BRAND.muted}
          style={[styles.input, styles.textArea]}
          multiline
        />

        {selectedService?.mode === "ASISTENCIAL" && (
          <Card style={styles.noticeCard}>
            <Text style={styles.noticeTitle}>
              🏥 Servicio asistencial
            </Text>

            <Text style={styles.noticeText}>
              Este tipo de solicitud requiere que el servicio
              sea atendido por personal con las credenciales
              correspondientes y dentro de su alcance
              profesional.
            </Text>
          </Card>
        )}

        <PrimaryButton
          title="CONFIRMAR SOLICITUD"
          onPress={submit}
        />

        <Text style={styles.disclaimer}>
          JUNTOS coordina el acompañamiento. Las actividades
          clínicas reguladas solo pueden ser realizadas por
          profesionales debidamente habilitados y dentro de
          su alcance profesional.
        </Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ========================================================
// TRACKING
// ========================================================

function TrackingScreen({
  service,
  onBack,
  onAssign,
  onCheckIn,
  onComplete,
  onCancel,
  onCall,
  onSOS,
  onViewProfile,
}: TrackingScreenProps) {
  const [pin, setPin] = useState("");

  if (!service) {
    return (
      <View style={styles.screen}>
        <Header
          title="Servicio"
          onBack={onBack}
        />

        <EmptyState
          icon="📭"
          title="No tienes un servicio activo"
          description="Crea una nueva solicitud para comenzar."
        />
      </View>
    );
  }

  const serviceInfo = SERVICE_TYPES.find(
    (item) => item.id === service.type
  );

  return (
    <View style={styles.screen}>
      <Header
        title="Mi servicio"
        subtitle={service.id}
        onBack={onBack}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card>
          <View style={styles.statusHeader}>
            <View>
              <Text style={styles.cardEyebrow}>
                ESTADO
              </Text>

              <Text style={styles.statusBig}>
                {getStatusLabel(service.status)}
              </Text>
            </View>

            <View style={styles.statusIcon}>
              <Text>✓</Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width:
                    service.status === "PENDIENTE"
                      ? "20%"
                      : service.status === "ASIGNADO"
                      ? "50%"
                      : service.status === "EN_CURSO"
                      ? "80%"
                      : "100%",
                },
              ]}
            />
          </View>
        </Card>

        <Card>
          <Text style={styles.cardEyebrow}>
            SERVICIO
          </Text>

          <Text style={styles.activeTitle}>
            {serviceInfo?.icon} {serviceInfo?.title}
          </Text>

          <Text style={styles.destination}>
            📍 {service.destination}
          </Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Fecha</Text>
            <Text style={styles.detailValue}>
              {service.date}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Hora</Text>
            <Text style={styles.detailValue}>
              {service.time}
            </Text>
          </View>

          {service.notes ? (
            <View style={styles.notesBox}>
              <Text style={styles.detailLabel}>
                Información adicional
              </Text>

              <Text style={styles.cardText}>
                {service.notes}
              </Text>
            </View>
          ) : null}
        </Card>

        {service.companion ? (
          <Card>
            <Text style={styles.cardEyebrow}>
              ACOMPAÑANTE
            </Text>

            <View style={styles.companionRow}>
              <View style={styles.companionAvatar}>
                <Text>
                  {service.companion.name.charAt(0)}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.companionName}>
                  {service.companion.name}
                </Text>

                <Text style={styles.cardText}>
                  {service.companion.role}
                </Text>

                <Text style={styles.rating}>
                  ⭐ {service.companion.rating} ·{" "}
                  {service.companion.services} servicios
                </Text>
              </View>

              <TouchableOpacity
                style={styles.callButton}
                onPress={onCall}
              >
                <Text style={styles.callButtonText}>
                  ☎
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.verifiedBox}>
              <Text style={styles.verifiedText}>
                ✓ Acompañante verificada
              </Text>
            </View>

            {service.status === "ASIGNADO" && (
              <SecondaryButton
                title="VER PERFIL ANTES DEL CHECK-IN"
                onPress={onViewProfile}
              />
            )}
          </Card>
        ) : (
          <Card>
            <Text style={styles.cardTitle}>
              {service.preferredCompanionId
                ? `Solicitud enviada a ${DEMO_COMPANIONS.find((item) => item.id === service.preferredCompanionId)?.name ?? "tu acompañante"}`
                : "Buscando acompañante"}
            </Text>

            <Text style={styles.cardText}>
              {service.preferredCompanionId
                ? "La persona elegida verá tu solicitud en su perfil y podrá aceptarla."
                : "Mesa de Operaciones debe asignar un acompañante compatible con el tipo de servicio."}
            </Text>

            {!service.preferredCompanionId && (
              <SecondaryButton title="SIMULAR ASIGNACIÓN" onPress={onAssign} />
            )}
          </Card>
        )}

        {service.status === "ASIGNADO" && (
          <Card style={styles.pinCard}>
            <Text style={styles.pinTitle}>
              🔐 PIN DE SEGURIDAD
            </Text>

            <Text style={styles.pinDescription}>
              Comparte este PIN únicamente cuando el
              acompañante llegue y estés lista para iniciar
              el servicio.
            </Text>

            <Text style={styles.pinDisplay}>
              {service.pin}
            </Text>

            <TextInput
              value={pin}
              onChangeText={setPin}
              keyboardType="number-pad"
              maxLength={4}
              placeholder="Introduce el PIN para validar"
              placeholderTextColor={BRAND.muted}
              style={styles.input}
            />

            <PrimaryButton
              title="VALIDAR CHECK-IN"
              onPress={() =>
                onCheckIn(service.id, pin)
              }
            />
          </Card>
        )}

        {service.status === "EN_CURSO" && (
          <Card style={styles.liveCard}>
            <View style={styles.liveHeader}>
              <View style={styles.liveDot} />

              <Text style={styles.liveTitle}>
                SERVICIO EN CURSO
              </Text>
            </View>

            <Text style={styles.cardText}>
              El acompañamiento está activo y registrado en
              la trazabilidad de JUNTOS.
            </Text>

            <View style={styles.timeline}>
              <TimelineItem
                title="Solicitud"
                text="Solicitud creada"
                done
              />

              <TimelineItem
                title="Asignación"
                text="Acompañante verificada"
                done
              />

              <TimelineItem
                title="Check-in"
                text="PIN validado"
                done
              />

              <TimelineItem
                title="Servicio"
                text="En curso"
                active
              />

              <TimelineItem
                title="Finalización"
                text="Pendiente"
              />
            </View>

            <PrimaryButton
              title="FINALIZAR SERVICIO"
              onPress={onComplete}
            />
          </Card>
        )}

        <SectionTitle>
          Trazabilidad del servicio
        </SectionTitle>

        <Card>
          {service.timeline.map((item, index) => (
            <View
              key={`${item.status}-${index}`}
              style={styles.timelineRow}
            >
              <View style={styles.timelineDot} />

              <View style={{ flex: 1 }}>
                <Text style={styles.timelineTitle}>
                  {getStatusLabel(item.status)}
                </Text>

                <Text style={styles.timelineText}>
                  {item.text}
                </Text>

                <Text style={styles.timelineDate}>
                  {formatDate(item.date)} ·{" "}
                  {formatTime(item.date)}
                </Text>
              </View>
            </View>
          ))}
        </Card>

        {["PENDIENTE", "ASIGNADO"].includes(
          service.status
        ) && (
          <SecondaryButton
            title="CANCELAR SOLICITUD"
            onPress={onCancel}
          />
        )}

        <DangerButton
          title="🚨 EMERGENCIA / 911"
          onPress={onSOS}
        />

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

// ========================================================
// TIMELINE ITEM
// ========================================================

export function CompanionProfileScreen({
  companion,
  onBack,
  onCall,
  context = "service",
}: CompanionProfileScreenProps) {
  if (!companion) {
    return (
      <View style={styles.screen}>
        <Header title="Perfil del acompañante" onBack={onBack} />
        <EmptyState
          icon="👤"
          title="Aún no hay acompañante asignado"
          description="El perfil aparecerá aquí cuando operaciones asigne a una persona."
        />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Header
        title="Perfil del acompañante"
        subtitle={context === "service" ? "Asignado a tu servicio" : "Perfil de demostración"}
        onBack={onBack}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card>
          <View style={styles.profileHeader}>
            <View style={styles.companionProfileAvatar}>
              <Text style={styles.companionProfileInitial}>
                {companion.name.charAt(0)}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>{companion.name}</Text>
              <Text style={styles.cardText}>{companion.role}</Text>
              <Text style={styles.rating}>
                ⭐ {companion.rating.toFixed(1)} · {companion.services} servicios
              </Text>
            </View>
          </View>

          <View style={styles.verifiedBox}>
            <Text style={styles.verifiedText}>
              {companion.verified
                ? "✓ Verificación registrada en esta demo"
                : "Verificación pendiente"}
            </Text>
          </View>

          <Text style={styles.companionDemoNote}>
            Perfil de demostración. La identidad y los datos reales deben confirmarse en la app.
          </Text>
        </Card>

        <SectionTitle>Sobre el acompañamiento</SectionTitle>
        <Card>
          <Text style={styles.cardText}>{companion.about}</Text>
        </Card>

        <SectionTitle>Áreas de apoyo</SectionTitle>
        <Card>
          <View style={styles.companionSpecialties}>
            {companion.specialties.map((specialty) => (
              <View key={specialty} style={styles.companionSpecialtyRow}>
                <View style={styles.companionSpecialtyDot} />
                <Text style={styles.cardText}>{specialty}</Text>
              </View>
            ))}
          </View>
        </Card>

        <SectionTitle>Contacto</SectionTitle>
        <Card>
          <ProfileRow label="Teléfono" value={companion.phone} />
          <SecondaryButton title="LLAMAR AL ACOMPAÑANTE" onPress={onCall} />
        </Card>

        <Card style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>
            {context === "service" ? "Antes de iniciar" : "Cuenta de acompañante"}
          </Text>
          <Text style={styles.noticeText}>
            {context === "service"
              ? "Revisa este perfil y comparte el PIN solo cuando la persona asignada haya llegado."
              : "Esta ficha contiene datos de ejemplo. La edición y verificación del perfil se conectarán a la cuenta real."}
          </Text>
        </Card>

        <PrimaryButton
          title={context === "service" ? "VOLVER AL CHECK-IN" : "VOLVER A ACOMPAÑAMIENTO"}
          onPress={onBack}
        />
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

export function CompanionAccountScreen({
  services,
  onAccept,
  onOpen,
  onCall,
}: CompanionAccountScreenProps) {
  const [selectedCompanionId, setSelectedCompanionId] = useState("CMP-001");
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const companion = DEMO_COMPANIONS.find((item) => item.id === selectedCompanionId) ?? DEMO_COMPANIONS[0];
  const reservedDates = getCompanionReservedDates(
    companion.id,
    calendarMonth.getFullYear(),
    calendarMonth.getMonth(),
    services,
  );
  const nearbyRequests = services.filter((service) =>
    service.status === "PENDIENTE" &&
    service.preferredCompanionId === companion.id &&
    service.mode === companion.type,
  );
  const assignedServices = services.filter((service) =>
    service.companion?.id === companion.id &&
    ["ASIGNADO", "EN_CURSO"].includes(service.status),
  );

  return (
    <View style={styles.screen}>
      <Header title="Perfil de acompañante" subtitle="Solicitudes y disponibilidad" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <SectionTitle>Perfiles de demostración</SectionTitle>
        <View style={styles.companionSwitcher}>
          {DEMO_COMPANIONS.map((candidate) => {
            const active = candidate.id === companion.id;
            return (
              <TouchableOpacity
                key={candidate.id}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                onPress={() => setSelectedCompanionId(candidate.id)}
                style={[styles.companionSwitchItem, active && styles.companionSwitchItemActive]}
              >
                <Text style={[styles.companionSwitchName, active && styles.companionSwitchNameActive]}>
                  {candidate.name.split(" ")[0]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Card>
          <View style={styles.profileHeader}>
            <View style={styles.companionAvatarLarge}>
              <Text style={styles.companionProfileInitial}>{companion.name.charAt(0)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>{companion.name}</Text>
              <Text style={styles.cardText}>{companion.role}</Text>
              <Text style={styles.rating}>⭐ {companion.rating.toFixed(1)} · {companion.services} servicios · {companion.distanceKm.toFixed(1)} km</Text>
            </View>
          </View>
          <View style={styles.verifiedBox}>
            <Text style={styles.verifiedText}>✓ Perfil verificado en esta demo</Text>
          </View>
          <Text style={[styles.cardText, { marginTop: 10 }]}>{companion.about}</Text>
          <Text style={styles.companionDemoNote}>Datos de ejemplo; la identidad y disponibilidad reales deben validarse antes de producción.</Text>
          <SecondaryButton title="LLAMAR A ESTE ACOMPAÑANTE" onPress={() => onCall(companion)} />
        </Card>

        <SectionTitle>Calendario de disponibilidad</SectionTitle>
        <Card>
          <AvailabilityCalendar
            month={calendarMonth}
            onMonthChange={setCalendarMonth}
            reservedDates={reservedDates}
          />
        </Card>

        <SectionTitle>Solicitudes cercanas</SectionTitle>
        {nearbyRequests.length === 0 ? (
          <EmptyState
            icon="📍"
            title="No hay solicitudes cercanas para este perfil"
            description="Las solicitudes compatibles aparecerán aquí para que puedas aceptarlas."
          />
        ) : (
          nearbyRequests.map((service) => (
            <Card key={service.id}>
              <View style={styles.operationsHeader}>
                <Text style={styles.operationsId}>{service.id}</Text>
                <Badge type="warning">NUEVA</Badge>
              </View>
              <Text style={styles.operationsTitle}>{service.requesterName} · {service.requesterDistanceKm.toFixed(1)} km</Text>
              <Text style={styles.cardText}>{SERVICE_TYPES.find((item) => item.id === service.type)?.title} · {service.destination}</Text>
              <Text style={styles.cardText}>📅 {formatDate(service.date)} · {service.time}</Text>
              {service.notes ? <Text style={styles.cardText}>{service.notes}</Text> : null}
              <PrimaryButton title="ACEPTAR SOLICITUD" onPress={() => onAccept(service.id, companion.id)} />
            </Card>
          ))
        )}

        <SectionTitle>Servicios aceptados</SectionTitle>
        {assignedServices.length === 0 ? (
          <EmptyState
            icon="🗓️"
            title="Todavía no tienes servicios aceptados"
            description="Cuando aceptes una solicitud, la verás aquí y ese día quedará reservado."
          />
        ) : (
          assignedServices.map((service) => (
            <TouchableOpacity key={service.id} style={styles.historyCard} onPress={() => onOpen(service)}>
              <Text style={styles.historyIcon}>🤝</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.historyTitle}>{service.requesterName} · {service.requesterDistanceKm.toFixed(1)} km</Text>
                <Text style={styles.historyDestination}>{service.destination}</Text>
                <Text style={styles.historyDate}>{formatDate(service.date)} · {service.time} · {service.id}</Text>
              </View>
              <Badge type="success">{service.status}</Badge>
            </TouchableOpacity>
          ))
        )}
        <View style={{ height: 35 }} />
      </ScrollView>
    </View>
  );
}

function TimelineItem({
  title,
  text,
  done = false,
  active = false,
}: {
  title: string;
  text: string;
  done?: boolean;
  active?: boolean;
}) {
  return (
    <View style={styles.timelineRow}>
      <View
        style={[
          styles.timelineDot,
          done && styles.timelineDotDone,
          active && styles.timelineDotActive,
        ]}
      />

      <View>
        <Text style={styles.timelineTitle}>
          {title}
        </Text>

        <Text style={styles.timelineText}>
          {text}
        </Text>
      </View>
    </View>
  );
}

// ========================================================
// HISTORIAL
// ========================================================

function HistoryScreen({
  services,
  onBack,
  onSelect,
}: HistoryScreenProps) {
  const history = services.filter(
    (item) =>
      item.status === "COMPLETADO" ||
      item.status === "CANCELADO"
  );

  return (
    <View style={styles.screen}>
      <Header
        title="Historial"
        subtitle="Tus servicios JUNTOS"
        onBack={onBack}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
      >
        {history.length === 0 ? (
          <EmptyState
            icon="🗂️"
            title="Todavía no tienes historial"
            description="Los servicios completados aparecerán aquí."
          />
        ) : (
          history.map((service) => {
            const info = SERVICE_TYPES.find(
              (item) => item.id === service.type
            );

            return (
              <TouchableOpacity
                key={service.id}
                style={styles.historyCard}
                onPress={() => onSelect(service)}
              >
                <Text style={styles.historyIcon}>
                  {info?.icon}
                </Text>

                <View style={{ flex: 1 }}>
                  <Text style={styles.historyTitle}>
                    {info?.title}
                  </Text>

                  <Text style={styles.historyDestination}>
                    {service.destination}
                  </Text>

                  <Text style={styles.historyDate}>
                    {service.date}
                  </Text>
                </View>

                <Badge
                  type={
                    service.status === "COMPLETADO"
                      ? "success"
                      : "danger"
                  }
                >
                  {service.status}
                </Badge>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

// ========================================================
// PERFIL
// ========================================================

function ProfileScreen({
  user,
  onBack,
  onSOS,
}: ProfileScreenProps) {
  return (
    <View style={styles.screen}>
      <Header
        title="Mi perfil"
        subtitle="Cuenta y seguridad"
        onBack={onBack}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
      >
        <Card>
          <View style={styles.profileHeader}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>
                {user.name.charAt(0)}
              </Text>
            </View>

            <View>
              <Text style={styles.profileName}>
                {user.name}
              </Text>

              <Text style={styles.cardText}>
                Usuario JUNTOS
              </Text>
            </View>
          </View>
        </Card>

        <SectionTitle>
          Información personal
        </SectionTitle>

        <Card>
          <ProfileRow
            label="Nombre"
            value={user.name}
          />

          <ProfileRow
            label="Teléfono"
            value={user.phone}
          />

          <ProfileRow
            label="Correo"
            value={user.email}
          />
        </Card>

        <SectionTitle>
          Contacto de emergencia
        </SectionTitle>

        <Card>
          <ProfileRow
            label="Nombre"
            value={user.emergencyContact.name}
          />

          <ProfileRow
            label="Relación"
            value={user.emergencyContact.relation}
          />

          <ProfileRow
            label="Teléfono"
            value={user.emergencyContact.phone}
          />
        </Card>

        <SectionTitle>
          Seguridad JUNTOS
        </SectionTitle>

        <Card>
          <SecurityRow
            icon="✓"
            title="Identidad"
            text="Diseñada para validación de usuario."
          />

          <SecurityRow
            icon="✓"
            title="Acompañantes"
            text="Proceso de verificación y habilitación."
          />

          <SecurityRow
            icon="✓"
            title="PIN"
            text="Código asociado al servicio."
          />

          <SecurityRow
            icon="✓"
            title="Trazabilidad"
            text="Registro de eventos del servicio."
          />
        </Card>

        <DangerButton
          title="🚨 CONTACTAR 911"
          onPress={onSOS}
        />

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

// ========================================================
// PROFILE ROW
// ========================================================

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.profileRow}>
      <Text style={styles.profileLabel}>
        {label}
      </Text>

      <Text style={styles.profileValue}>
        {value}
      </Text>
    </View>
  );
}

// ========================================================
// SECURITY ROW
// ========================================================

function SecurityRow({
  icon,
  title,
  text,
}: { icon: string; title: string; text: string }) {
  return (
    <View style={styles.securityRow}>
      <View style={styles.securityIcon}>
        <Text>{icon}</Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.securityTitle}>
          {title}
        </Text>

        <Text style={styles.securityText}>
          {text}
        </Text>
      </View>
    </View>
  );
}

// ========================================================
// RATING
// ========================================================

function RatingScreen({
  service,
  onRate,
}: RatingScreenProps) {
  const [selected, setSelected] = useState(0);

  if (!service) {
    return (
      <View style={styles.screen}>
        <EmptyState
          title="Servicio no encontrado"
          description=""
        />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.ratingContainer}>
        <Text style={styles.ratingEmoji}>
          ⭐
        </Text>

        <Text style={styles.ratingBigTitle}>
          ¿Cómo fue tu experiencia?
        </Text>

        <Text style={styles.ratingDescription}>
          Tu evaluación ayuda a JUNTOS a mantener la calidad
          del servicio.
        </Text>

        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => setSelected(star)}
            >
              <Text
                style={[
                  styles.star,
                  star <= selected &&
                    styles.starSelected,
                ]}
              >
                ★
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <PrimaryButton
          title="ENVIAR EVALUACIÓN"
          disabled={selected === 0}
          onPress={() => onRate(selected)}
        />

        <SecondaryButton
          title="Omitir por ahora"
          onPress={() => onRate(null)}
        />
      </View>
    </View>
  );
}

// ========================================================
// OPERATIONS
// ========================================================

function OperationsScreen({
  services,
  onBack,
  onAssign,
  onOpen,
}: OperationsScreenProps) {
  const pending = services.filter(
    (service) =>
      service.status === "PENDIENTE"
  );

  const assigned = services.filter(
    (service) =>
      service.status === "ASIGNADO" ||
      service.status === "EN_CURSO"
  );

  return (
    <View style={styles.screen}>
      <Header
        title="Mesa de Operaciones"
        subtitle="Control operativo JUNTOS"
        onBack={onBack}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.operationsGrid}>
          <Metric
            value={pending.length}
            label="Pendientes"
          />

          <Metric
            value={assigned.length}
            label="Activos"
          />

          <Metric
            value={services.length}
            label="Total"
          />
        </View>

        <SectionTitle>
          Solicitudes pendientes
        </SectionTitle>

        {pending.length === 0 ? (
          <EmptyState
            icon="✓"
            title="No hay solicitudes pendientes"
            description="La mesa de operaciones está al día."
          />
        ) : (
          pending.map((service) => (
            <OperationsCard
              key={service.id}
              service={service}
              onAssign={() =>
                onAssign(service.id)
              }
              onOpen={() => onOpen(service)}
            />
          ))
        )}

        <SectionTitle>
          Servicios activos
        </SectionTitle>

        {assigned.length === 0 ? (
          <EmptyState
            icon="🛰️"
            title="Sin servicios activos"
            description=""
          />
        ) : (
          assigned.map((service) => (
            <OperationsCard
              key={service.id}
              service={service}
              onAssign={() =>
                onAssign(service.id)
              }
              onOpen={() => onOpen(service)}
            />
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ========================================================
// OPERATIONS CARD
// ========================================================

function OperationsCard({
  service,
  onAssign,
  onOpen,
}: { service: Service; onAssign: Action; onOpen: Action }) {
  const info = SERVICE_TYPES.find(
    (item) => item.id === service.type
  );

  return (
    <Card>
      <View style={styles.operationsHeader}>
        <Text style={styles.operationsId}>
          {service.id}
        </Text>

        <Badge>{service.status}</Badge>
      </View>

      <Text style={styles.operationsTitle}>
        {info?.icon} {info?.title}
      </Text>

      <Text style={styles.cardText}>
        📍 {service.destination}
      </Text>

      <Text style={styles.cardText}>
        📅 {service.date} · {service.time}
      </Text>

      {service.companion ? (
        <Text style={styles.assignedText}>
          👤 {service.companion.name}
        </Text>
      ) : (
        <SecondaryButton
          title="ASIGNAR ACOMPAÑANTE"
          onPress={onAssign}
        />
      )}

      <TouchableOpacity
        style={styles.smallLink}
        onPress={onOpen}
      >
        <Text style={styles.smallLinkText}>
          Ver detalle →
        </Text>
      </TouchableOpacity>
    </Card>
  );
}

// ========================================================
// METRIC
// ========================================================

function Metric({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>
        {value}
      </Text>

      <Text style={styles.metricLabel}>
        {label}
      </Text>
    </View>
  );
}

// ========================================================
// COMPANION
// ========================================================

function CompanionScreen({
  services,
  onBack,
  onOpen,
}: CompanionScreenProps) {
  const active = services.filter(
    (service) =>
      service.companion &&
      ["ASIGNADO", "EN_CURSO"].includes(
        service.status
      )
  );

  return (
    <View style={styles.screen}>
      <Header
        title="Modo acompañante"
        subtitle="Servicios asignados"
        onBack={onBack}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
      >
        <Card>
          <View style={styles.profileHeader}>
            <View style={styles.companionAvatarLarge}>
              <Text>A</Text>
            </View>

            <View>
              <Text style={styles.profileName}>
                Ana Martínez
              </Text>

              <Text style={styles.cardText}>
                Acompañante verificada
              </Text>

              <Text style={styles.rating}>
                ⭐ 4.9 · 127 servicios
              </Text>
            </View>
          </View>
        </Card>

        <SectionTitle>
          Mis servicios
        </SectionTitle>

        {active.length === 0 ? (
          <EmptyState
            icon="🧭"
            title="No tienes servicios asignados"
            description="Cuando operaciones te asigne un servicio aparecerá aquí."
          />
        ) : (
          active.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={styles.historyCard}
              onPress={() => onOpen(service)}
            >
              <Text style={styles.historyIcon}>
                🤝
              </Text>

              <View style={{ flex: 1 }}>
                <Text style={styles.historyTitle}>
                  {service.destination}
                </Text>

                <Text style={styles.historyDestination}>
                  {service.date} · {service.time}
                </Text>

                <Text style={styles.historyDate}>
                  {service.id}
                </Text>
              </View>

              <Badge type="success">
                {service.status}
              </Badge>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

// ========================================================
// BOTTOM NAVIGATION
// ========================================================

function BottomNavigation({
  screen,
  role,
  onHome,
  onRequest,
  onTracking,
  onHistory,
  onProfile,
  onOperations,
  onCompanion,
}: BottomNavigationProps) {
  if (
    screen === "RATING" ||
    screen === "REQUEST" ||
    screen === "TRACKING" ||
    screen === "COMPANION_PROFILE"
  ) {
    return null;
  }

  return (
    <View style={styles.bottomNav}>
      <NavItem
        icon="⌂"
        label="Inicio"
        active={screen === "HOME"}
        onPress={onHome}
      />

      <NavItem
        icon="＋"
        label="Solicitar"
        active={false}
        onPress={onRequest}
      />

      {role === "COMPANION" ? (
        <NavItem
          icon="🤝"
          label="Servicios"
          active={screen === "COMPANION"}
          onPress={onCompanion}
        />
      ) : (
        <NavItem
          icon="📍"
          label="En camino"
          active={false}
          onPress={onTracking}
        />
      )}

      <NavItem
        icon="▤"
        label="Historial"
        active={screen === "HISTORY"}
        onPress={onHistory}
      />

      <NavItem
        icon="◉"
        label="Perfil"
        active={screen === "PROFILE"}
        onPress={onProfile}
      />
    </View>
  );
}

// ========================================================
// NAV ITEM
// ========================================================

function NavItem({
  icon,
  label,
  active,
  onPress,
}: { icon: string; label: string; active: boolean; onPress: Action }) {
  return (
    <TouchableOpacity
      style={styles.navItem}
      onPress={onPress}
    >
      <Text
        style={[
          styles.navIcon,
          active && styles.navActive,
        ]}
      >
        {icon}
      </Text>

      <Text
        style={[
          styles.navLabel,
          active && styles.navActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ========================================================
// STATUS
// ========================================================

function getStatusLabel(status: ServiceStatus) {
  const labels: Record<ServiceStatus, string> = {
    PENDIENTE: "Pendiente",
    ASIGNADO: "Acompañante asignado",
    EN_CURSO: "En curso",
    COMPLETADO: "Completado",
    CANCELADO: "Cancelado",
    CALIFICADO: "Calificado",
  };

  return labels[status] || status;
}

// ========================================================
// ESTILOS
// ========================================================

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BRAND.bg,
  },

  app: {
    flex: 1,
    backgroundColor: BRAND.bg,
  },

  screen: {
    flex: 1,
    backgroundColor: BRAND.bg,
  },

  scrollContent: {
    padding: 18,
    paddingBottom: 120,
  },

  // ------------------------------------------------------
  // HEADER
  // ------------------------------------------------------

  header: {
    backgroundColor: BRAND.navy,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  headerTitle: {
    color: BRAND.white,
    fontSize: 20,
    fontWeight: "800",
  },

  headerSubtitle: {
    color: "#BFD0DB",
    fontSize: 12,
    marginTop: 2,
  },

  backButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },

  backText: {
    color: BRAND.white,
    fontSize: 38,
    lineHeight: 38,
  },

  logoMini: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: BRAND.emerald,
    alignItems: "center",
    justifyContent: "center",
  },

  logoMiniText: {
    color: BRAND.white,
    fontWeight: "900",
    fontSize: 20,
  },

  // ------------------------------------------------------
  // HERO
  // ------------------------------------------------------

  hero: {
    backgroundColor: BRAND.navy,
    marginHorizontal: -18,
    marginTop: -18,
    padding: 24,
    paddingTop: 28,
    paddingBottom: 30,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  heroSmall: {
    color: "#BFD0DB",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.4,
  },

  logoText: {
    color: BRAND.white,
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: 2,
    marginTop: 4,
  },

  heroSubtitle: {
    color: "#DCE9EF",
    fontSize: 13,
    lineHeight: 19,
    maxWidth: 250,
    marginTop: 4,
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: BRAND.emerald,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: BRAND.white,
    fontWeight: "800",
    fontSize: 20,
  },

  greeting: {
    paddingVertical: 22,
  },

  greetingTitle: {
    color: BRAND.text,
    fontSize: 23,
    fontWeight: "800",
  },

  greetingText: {
    color: BRAND.muted,
    marginTop: 4,
    fontSize: 14,
  },

  // ------------------------------------------------------
  // BUTTONS
  // ------------------------------------------------------

  primaryButton: {
    backgroundColor: BRAND.emerald,
    minHeight: 52,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    marginVertical: 7,
  },

  primaryButtonText: {
    color: BRAND.white,
    fontWeight: "800",
    fontSize: 14,
    letterSpacing: 0.3,
  },

  secondaryButton: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BRAND.emerald,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 15,
    marginVertical: 7,
  },

  secondaryButtonText: {
    color: BRAND.emeraldDark,
    fontWeight: "800",
    fontSize: 13,
  },

  dangerButton: {
    backgroundColor: BRAND.danger,
    minHeight: 52,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    marginVertical: 8,
  },

  dangerButtonText: {
    color: BRAND.white,
    fontWeight: "900",
    fontSize: 14,
  },

  buttonDisabled: {
    opacity: 0.4,
  },

  // ------------------------------------------------------
  // CARDS
  // ------------------------------------------------------

  card: {
    backgroundColor: BRAND.white,
    borderRadius: 16,
    padding: 17,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: BRAND.border,
  },

  activeCard: {
    borderColor: "#A8DDCE",
    backgroundColor: "#F2FBF8",
  },

  cardEyebrow: {
    color: BRAND.muted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 5,
  },

  cardTitle: {
    color: BRAND.text,
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 7,
  },

  cardText: {
    color: BRAND.muted,
    fontSize: 13,
    lineHeight: 19,
  },

  activeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  activeTitle: {
    color: BRAND.text,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 7,
  },

  destination: {
    color: BRAND.text,
    fontSize: 14,
    fontWeight: "600",
    marginVertical: 9,
  },

  // ------------------------------------------------------
  // GRID
  // ------------------------------------------------------

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
  },

  categoryCard: {
    width: "48%",
    backgroundColor: BRAND.white,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: BRAND.border,
    padding: 15,
    marginBottom: 12,
    minHeight: 145,
  },

  categoryIcon: {
    fontSize: 30,
    marginBottom: 8,
  },

  categoryTitle: {
    color: BRAND.text,
    fontSize: 14,
    fontWeight: "800",
  },

  categoryDescription: {
    color: BRAND.muted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 5,
  },

  // ------------------------------------------------------
  // SECTIONS
  // ------------------------------------------------------

  sectionTitle: {
    color: BRAND.text,
    fontSize: 17,
    fontWeight: "800",
    marginTop: 17,
    marginBottom: 10,
  },

  // ------------------------------------------------------
  // STEPS
  // ------------------------------------------------------

  step: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  stepCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: BRAND.mint,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  stepNumber: {
    color: BRAND.emeraldDark,
    fontWeight: "900",
  },

  stepTitle: {
    color: BRAND.text,
    fontSize: 14,
    fontWeight: "800",
  },

  stepDescription: {
    color: BRAND.muted,
    fontSize: 12,
    marginTop: 2,
  },

  // ------------------------------------------------------
  // BADGES
  // ------------------------------------------------------

  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#EDF2F5",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 20,
  },

  badgeSuccess: {
    backgroundColor: "#E2F6ED",
  },

  badgeWarning: {
    backgroundColor: "#FFF1D7",
  },

  badgeDanger: {
    backgroundColor: "#FCE7E7",
  },

  badgeText: {
    color: BRAND.text,
    fontSize: 9,
    fontWeight: "800",
  },

  // ------------------------------------------------------
  // FORM
  // ------------------------------------------------------

  nearbyCompanion: {
    backgroundColor: BRAND.white,
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 9,
    flexDirection: "row",
    alignItems: "center",
  },

  nearbyCompanionActive: {
    borderColor: BRAND.emerald,
    backgroundColor: "#F0FBF7",
  },

  nearbyAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: BRAND.navy,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  nearbyAvatarText: {
    color: BRAND.white,
    fontSize: 19,
    fontWeight: "900",
  },

  nearbyInfo: {
    flex: 1,
  },

  nearbyName: {
    color: BRAND.text,
    fontSize: 14,
    fontWeight: "800",
  },

  nearbyMeta: {
    color: BRAND.muted,
    fontSize: 11,
    marginTop: 3,
  },

  calendarSelectedDate: {
    color: BRAND.emeraldDark,
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 10,
    textTransform: "capitalize",
  },

  calendarWrap: {
    width: "100%",
  },

  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  calendarArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BRAND.bg,
    alignItems: "center",
    justifyContent: "center",
  },

  calendarArrowText: {
    color: BRAND.text,
    fontSize: 24,
    lineHeight: 28,
  },

  calendarMonth: {
    color: BRAND.text,
    fontSize: 15,
    fontWeight: "800",
    textTransform: "capitalize",
  },

  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  calendarCell: {
    width: "14.2857%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  calendarWeekday: {
    color: BRAND.muted,
    fontSize: 11,
    fontWeight: "800",
  },

  calendarDay: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#E8F7F2",
    alignItems: "center",
    justifyContent: "center",
  },

  calendarDayReserved: {
    backgroundColor: "#FCE7E7",
  },

  calendarDayPast: {
    backgroundColor: "#F1F3F5",
  },

  calendarDaySelected: {
    backgroundColor: BRAND.emerald,
  },

  calendarDayText: {
    color: BRAND.emeraldDark,
    fontSize: 12,
    fontWeight: "700",
  },

  calendarDayReservedText: {
    color: BRAND.danger,
  },

  calendarDaySelectedText: {
    color: BRAND.white,
  },

  calendarLegend: {
    flexDirection: "row",
    gap: 16,
    marginTop: 12,
  },

  calendarLegendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  calendarLegendDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },

  calendarLegendAvailable: {
    backgroundColor: BRAND.emerald,
  },

  calendarLegendReserved: {
    backgroundColor: BRAND.danger,
  },

  calendarLegendText: {
    color: BRAND.muted,
    fontSize: 10,
  },

  serviceOption: {
    backgroundColor: BRAND.white,
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 15,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  serviceOptionActive: {
    borderColor: BRAND.emerald,
    backgroundColor: "#F0FBF7",
  },

  serviceIcon: {
    fontSize: 28,
    width: 45,
  },

  serviceTitle: {
    color: BRAND.text,
    fontWeight: "800",
    fontSize: 14,
  },

  serviceTitleActive: {
    color: BRAND.emeraldDark,
  },

  serviceDescription: {
    color: BRAND.muted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },

  modeRow: {
    marginTop: 6,
  },

  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: BRAND.border,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  radioActive: {
    borderColor: BRAND.emerald,
  },

  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: BRAND.emerald,
  },

  input: {
    backgroundColor: BRAND.white,
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    color: BRAND.text,
    marginBottom: 9,
  },

  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },

  noticeCard: {
    backgroundColor: "#FFF9EA",
    borderColor: "#F1D897",
  },

  noticeTitle: {
    color: "#805B00",
    fontWeight: "800",
    marginBottom: 5,
  },

  noticeText: {
    color: "#6D5A2C",
    fontSize: 12,
    lineHeight: 18,
  },

  disclaimer: {
    color: BRAND.muted,
    fontSize: 10,
    lineHeight: 15,
    textAlign: "center",
    marginTop: 8,
  },

  // ------------------------------------------------------
  // STATUS
  // ------------------------------------------------------

  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  statusBig: {
    color: BRAND.emeraldDark,
    fontSize: 21,
    fontWeight: "900",
  },

  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: BRAND.mint,
    alignItems: "center",
    justifyContent: "center",
  },

  progressTrack: {
    height: 7,
    backgroundColor: "#E5EBEE",
    borderRadius: 5,
    overflow: "hidden",
    marginTop: 18,
  },

  progressFill: {
    height: "100%",
    backgroundColor: BRAND.emerald,
  },

  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: BRAND.border,
    paddingVertical: 11,
  },

  detailLabel: {
    color: BRAND.muted,
    fontSize: 12,
  },

  detailValue: {
    color: BRAND.text,
    fontWeight: "700",
    fontSize: 12,
  },

  notesBox: {
    backgroundColor: BRAND.bg,
    padding: 12,
    borderRadius: 10,
    marginTop: 5,
  },

  // ------------------------------------------------------
  // COMPANION
  // ------------------------------------------------------

  companionRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  companionAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: BRAND.mint,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  companionAvatarLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: BRAND.mint,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  companionSwitcher: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },

  companionSwitchItem: {
    minHeight: 40,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BRAND.border,
    backgroundColor: BRAND.white,
    alignItems: "center",
    justifyContent: "center",
  },

  companionSwitchItemActive: {
    borderColor: BRAND.emerald,
    backgroundColor: BRAND.mint,
  },

  companionSwitchName: {
    color: BRAND.muted,
    fontSize: 13,
    fontWeight: "700",
  },

  companionSwitchNameActive: {
    color: BRAND.emeraldDark,
  },

  companionName: {
    color: BRAND.text,
    fontSize: 15,
    fontWeight: "800",
  },

  rating: {
    color: BRAND.emeraldDark,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 4,
  },

  callButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: BRAND.emerald,
    alignItems: "center",
    justifyContent: "center",
  },

  callButtonText: {
    color: BRAND.white,
    fontSize: 18,
  },

  verifiedBox: {
    backgroundColor: "#EAF8F1",
    borderRadius: 9,
    padding: 9,
    marginTop: 12,
  },

  companionProfileAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: BRAND.navy,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  companionProfileInitial: {
    color: BRAND.white,
    fontSize: 28,
    fontWeight: "900",
  },

  companionDemoNote: {
    color: BRAND.muted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 10,
  },

  companionSpecialties: {
    gap: 10,
  },

  companionSpecialtyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  companionSpecialtyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: BRAND.emerald,
  },

  verifiedText: {
    color: BRAND.emeraldDark,
    fontSize: 11,
    fontWeight: "800",
  },

  // ------------------------------------------------------
  // PIN
  // ------------------------------------------------------

  pinCard: {
    backgroundColor: BRAND.navy,
  },

  pinTitle: {
    color: BRAND.white,
    fontSize: 17,
    fontWeight: "900",
  },

  pinDescription: {
    color: "#C7D7E0",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },

  pinDisplay: {
    color: BRAND.white,
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: 12,
    textAlign: "center",
    marginVertical: 16,
  },

  // ------------------------------------------------------
  // LIVE
  // ------------------------------------------------------

  liveCard: {
    borderColor: "#9BDCC8",
    backgroundColor: "#F1FBF7",
  },

  liveHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: BRAND.success,
    marginRight: 8,
  },

  liveTitle: {
    color: BRAND.success,
    fontWeight: "900",
    fontSize: 13,
  },

  // ------------------------------------------------------
  // TIMELINE
  // ------------------------------------------------------

  timeline: {
    marginTop: 15,
  },

  timelineRow: {
    flexDirection: "row",
    marginBottom: 14,
  },

  timelineDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: "#D9E1E5",
    marginTop: 4,
    marginRight: 12,
  },

  timelineDotDone: {
    backgroundColor: BRAND.emerald,
  },

  timelineDotActive: {
    backgroundColor: BRAND.warning,
  },

  timelineTitle: {
    color: BRAND.text,
    fontWeight: "800",
    fontSize: 12,
  },

  timelineText: {
    color: BRAND.muted,
    fontSize: 11,
    marginTop: 2,
  },

  timelineDate: {
    color: "#8A9AA5",
    fontSize: 9,
    marginTop: 2,
  },

  // ------------------------------------------------------
  // HISTORY
  // ------------------------------------------------------

  historyCard: {
    backgroundColor: BRAND.white,
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 15,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  historyIcon: {
    fontSize: 27,
    marginRight: 12,
  },

  historyTitle: {
    color: BRAND.text,
    fontSize: 14,
    fontWeight: "800",
  },

  historyDestination: {
    color: BRAND.muted,
    fontSize: 11,
    marginTop: 3,
  },

  historyDate: {
    color: "#8798A3",
    fontSize: 10,
    marginTop: 3,
  },

  // ------------------------------------------------------
  // PROFILE
  // ------------------------------------------------------

  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: BRAND.navy,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  profileAvatarText: {
    color: BRAND.white,
    fontSize: 25,
    fontWeight: "900",
  },

  profileName: {
    color: BRAND.text,
    fontSize: 18,
    fontWeight: "900",
  },

  profileRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BRAND.border,
  },

  profileLabel: {
    color: BRAND.muted,
    fontSize: 10,
    marginBottom: 3,
  },

  profileValue: {
    color: BRAND.text,
    fontSize: 14,
    fontWeight: "700",
  },

  securityRow: {
    flexDirection: "row",
    marginBottom: 14,
  },

  securityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BRAND.mint,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  securityTitle: {
    color: BRAND.text,
    fontWeight: "800",
    fontSize: 13,
  },

  securityText: {
    color: BRAND.muted,
    fontSize: 11,
    marginTop: 2,
  },

  // ------------------------------------------------------
  // RATING
  // ------------------------------------------------------

  ratingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },

  ratingEmoji: {
    fontSize: 58,
    marginBottom: 20,
  },

  ratingBigTitle: {
    color: BRAND.text,
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
  },

  ratingDescription: {
    color: BRAND.muted,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 25,
  },

  stars: {
    flexDirection: "row",
    marginBottom: 25,
  },

  star: {
    color: "#D8E0E4",
    fontSize: 43,
    marginHorizontal: 4,
  },

  starSelected: {
    color: "#F3B633",
  },

  // ------------------------------------------------------
  // OPERATIONS
  // ------------------------------------------------------

  operationsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  metric: {
    width: "31%",
    backgroundColor: BRAND.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BRAND.border,
    padding: 15,
    alignItems: "center",
  },

  metricValue: {
    color: BRAND.emeraldDark,
    fontSize: 25,
    fontWeight: "900",
  },

  metricLabel: {
    color: BRAND.muted,
    fontSize: 10,
    marginTop: 3,
  },

  operationsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  operationsId: {
    color: BRAND.muted,
    fontSize: 10,
    fontWeight: "700",
  },

  operationsTitle: {
    color: BRAND.text,
    fontSize: 16,
    fontWeight: "900",
    marginTop: 10,
    marginBottom: 4,
  },

  assignedText: {
    color: BRAND.emeraldDark,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 8,
  },

  smallLink: {
    alignSelf: "flex-end",
    marginTop: 8,
  },

  smallLinkText: {
    color: BRAND.emeraldDark,
    fontSize: 12,
    fontWeight: "800",
  },

  // ------------------------------------------------------
  // EMPTY
  // ------------------------------------------------------

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 35,
  },

  emptyIcon: {
    fontSize: 42,
    marginBottom: 12,
  },

  emptyTitle: {
    color: BRAND.text,
    fontSize: 17,
    fontWeight: "800",
    textAlign: "center",
  },

  emptyDescription: {
    color: BRAND.muted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 5,
    maxWidth: 280,
  },

  // ------------------------------------------------------
  // BOTTOM NAV
  // ------------------------------------------------------

  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 72,
    backgroundColor: BRAND.white,
    borderTopWidth: 1,
    borderTopColor: BRAND.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingBottom: Platform.OS === "ios" ? 8 : 0,
  },

  navItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },

  navIcon: {
    color: "#80919D",
    fontSize: 20,
    marginBottom: 3,
  },

  navLabel: {
    color: "#80919D",
    fontSize: 9,
    fontWeight: "700",
  },

  navActive: {
    color: BRAND.emerald,
  },
});