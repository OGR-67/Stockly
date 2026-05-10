import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faListCheck, faPlus, faTrash, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'
import { haptic } from 'ios-haptics'
import { StackPage } from '../../../components/layout/StackPage'
import { LoadingSpinner } from '../../../components/layout/LoadingSpinner'
import { EmptyState } from '../../../components/EmptyState'
import { Card } from '../../../components/Card'
import type {GroceryListItem } from '../../../models/GroceryListModel.ts'
import { useCurrentGroceryList, useRemoveGroceryListItem } from '../../../hooks/queries/useGroceryList'
import type { GroceryListItemSource } from '../../../models/GroceryListModel'

export const Route = createFileRoute('/preparation/grocery-list/')({
    component: RouteComponent,
})

const sourceLabels: Record<GroceryListItemSource, string> = {
    minStock: 'Stock minimal',
    recipe: 'Recettes',
    manual: 'Ajout manuel',
}

function RouteComponent() {
    const navigate = useNavigate()
    const { data: groceryList, isLoading, isError } = useCurrentGroceryList()
    const removeItem = useRemoveGroceryListItem()
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const grouped = groceryList
        ? groceryList.items.reduce<Partial<Record<GroceryListItemSource, typeof groceryList.items>>>((acc, item) => {
            acc[item.source] = [...(acc[item.source] ?? []), item]
            return acc
        }, {})
        : null

    // Products appearing in both recipe and manual sources — flag as duplicate
    const recipeProductIds = new Set(
        groceryList?.items.filter(i => i.source === 'recipe').map(i => i.product.id) ?? []
    )
    const duplicateManualIds = new Set(
        groceryList?.items
            .filter(i => i.source === 'manual' && recipeProductIds.has(i.product.id))
            .map(i => i.id) ?? []
    )

    async function handleRemoveItem(itemId: string) {
        haptic()
        setDeletingId(itemId)
        try {
            await removeItem.mutateAsync(itemId)
            haptic.confirm()
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <StackPage
            title="Liste de courses"
            action={
                <button
                    onClick={() => { haptic(); navigate({ to: '/preparation/grocery-list/prepare' }) }}
                    className="text-white/80 hover:text-white"
                >
                    <FontAwesomeIcon icon={faPlus} />
                </button>
            }
        >
            {isLoading && <LoadingSpinner />}
            {isError && <EmptyState message="Erreur de chargement" error />}

            {!isLoading && !isError && !groceryList && (
                <div className="flex flex-col items-center">
                    <EmptyState message="Aucune liste générée" />
                    <button
                        onClick={() => { haptic.confirm(); navigate({ to: '/preparation/grocery-list/prepare' }) }}
                        className="mt-2 px-4 py-2 bg-earth text-white rounded-lg text-sm font-medium"
                    >
                        Préparer la liste
                    </button>
                </div>
            )}

            {grouped && (
                <div className="flex flex-col gap-6">
                    <p className="text-xs text-stone-400">
                        Générée le {new Date(groceryList!.generatedAt).toLocaleDateString('fr-FR', { dateStyle: 'medium' })}
                    </p>

                    {(Object.entries(grouped) as [GroceryListItemSource, GroceryListItem[]][]).map(([source, items]) => (
                        <div key={source}>
                            <h2 className="text-sm font-semibold text-bark mb-2">{sourceLabels[source]}</h2>
                            <div className="flex flex-col gap-2">
                                {items?.map(item => (
                                    <Card key={item.id}>
                                        <div className="text-earth">
                                            <FontAwesomeIcon icon={faListCheck} />
                                        </div>
                                        <p className="flex-1 text-bark text-sm font-medium">{item.product.name}</p>
                                        {item.quantity !== null && (
                                            <span className="text-xs font-semibold text-earth bg-earth/10 px-2 py-0.5 rounded-full">
                                                ×{item.quantity}
                                            </span>
                                        )}
                                        {duplicateManualIds.has(item.id) && (
                                            <span className="text-amber-500" title="Déjà présent via une recette">
                                                <FontAwesomeIcon icon={faTriangleExclamation} />
                                            </span>
                                        )}
                                        {item.source === 'manual' && (
                                            <button
                                                onClick={() => handleRemoveItem(item.id)}
                                                disabled={deletingId === item.id}
                                                className="text-stone-400 hover:text-red-400 disabled:opacity-40"
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        )}
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={() => { haptic(); navigate({ to: '/preparation/grocery-list/prepare' }) }}
                        className="w-full py-3 border border-earth text-earth rounded-lg text-sm font-medium"
                    >
                        Préparer la liste
                    </button>
                </div>
            )}
        </StackPage>
    )
}
