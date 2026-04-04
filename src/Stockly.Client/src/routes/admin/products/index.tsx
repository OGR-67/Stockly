import { useState, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPencil, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons'
import { StackPage } from '../../../components/layout/StackPage'
import { ProductModal } from '../../../components/admin/ProductModal'
import { productService, categoryService } from '../../../services'
import type { ProductDetail } from '../../../models/ProductModel'
import type { Category } from '../../../models/CategoryModel'

export const Route = createFileRoute('/admin/products/')({
    component: RouteComponent,
})

function RouteComponent() {
    const [products, setProducts] = useState<ProductDetail[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [editTarget, setEditTarget] = useState<ProductDetail | 'new' | null>(null)

    useEffect(() => {
        Promise.all([productService.getAll(), categoryService.getAll()]).then(([prods, cats]) => {
            setProducts(prods)
            setCategories(cats)
        })
    }, [])

    async function handleSave(data: Omit<import('../../../models/ProductModel').Product, 'id'>) {
        if (editTarget === 'new') {
            const created = await productService.create(data)
            const category = categories.find(c => c.id === data.categoryId)!
            setProducts(prev => [...prev, { id: created.id, ...data, category, barcodes: [] }])
        } else {
            await productService.update(editTarget!.id, data)
            const category = categories.find(c => c.id === data.categoryId)!
            setProducts(prev => prev.map(p => p.id === editTarget!.id ? { ...p, ...data, category } : p))
        }
        setEditTarget(null)
    }

    async function handleDelete(id: string) {
        if (!window.confirm('Supprimer cet article ?')) return
        await productService.delete(id)
        setProducts(prev => prev.filter(p => p.id !== id))
    }

    async function handleAddBarcode(barcode: string) {
        if (editTarget === 'new' || !editTarget) return
        await productService.addBarcode(editTarget.id, barcode)
        setProducts(prev => prev.map(p =>
            p.id === editTarget.id
                ? { ...p, barcodes: [...p.barcodes, { code: barcode, productId: p.id }] }
                : p
        ))
        setEditTarget(prev => prev && prev !== 'new'
            ? { ...prev, barcodes: [...prev.barcodes, { code: barcode, productId: prev.id }] }
            : prev
        )
    }

    async function handleDeleteBarcode(barcode: string) {
        if (editTarget === 'new' || !editTarget) return
        await productService.deleteBarcode(barcode)
        setProducts(prev => prev.map(p =>
            p.id === editTarget.id
                ? { ...p, barcodes: p.barcodes.filter(b => b.code !== barcode) }
                : p
        ))
        setEditTarget(prev => prev && prev !== 'new'
            ? { ...prev, barcodes: prev.barcodes.filter(b => b.code !== barcode) }
            : prev
        )
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
            <div className="flex flex-col gap-3">
                {products.map(product => (
                    <div
                        key={product.id}
                        className="flex items-center gap-3 p-3 bg-cream rounded-xl border border-sage/30"
                    >
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-bark truncate">{product.name}</p>
                            <p className="text-xs text-stone-500 truncate">{product.category.name}</p>
                        </div>
                        <button
                            onClick={() => setEditTarget(product)}
                            className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center shrink-0"
                        >
                            <FontAwesomeIcon icon={faPencil} className="text-stone-500 text-sm" />
                        </button>
                        <button
                            onClick={() => handleDelete(product.id)}
                            className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center shrink-0"
                        >
                            <FontAwesomeIcon icon={faTrash} className="text-stone-500 text-sm" />
                        </button>
                    </div>
                ))}
                {products.length === 0 && (
                    <p className="text-center text-stone-400 py-8">Aucun article</p>
                )}
            </div>

            {editTarget && (
                <ProductModal
                    initial={editTarget === 'new' ? undefined : editTarget}
                    categories={categories}
                    onConfirm={handleSave}
                    onAddBarcode={handleAddBarcode}
                    onDeleteBarcode={handleDeleteBarcode}
                    onCategoryCreated={(cat) => setCategories(prev => [...prev, cat])}
                    onClose={() => setEditTarget(null)}
                />
            )}
        </StackPage>
    )
}
