import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPrint, faMinus, faPlus } from '@fortawesome/free-solid-svg-icons'
import { Modal } from '../Modal'
import { FormField } from '../FormField'
import { FieldWrapper } from '../FieldWrapper'
import { ConfirmButton } from '../ConfirmButton'
import { PrintModal } from '../PrintModal'
import { useSettings } from '../../hooks/useSettings'
import { toInputDate, addDays } from '../../utils/dateUtils'
import type { ProductDetail } from '../../models/ProductModel'
import type { StorageLocation } from '../../models/StorageLocationModel'

interface AddStockModalProps {
    product: ProductDetail
    location: StorageLocation
    onConfirm: (expirationDate: Date | null, quantity: number) => void
    onClose: () => void
}

function computeSuggestedDlc(product: ProductDetail, location: StorageLocation): string {
    const { category } = product
    if (!category.isPerishable) return ''
    const days = location.type === 'freezer'
        ? category.defaultFrozenDays
        : (category.defaultClosedDays ?? category.defaultOpenedDays)
    return toInputDate(addDays(days ?? 0))
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
                    <FormField label="DLC" type="date" value={dateValue} onChange={setDateValue} className="mt-3" />
                )}

                <div className="mt-4 flex flex-col gap-3">
                    <FieldWrapper label="Quantité">
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
                    </FieldWrapper>

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
