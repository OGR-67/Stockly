import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPencil, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons'
import { StackPage } from '../../../components/layout/StackPage'
import { LoadingSpinner } from '../../../components/layout/LoadingSpinner'
import { ProductModal } from '../../../components/admin/ProductModal'
import { useProducts, useProductMutations } from '../../../hooks/queries/useProducts'
import { useCategories } from '../../../hooks/queries/useCategories'
import type { ProductDetail } from '../../../models/ProductModel'

export const Route = createFileRoute('/admin/products/')({
    component: RouteComponent,
})

function RouteComponent() {
    const { data: products = [], isLoading, isError } = useProducts()
    const { data: categories = [] } = useCategories()
    const { create, update, remove, addBarcode, deleteBarcode } = useProductMutations()
    const [editTarget, setEditTarget] = useState<ProductDetail | 'new' | null>(null)

    async function handleSave(data: Omit<import('../../../models/ProductModel').Product, 'id'>) {
        if (editTarget === 'new') {
            await create.mutateAsync(data)
        } else {
            await update.mutateAsync({ id: editTarget!.id, data })
        }
        setEditTarget(null)
    }

    async function handleDelete(id: string) {
        if (!window.confirm('Supprimer cet article ?')) return
        await remove.mutateAsync(id)
    }

    return (
        <StackPage
            title="Articles"
            action={
                <button onClick={() => setEditTarget('new')} className="text-white/80 hover:text-white">
                    <FontAwesomeIcon icon={faPlus} />
                </button>
            }
        >
            {isLoading && <LoadingSpinner />}
            {isError && <p className="text-center text-stone-400 py-8">Erreur de chargement</p>}

            <div className="flex flex-col gap-3">
                {products.map(product => (
                    <div key={product.id} className="flex items-center gap-3 p-3 bg-cream rounded-xl border border-sage/30">
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-bark truncate">{product.name}</p>
                            <p className="text-xs text-stone-500 truncate">{product.category.name}</p>
                        </div>
                        <button onClick={() => setEditTarget(product)} className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center shrink-0">
                            <FontAwesomeIcon icon={faPencil} className="text-stone-500 text-sm" />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center shrink-0">
                            <FontAwesomeIcon icon={faTrash} className="text-stone-500 text-sm" />
                        </button>
                    </div>
                ))}
                {!isLoading && products.length === 0 && (
                    <p className="text-center text-stone-400 py-8">Aucun article</p>
                )}
            </div>

            {editTarget && (
                <ProductModal
                    initial={editTarget === 'new' ? undefined : editTarget}
                    categories={categories}
                    onConfirm={handleSave}
                    onAddBarcode={(barcode) => {
                        if (editTarget !== 'new' && editTarget) {
                            addBarcode.mutate({ productId: editTarget.id, barcode })
                        }
                    }}
                    onDeleteBarcode={(barcode) => deleteBarcode.mutate(barcode)}
                    onClose={() => setEditTarget(null)}
                />
            )}
        </StackPage>
    )
}
