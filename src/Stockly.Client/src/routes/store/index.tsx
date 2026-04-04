import { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import Fuse from "fuse.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { RootPage } from "../../components/layout/RootPage";
import { locationService } from "../../services";
import { locationIcon } from "../../utils/locationIcons";
import type { StorageLocation } from "../../models/StorageLocationModel";

export const Route = createFileRoute("/store/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState<StorageLocation[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    locationService.getAll().then(setLocations);
  }, []);

  const fuse = new Fuse(locations, { keys: ["name"], threshold: 0.3 });
  const filtered = query ? fuse.search(query).map((r) => r.item) : locations;

  return (
    <RootPage title="Ranger">
      <div className="mb-4">
        <div className="flex items-center border border-stone-300 rounded-lg px-3 py-2 gap-2 bg-cream">
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="text-stone-400"
          />
          <input
            className="flex-1 outline-none text-sm bg-transparent"
            placeholder="Rechercher un emplacement..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

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
