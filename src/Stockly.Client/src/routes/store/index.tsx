import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera } from "@fortawesome/free-solid-svg-icons";
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
      topContent={
        <button
          onClick={() => {
            haptic.confirm();
            void navigate({ to: "/store/scan-receipt", search: { shared: undefined } });
          }}
          className="flex items-center justify-center gap-2 w-full py-3 mb-4 rounded-lg bg-earth text-white font-medium"
        >
          <FontAwesomeIcon icon={faCamera} />
          Scanner un ticket
        </button>
      }
    />
  );
}
