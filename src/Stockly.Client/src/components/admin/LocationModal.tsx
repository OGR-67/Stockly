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
    const [description, setDescription] = useState(initial?.description ?? '')

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

                <FieldWrapper label="Description (optionnel)">
                    <textarea
                        value={description}
                        onChange={(e) => { setDescription(e.target.value) }}
                        placeholder="Ex: stock longue durée — PQ, conserves, épicerie sèche"
                        rows={2}
                        className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none resize-none"
                    />
                    <p className="text-xs text-stone-400 mt-1">
                        Aide l'IA à choisir cet emplacement lors du rangement automatique.
                    </p>
                </FieldWrapper>

                <ConfirmButton
                    onClick={() => onConfirm({ name, type, description: description.trim() || null })}
                    disabled={!name.trim()}
                />
            </div>
        </Modal>
    )
}
