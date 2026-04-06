import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUtensils, faBoxOpen, faArrowRightArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { StackPage } from "../../components/layout/StackPage";
import { LoadingSpinner } from "../../components/layout/LoadingSpinner";
import { Scanner } from "../../components/Scanner";
import { SearchOrCreate } from "../../components/SearchOrCreate";
import { OpenModal } from "../../components/stock/OpenModal";
import { TransferModal } from "../../components/stock/TransferModal";
import { productService } from "../../services";
import { useLocation, useLocations } from "../../hooks/queries/useLocations";
import { useStockUnits, useStockUnitMutations } from "../../hooks/queries/useStockUnits";
import { useSettings } from "../../hooks/useSettings";
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
  const { consume, open, move } = useStockUnitMutations(locationId);

  const [scannerOpen, setScannerOpen] = useState(settings.cameraEnabled);
  const [selectedProduct, setSelectedProduct] = useState<ProductOption | undefined>();
  const [toast, setToast] = useState<string | null>(null);
  const [openModalUnit, setOpenModalUnit] = useState<StockUnitDetail | null>(null);
  const [transferModalUnit, setTransferModalUnit] = useState<StockUnitDetail | null>(null);

  const productOptions: ProductOption[] = [
    ...new Map(stockUnits.map((u) => [u.productId, { id: u.productId, name: u.product.name }])).values(),
  ];

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
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
    await move.mutateAsync({ id: transferModalUnit!.id, targetLocationId: destinationLocationId });
    setTransferModalUnit(null);
  }

  const displayedUnits = selectedProduct
    ? stockUnits.filter((u) => u.productId === selectedProduct.id)
    : stockUnits;

  return (
    <StackPage title={location?.name ?? "..."}>
      {scannerOpen && (
        <Scanner onScan={handleScan} onClose={() => setScannerOpen(false)} />
      )}

      {toast && (
        <div className="fixed bottom-20 left-4 right-4 z-40 bg-bark text-white text-sm text-center py-3 px-4 rounded-xl shadow-lg">
          {toast}
        </div>
      )}

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
      {isError && <p className="text-center text-stone-400 py-8">Erreur de chargement</p>}

      <div className="flex flex-col gap-3">
        {displayedUnits.map((unit) => (
          <div key={unit.id} className="flex items-center gap-3 p-3 bg-cream rounded-xl shadow-sm border border-sage/30">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-bark truncate">{unit.product.name}</p>
              <p className="text-xs text-stone-500">
                DLC :{" "}
                {unit.expirationDate
                  ? new Date(unit.expirationDate).toLocaleDateString("fr-FR")
                  : "—"}
              </p>
              {unit.isOpened && (
                <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-earth/10 text-earth font-medium">
                  Ouvert
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => consume.mutate(unit.id)}
                className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center"
                title="Consommer"
              >
                <FontAwesomeIcon icon={faUtensils} className="text-stone-600 text-sm" />
              </button>
              {!unit.isOpened && unit.product.category.defaultOpenedDays !== null && (
                <button
                  onClick={() => setOpenModalUnit(unit)}
                  className="w-9 h-9 rounded-full bg-sage-light flex items-center justify-center"
                  title="Ouvrir"
                >
                  <FontAwesomeIcon icon={faBoxOpen} className="text-earth text-sm" />
                </button>
              )}
              <button
                onClick={() => setTransferModalUnit(unit)}
                className="w-9 h-9 rounded-full bg-sage-light flex items-center justify-center"
                title="Transférer"
              >
                <FontAwesomeIcon icon={faArrowRightArrowLeft} className="text-earth text-sm" />
              </button>
            </div>
          </div>
        ))}
        {!isLoading && displayedUnits.length === 0 && (
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
    </StackPage>
  );
}
