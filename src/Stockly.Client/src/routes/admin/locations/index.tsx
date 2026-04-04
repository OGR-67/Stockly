import { useState, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPencil, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons'
import { StackPage } from '../../../components/layout/StackPage'
import { LocationModal } from '../../../components/admin/LocationModal'
import { locationService } from '../../../services'
import { locationIcon } from '../../../utils/locationIcons'
import type { StorageLocation } from '../../../models/StorageLocationModel'

export const Route = createFileRoute('/admin/locations/')({
    component: RouteComponent,
})

function RouteComponent() {
    const [locations, setLocations] = useState<StorageLocation[]>([])
    const [editTarget, setEditTarget] = useState<StorageLocation | 'new' | null>(null)

    useEffect(() => {
        locationService.getAll().then(setLocations)
    }, [])

    async function handleSave(data: Omit<StorageLocation, 'id'>) {
        if (editTarget === 'new') {
            const created = await locationService.create(data)
            setLocations(prev => [...prev, { id: created.id, ...data }])
        } else {
            await locationService.update(editTarget!.id, data)
            setLocations(prev => prev.map(l => l.id === editTarget!.id ? { ...l, ...data } : l))
        }
        setEditTarget(null)
    }

    async function handleDelete(id: string) {
        if (!window.confirm('Supprimer cet emplacement ?')) return
        await locationService.delete(id)
        setLocations(prev => prev.filter(l => l.id !== id))
    }

    return (
        <StackPage
            title="Emplacements"
            action={
                <button onClick={() => setEditTarget('new')} className="text-white/80 hover:text-white">
                    <FontAwesomeIcon icon={faPlus} />
                </button>
            }
        >
            <div className="flex flex-col gap-3">
                {locations.map(location => (
                    <div
                        key={location.id}
                        className="flex items-center gap-3 p-3 bg-cream rounded-xl border border-sage/30"
                    >
                        <div className="w-9 h-9 rounded-full bg-sage-light flex items-center justify-center shrink-0">
                            <FontAwesomeIcon icon={locationIcon(location.type)} className="text-earth" />
                        </div>
                        <span className="flex-1 font-medium text-bark">{location.name}</span>
                        <button
                            onClick={() => setEditTarget(location)}
                            className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center"
                        >
                            <FontAwesomeIcon icon={faPencil} className="text-stone-500 text-sm" />
                        </button>
                        <button
                            onClick={() => handleDelete(location.id)}
                            className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center"
                        >
                            <FontAwesomeIcon icon={faTrash} className="text-stone-500 text-sm" />
                        </button>
                    </div>
                ))}
                {locations.length === 0 && (
                    <p className="text-center text-stone-400 py-8">Aucun emplacement</p>
                )}
            </div>

            {editTarget && (
                <LocationModal
                    initial={editTarget === 'new' ? undefined : editTarget}
                    onConfirm={handleSave}
                    onClose={() => setEditTarget(null)}
                />
            )}
        </StackPage>
    )
}
