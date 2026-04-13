import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { haptic } from "ios-haptics";
import { LocationSelectorPage } from "../../components/layout/LocationSelectorPage";

export const Route = createFileRoute("/store/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  return (
    <LocationSelectorPage
      title="Ranger"
      onSelect={(locationId) => {
        haptic.confirm();
        navigate({ to: "/store/$locationId", params: { locationId } });
      }}
    />
  );
}
