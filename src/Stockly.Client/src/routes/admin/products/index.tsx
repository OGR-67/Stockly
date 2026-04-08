import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import Fuse from 'fuse.js'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPencil, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons'
import { StackPage } from '../../../components/layout/StackPage'
import { LoadingSpinner } from '../../../components/layout/LoadingSpinner'
import { SearchInput } from '../../../components/SearchInput'
import { Card } from '../../../components/Card'
import { IconButton } from '../../../components/IconButton'
import { ProductModal } from '../../../components/admin/ProductModal'
import { useProducts, useProductMutations } from '../../../hooks/queries/useProducts'
import { stockUnitService } from '../../../services'
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
    const [query, setQuery] = useState('')

    const fuse = new Fuse(products, { keys: ['name', 'category.name'], threshold: 0.3 })
    const filtered = query ? fuse.search(query).map(r => r.item) : products

    async function handleSave(data: Omit<import('../../../models/ProductModel').Product, 'id'>) {
        if (editTarget === 'new') {
            await create.mutateAsync(data)
        } else {
            await update.mutateAsync({ id: editTarget!.id, data })
        }
        setEditTarget(null)
    }

    async function handleDelete(id: string) {
        const units = await stockUnitService.getAll()
        const count = units.filter(u => u.productId === id).length
        const message = count > 0
            ? `Cet article a ${count} unité${count > 1 ? 's' : ''} en stock. Supprimer quand même ?`
            : 'Supprimer cet article ?'
        if (!window.confirm(message)) return
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
            <SearchInput value={query} onChange={setQuery} placeholder="Rechercher un article..." className="mb-4" />

            {isLoading && <LoadingSpinner />}
            {isError && <p className="text-center text-stone-400 py-8">Erreur de chargement</p>}

            <div className="flex flex-col gap-3">
                {filtered.map(product => (
                    <Card key={product.id}>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-bark truncate">{product.name}</p>
                            <p className="text-xs text-stone-500 truncate">{product.category.name}</p>
                        </div>
                        <IconButton icon={faPencil} onClick={() => setEditTarget(product)} title="Modifier" />
                        <IconButton icon={faTrash} onClick={() => handleDelete(product.id)} title="Supprimer" />
                    </Card>
                ))}
                {!isLoading && filtered.length === 0 && (
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
                            setEditTarget({ ...editTarget, barcodes: [...editTarget.barcodes, { code: barcode, productId: editTarget.id }] })
                        }
                    }}
                    onDeleteBarcode={(barcode) => {
                        deleteBarcode.mutate(barcode)
                        if (editTarget !== 'new' && editTarget) {
                            setEditTarget({ ...editTarget, barcodes: editTarget.barcodes.filter(b => b.code !== barcode) })
                        }
                    }}
                    onClose={() => setEditTarget(null)}
                />
            )}
        </StackPage>
    )
}
