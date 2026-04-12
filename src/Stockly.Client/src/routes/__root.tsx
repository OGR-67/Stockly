import { useState } from "react";
import { useWindowEvent } from "../hooks/useWindowEvent";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import {
  faWarehouse,
  faCartShopping,
  faUtensils,
  faGear,
  faCode,
} from "@fortawesome/free-solid-svg-icons";
import { LoginModal } from "../components/LoginModal";
import { NavLink } from "../components/NavLink";
import { ErrorToast } from "../components/ErrorToast";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const [showLogin, setShowLogin] = useState(false);
  useWindowEvent('auth-required', () => setShowLogin(true));

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
        <NavLink to="/preparation" icon={faUtensils} label="Préparation" />
        <NavLink to="/admin" icon={faGear} label="Admin" />
        {import.meta.env.DEV && <NavLink to="/dev" icon={faCode} label="Dev" />}
      </nav>
    </div>
  );
}
