import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPrint } from '@fortawesome/free-solid-svg-icons'
import { Modal } from '../Modal'
import { FormField } from '../FormField'
import { FieldWrapper } from '../FieldWrapper'
import { ConfirmButton } from '../ConfirmButton'
import { PrintModal } from '../PrintModal'
import { SearchOrCreate } from '../SearchOrCreate'
import { LocationModal } from '../admin/LocationModal'
import { useSettings } from '../../hooks/useSettings'
import { useLocationMutations } from '../../hooks/queries/useLocations'
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
    const [showLocationModal, setShowLocationModal] = useState(false)
    const { settings } = useSettings()
    const { create: createLocation } = useLocationMutations()

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

                <FormField label="Nouvelle DLC" type="date" value={dateValue} onChange={setDateValue} className="mt-3" />

                <FieldWrapper label="Emplacement" className="mt-3">
                    <SearchOrCreate
                        items={locations}
                        displayKey="name"
                        searchKeys={['name']}
                        value={selectedLocation}
                        onSelect={setSelectedLocation}
                        onClear={() => setSelectedLocation(stockUnit.location)}
                        onCreate={() => setShowLocationModal(true)}
                        placeholder="Rechercher un emplacement..."
                    />
                </FieldWrapper>

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
                    <ConfirmButton
                        onClick={() => onConfirm(
                            dateValue ? new Date(dateValue) : null,
                            movedToNewLocation ? selectedLocation.id : null,
                        )}
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

            {showLocationModal && (
                <LocationModal
                    onConfirm={async (data) => {
                        const created = await createLocation.mutateAsync(data)
                        const newLoc = { id: created.id, ...data }
                        setSelectedLocation(newLoc)
                        setShowLocationModal(false)
                    }}
                    onClose={() => setShowLocationModal(false)}
                />
            )}
        </>
    )
}
