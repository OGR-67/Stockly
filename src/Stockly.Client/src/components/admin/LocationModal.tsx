import { useState } from 'react'
import { Modal } from '../Modal'
import { FormField } from '../FormField'
import { FieldWrapper } from '../FieldWrapper'
import { ConfirmButton } from '../ConfirmButton'
import { ToggleGroup } from '../ToggleGroup'
import { locationIcon } from '../../utils/locationIcons'
import type { StorageLocation, LocationType } from '../../models/StorageLocationModel'

interface LocationModalProps {
    initial?: StorageLocation
    onConfirm: (data: Omit<StorageLocation, 'id'>) => void
    onClose: () => void
}

const LOCATION_TYPES = [
    { value: 'fridge' as LocationType, label: 'Réfrigérateur', icon: locationIcon('fridge') },
    { value: 'freezer' as LocationType, label: 'Congélateur', icon: locationIcon('freezer') },
    { value: 'normal' as LocationType, label: 'Placard', icon: locationIcon('normal') },
]

export function LocationModal({ initial, onConfirm, onClose }: LocationModalProps) {
    const [name, setName] = useState(initial?.name ?? '')
    const [type, setType] = useState<LocationType>(initial?.type ?? 'normal')

    return (
        <Modal title={initial ? 'Modifier l\'emplacement' : 'Nouvel emplacement'} onClose={onClose}>
            <div className="flex flex-col gap-4">
                <FormField label="Nom" value={name} onChange={setName} placeholder="Ex: Frigo cuisine" />

                <FieldWrapper label="Type">
                    <ToggleGroup
                        options={LOCATION_TYPES}
                        value={type}
                        onChange={setType}
                        variant="secondary"
                    />
                </FieldWrapper>

                <ConfirmButton onClick={() => onConfirm({ name, type })} disabled={!name.trim()} />
            </div>
        </Modal>
    )
}
