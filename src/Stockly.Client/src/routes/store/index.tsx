import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LocationSelectorPage } from "../../components/layout/LocationSelectorPage";

export const Route = createFileRoute("/store/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  return (
    <LocationSelectorPage
      title="Ranger"
      onSelect={(locationId) => navigate({ to: "/store/$locationId", params: { locationId } })}
    />
  );
}
