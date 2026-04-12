import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { Card } from "../Card";
import { IconButton } from "../IconButton";
import { SearchOrCreate } from "../SearchOrCreate";
import type { Product } from "../../models/ProductModel";

interface RecipeProductManagerProps {
  products: Product[];
  allProducts: Product[];
  onAddProduct: (product: Product) => void;
  onRemoveProduct: (productId: string) => void;
}

export function RecipeProductManager({
  products,
  allProducts,
  onAddProduct,
  onRemoveProduct,
}: RecipeProductManagerProps) {
  const availableProducts = allProducts.filter(
    (p) => !products.find((selected) => selected.id === p.id),
  );

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-bark mb-2">
          Articles
        </label>
        <SearchOrCreate
          items={availableProducts}
          displayKey="name"
          searchKeys={["name"]}
          value={undefined}
          onSelect={onAddProduct}
          onClear={() => {}}
          placeholder="Ajouter un article..."
        />
      </div>

      {products.length > 0 && (
        <div className="space-y-2">
          {products.map((product) => (
            <Card key={product.id}>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-bark">{product.name}</p>
              </div>
              <IconButton
                icon={faTrash}
                onClick={() => onRemoveProduct(product.id)}
                title="Supprimer"
              />
            </Card>
          ))}
        </div>
      )}

      {products.length === 0 && (
        <p className="text-sm text-stone-400 text-center py-4">
          Aucun article ajouté
        </p>
      )}
    </div>
  );
}
