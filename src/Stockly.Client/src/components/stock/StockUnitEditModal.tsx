import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPrint, faBoxOpen, faArrowUpFromBracket, faArrowRightArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { Modal } from '../Modal'
import { FormField } from '../FormField'
import { ConfirmButton } from '../ConfirmButton'
import { PrintModal } from '../PrintModal'
import { TransferModal } from './TransferModal'
import { useSettings } from '../../hooks/useSettings'
import { toInputDate } from '../../utils/dateUtils'
import type { StockUnitDetail } from '../../models/StockUnitModel'
import type { StorageLocation } from '../../models/StorageLocationModel'

interface StockUnitEditModalProps {
    stockUnit: StockUnitDetail
    locations: StorageLocation[]
    onSave: (expirationDate: Date | null, freeText: string | null) => void
    onOpen: (unit: StockUnitDetail) => void
    onConsume: (unit: StockUnitDetail) => void
    onTransfer: (destinationLocationId: string) => void
    onClose: () => void
}

export function StockUnitEditModal({
    stockUnit,
    locations,
    onSave,
    onOpen,
    onConsume,
    onTransfer,
    onClose,
}: StockUnitEditModalProps) {
    const { settings } = useSettings()
    const [dateValue, setDateValue] = useState(
        stockUnit.expirationDate ? toInputDate(new Date(stockUnit.expirationDate)) : ''
    )
    const [freeText, setFreeText] = useState(stockUnit.freeText ?? '')
    const [showPrintModal, setShowPrintModal] = useState(false)
    const [showTransferModal, setShowTransferModal] = useState(false)

    const canOpen = !stockUnit.isOpened && stockUnit.product.category.defaultOpenedDays !== null

    return (
        <>
            <Modal title={stockUnit.product.name} onClose={onClose}>
                <div className="flex flex-col gap-3">
                    <FormField
                        label="DLC"
                        type="date"
                        value={dateValue}
                        onChange={setDateValue}
                    />
                    <FormField
                        label="Note"
                        value={freeText}
                        onChange={setFreeText}
                        placeholder="Note sur l'unité..."
                    />

                    <div className="flex flex-col gap-2 mt-1">
                        {settings.defaultPrinterId && (
                            <button
                                onClick={() => setShowPrintModal(true)}
                                className="flex items-center justify-center gap-2 w-full py-3 rounded-lg border border-stone-200 text-earth hover:bg-sage-light/50"
                            >
                                <FontAwesomeIcon icon={faPrint} />
                                Imprimer l'étiquette
                            </button>
                        )}
                        {canOpen && (
                            <button
                                onClick={() => { onOpen(stockUnit); onClose() }}
                                className="flex items-center justify-center gap-2 w-full py-3 rounded-lg border border-stone-200 text-earth hover:bg-sage-light/50"
                            >
                                <FontAwesomeIcon icon={faBoxOpen} />
                                Ouvrir
                            </button>
                        )}
                        <button
                            onClick={() => setShowTransferModal(true)}
                            className="flex items-center justify-center gap-2 w-full py-3 rounded-lg border border-stone-200 text-earth hover:bg-sage-light/50"
                        >
                            <FontAwesomeIcon icon={faArrowRightArrowLeft} />
                            Transférer
                        </button>
                        <button
                            onClick={() => { onConsume(stockUnit); onClose() }}
                            className="flex items-center justify-center gap-2 w-full py-3 rounded-lg border border-red-100 text-red-600 hover:bg-red-50"
                        >
                            <FontAwesomeIcon icon={faArrowUpFromBracket} />
                            Consommer
                        </button>
                    </div>

                    <ConfirmButton
                        label="Enregistrer"
                        onClick={() => {
                            onSave(dateValue ? new Date(dateValue) : null, freeText || null)
                            onClose()
                        }}
                    />
                </div>
            </Modal>

            {showPrintModal && (
                <PrintModal
                    product={stockUnit.product}
                    expirationDate={dateValue ? new Date(dateValue) : null}
                    onClose={() => setShowPrintModal(false)}
                />
            )}

            {showTransferModal && (
                <TransferModal
                    stockUnit={stockUnit}
                    locations={locations}
                    onConfirm={(destinationLocationId) => {
                        onTransfer(destinationLocationId)
                        onClose()
                    }}
                    onClose={() => setShowTransferModal(false)}
                />
            )}
        </>
    )
}
