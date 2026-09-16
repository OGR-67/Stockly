import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faCheck, faPlus, faMinus, faArrowsSplitUpAndLeft } from '@fortawesome/free-solid-svg-icons'
import { FieldWrapper } from '../FieldWrapper'
import { FormField } from '../FormField'
import { SearchOrCreate } from '../SearchOrCreate'
import type { ProductDetail } from '../../models/ProductModel'
import type { StorageLocation } from '../../models/StorageLocationModel'

export interface ReceiptDraftRow {
    key: string
    productName: string
    quantity: number
    locationId: string | null
    expirationDate: string
    product: ProductDetail | null
    note: string
}

interface ReceiptRowProps {
    row: ReceiptDraftRow
    products: ProductDetail[]
    locations: StorageLocation[]
    onChange: (row: ReceiptDraftRow) => void
    onRemove: () => void
    onCreateProduct: () => void
    onSplit: () => void
}

export function ReceiptRow({ row, products, locations, onChange, onRemove, onCreateProduct, onSplit }: ReceiptRowProps) {
    function adjustQuantity(delta: number) {
        onChange({ ...row, quantity: Math.max(1, row.quantity + delta) })
    }

    return (
        <div className="bg-cream rounded-xl border border-sage/30 p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    {row.product ? (
                        <div>
                            <div className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faCheck} className="text-sage shrink-0" />
                                <p className="font-medium text-bark truncate">{row.product.name}</p>
                            </div>
                            <button
                                onClick={() => { onChange({ ...row, product: null }) }}
                                className="text-xs text-stone-400 hover:text-stone-600 mt-1"
                            >
                                Changer de produit
                            </button>
                        </div>
                    ) : (
                        <div>
                            <p className="text-sm text-stone-500 mb-1">Détecté : « {row.productName} »</p>
                            <SearchOrCreate
                                items={products}
                                displayKey="name"
                                searchKeys={['name']}
                                onSelect={(p) => { onChange({ ...row, product: p }) }}
                                onClear={() => { onChange({ ...row, product: null }) }}
                                onCreate={onCreateProduct}
                                placeholder="Associer un produit..."
                            />
                        </div>
                    )}
                </div>
                <button onClick={onRemove} className="text-stone-400 hover:text-stone-600 shrink-0" title="Retirer cette ligne">
                    <FontAwesomeIcon icon={faXmark} />
                </button>
            </div>

            <div className="flex gap-2">
                <FieldWrapper label="Emplacement" className="flex-1">
                    <select
                        value={row.locationId ?? ''}
                        onChange={(e) => { onChange({ ...row, locationId: e.target.value || null }) }}
                        className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none bg-cream"
                    >
                        <option value="">Choisir...</option>
                        {locations.map(l => (
                            <option key={l.id} value={l.id}>{l.name}</option>
                        ))}
                    </select>
                </FieldWrapper>

                <FormField
                    label="DLC"
                    type="date"
                    value={row.expirationDate}
                    onChange={(v) => { onChange({ ...row, expirationDate: v }) }}
                    className="flex-1"
                />
            </div>

            <FormField
                label="Note (optionnel)"
                value={row.note}
                onChange={(v) => { onChange({ ...row, note: v }) }}
                placeholder="Note sur l'unité..."
            />

            <FieldWrapper label="Quantité">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => { adjustQuantity(-1) }}
                        disabled={row.quantity <= 1}
                        className="px-3 py-2 rounded-lg bg-stone-100 text-stone-600 disabled:opacity-30"
                    >
                        <FontAwesomeIcon icon={faMinus} />
                    </button>
                    <span className="flex-1 text-center font-semibold text-bark">{row.quantity}</span>
                    <button onClick={() => { adjustQuantity(1) }} className="px-3 py-2 rounded-lg bg-stone-100 text-stone-600">
                        <FontAwesomeIcon icon={faPlus} />
                    </button>
                </div>
            </FieldWrapper>

            {row.quantity > 1 && (
                <button
                    onClick={onSplit}
                    className="flex items-center justify-center gap-2 text-xs text-earth py-1"
                >
                    <FontAwesomeIcon icon={faArrowsSplitUpAndLeft} />
                    Séparer 1 unité (emplacement/DLC différents)
                </button>
            )}
        </div>
    )
}
