import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { StackPage } from "../../components/layout/StackPage";
import { LoadingSpinner } from "../../components/layout/LoadingSpinner";
import { Scanner } from "../../components/Scanner";
import { SearchOrCreate } from "../../components/SearchOrCreate";
import { Toast } from "../../components/Toast";
import { StockUnitCard } from "../../components/stock/StockUnitCard";
import { StockGroupCard } from "../../components/stock/StockGroupCard";
import { OpenModal } from "../../components/stock/OpenModal";
import { TransferModal } from "../../components/stock/TransferModal";
import { StockUnitEditModal } from "../../components/stock/StockUnitEditModal";
import { productService } from "../../services";
import { useLocation, useLocations } from "../../hooks/queries/useLocations";
import { useStockUnits, useStockUnitMutations } from "../../hooks/queries/useStockUnits";
import { useSettings } from "../../hooks/useSettings";
import { useToast } from "../../hooks/useToast";
import { groupUnits } from "../../utils/stockGrouping";
import type { StockUnitDetail } from "../../models/StockUnitModel";

export const Route = createFileRoute("/stock/$locationId")({
  component: RouteComponent,
});

interface ProductOption {
  id: string;
  name: string;
}

function RouteComponent() {
  const { locationId } = Route.useParams();
  const { settings } = useSettings();

  const { data: location } = useLocation(locationId);
  const { data: allLocations = [] } = useLocations();
  const { data: stockUnits = [], isLoading, isError } = useStockUnits(locationId);
  const { consume, open, move, update } = useStockUnitMutations(locationId);

  const [scannerOpen, setScannerOpen] = useState(settings.cameraEnabled);
  const [selectedProduct, setSelectedProduct] = useState<ProductOption | undefined>();
  const { toast, showToast } = useToast();
  const [openModalUnit, setOpenModalUnit] = useState<StockUnitDetail | null>(null);
  const [transferModalUnit, setTransferModalUnit] = useState<StockUnitDetail | null>(null);
  const [editModalUnit, setEditModalUnit] = useState<StockUnitDetail | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const productOptions: ProductOption[] = [
    ...new Map(
      stockUnits.map((u) => [u.productId, { id: u.productId, name: u.product.name }]),
    ).values(),
  ];

  const displayedUnits = selectedProduct
    ? stockUnits.filter((u) => u.productId === selectedProduct.id)
    : stockUnits;

  const groups = useMemo(() => groupUnits(displayedUnits), [displayedUnits]);

  const effectiveExpanded = useMemo(() => {
    if (groups.length === 1 && groups[0].units.length > 1) {
      return new Set([groups[0].key]);
    }
    return expandedGroups;
  }, [groups, expandedGroups]);

  function toggleGroup(key: string) {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function handleScan(barcode: string) {
    setScannerOpen(false);
    const product = await productService.getByBarcode(barcode);
    if (product) {
      setSelectedProduct({ id: product.id, name: product.name });
    } else {
      showToast("Produit non trouvé pour ce code-barres");
    }
  }

  async function handleOpen(_newExpirationDate: Date | null, newLocationId: string | null) {
    const unit = openModalUnit!;
    await open.mutateAsync(unit.id);
    if (newLocationId) {
      await move.mutateAsync({ id: unit.id, targetLocationId: newLocationId });
    }
    setOpenModalUnit(null);
  }

  async function handleTransfer(destinationLocationId: string) {
    const unit = transferModalUnit ?? editModalUnit;
    if (!unit) return;
    await move.mutateAsync({ id: unit.id, targetLocationId: destinationLocationId });
    setTransferModalUnit(null);
  }

  const unitCardHandlers = {
    onEdit: setEditModalUnit,
    onOpen: setOpenModalUnit,
    onTransfer: setTransferModalUnit,
    onConsume: (id: string) => consume.mutate(id),
  };

  return (
    <StackPage title={location?.name ?? "..."}>
      {scannerOpen && (
        <Scanner onScan={handleScan} onClose={() => setScannerOpen(false)} />
      )}

      <Toast message={toast} />

      <div className="mb-4">
        <SearchOrCreate
          items={productOptions}
          displayKey="name"
          searchKeys={["name"]}
          value={selectedProduct}
          onSelect={setSelectedProduct}
          onClear={() => setSelectedProduct(undefined)}
          onScanRequest={settings.cameraEnabled ? () => setScannerOpen(true) : undefined}
          onScan={handleScan}
          autoFocus={!settings.cameraEnabled}
          placeholder="Rechercher un article..."
        />
      </div>

      {isLoading && <LoadingSpinner />}
      {isError && (
        <p className="text-center text-stone-400 py-8">Erreur de chargement</p>
      )}

      <div className="flex flex-col gap-3">
        {groups.map((group) =>
          group.units.length === 1 ? (
            <StockUnitCard key={group.key} unit={group.units[0]} {...unitCardHandlers} />
          ) : (
            <StockGroupCard
              key={group.key}
              group={group}
              expanded={effectiveExpanded.has(group.key)}
              onToggle={() => toggleGroup(group.key)}
              {...unitCardHandlers}
            />
          ),
        )}
        {!isLoading && groups.length === 0 && (
          <p className="text-center text-stone-400 py-8">Aucun article</p>
        )}
      </div>

      {openModalUnit && (
        <OpenModal
          stockUnit={openModalUnit}
          locations={allLocations}
          onConfirm={handleOpen}
          onClose={() => setOpenModalUnit(null)}
        />
      )}
      {transferModalUnit && (
        <TransferModal
          stockUnit={transferModalUnit}
          locations={allLocations}
          onConfirm={handleTransfer}
          onClose={() => setTransferModalUnit(null)}
        />
      )}
      {editModalUnit && (
        <StockUnitEditModal
          stockUnit={editModalUnit}
          locations={allLocations}
          onSave={async (expirationDate, freeText) => {
            await update.mutateAsync({ id: editModalUnit.id, data: { expirationDate, freeText } });
          }}
          onOpen={(unit) => { setEditModalUnit(null); setOpenModalUnit(unit); }}
          onConsume={(unit) => { consume.mutate(unit.id); }}
          onTransfer={async (destinationLocationId) => {
            await move.mutateAsync({ id: editModalUnit.id, targetLocationId: destinationLocationId });
          }}
          onClose={() => setEditModalUnit(null)}
        />
      )}
    </StackPage>
  );
}
