import React, { useState } from "react";
import MainApp from "./src/screens/MainApp";

export default function App() {
  const [profile] = useState({
    id: "demo-user-1",
    full_name: "Perfil Demo",
    email: "demo@juntos.com",
  });

  return <MainApp profile={profile} onSignOut={() => {}} />;
}
