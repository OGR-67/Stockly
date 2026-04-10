interface ExpiryBadgesProps {
  expiredCount: number;
  soonCount: number;
  variant?: "inline" | "stacked";
}

export function ExpiryBadges({
  expiredCount,
  soonCount,
  variant = "inline",
}: ExpiryBadgesProps) {
  if (expiredCount === 0 && soonCount === 0) return null;

  const containerClass =
    variant === "stacked"
      ? "flex gap-2 flex-wrap"
      : "flex items-center gap-2 flex-wrap";

  return (
    <div className={containerClass}>
      {expiredCount > 0 && (
        <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-600 font-medium">
          {expiredCount} périmé{expiredCount > 1 ? "s" : ""}
        </span>
      )}
      {soonCount > 0 && (
        <span className="px-2 py-0.5 text-xs rounded-full bg-orange-100 text-orange-600 font-medium">
          {soonCount} bientôt
        </span>
      )}
    </div>
  );
}
