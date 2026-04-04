import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import { Modal } from '../Modal'
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
                <div>
                    <label className="block text-sm text-stone-500 mb-1">Nom</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none"
                        placeholder="Ex: Frigo cuisine"
                    />
                </div>

                <div>
                    <label className="block text-sm text-stone-500 mb-2">Type</label>
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
                </div>

                <button
                    onClick={() => onConfirm({ name, type })}
                    disabled={!name.trim()}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-earth text-white font-medium disabled:opacity-50"
                >
                    <FontAwesomeIcon icon={faCheck} />
                    Confirmer
                </button>
            </div>
        </Modal>
    )
}
