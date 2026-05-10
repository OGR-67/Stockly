import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faUtensils, faBoxOpen } from '@fortawesome/free-solid-svg-icons'
import { haptic } from 'ios-haptics'
import { StackPage } from '../../../components/layout/StackPage'
import { Card } from '../../../components/Card'
import { Modal } from '../../../components/Modal'
import { SearchOrCreate } from '../../../components/SearchOrCreate'
import { FieldWrapper } from '../../../components/FieldWrapper'
import { EmptyState } from '../../../components/EmptyState'
import { useRecipes } from '../../../hooks/queries/useRecipes'
import { useProducts } from '../../../hooks/queries/useProducts'
import { useCurrentGroceryList, useGenerateGroceryList, useClearGroceryList } from '../../../hooks/queries/useGroceryList'
import type { Recipe } from '../../../models/RecipeModel'
import type { ProductDetail } from '../../../models/ProductModel'

export const Route = createFileRoute('/preparation/grocery-list/prepare')({
    component: RouteComponent,
})

function RouteComponent() {
    const navigate = useNavigate()
    const { data: allRecipes = [] } = useRecipes()
    const { data: allProducts = [] } = useProducts()
    const { data: currentList } = useCurrentGroceryList()
    const generate = useGenerateGroceryList()
    const clear = useClearGroceryList()

    const [selectedRecipes, setSelectedRecipes] = useState<Recipe[]>([])
    const [manualProducts, setManualProducts] = useState<ProductDetail[]>([])
    const [showRecipePicker, setShowRecipePicker] = useState(false)
    const [showProductPicker, setShowProductPicker] = useState(false)

    // Pre-fill from current list once all data is available, without re-triggering on cache refreshes
    const initialized = useRef(false)
    useEffect(() => {
        if (initialized.current || !currentList || allRecipes.length === 0 || allProducts.length === 0) return
        initialized.current = true

        const recipeIds = new Set(
            currentList.items.filter(i => i.source === 'recipe' && i.recipeId).map(i => i.recipeId!)
        )
        const manualProductIds = new Set(
            currentList.items.filter(i => i.source === 'manual').map(i => i.product.id)
        )

        setSelectedRecipes(allRecipes.filter(r => recipeIds.has(r.id)))
        setManualProducts(allProducts.filter(p => manualProductIds.has(p.id)))
    }, [currentList, allRecipes, allProducts])

    const availableRecipes = allRecipes.filter(r => !selectedRecipes.some(s => s.id === r.id))
    const availableProducts = allProducts.filter(p => !manualProducts.some(m => m.id === p.id))

    function addRecipe(recipe: Recipe) {
        haptic()
        setSelectedRecipes(prev => [...prev, recipe])
        setShowRecipePicker(false)
    }

    function removeRecipe(id: string) {
        haptic()
        setSelectedRecipes(prev => prev.filter(r => r.id !== id))
    }

    function addProduct(product: ProductDetail) {
        haptic()
        setManualProducts(prev => [...prev, product])
        setShowProductPicker(false)
    }

    function removeProduct(id: string) {
        haptic()
        setManualProducts(prev => prev.filter(p => p.id !== id))
    }

    async function handleClear() {
        haptic()
        await clear.mutateAsync()
        setSelectedRecipes([])
        setManualProducts([])
        haptic.confirm()
    }

    async function handleGenerate() {
        await generate.mutateAsync({
            recipeIds: selectedRecipes.map(r => r.id),
            manualProductIds: manualProducts.map(p => p.id),
        })
        haptic.confirm()
        navigate({ to: '/preparation/grocery-list', replace: true })
    }

    return (
        <>
            <StackPage title="Préparer une liste">
                <div className="flex flex-col gap-6">
                    {/* Recettes */}
                    <section>
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-sm font-semibold text-bark">Recettes</h2>
                            <button
                                onClick={() => { haptic(); setShowRecipePicker(true) }}
                                className="text-xs text-earth font-medium"
                            >
                                + Ajouter
                            </button>
                        </div>
                        {selectedRecipes.length === 0 && (
                            <EmptyState message="Aucune recette sélectionnée" />
                        )}
                        <div className="flex flex-col gap-2">
                            {selectedRecipes.map(recipe => (
                                <Card key={recipe.id}>
                                    <div className="text-earth">
                                        <FontAwesomeIcon icon={faUtensils} />
                                    </div>
                                    <p className="flex-1 text-bark text-sm font-medium">{recipe.name}</p>
                                    <button onClick={() => removeRecipe(recipe.id)} className="text-stone-400 hover:text-red-400">
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                </Card>
                            ))}
                        </div>
                    </section>

                    {/* Articles manuels */}
                    <section>
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-sm font-semibold text-bark">Articles</h2>
                            <button
                                onClick={() => { haptic(); setShowProductPicker(true) }}
                                className="text-xs text-earth font-medium"
                            >
                                + Ajouter
                            </button>
                        </div>
                        {manualProducts.length === 0 && (
                            <EmptyState message="Aucun article ajouté" />
                        )}
                        <div className="flex flex-col gap-2">
                            {manualProducts.map(product => (
                                <Card key={product.id}>
                                    <div className="text-earth">
                                        <FontAwesomeIcon icon={faBoxOpen} />
                                    </div>
                                    <p className="flex-1 text-bark text-sm font-medium">{product.name}</p>
                                    <button onClick={() => removeProduct(product.id)} className="text-stone-400 hover:text-red-400">
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                </Card>
                            ))}
                        </div>
                    </section>

                    {currentList && (
                        <button
                            onClick={handleClear}
                            disabled={clear.isPending}
                            className="w-full py-3 border border-red-400 text-red-400 rounded-lg text-sm font-medium disabled:opacity-50"
                        >
                            {clear.isPending ? 'Suppression...' : 'Vider la liste actuelle'}
                        </button>
                    )}

                    <button
                        onClick={handleGenerate}
                        disabled={generate.isPending}
                        className="w-full py-3 bg-earth text-white rounded-lg font-medium disabled:opacity-50"
                    >
                        {generate.isPending ? 'Génération...' : 'Générer la liste de courses'}
                    </button>
                </div>
            </StackPage>

            {showRecipePicker && (
                <Modal title="Ajouter une recette" onClose={() => setShowRecipePicker(false)}>
                    <FieldWrapper label="Recette">
                        <SearchOrCreate
                            items={availableRecipes}
                            displayKey="name"
                            searchKeys={['name']}
                            onSelect={addRecipe}
                            onClear={() => {}}
                            placeholder="Rechercher une recette..."
                            autoFocus
                        />
                    </FieldWrapper>
                </Modal>
            )}

            {showProductPicker && (
                <Modal title="Ajouter un article" onClose={() => setShowProductPicker(false)}>
                    <FieldWrapper label="Article">
                        <SearchOrCreate
                            items={availableProducts}
                            displayKey="name"
                            searchKeys={['name']}
                            onSelect={addProduct}
                            onClear={() => {}}
                            placeholder="Rechercher un article..."
                            autoFocus
                        />
                    </FieldWrapper>
                </Modal>
            )}
        </>
    )
}
