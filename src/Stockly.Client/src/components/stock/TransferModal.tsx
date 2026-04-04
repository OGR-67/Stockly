import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { Modal } from "../Modal";
import { locationIcon } from "../../utils/locationIcons";
import type { StockUnitDetail } from "../../models/StockUnitModel";
import type { StorageLocation } from "../../models/StorageLocationModel";

interface TransferModalProps {
  stockUnit: StockUnitDetail;
  locations: StorageLocation[];
  onConfirm: (destinationLocationId: string) => void;
  onClose: () => void;
}

export function TransferModal({
  stockUnit,
  locations,
  onConfirm,
  onClose,
}: TransferModalProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const destinations = locations.filter((l) => l.id !== stockUnit.locationId);

  return (
    <Modal title="Transférer" onClose={onClose}>
      <p className="font-medium text-bark">{stockUnit.product.name}</p>

      <div className="mt-3 flex items-center gap-2 text-sm text-stone-500">
        <FontAwesomeIcon icon={locationIcon(stockUnit.location.type)} />
        <span>Depuis : {stockUnit.location.name}</span>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <p className="text-sm font-medium text-bark">Nouvel emplacement</p>
        {destinations.map((loc) => (
          <button
            key={loc.id}
            onClick={() => setSelectedId(loc.id)}
            className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
              selectedId === loc.id
                ? "border-earth bg-sage-light/30"
                : "border-stone-200"
            }`}
          >
            <FontAwesomeIcon
              icon={locationIcon(loc.type)}
              className="text-earth"
            />
            <span className="text-sm text-bark">{loc.name}</span>
          </button>
        ))}
      </div>

      <button
        onClick={() => selectedId && onConfirm(selectedId)}
        disabled={!selectedId}
        className={`mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-lg font-medium ${
          selectedId
            ? "bg-earth text-white"
            : "bg-stone-200 text-stone-400 cursor-not-allowed"
        }`}
      >
        <FontAwesomeIcon icon={faCheck} />
        Confirmer
      </button>
    </Modal>
  );
}
