import { HashRouter, Routes, Route } from "react-router-dom";
import { AppShell } from "./components/root/AppShell";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import Vault from "./pages/Vault";
import Settings from "./pages/Settings";
import { ThemeContext, useTheme } from "./lib/theme";

export default function App() {
  const themeValue = useTheme();

  return (
<<<<<<< HEAD
    <ThemeContext.Provider value={themeValue}>
      <HashRouter>
        <AppShell>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/vault" element={<Vault />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </AppShell>
      </HashRouter>
    </ThemeContext.Provider>
=======
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
>>>>>>> worktree-agent-a9c83221533c153e6
  );
}
