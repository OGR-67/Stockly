import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCamera } from '@fortawesome/free-solid-svg-icons'
import { haptic } from 'ios-haptics'
import { StackPage } from '../../components/layout/StackPage'
import { LoadingSpinner } from '../../components/layout/LoadingSpinner'
import { EmptyState } from '../../components/EmptyState'
import { ConfirmButton } from '../../components/ConfirmButton'
import { Toast } from '../../components/Toast'
import { ProductModal } from '../../components/admin/ProductModal'
import { ReceiptRow } from '../../components/store/ReceiptRow'
import type { ReceiptDraftRow } from '../../components/store/ReceiptRow'
import { useParseReceipt } from '../../hooks/queries/useParseReceipt'
import { useProducts, useProductMutations } from '../../hooks/queries/useProducts'
import { useLocations } from '../../hooks/queries/useLocations'
import { useCategories } from '../../hooks/queries/useCategories'
import { useAllStockUnitMutations } from '../../hooks/queries/useStockUnits'
import { useAiSettings } from '../../hooks/queries/useAiSettings'
import { useToast } from '../../hooks/useToast'
import type { Product } from '../../models/ProductModel'

export const Route = createFileRoute('/store/scan-receipt')({
    component: RouteComponent,
})

let rowCounter = 0
function nextKey() {
    rowCounter += 1
    return `row-${rowCounter.toString()}`
}

function RouteComponent() {
    const navigate = useNavigate()
    const { data: aiSettings } = useAiSettings()
    const { data: products = [] } = useProducts()
    const { data: locations = [] } = useLocations()
    const { data: categories = [] } = useCategories()
    const { create: createProduct } = useProductMutations()
    const { add: addStockUnit } = useAllStockUnitMutations()
    const parseReceipt = useParseReceipt()
    const { toast, showToast } = useToast(2500)

    const [rows, setRows] = useState<ReceiptDraftRow[] | null>(null)
    const [productModalRowKey, setProductModalRowKey] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)

    async function handleCapture(file: File) {
        const items = await parseReceipt.mutateAsync(file)
        setRows(items.map(item => ({
            key: nextKey(),
            productName: item.productName,
            quantity: item.quantity,
            locationId: item.suggestedLocationId,
            expirationDate: item.suggestedExpiration ?? '',
            product: products.find(p => p.id === item.matchedProductId) ?? null,
        })))
    }

    function updateRow(key: string, next: ReceiptDraftRow) {
        setRows(prev => prev?.map(r => r.key === key ? next : r) ?? null)
    }

    function removeRow(key: string) {
        haptic()
        setRows(prev => prev?.filter(r => r.key !== key) ?? null)
    }

    async function handleCreateProduct(data: Omit<Product, 'id'>) {
        const created = await createProduct.mutateAsync(data)
        haptic.confirm()
        const rowKey = productModalRowKey
        setProductModalRowKey(null)
        const category = categories.find(c => c.id === data.categoryId)
        if (!rowKey || !category) return
        setRows(prev => prev?.map(r => r.key === rowKey
            ? { ...r, product: { ...created, category, barcodes: [] } }
            : r) ?? null)
    }

    async function handleValidateAll() {
        if (!rows) return
        setSubmitting(true)
        try {
            for (const row of rows) {
                if (!row.product || !row.locationId) continue
                for (let i = 0; i < row.quantity; i++) {
                    await addStockUnit.mutateAsync({
                        productId: row.product.id,
                        locationId: row.locationId,
                        expirationDate: row.expirationDate ? new Date(row.expirationDate) : null,
                        freeText: null,
                    })
                }
            }
            haptic.confirm()
            showToast('Ticket rangé')
            await navigate({ to: '/store' })
        } finally {
            setSubmitting(false)
        }
    }

    const readyCount = rows?.filter(r => r.product && r.locationId).length ?? 0
    const productModalRow = rows?.find(r => r.key === productModalRowKey)

    return (
        <StackPage title="Scanner un ticket">
            <Toast message={toast} />

            {!rows && !parseReceipt.isPending && (
                <div className="flex flex-col items-center gap-4 py-12">
                    {aiSettings?.aiProvider === 'none' && (
                        <div className="p-3 bg-earth/10 rounded-xl text-sm text-earth text-center">
                            Aucun fournisseur IA configuré — rendez-vous dans Réglages pour en activer un.
                        </div>
                    )}
                    <label className="flex flex-col items-center gap-2 cursor-pointer">
                        <div className="w-20 h-20 rounded-full bg-sage-light flex items-center justify-center text-2xl text-earth">
                            <FontAwesomeIcon icon={faCamera} />
                        </div>
                        <span className="text-sm text-earth font-medium">Prendre en photo le ticket</span>
                        <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) void handleCapture(file)
                            }}
                        />
                    </label>
                </div>
            )}

            {parseReceipt.isPending && <LoadingSpinner />}

            {parseReceipt.isError && (
                <EmptyState message="Échec de l'analyse du ticket. Réessayez." error />
            )}

            {rows?.length === 0 && (
                <EmptyState message="Aucun article détecté sur cette photo." />
            )}

            {rows && rows.length > 0 && (
                <div className="flex flex-col gap-3 pb-4">
                    {rows.map(row => (
                        <ReceiptRow
                            key={row.key}
                            row={row}
                            products={products}
                            locations={locations}
                            onChange={(next) => { updateRow(row.key, next) }}
                            onRemove={() => { removeRow(row.key) }}
                            onCreateProduct={() => { setProductModalRowKey(row.key) }}
                        />
                    ))}

                    <ConfirmButton
                        onClick={() => { void handleValidateAll() }}
                        label={`Ranger (${readyCount.toString()}/${rows.length.toString()})`}
                        loading={submitting}
                        disabled={readyCount === 0}
                    />
                </div>
            )}

            {productModalRow && (
                <ProductModal
                    categories={categories}
                    onConfirm={(data) => { void handleCreateProduct(data) }}
                    onAddBarcode={() => {}}
                    onDeleteBarcode={() => {}}
                    onClose={() => { setProductModalRowKey(null) }}
                />
            )}
        </StackPage>
    )
}
