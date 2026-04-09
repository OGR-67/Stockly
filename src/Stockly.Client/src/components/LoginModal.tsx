import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faKey } from "@fortawesome/free-solid-svg-icons";
import { ConfirmButton } from "./ConfirmButton";

interface LoginModalProps {
  onSuccess: () => void;
}

export function LoginModal({ onSuccess }: LoginModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!apiKey.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        setError(body.detail ?? "Clé API invalide.");
      } else {
        onSuccess();
      }
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-sage-light/80">
      <div className="bg-cream rounded-2xl p-8 mx-4 w-full max-w-sm shadow-xl flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-earth/10 flex items-center justify-center">
            <FontAwesomeIcon icon={faKey} className="text-earth text-xl" />
          </div>
          <h1 className="text-lg font-semibold text-bark">Connexion</h1>
          <p className="text-sm text-stone-500 text-center">
            Renseignez la clé API configurée sur votre serveur.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Clé API"
            autoFocus
            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none font-mono"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <ConfirmButton type="submit" disabled={!apiKey.trim()} loading={loading} label="Se connecter" />
        </form>
      </div>
    </div>
  );
}
