import { HashRouter, Routes, Route } from "react-router-dom";
import { AppShell } from "./components/root/AppShell";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import Vault from "./pages/Vault";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <HashRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/vault" element={<Vault />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </AppShell>
    </HashRouter>
  );
}
