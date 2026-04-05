import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import Fuse from "fuse.js";
import { RootPage } from "../../components/layout/RootPage";
import { LoadingSpinner } from "../../components/layout/LoadingSpinner";
import { SearchInput } from "../../components/SearchInput";
import { locationIcon } from "../../utils/locationIcons";
import { useLocations } from "../../hooks/queries/useLocations";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const Route = createFileRoute("/store/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { data: locations = [], isLoading, isError } = useLocations();
  const [query, setQuery] = useState("");

  const fuse = new Fuse(locations, { keys: ["name"], threshold: 0.3 });
  const filtered = query ? fuse.search(query).map((r) => r.item) : locations;

  return (
    <RootPage title="Ranger">
      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="Rechercher un emplacement..."
        className="mb-4"
      />

      {isLoading && <LoadingSpinner />}
      {isError && (
        <p className="text-center text-stone-400 py-8">Erreur de chargement</p>
      )}

      <div className="flex flex-col gap-3">
        {filtered.map((location) => (
          <button
            key={location.id}
            onClick={() =>
              navigate({
                to: "/store/$locationId",
                params: { locationId: location.id },
              })
            }
            className="flex items-center gap-4 p-4 bg-cream rounded-xl shadow-sm border border-sage/30 active:bg-sage-light/50 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-full bg-sage-light flex items-center justify-center">
              <FontAwesomeIcon
                icon={locationIcon(location.type)}
                className="text-earth"
              />
            </div>
            <span className="text-base font-medium text-bark">
              {location.name}
            </span>
          </button>
        ))}
      </div>
    </RootPage>
  );
}
