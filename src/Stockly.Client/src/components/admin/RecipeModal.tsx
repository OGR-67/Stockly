import { useState, useEffect } from "react";
import { Modal } from "../Modal";
import { FormField } from "../FormField";
import { FieldWrapper } from "../FieldWrapper";
import { ConfirmButton } from "../ConfirmButton";
import { RecipeProductManager } from "./RecipeProductManager";
import { useProducts } from "../../hooks/queries/useProducts";
import type { Recipe } from "../../models/RecipeModel";
import type { Product } from "../../models/ProductModel";

interface RecipeModalProps {
  initial?: Recipe;
  onConfirm: (data: {
    name: string;
    type: "main" | "dessert";
    freeText?: string;
    productIds: string[];
  }) => void;
  onClose: () => void;
}

export function RecipeModal({ initial, onConfirm, onClose }: RecipeModalProps) {
  const { data: allProducts = [] } = useProducts();

  const [name, setName] = useState("");
  const [type, setType] = useState<"main" | "dessert">("main");
  const [freeText, setFreeText] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initial) {
      setName(initial.name);
      setType(initial.type);
      setFreeText(initial.freeText ?? "");
      setProducts(initial.products);
    } else {
      setName("");
      setType("main");
      setFreeText("");
      setProducts([]);
    }
  }, [initial]);

  const handleAddProduct = (product: Product) => {
    setProducts([...products, product]);
  };

  const handleRemoveProduct = (productId: string) => {
    setProducts(products.filter((p) => p.id !== productId));
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setIsLoading(true);
    try {
      await onConfirm({
        name: name.trim(),
        type,
        freeText: freeText.trim() || undefined,
        productIds: products.map((p) => p.id),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      title={initial ? `Modifier ${initial.name}` : "Nouvelle recette"}
      onClose={onClose}
    >
      <div className="space-y-4">
        <FormField
          label="Nom"
          value={name}
          onChange={setName}
          placeholder="Nom de la recette"
        />

        <FieldWrapper label="Type">
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={type === "main"}
                onChange={() => setType("main")}
                className="cursor-pointer"
              />
              <span className="text-sm">Plat</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={type === "dessert"}
                onChange={() => setType("dessert")}
                className="cursor-pointer"
              />
              <span className="text-sm">Dessert</span>
            </label>
          </div>
        </FieldWrapper>

        <FieldWrapper label="Préparation (optionnel)">
          <textarea
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            placeholder="Détails de préparation..."
            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none font-sans min-h-24"
          />
        </FieldWrapper>

        <RecipeProductManager
          products={products}
          allProducts={allProducts}
          onAddProduct={handleAddProduct}
          onRemoveProduct={handleRemoveProduct}
        />

        <ConfirmButton
          onClick={handleSave}
          disabled={!name.trim() || isLoading}
          label={initial ? "Modifier" : "Créer"}
        />
      </div>
    </Modal>
  );
}
