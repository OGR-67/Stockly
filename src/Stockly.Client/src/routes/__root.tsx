import { useState, useEffect } from "react";
import {
  Outlet,
  createRootRoute,
  Link,
  useLocation,
} from "@tanstack/react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWarehouse,
  faCartShopping,
  faGear,
  faCode,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { LoginModal } from "../components/LoginModal";

export const Route = createRootRoute({
  component: RootComponent,
});

function NavLink({
  to,
  icon,
  label,
}: {
  to: string;
  icon: IconDefinition;
  label: string;
}) {
  const { pathname } = useLocation();
  const isActive = pathname.startsWith(to);
  return (
    <Link
      to={to}
      className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors ${isActive ? "text-earth font-semibold" : "text-sage font-normal"}`}
    >
      <FontAwesomeIcon icon={icon} className="text-lg" />
      <span>{label}</span>
    </Link>
  );
}

function ErrorToast() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    function handler(e: Event) {
      const msg = (e as CustomEvent<string>).detail;
      setMessage(msg);
      setTimeout(() => setMessage(null), 4000);
    }
    window.addEventListener("api-error", handler);
    return () => window.removeEventListener("api-error", handler);
  }, []);

  if (!message) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-60 flex items-center gap-3 bg-red-600 text-white text-sm py-3 px-4 rounded-xl shadow-lg">
      <FontAwesomeIcon icon={faTriangleExclamation} className="shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function RootComponent() {
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    function handler() {
      setShowLogin(true);
    }
    window.addEventListener("auth-required", handler);
    return () => window.removeEventListener("auth-required", handler);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-sage-light/40">
      {showLogin && <LoginModal onSuccess={() => setShowLogin(false)} />}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <ErrorToast />
      <nav className="flex border-t border-sage bg-sage-light/50">
        <NavLink to="/stock" icon={faWarehouse} label="Stock" />
        <NavLink to="/store" icon={faCartShopping} label="Ranger" />
        <NavLink to="/admin" icon={faGear} label="Admin" />
        {import.meta.env.DEV && <NavLink to="/dev" icon={faCode} label="Dev" />}
      </nav>
    </div>
  );
}
