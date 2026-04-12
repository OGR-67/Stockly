import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPencil, faPlus } from '@fortawesome/free-solid-svg-icons'
import { StackPage } from '../../../components/layout/StackPage'
import { LoadingSpinner } from '../../../components/layout/LoadingSpinner'
import { SearchInput } from '../../../components/SearchInput'
import { Card } from '../../../components/Card'
import { IconButton } from '../../../components/IconButton'
import { RecipeModal } from '../../../components/admin/RecipeModal'
import { useRecipes, useRecipeMutations } from '../../../hooks/queries/useRecipes'
import { useAllStockUnits } from '../../../hooks/queries/useStockUnits'
import { getRecipeAvailability } from '../../../utils/recipeAvailability'
import { useState } from 'react'
import type { Recipe } from '../../../models/RecipeModel'

export const Route = createFileRoute('/preparation/recipes/')({
    component: RouteComponent,
})

function RouteComponent() {
    const navigate = useNavigate()
    const { data: recipes = [], isLoading, isError } = useRecipes()
    const { data: allUnits = [] } = useAllStockUnits()
    const { create, update } = useRecipeMutations()

    const [editTarget, setEditTarget] = useState<Recipe | 'new' | null>(null)
    const [showAvailableOnly, setShowAvailableOnly] = useState(false)
    const [typeFilter, setTypeFilter] = useState<'all' | 'main' | 'dessert'>('all')
    const [query, setQuery] = useState('')

    const filtered = recipes.filter(recipe => {
        // Filtre nom
        if (query && !recipe.name.toLowerCase().includes(query.toLowerCase())) {
            return false
        }

        // Filtre type
        if (typeFilter !== 'all' && recipe.type !== typeFilter) {
            return false
        }

        // Filtre disponibilité
        if (showAvailableOnly) {
            const availability = getRecipeAvailability(recipe, allUnits)
            if (!availability.isFullyAvailable) return false
        }

        return true
    })

    async function handleSave(data: { name: string; type: 'main' | 'dessert'; freeText?: string; productIds: string[] }) {
        if (editTarget === 'new') {
            await create.mutateAsync(data)
        } else if (editTarget) {
            await update.mutateAsync({ id: editTarget.id, ...data })
        }
        setEditTarget(null)
    }

    const typeLabel = (type: 'main' | 'dessert') => (type === 'main' ? 'Plat' : 'Dessert')

    return (
        <StackPage
            title="Recettes"
            action={
                <button onClick={() => setEditTarget('new')} className="text-white/80 hover:text-white">
                    <FontAwesomeIcon icon={faPlus} />
                </button>
            }
        >
            <SearchInput value={query} onChange={setQuery} placeholder="Rechercher une recette..." className="mb-4" />

            <div className="flex gap-2 mb-4 flex-wrap">
                <label className="flex items-center gap-2 px-3 py-1 bg-cream rounded-full border border-sage/30 cursor-pointer hover:bg-sage-light/30">
                    <input
                        type="checkbox"
                        checked={showAvailableOnly}
                        onChange={e => setShowAvailableOnly(e.target.checked)}
                        className="cursor-pointer"
                    />
                    <span className="text-sm">Disponibles</span>
                </label>

                <div className="flex gap-2">
                    <button
                        onClick={() => setTypeFilter('all')}
                        className={`px-3 py-1 rounded-full text-sm ${
                            typeFilter === 'all'
                                ? 'bg-earth text-white'
                                : 'bg-cream border border-sage/30 text-bark hover:bg-sage-light/30'
                        }`}
                    >
                        Tous
                    </button>
                    <button
                        onClick={() => setTypeFilter('main')}
                        className={`px-3 py-1 rounded-full text-sm ${
                            typeFilter === 'main'
                                ? 'bg-earth text-white'
                                : 'bg-cream border border-sage/30 text-bark hover:bg-sage-light/30'
                        }`}
                    >
                        Plats
                    </button>
                    <button
                        onClick={() => setTypeFilter('dessert')}
                        className={`px-3 py-1 rounded-full text-sm ${
                            typeFilter === 'dessert'
                                ? 'bg-earth text-white'
                                : 'bg-cream border border-sage/30 text-bark hover:bg-sage-light/30'
                        }`}
                    >
                        Desserts
                    </button>
                </div>
            </div>

            {isLoading && <LoadingSpinner />}
            {isError && <p className="text-center text-stone-400 py-8">Erreur de chargement</p>}

            <div className="flex flex-col gap-3">
                {filtered.map(recipe => {
                    const availability = getRecipeAvailability(recipe, allUnits)
                    const handleEditClick = (e: React.MouseEvent) => {
                        e.stopPropagation()
                        setEditTarget(recipe)
                    }
                    return (
                        <Card
                            key={recipe.id}
                            onClick={() => navigate({ to: '/preparation/recipes/$recipeId', params: { recipeId: recipe.id } })}
                        >
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-bark truncate">{recipe.name}</p>
                                <div className="flex gap-2 mt-1 items-center">
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-earth/10 text-earth">
                                        {typeLabel(recipe.type)}
                                    </span>
                                    {availability.isFullyAvailable ? (
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-sage/30 text-bark">
                                            ✓ Disponible
                                        </span>
                                    ) : (
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                                            ✗ {availability.missingProductIds.length} manquant
                                            {availability.missingProductIds.length > 1 ? 's' : ''}
                                        </span>
                                    )}
                                </div>
                                {recipe.freeText && <p className="text-xs text-stone-400 mt-1 truncate">{recipe.freeText}</p>}
                            </div>
                            <button onClick={handleEditClick}>
                                <IconButton
                                    icon={faPencil}
                                    title="Modifier"
                                />
                            </button>
                        </Card>
                    )
                })}
                {!isLoading && filtered.length === 0 && (
                    <p className="text-center text-stone-400 py-8">Aucune recette</p>
                )}
            </div>

            {editTarget && (
                <RecipeModal
                    initial={editTarget === 'new' ? undefined : editTarget}
                    onConfirm={handleSave}
                    onClose={() => setEditTarget(null)}
                />
            )}
        </StackPage>
    )
}
