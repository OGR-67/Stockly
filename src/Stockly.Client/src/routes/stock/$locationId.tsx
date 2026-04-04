import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUtensils,
  faBoxOpen,
  faArrowRightArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { StackPage } from "../../components/layout/StackPage";
import { Scanner } from "../../components/Scanner";
import { SearchOrCreate } from "../../components/SearchOrCreate";
import { OpenModal } from "../../components/stock/OpenModal";
import { TransferModal } from "../../components/stock/TransferModal";
import {
  locationService,
  stockUnitService,
  productService,
} from "../../services";
import type { StorageLocation } from "../../models/StorageLocationModel";
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

  const [location, setLocation] = useState<StorageLocation | null>(null);
  const [allLocations, setAllLocations] = useState<StorageLocation[]>([]);
  const [stockUnits, setStockUnits] = useState<StockUnitDetail[]>([]);

  const [scannerOpen, setScannerOpen] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<
    ProductOption | undefined
  >();
  const [toast, setToast] = useState<string | null>(null);

  const [openModalUnit, setOpenModalUnit] = useState<StockUnitDetail | null>(
    null,
  );
  const [transferModalUnit, setTransferModalUnit] =
    useState<StockUnitDetail | null>(null);

  useEffect(() => {
    Promise.all([
      locationService.getById(locationId),
      locationService.getAll(),
      stockUnitService.getByLocation(locationId),
    ]).then(([loc, allLocs, units]) => {
      setLocation(loc);
      setAllLocations(allLocs);
      setStockUnits(units);
    });
  }, [locationId]);

  const productOptions: ProductOption[] = [
    ...new Map(
      stockUnits.map((u) => [
        u.productId,
        { id: u.productId, name: u.product.name },
      ]),
    ).values(),
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

  async function handleConsume(id: string) {
    await stockUnitService.consume(id);
    setStockUnits((prev) => prev.filter((u) => u.id !== id));
  }

  async function handleOpen(
    newExpirationDate: Date | null,
    newLocationId: string | null,
  ) {
    const unit = openModalUnit!;
    await stockUnitService.open(unit.id);
    if (newLocationId) {
      await stockUnitService.move(unit.id, newLocationId);
      setStockUnits((prev) => prev.filter((u) => u.id !== unit.id));
    } else {
      setStockUnits((prev) =>
        prev.map((u) =>
          u.id === unit.id
            ? {
                ...u,
                isOpened: true,
                openedAt: new Date(),
                expirationDate: newExpirationDate,
              }
            : u,
        ),
      );
    }
    setOpenModalUnit(null);
  }

  async function handleTransfer(destinationLocationId: string) {
    const unit = transferModalUnit!;
    await stockUnitService.move(unit.id, destinationLocationId);
    setStockUnits((prev) => prev.filter((u) => u.id !== unit.id));
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
          onScanRequest={() => setScannerOpen(true)}
          onScan={handleScan}
          onCreate={() => {
            /* TODO: ouvrir modale ajout article */
          }}
          placeholder="Rechercher un article..."
        />
      </div>

      <div className="flex flex-col gap-3">
        {displayedUnits.map((unit) => (
          <div
            key={unit.id}
            className="flex items-center gap-3 p-3 bg-cream rounded-xl shadow-sm border border-sage/30"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-bark truncate">
                {unit.product.name}
              </p>
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
                onClick={() => handleConsume(unit.id)}
                className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center"
                title="Consommer"
              >
                <FontAwesomeIcon
                  icon={faUtensils}
                  className="text-stone-600 text-sm"
                />
              </button>
              {!unit.isOpened && unit.product.category.defaultOpenedDays !== null && (
                <button
                  onClick={() => setOpenModalUnit(unit)}
                  className="w-9 h-9 rounded-full bg-sage-light flex items-center justify-center"
                  title="Ouvrir"
                >
                  <FontAwesomeIcon
                    icon={faBoxOpen}
                    className="text-earth text-sm"
                  />
                </button>
              )}
              <button
                onClick={() => setTransferModalUnit(unit)}
                className="w-9 h-9 rounded-full bg-sage-light flex items-center justify-center"
                title="Transférer"
              >
                <FontAwesomeIcon
                  icon={faArrowRightArrowLeft}
                  className="text-earth text-sm"
                />
              </button>
            </div>
          </div>
        ))}
        {displayedUnits.length === 0 && (
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
