import { createFileRoute } from '@tanstack/react-router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons'
import { StackPage } from '../../../components/layout/StackPage'
import { useRecipes } from '../../../hooks/queries/useRecipes'
import { useAllStockUnits } from '../../../hooks/queries/useStockUnits'
import { getRecipeAvailability } from '../../../utils/recipeAvailability'
import { LoadingSpinner } from '../../../components/layout/LoadingSpinner'
import { EmptyState } from '../../../components/EmptyState'
import { StatusBanner } from '../../../components/StatusBanner'
import { LabeledSection } from '../../../components/LabeledSection'
import { RecipeTypeBadge } from '../../../components/RecipeTypeBadge'

export const Route = createFileRoute('/preparation/recipes/$recipeId')({
    component: RouteComponent,
})

function RouteComponent() {
    const { recipeId } = Route.useParams()
    const { data: recipes = [], isLoading: recipesLoading } = useRecipes()
    const { data: allUnits = [], isLoading: unitsLoading } = useAllStockUnits()

    const recipe = recipes.find(r => r.id === recipeId)
    const availability = recipe ? getRecipeAvailability(recipe, allUnits) : null

    if (recipesLoading || unitsLoading) {
        return <LoadingSpinner />
    }

    if (!recipe) {
        return (
            <StackPage title="Recette non trouvée">
                <EmptyState message="Recette introuvable" />
            </StackPage>
        )
    }

    return (
        <StackPage title={recipe.name}>
            <div className="space-y-4">
                <div>
                    <div className="flex gap-2 items-center mb-2">
                        <RecipeTypeBadge type={recipe.type} />
                        {availability && (
                            <span className="text-sm font-medium text-bark">
                                {availability.availableProductIds.length}/{recipe.products.length} ingrédients
                            </span>
                        )}
                    </div>

                    {availability && !availability.isFullyAvailable && (
                        <StatusBanner variant="warning">
                            {availability.missingProductIds.length} ingrédient
                            {availability.missingProductIds.length > 1 ? 's' : ''} manquant
                            {availability.missingProductIds.length > 1 ? 's' : ''}
                        </StatusBanner>
                    )}

                    {availability?.isFullyAvailable && (
                        <StatusBanner variant="success">
                            ✓ Recette complète, tous les ingrédients sont disponibles
                        </StatusBanner>
                    )}
                </div>

                {recipe.freeText && (
                    <LabeledSection title="Préparation">
                        <p className="text-sm text-stone-600 whitespace-pre-wrap">{recipe.freeText}</p>
                    </LabeledSection>
                )}

                <LabeledSection title="Ingrédients">
                    <div className="space-y-2">
                        {recipe.products.map(product => {
                            const available = availability && availability.availableProductIds.includes(product.id)
                            return (
                                <div
                                    key={product.id}
                                    className={`p-3 rounded-lg border ${
                                        available
                                            ? 'bg-sage-light/30 border-sage/30'
                                            : 'bg-orange-50 border-orange-200'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <FontAwesomeIcon
                                            icon={available ? faCheck : faTimes}
                                            className={`text-sm ${available ? 'text-sage' : 'text-orange-600'}`}
                                        />
                                        <span className={`text-sm ${available ? 'text-bark' : 'text-orange-900'}`}>
                                            {product.name}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </LabeledSection>
            </div>
        </StackPage>
    )
}
