import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LocationSelectorPage } from "../../components/layout/LocationSelectorPage";

export const Route = createFileRoute("/stock/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  return (
    <LocationSelectorPage
      title="Stock"
      onSelect={(locationId) => navigate({ to: "/stock/$locationId", params: { locationId } })}
    />
  );
}
