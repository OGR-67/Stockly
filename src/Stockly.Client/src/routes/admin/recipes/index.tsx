import { createFileRoute } from "@tanstack/react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { haptic } from "ios-haptics";
import { StackPage } from "../../../components/layout/StackPage";
import { LoadingSpinner } from "../../../components/layout/LoadingSpinner";
import { SearchInput } from "../../../components/SearchInput";
import { Card } from "../../../components/Card";
import { IconButton } from "../../../components/IconButton";
import { RecipeModal } from "../../../components/admin/RecipeModal";
import { EmptyState } from "../../../components/EmptyState";
import { RecipeTypeBadge } from "../../../components/RecipeTypeBadge";
import {
  useRecipes,
  useRecipeMutations,
} from "../../../hooks/queries/useRecipes";
import { useCrudList } from "../../../hooks/useCrudList";

export const Route = createFileRoute("/admin/recipes/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: recipes = [], isLoading, isError } = useRecipes();
  const { create, update, remove } = useRecipeMutations();
  const { editTarget, setEditTarget, query, setQuery, filtered } = useCrudList(
    recipes,
    ["name"],
  );

  async function handleSave(data: {
    name: string;
    type: "main" | "dessert";
    freeText?: string;
    productIds: string[];
  }) {
    if (editTarget === "new") {
      await create.mutateAsync(data);
    } else {
      await update.mutateAsync({ id: editTarget!.id, ...data });
    }
    haptic.confirm();
    setEditTarget(null);
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Supprimer cette recette ?")) return;
    await remove.mutateAsync(id);
  }

  return (
    <StackPage
      title="Recettes"
      action={
        <button
          onClick={() => setEditTarget("new")}
          className="text-white/80 hover:text-white"
        >
          <FontAwesomeIcon icon={faPlus} />
        </button>
      }
    >
      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="Rechercher une recette..."
        className="mb-4"
      />

      {isLoading && <LoadingSpinner />}
      {isError && <EmptyState message="Erreur de chargement" error />}

      <div className="flex flex-col gap-3">
        {filtered.map((recipe) => (
          <Card key={recipe.id}>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-bark truncate">{recipe.name}</p>
              <div className="flex gap-2 mt-1 items-center">
                <RecipeTypeBadge type={recipe.type} />
                <span className="text-xs text-stone-400">
                  {recipe.products.length} article
                  {recipe.products.length > 1 ? "s" : ""}
                </span>
              </div>
              {recipe.freeText && (
                <p className="text-xs text-stone-400 mt-1 truncate">
                  {recipe.freeText}
                </p>
              )}
            </div>
            <IconButton
              icon={faPencil}
              onClick={() => setEditTarget(recipe)}
              title="Modifier"
            />
            <IconButton
              icon={faTrash}
              onClick={() => handleDelete(recipe.id)}
              title="Supprimer"
            />
          </Card>
        ))}
        {!isLoading && filtered.length === 0 && (
          <EmptyState message="Aucune recette" />
        )}
      </div>

      {editTarget && (
        <RecipeModal
          initial={editTarget === "new" ? undefined : editTarget}
          onConfirm={handleSave}
          onClose={() => setEditTarget(null)}
        />
      )}
    </StackPage>
  );
}
