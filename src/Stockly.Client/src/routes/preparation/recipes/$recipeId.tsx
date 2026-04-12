import { createFileRoute } from '@tanstack/react-router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons'
import { StackPage } from '../../../components/layout/StackPage'
import { useRecipes } from '../../../hooks/queries/useRecipes'
import { useAllStockUnits } from '../../../hooks/queries/useStockUnits'
import { getRecipeAvailability } from '../../../utils/recipeAvailability'
import { LoadingSpinner } from '../../../components/layout/LoadingSpinner'

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
                <p className="text-center text-stone-400 py-8">Recette introuvable</p>
            </StackPage>
        )
    }

    const typeLabel = recipe.type === 'main' ? 'Plat' : 'Dessert'

    return (
        <StackPage title={recipe.name}>
            <div className="space-y-4">
                <div>
                    <div className="flex gap-2 items-center mb-2">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-earth/10 text-earth font-medium">
                            {typeLabel}
                        </span>
                        {availability && (
                            <span className="text-sm font-medium text-bark">
                                {availability.availableProductIds.length}/{recipe.products.length} ingrédients
                            </span>
                        )}
                    </div>

                    {availability && !availability.isFullyAvailable && (
                        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg mb-2">
                            <p className="text-sm text-orange-900">
                                {availability.missingProductIds.length} ingrédient
                                {availability.missingProductIds.length > 1 ? 's' : ''} manquant
                                {availability.missingProductIds.length > 1 ? 's' : ''}
                            </p>
                        </div>
                    )}

                    {availability?.isFullyAvailable && (
                        <div className="p-3 bg-sage-light/50 border border-sage/30 rounded-lg mb-2">
                            <p className="text-sm text-bark">✓ Recette complète, tous les ingrédients sont disponibles</p>
                        </div>
                    )}
                </div>

                {recipe.freeText && (
                    <div>
                        <h3 className="text-sm font-medium text-bark mb-1">Préparation</h3>
                        <p className="text-sm text-stone-600 whitespace-pre-wrap">{recipe.freeText}</p>
                    </div>
                )}

                <div>
                    <h3 className="text-sm font-medium text-bark mb-2">Ingrédients</h3>
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
                </div>
            </div>
        </StackPage>
    )
}
