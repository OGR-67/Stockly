import { useState } from 'react'
import { Modal } from '../Modal'
import { FormField } from '../FormField'
import { ConfirmButton } from '../ConfirmButton'
import { Toggle } from './Toggle'
import { DaysInput } from './DaysInput'
import type { Category } from '../../models/CategoryModel'

interface CategoryModalProps {
    initial?: Category
    onConfirm: (data: Omit<Category, 'id'>) => void
    onClose: () => void
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
                <FormField label="Nom" value={name} onChange={setName} placeholder="Ex: Viande cuite" />

                <div className="border border-stone-200 rounded-lg px-3 divide-y divide-stone-100">
                    <Toggle label="Périssable" checked={isPerishable} onChange={setIsPerishable} />
                    <Toggle label="Frais" checked={isFresh} onChange={setIsFresh} />
                </div>

                <DaysInput label="Jours fermé" value={defaultClosedDays} onChange={setDefaultClosedDays} />
                <DaysInput label="Jours ouvert" value={defaultOpenedDays} onChange={setDefaultOpenedDays} />
                <DaysInput label="Jours congelé" value={defaultFrozenDays} onChange={setDefaultFrozenDays} />

                <FormField label="Note (optionnel)" value={freeText} onChange={setFreeText} />

                <ConfirmButton
                    onClick={() => onConfirm({ name, isPerishable, isFresh, defaultClosedDays, defaultOpenedDays, defaultFrozenDays, freeText: freeText || null })}
                    disabled={!name.trim()}
                />
            </div>
        </Modal>
    )
}
