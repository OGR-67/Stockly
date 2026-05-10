import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPencil, faPlus } from '@fortawesome/free-solid-svg-icons'
import { haptic } from 'ios-haptics'
import { StackPage } from '../../../components/layout/StackPage'
import { LoadingSpinner } from '../../../components/layout/LoadingSpinner'
import { SearchInput } from '../../../components/SearchInput'
import { Card } from '../../../components/Card'
import { Toggle } from '../../../components/Toggle'
import { ToggleGroup } from '../../../components/ToggleGroup'
import { IconButton } from '../../../components/IconButton'
import { EmptyState } from '../../../components/EmptyState'
import { RecipeTypeBadge } from '../../../components/RecipeTypeBadge'
import { AvailabilityBadge } from '../../../components/AvailabilityBadge'
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
        haptic.confirm()
        setEditTarget(null)
    }

    return (
        <StackPage
            title="Recettes"
            action={
                <button onClick={() => { haptic(); setEditTarget('new'); }} className="text-white/80 hover:text-white">
                    <FontAwesomeIcon icon={faPlus} />
                </button>
            }
        >
            <SearchInput value={query} onChange={setQuery} placeholder="Rechercher une recette..." className="mb-4" />

            <div className="flex gap-4 mb-4 flex-col sm:flex-row sm:items-center">
                <div className="bg-cream rounded-lg border border-sage/30 px-4 py-2 flex-1">
                    <Toggle
                        label="Disponibles uniquement"
                        checked={showAvailableOnly}
                        onChange={setShowAvailableOnly}
                    />
                </div>

                <div className="bg-cream rounded-lg border border-sage/30 px-4 py-2">
                    <ToggleGroup
                        options={[
                            { value: 'all', label: 'Tous' },
                            { value: 'main', label: 'Plats' },
                            { value: 'dessert', label: 'Desserts' },
                        ]}
                        value={typeFilter}
                        onChange={(value) => setTypeFilter(value as typeof typeFilter)}
                    />
                </div>
            </div>

            {isLoading && <LoadingSpinner />}
            {isError && <EmptyState message="Erreur de chargement" error />}

            <div className="flex flex-col gap-3">
                {filtered.map(recipe => {
                    const availability = getRecipeAvailability(recipe, allUnits)
                    const handleEditClick = (e: React.MouseEvent) => {
                        e.stopPropagation()
                        haptic()
                        setEditTarget(recipe)
                    }
                    return (
                        <Card
                            key={recipe.id}
                            onClick={() => {
                              haptic.confirm();
                              navigate({ to: '/preparation/recipes/$recipeId', params: { recipeId: recipe.id } });
                            }}
                        >
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-bark truncate">{recipe.name}</p>
                                <div className="flex gap-2 mt-1 items-center">
                                    <RecipeTypeBadge type={recipe.type} />
                                    <AvailabilityBadge missing={availability.missingProductIds.length} />
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
                    <EmptyState message="Aucune recette" />
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
