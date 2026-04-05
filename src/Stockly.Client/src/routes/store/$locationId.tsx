import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { StackPage } from "../../components/layout/StackPage";
import { LoadingSpinner } from "../../components/layout/LoadingSpinner";
import { Scanner } from "../../components/Scanner";
import { SearchOrCreate } from "../../components/SearchOrCreate";
import { AddStockModal } from "../../components/store/AddStockModal";
import { ProductModal } from "../../components/admin/ProductModal";
import { productService } from "../../services";
import { useLocation } from "../../hooks/queries/useLocations";
import { useProducts, useProductMutations } from "../../hooks/queries/useProducts";
import { useCategories } from "../../hooks/queries/useCategories";
import { useStockUnitMutations } from "../../hooks/queries/useStockUnits";
import { useSettings } from "../../hooks/useSettings";
import type { ProductDetail } from "../../models/ProductModel";
import type { Product } from "../../models/ProductModel";

export const Route = createFileRoute("/store/$locationId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { locationId } = Route.useParams();
  const { settings } = useSettings();

  const { data: location } = useLocation(locationId);
  const { data: allProducts = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();
  const { create: createProduct } = useProductMutations();
  const { add } = useStockUnitMutations(locationId);

  const [scannerOpen, setScannerOpen] = useState(settings.cameraEnabled);
  const [pendingBarcode, setPendingBarcode] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductDetail | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [toast] = useState<string | null>(null);

  function cancelAndRescan() {
    setPendingBarcode(null);
    setSelectedProduct(null);
    setScannerOpen(settings.cameraEnabled);
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

  async function handleCreateProduct(data: Omit<Product, 'id'>) {
    const created = await createProduct.mutateAsync(data);
    // Fetch the full product detail from the updated cache via refetch
    const fresh = allProducts.find(p => p.id === created.id) ?? {
      ...created,
      category: categories.find(c => c.id === data.categoryId)!,
      barcodes: [],
    } as ProductDetail;
    if (pendingBarcode) {
      await productService.addBarcode(created.id, pendingBarcode);
      setPendingBarcode(null);
    }
    setSelectedProduct(fresh);
    setShowProductModal(false);
  }

  async function handleProductSelect(product: ProductDetail) {
    if (pendingBarcode) {
      await productService.addBarcode(product.id, pendingBarcode);
      setPendingBarcode(null);
    }
    setSelectedProduct(product);
  }

  async function handleConfirm(expirationDate: Date | null) {
    await add.mutateAsync({
      productId: selectedProduct!.id,
      locationId,
      expirationDate,
    });
    setSelectedProduct(null);
    setPendingBarcode(null);
    setScannerOpen(settings.cameraEnabled);
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
          {isLoading ? <LoadingSpinner /> : (
            <SearchOrCreate
              items={allProducts}
              displayKey="name"
              searchKeys={["name"]}
              onSelect={handleProductSelect}
              onClear={() => {}}
              onCreate={() => setShowProductModal(true)}
              onScanRequest={settings.cameraEnabled ? () => setScannerOpen(true) : undefined}
              onScan={handleScan}
              autoFocus={!settings.cameraEnabled}
              placeholder="Rechercher un article..."
            />
          )}
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

      {showProductModal && (
        <ProductModal
          categories={categories}
          onConfirm={handleCreateProduct}
          onAddBarcode={() => {}}
          onDeleteBarcode={() => {}}
          onClose={() => setShowProductModal(false)}
        />
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
