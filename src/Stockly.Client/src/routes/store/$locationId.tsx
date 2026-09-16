import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { haptic } from "ios-haptics";
import { StackPage } from "../../components/layout/StackPage";
import { LoadingSpinner } from "../../components/layout/LoadingSpinner";
import { Scanner } from "../../components/Scanner";
import { SearchOrCreate } from "../../components/SearchOrCreate";
import { Toast } from "../../components/Toast";
import { AddStockModal } from "../../components/store/AddStockModal";
import { ProductModal } from "../../components/admin/ProductModal";
import { productService, categoryService } from "../../services";
import { useLocation } from "../../hooks/queries/useLocations";
import { useProducts, useProductMutations } from "../../hooks/queries/useProducts";
import { useCategories } from "../../hooks/queries/useCategories";
import { useStockUnitMutations } from "../../hooks/queries/useStockUnits";
import { useSettings } from "../../hooks/useSettings";
import { useToast } from "../../hooks/useToast";
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
  const { toast, showToast } = useToast(2500);

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
    haptic.confirm();
    // Fetch the full product detail from the updated cache via refetch
    const existing = allProducts.find(p => p.id === created.id);
    // La catégorie peut avoir été créée à la volée dans la modale et ne pas
    // encore être dans le cache local : on va la chercher au besoin.
    const category = categories.find(c => c.id === data.categoryId)
      ?? await categoryService.getById(data.categoryId);
    if (!category) {
      setShowProductModal(false);
      return;
    }
    const fresh = existing ?? {
      ...created,
      category,
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

  async function handleConfirm(expirationDate: Date | null, quantity: number, freeText: string | null) {
    if (!selectedProduct) return;
    const { id, name } = selectedProduct;
    for (let i = 0; i < quantity; i++) {
      await add.mutateAsync({ productId: id, locationId, expirationDate, freeText });
    }
    haptic.confirm();
    setSelectedProduct(null);
    setPendingBarcode(null);
    setScannerOpen(settings.cameraEnabled);
    showToast(`${quantity > 1 ? `${String(quantity)}× ` : ''}${name} rangé`);
  }

  return (
    <StackPage title={location?.name ?? "..."}>
      {scannerOpen && (
        <Scanner onScan={(barcode) => { void handleScan(barcode); }} onClose={() => { setScannerOpen(false); }} />
      )}

      <Toast message={toast} />

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
              onSelect={(product) => { void handleProductSelect(product); }}
              // eslint-disable-next-line @typescript-eslint/no-empty-function -- pas d'action à effectuer au clear, prop requise par SearchOrCreate
              onClear={() => {}}
              onCreate={() => { setShowProductModal(true); }}
              onScanRequest={settings.cameraEnabled ? () => { setScannerOpen(true); } : undefined}
              onScan={(barcode) => { void handleScan(barcode); }}
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
          onConfirm={(data) => { void handleCreateProduct(data); }}
          // eslint-disable-next-line @typescript-eslint/no-empty-function -- pas de gestion de code-barres dans ce flux, prop requise par ProductModal
          onAddBarcode={() => {}}
          // eslint-disable-next-line @typescript-eslint/no-empty-function -- pas de gestion de code-barres dans ce flux, prop requise par ProductModal
          onDeleteBarcode={() => {}}
          onClose={() => { setShowProductModal(false); }}
        />
      )}

      {selectedProduct && location && (
        <AddStockModal
          product={selectedProduct}
          location={location}
          onConfirm={(expirationDate, quantity, freeText) => { void handleConfirm(expirationDate, quantity, freeText); }}
          onClose={cancelAndRescan}
        />
      )}
    </StackPage>
  );
}
