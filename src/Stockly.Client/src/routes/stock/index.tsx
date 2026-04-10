import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Fuse from 'fuse.js'
import { RootPage } from '../../components/layout/RootPage'
import { LoadingSpinner } from '../../components/layout/LoadingSpinner'
import { SearchInput } from '../../components/SearchInput'
import { locationIcon } from '../../utils/locationIcons'
import { useLocations } from '../../hooks/queries/useLocations'
import { useAllStockUnits } from '../../hooks/queries/useStockUnits'
import { getExpiryStatus } from '../../utils/expiryStatus'

export const Route = createFileRoute('/stock/')({
    component: RouteComponent,
})

function RouteComponent() {
    const navigate = useNavigate()
    const { data: locations = [], isLoading, isError } = useLocations()
    const { data: allUnits = [] } = useAllStockUnits()
    const [query, setQuery] = useState('')

    const expiredCount = allUnits.filter(u => getExpiryStatus(u.expirationDate) === 'expired').length
    const soonCount = allUnits.filter(u => getExpiryStatus(u.expirationDate) === 'soon').length

    const fuse = new Fuse(locations, { keys: ['name'], threshold: 0.3 })
    const filtered = query ? fuse.search(query).map(r => r.item) : locations

    return (
        <RootPage title="Stock">
            {expiredCount > 0 && (
                <button
                    onClick={() => navigate({ to: '/admin/stock', search: { filter: 'expired' } })}
                    className="flex items-center justify-between w-full mb-3 px-4 py-3 rounded-xl bg-red-100 border border-red-200 text-red-600 text-sm font-medium"
                >
                    <span>{expiredCount} article{expiredCount > 1 ? 's' : ''} périmé{expiredCount > 1 ? 's' : ''}</span>
                    <span className="text-xs opacity-70">Voir →</span>
                </button>
            )}
            {soonCount > 0 && (
                <button
                    onClick={() => navigate({ to: '/admin/stock', search: { filter: 'soon' } })}
                    className="flex items-center justify-between w-full mb-3 px-4 py-3 rounded-xl bg-orange-100 border border-orange-200 text-orange-600 text-sm font-medium"
                >
                    <span>{soonCount} article{soonCount > 1 ? 's' : ''} bientôt périmé{soonCount > 1 ? 's' : ''}</span>
                    <span className="text-xs opacity-70">Voir →</span>
                </button>
            )}

            <SearchInput
                value={query}
                onChange={setQuery}
                placeholder="Rechercher un emplacement..."
                className="mb-4"
            />

            {isLoading && <LoadingSpinner />}
            {isError && <p className="text-center text-stone-400 py-8">Erreur de chargement</p>}

            <div className="flex flex-col gap-3">
                {filtered.map(location => (
                    <button
                        key={location.id}
                        onClick={() => navigate({ to: '/stock/$locationId', params: { locationId: location.id } })}
                        className="flex items-center gap-4 p-4 bg-cream rounded-xl shadow-sm border border-sage/30 active:bg-sage-light/50 transition-colors text-left"
                    >
                        <div className="w-10 h-10 rounded-full bg-sage-light flex items-center justify-center">
                            <FontAwesomeIcon icon={locationIcon(location.type)} className="text-earth" />
                        </div>
                        <span className="text-base font-medium text-bark">{location.name}</span>
                    </button>
                ))}
            </div>
        </RootPage>
    )
}
