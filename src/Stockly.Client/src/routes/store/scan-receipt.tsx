import { useEffect, useRef, useState } from 'react'
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCamera, faFolderOpen } from '@fortawesome/free-solid-svg-icons'
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
import { computeSuggestedDlc } from '../../utils/dateUtils'
import type { Product } from '../../models/ProductModel'

export const Route = createFileRoute('/store/scan-receipt')({
    validateSearch: (search: Record<string, unknown>) => {
        return { shared: search.shared === '1' || search.shared === true ? true : undefined }
    },
    component: RouteComponent,
})

let rowCounter = 0
function nextKey() {
    rowCounter += 1
    return `row-${rowCounter.toString()}`
}

function RouteComponent() {
    const navigate = useNavigate()
    const { shared } = Route.useSearch()
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
    const sharedFileConsumed = useRef(false)

    // Récupère le fichier déposé dans le Cache API par le service worker lors d'un partage
    // depuis une autre app (Web Share Target API) — voir sw.ts pour le pourquoi de ce relais.
    useEffect(() => {
        if (!shared || sharedFileConsumed.current) return
        sharedFileConsumed.current = true
        void (async () => {
            try {
                if (!('caches' in window)) return
                const cache = await caches.open('shared-files')
                const response = await cache.match('/shared-file')
                if (response) {
                    await cache.delete('/shared-file')
                    const blob = await response.blob()
                    const extension = blob.type === 'application/pdf' ? '.pdf' : '.jpg'
                    const file = new File([blob], `ticket-partage${extension}`, { type: blob.type })
                    await handleCapture(file)
                } else {
                    showToast('Fichier partagé introuvable')
                }
            } finally {
                await navigate({ to: '/store/scan-receipt', search: { shared: undefined }, replace: true })
            }
        })()
    }, [shared])

    async function handleCapture(file: File) {
        const items = await parseReceipt.mutateAsync(file)
        setRows(items.map(item => {
            const product = products.find(p => p.id === item.matchedProductId) ?? null
            const location = item.suggestedLocationId
                ? locations.find(l => l.id === item.suggestedLocationId)
                : undefined

            // Quand on connaît déjà le produit (donc sa catégorie) et l'emplacement suggéré, on
            // recalcule la DLC nous-mêmes (defaultFrozenDays pour un congélateur, etc.) plutôt que
            // de garder l'estimation brute de l'IA — celle-ci ne tient pas forcément compte du
            // congélateur (ex: DLC déjà expirée proposée pour un poulet pourtant surgelé).
            const expirationDate = product && location
                ? computeSuggestedDlc(product, location)
                : (item.suggestedExpiration ?? '')

            return {
                key: nextKey(),
                productName: item.productName,
                quantity: item.quantity,
                locationId: item.suggestedLocationId,
                expirationDate,
                product,
            }
        }))
    }

    function updateRow(key: string, next: ReceiptDraftRow) {
        setRows(prev => prev?.map(r => {
            if (r.key !== key) return r

            const productChanged = next.product?.id !== r.product?.id
            const locationChanged = next.locationId !== r.locationId
            if (next.product && next.locationId && (productChanged || locationChanged)) {
                const location = locations.find(l => l.id === next.locationId)
                if (location) {
                    return { ...next, expirationDate: computeSuggestedDlc(next.product, location) }
                }
            }
            return next
        }) ?? null)
    }

    function removeRow(key: string) {
        haptic()
        setRows(prev => prev?.filter(r => r.key !== key) ?? null)
    }

    // Détache 1 unité de la ligne vers une nouvelle ligne indépendante -- utile quand un même
    // article (ex: 2 bières) doit finir dans deux emplacements différents.
    function splitRow(key: string) {
        haptic()
        setRows(prev => {
            if (!prev) return prev
            const index = prev.findIndex(r => r.key === key)
            if (index === -1) return prev
            const row = prev[index]
            if (row.quantity <= 1) return prev

            const next = [...prev]
            next[index] = { ...row, quantity: row.quantity - 1 }
            next.splice(index + 1, 0, { ...row, key: nextKey(), quantity: 1 })
            return next
        })
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
                            Aucun fournisseur IA configuré — rendez-vous dans{' '}
                            <Link to="/admin/settings" className="underline font-medium">
                                Réglages
                            </Link>
                            {' '}pour en activer un.
                        </div>
                    )}
                    <div className="flex items-start gap-6">
                        <label className="flex flex-col items-center gap-2 cursor-pointer">
                            <div className="w-20 h-20 rounded-full bg-sage-light flex items-center justify-center text-2xl text-earth">
                                <FontAwesomeIcon icon={faCamera} />
                            </div>
                            <span className="text-sm text-earth font-medium">Prendre en photo</span>
                            <input
                                type="file"
                                accept="image/*,application/pdf"
                                capture="environment"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) void handleCapture(file)
                                }}
                            />
                        </label>

                        <label className="flex flex-col items-center gap-2 cursor-pointer">
                            <div className="w-20 h-20 rounded-full bg-sage-light flex items-center justify-center text-2xl text-earth">
                                <FontAwesomeIcon icon={faFolderOpen} />
                            </div>
                            <span className="text-sm text-earth font-medium">Choisir un fichier</span>
                            <input
                                type="file"
                                accept="image/*,application/pdf"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) void handleCapture(file)
                                }}
                            />
                        </label>
                    </div>
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
                            onSplit={() => { splitRow(row.key) }}
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
