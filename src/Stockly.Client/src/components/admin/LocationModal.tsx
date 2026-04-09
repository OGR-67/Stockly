import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Modal } from '../Modal'
import { FormField } from '../FormField'
import { FieldWrapper } from '../FieldWrapper'
import { ConfirmButton } from '../ConfirmButton'
import { locationIcon } from '../../utils/locationIcons'
import type { StorageLocation, LocationType } from '../../models/StorageLocationModel'

interface LocationModalProps {
    initial?: StorageLocation
    onConfirm: (data: Omit<StorageLocation, 'id'>) => void
    onClose: () => void
}

const LOCATION_TYPES: { type: LocationType; label: string }[] = [
    { type: 'fridge', label: 'Réfrigérateur' },
    { type: 'freezer', label: 'Congélateur' },
    { type: 'normal', label: 'Placard' },
]

export function LocationModal({ initial, onConfirm, onClose }: LocationModalProps) {
    const [name, setName] = useState(initial?.name ?? '')
    const [type, setType] = useState<LocationType>(initial?.type ?? 'normal')

    return (
        <Modal title={initial ? 'Modifier l\'emplacement' : 'Nouvel emplacement'} onClose={onClose}>
            <div className="flex flex-col gap-4">
                <FormField label="Nom" value={name} onChange={setName} placeholder="Ex: Frigo cuisine" />

                <FieldWrapper label="Type">
                    <div className="flex flex-col gap-2">
                        {LOCATION_TYPES.map(({ type: t, label }) => (
                            <button
                                key={t}
                                onClick={() => setType(t)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${type === t ? 'border-earth bg-earth/10 text-earth' : 'border-stone-200 text-stone-600'}`}
                            >
                                <FontAwesomeIcon icon={locationIcon(t)} />
                                {label}
                            </button>
                        ))}
                    </div>
                </FieldWrapper>

                <ConfirmButton onClick={() => onConfirm({ name, type })} disabled={!name.trim()} />
            </div>
        </Modal>
    )
}
