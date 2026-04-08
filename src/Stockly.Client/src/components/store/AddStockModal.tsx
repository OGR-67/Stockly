import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPrint, faMinus, faPlus } from '@fortawesome/free-solid-svg-icons'
import { Modal } from '../Modal'
import { ConfirmButton } from '../ConfirmButton'
import { PrintModal } from '../PrintModal'
import { useSettings } from '../../hooks/useSettings'
import type { ProductDetail } from '../../models/ProductModel'
import type { StorageLocation } from '../../models/StorageLocationModel'

interface AddStockModalProps {
    product: ProductDetail
    location: StorageLocation
    onConfirm: (expirationDate: Date | null, quantity: number) => void
    onClose: () => void
}

function toInputDate(date: Date): string {
    return date.toISOString().split('T')[0]
}

function computeSuggestedDlc(product: ProductDetail, location: StorageLocation): string {
    const { category } = product
    if (!category.isPerishable) return ''
    const days = location.type === 'freezer'
        ? category.defaultFrozenDays
        : (category.defaultClosedDays ?? category.defaultOpenedDays)
    return toInputDate(new Date(Date.now() + (days ?? 0) * 86400000)) // 86400000 ms in a day
}

export function AddStockModal({ product, location, onConfirm, onClose }: AddStockModalProps) {
    const [dateValue, setDateValue] = useState(() => computeSuggestedDlc(product, location))
    const [quantity, setQuantity] = useState(1)
    const [showPrintModal, setShowPrintModal] = useState(false)
    const { settings } = useSettings()

    function adjust(delta: number) {
        setQuantity(q => Math.max(1, q + delta))
    }

    return (
        <>
            <Modal title="Ranger" onClose={onClose}>
                <p className="font-medium text-bark">{product.name}</p>
                <p className="text-sm text-stone-500">{location.name}</p>

                {product.category.isPerishable && (
                    <div className="mt-3">
                        <label className="block text-sm text-stone-500 mb-1">DLC</label>
                        <input
                            type="date"
                            value={dateValue}
                            onChange={(e) => setDateValue(e.target.value)}
                            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none"
                        />
                    </div>
                )}

                <div className="mt-4 flex flex-col gap-3">
                    <div>
                        <label className="block text-sm text-stone-500 mb-1">Quantité</label>
                        <div className="flex items-center gap-2">
                            <button onClick={() => adjust(-5)} disabled={quantity <= 5} className="px-3 py-2 rounded-lg bg-stone-100 text-stone-600 text-sm disabled:opacity-30">-5</button>
                            <button onClick={() => adjust(-1)} disabled={quantity <= 1} className="px-3 py-2 rounded-lg bg-stone-100 text-stone-600 disabled:opacity-30">
                                <FontAwesomeIcon icon={faMinus} />
                            </button>
                            <span className="flex-1 text-center font-semibold text-lg text-bark">{quantity}</span>
                            <button onClick={() => adjust(1)} className="px-3 py-2 rounded-lg bg-stone-100 text-stone-600">
                                <FontAwesomeIcon icon={faPlus} />
                            </button>
                            <button onClick={() => adjust(5)} className="px-3 py-2 rounded-lg bg-stone-100 text-stone-600 text-sm">+5</button>
                        </div>
                    </div>

                    {settings.defaultPrinterId && (
                        <button
                            onClick={() => setShowPrintModal(true)}
                            className="flex items-center justify-center gap-2 w-full py-3 rounded-lg border border-stone-200 text-earth hover:bg-sage-light/50"
                        >
                            <FontAwesomeIcon icon={faPrint} />
                            Imprimer {quantity > 1 ? `${quantity} étiquettes` : "l'étiquette"}
                        </button>
                    )}
                    <ConfirmButton
                        onClick={() => onConfirm(dateValue ? new Date(dateValue) : null, quantity)}
                        label={`Confirmer${quantity > 1 ? ` (×${quantity})` : ''}`}
                    />
                </div>
            </Modal>

            {showPrintModal && (
                <PrintModal
                    product={product}
                    expirationDate={dateValue ? new Date(dateValue) : null}
                    copies={quantity}
                    onClose={() => setShowPrintModal(false)}
                />
            )}
        </>
    )
}
