export type ExpiryStatus = "expired" | "soon" | "ok";

export function getExpiryStatus(
  date: Date | null | undefined,
): ExpiryStatus | null {
  if (!date) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dlcDate = new Date(date);
  dlcDate.setHours(0, 0, 0, 0);

  const diffMs = dlcDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "expired";
  if (diffDays <= 2) return "soon";
  return "ok";
}

export const expiryBadgeClass: Record<ExpiryStatus, string> = {
  expired: "bg-red-100 text-red-600 border border-red-200",
  soon: "bg-orange-100 text-orange-600 border border-orange-200",
  ok: "",
};

export const expiryLabel: Record<ExpiryStatus, string> = {
  expired: "Périmé",
  soon: "Bientôt périmé",
  ok: "",
};
