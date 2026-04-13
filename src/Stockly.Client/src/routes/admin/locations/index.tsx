import { createFileRoute } from '@tanstack/react-router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPencil, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons'
import { haptic } from 'ios-haptics'
import { StackPage } from '../../../components/layout/StackPage'
import { LoadingSpinner } from '../../../components/layout/LoadingSpinner'
import { SearchInput } from '../../../components/SearchInput'
import { Card } from '../../../components/Card'
import { IconButton } from '../../../components/IconButton'
import { EmptyState } from '../../../components/EmptyState'
import { LocationModal } from '../../../components/admin/LocationModal'
import { locationIcon } from '../../../utils/locationIcons'
import { useLocations, useLocationMutations } from '../../../hooks/queries/useLocations'
import { useCrudList } from '../../../hooks/useCrudList'
import type { StorageLocation } from '../../../models/StorageLocationModel'

export const Route = createFileRoute('/admin/locations/')({
    component: RouteComponent,
})

function RouteComponent() {
    const { data: locations = [], isLoading, isError } = useLocations()
    const { create, update, remove } = useLocationMutations()
    const { editTarget, setEditTarget, query, setQuery, filtered } = useCrudList(locations, ['name'])

    async function handleSave(data: Omit<StorageLocation, 'id'>) {
        if (editTarget === 'new') {
            await create.mutateAsync(data)
        } else {
            await update.mutateAsync({ id: editTarget!.id, data })
        }
        haptic.confirm()
        setEditTarget(null)
    }

    async function handleDelete(id: string) {
        if (!window.confirm('Supprimer cet emplacement ?')) return
        await remove.mutateAsync(id)
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
            <SearchInput value={query} onChange={setQuery} placeholder="Rechercher un emplacement..." className="mb-4" />

            {isLoading && <LoadingSpinner />}
            {isError && <EmptyState message="Erreur de chargement" error />}

            <div className="flex flex-col gap-3">
                {filtered.map(location => (
                    <Card key={location.id}>
                        <IconButton icon={locationIcon(location.type)} variant="primary" />
                        <span className="flex-1 font-medium text-bark">{location.name}</span>
                        <IconButton icon={faPencil} onClick={() => setEditTarget(location)} title="Modifier" />
                        <IconButton icon={faTrash} onClick={() => handleDelete(location.id)} title="Supprimer" />
                    </Card>
                ))}
                {!isLoading && filtered.length === 0 && (
                    <EmptyState message="Aucun emplacement" />
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
