import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faPrint } from '@fortawesome/free-solid-svg-icons'
import { Modal } from '../Modal'
import { PrintModal } from '../PrintModal'
import { SearchOrCreate } from '../SearchOrCreate'
import { useSettings } from '../../hooks/useSettings'
import type { StockUnitDetail } from '../../models/StockUnitModel'
import type { StorageLocation, LocationType } from '../../models/StorageLocationModel'
import type { Category } from '../../models/CategoryModel'

interface OpenModalProps {
    stockUnit: StockUnitDetail
    locations: StorageLocation[]
    onConfirm: (newExpirationDate: Date | null, newLocationId: string | null) => void
    onClose: () => void
}

function toInputDate(date: Date): string {
    return date.toISOString().split('T')[0]
}

function computeSuggestedDlc(category: Category, locationType: LocationType): string {
    const days = locationType === 'freezer'
        ? category.defaultFrozenDays
        : category.defaultOpenedDays
    if (!days) return ''
    return toInputDate(new Date(Date.now() + days * 86400000)) // 86400000 ms in a day
}

export function OpenModal({ stockUnit, locations, onConfirm, onClose }: OpenModalProps) {
    const category = stockUnit.product.category
    const [selectedLocation, setSelectedLocation] = useState<StorageLocation | undefined>(stockUnit.location)
    const [dateValue, setDateValue] = useState(() =>
        computeSuggestedDlc(category, stockUnit.location.type)
    )
    const [showPrintModal, setShowPrintModal] = useState(false)
    const { settings } = useSettings()

    useEffect(() => {
        if (selectedLocation) {
            setDateValue(computeSuggestedDlc(category, selectedLocation.type))
        }
    }, [selectedLocation, category])

    const movedToNewLocation = selectedLocation && selectedLocation.id !== stockUnit.locationId

    return (
        <>
            <Modal title="Ouvrir" onClose={onClose}>
                <p className="font-medium text-bark">{stockUnit.product.name}</p>

                <div className="mt-3">
                    <label className="block text-sm text-stone-500 mb-1">Nouvelle DLC</label>
                    <input
                        type="date"
                        value={dateValue}
                        onChange={(e) => setDateValue(e.target.value)}
                        className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none"
                    />
                </div>

                <div className="mt-3">
                    <label className="block text-sm text-stone-500 mb-1">Emplacement</label>
                    <SearchOrCreate
                        items={locations}
                        displayKey="name"
                        searchKeys={['name']}
                        value={selectedLocation}
                        onSelect={setSelectedLocation}
                        onClear={() => setSelectedLocation(stockUnit.location)}
                        onCreate={() => {}}
                        placeholder="Rechercher un emplacement..."
                    />
                </div>

                <div className="mt-4 flex flex-col gap-3">
                    {settings.defaultPrinterId && (
                        <button
                            onClick={() => setShowPrintModal(true)}
                            className="flex items-center justify-center gap-2 w-full py-3 rounded-lg border border-stone-200 text-earth hover:bg-sage-light/50"
                        >
                            <FontAwesomeIcon icon={faPrint} />
                            Imprimer l'étiquette
                        </button>
                    )}
                    <button
                        onClick={() => onConfirm(
                            dateValue ? new Date(dateValue) : null,
                            movedToNewLocation ? selectedLocation.id : null,
                        )}
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-earth text-white font-medium"
                    >
                        <FontAwesomeIcon icon={faCheck} />
                        Confirmer
                    </button>
                </div>
            </Modal>

            {showPrintModal && (
                <PrintModal
                    product={stockUnit.product}
                    expirationDate={dateValue ? new Date(dateValue) : null}
                    onClose={() => setShowPrintModal(false)}
                />
            )}
        </>
    )
}
