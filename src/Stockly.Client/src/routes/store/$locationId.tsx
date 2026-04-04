import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { StackPage } from "../../components/layout/StackPage";
import { Scanner } from "../../components/Scanner";
import { SearchOrCreate } from "../../components/SearchOrCreate";
import { AddStockModal } from "../../components/store/AddStockModal";
import { locationService, productService, stockUnitService } from "../../services";
import type { StorageLocation } from "../../models/StorageLocationModel";
import type { ProductDetail } from "../../models/ProductModel";

export const Route = createFileRoute("/store/$locationId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { locationId } = Route.useParams();

  const [location, setLocation] = useState<StorageLocation | null>(null);
  const [allProducts, setAllProducts] = useState<ProductDetail[]>([]);
  const [scannerOpen, setScannerOpen] = useState(true);
  const [pendingBarcode, setPendingBarcode] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductDetail | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      locationService.getById(locationId),
      productService.getAll(),
    ]).then(([loc, products]) => {
      setLocation(loc);
      setAllProducts(products);
    });
  }, [locationId]);

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }

  function cancelAndRescan() {
    setPendingBarcode(null);
    setSelectedProduct(null);
    setScannerOpen(true);
  }

  async function handleScan(barcode: string) {
    setScannerOpen(false);
    const product = await productService.getByBarcode(barcode);
    if (product) {
      setSelectedProduct(product);
    } else {
      setPendingBarcode(barcode);
    }
  }

  async function handleProductSelect(product: ProductDetail) {
    if (pendingBarcode) {
      await productService.addBarcode(product.id, pendingBarcode);
      setPendingBarcode(null);
    }
    setSelectedProduct(product);
  }

  async function handleConfirm(expirationDate: Date | null) {
    await stockUnitService.add({
      productId: selectedProduct!.id,
      locationId,
      expirationDate,
    });
    setSelectedProduct(null);
    setPendingBarcode(null);
    setScannerOpen(true);
  }

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

      {!scannerOpen && !selectedProduct && (
        <div className="flex flex-col gap-4">
          {pendingBarcode && (
            <div className="p-3 bg-earth/10 rounded-xl text-sm text-earth">
              Code-barres non trouvé : <span className="font-mono font-medium">{pendingBarcode}</span>
            </div>
          )}
          <SearchOrCreate
            items={allProducts}
            displayKey="name"
            searchKeys={["name"]}
            onSelect={handleProductSelect}
            onClear={() => {}}
            onCreate={() => showToast("Création de produit à venir")}
            onScanRequest={() => setScannerOpen(true)}
            onScan={handleScan}
            placeholder="Rechercher un article..."
          />
          {pendingBarcode && (
            <button
              onClick={cancelAndRescan}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-lg border border-stone-300 text-stone-500"
            >
              <FontAwesomeIcon icon={faXmark} />
              Annuler
            </button>
          )}
        </div>
      )}

      {selectedProduct && location && (
        <AddStockModal
          product={selectedProduct}
          location={location}
          onConfirm={handleConfirm}
          onClose={cancelAndRescan}
        />
      )}
    </StackPage>
  );
}
