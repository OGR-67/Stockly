import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import { Modal } from '../Modal'
import { Toggle } from './Toggle'
import type { Category } from '../../models/CategoryModel'

interface CategoryModalProps {
    initial?: Category
    onConfirm: (data: Omit<Category, 'id'>) => void
    onClose: () => void
}

function parseNullableInt(value: string): number | null {
    const n = parseInt(value, 10)
    return isNaN(n) ? null : n
}


function DaysInput({ label, value, onChange }: { label: string; value: number | null; onChange: (v: number | null) => void }) {
    return (
        <div>
            <label className="block text-sm text-stone-500 mb-1">{label}</label>
            <input
                type="number"
                min="0"
                value={value ?? ''}
                onChange={(e) => onChange(parseNullableInt(e.target.value))}
                placeholder="—"
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none"
            />
        </div>
    )
}

export function CategoryModal({ initial, onConfirm, onClose }: CategoryModalProps) {
    const [name, setName] = useState(initial?.name ?? '')
    const [isPerishable, setIsPerishable] = useState(initial?.isPerishable ?? true)
    const [isFresh, setIsFresh] = useState(initial?.isFresh ?? false)
    const [defaultClosedDays, setDefaultClosedDays] = useState<number | null>(initial?.defaultClosedDays ?? null)
    const [defaultOpenedDays, setDefaultOpenedDays] = useState<number | null>(initial?.defaultOpenedDays ?? null)
    const [defaultFrozenDays, setDefaultFrozenDays] = useState<number | null>(initial?.defaultFrozenDays ?? null)
    const [freeText, setFreeText] = useState(initial?.freeText ?? '')

    return (
        <Modal title={initial ? 'Modifier la catégorie' : 'Nouvelle catégorie'} onClose={onClose}>
            <div className="flex flex-col gap-3">
                <div>
                    <label className="block text-sm text-stone-500 mb-1">Nom</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none"
                        placeholder="Ex: Viande cuite"
                    />
                </div>

                <div className="border border-stone-200 rounded-lg px-3 divide-y divide-stone-100">
                    <Toggle label="Périssable" checked={isPerishable} onChange={setIsPerishable} />
                    <Toggle label="Frais" checked={isFresh} onChange={setIsFresh} />
                </div>

                <DaysInput label="Jours fermé" value={defaultClosedDays} onChange={setDefaultClosedDays} />
                <DaysInput label="Jours ouvert" value={defaultOpenedDays} onChange={setDefaultOpenedDays} />
                <DaysInput label="Jours congelé" value={defaultFrozenDays} onChange={setDefaultFrozenDays} />

                <div>
                    <label className="block text-sm text-stone-500 mb-1">Note (optionnel)</label>
                    <input
                        type="text"
                        value={freeText}
                        onChange={(e) => setFreeText(e.target.value)}
                        className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none"
                    />
                </div>

                <button
                    onClick={() => onConfirm({ name, isPerishable, isFresh, defaultClosedDays, defaultOpenedDays, defaultFrozenDays, freeText: freeText || null })}
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
