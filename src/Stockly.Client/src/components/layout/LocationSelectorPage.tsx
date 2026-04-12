import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Fuse from 'fuse.js'
import { RootPage } from './RootPage'
import { LoadingSpinner } from './LoadingSpinner'
import { SearchInput } from '../SearchInput'
import { Card } from '../Card'
import { EmptyState } from '../EmptyState'
import { locationIcon } from '../../utils/locationIcons'
import { useLocations } from '../../hooks/queries/useLocations'

interface LocationSelectorPageProps {
    title: string
    onSelect: (locationId: string) => void
}

export function LocationSelectorPage({ title, onSelect }: LocationSelectorPageProps) {
    const { data: locations = [], isLoading, isError } = useLocations()
    const [query, setQuery] = useState('')

    const fuse = new Fuse(locations, { keys: ['name'], threshold: 0.3 })
    const filtered = query ? fuse.search(query).map(r => r.item) : locations

    return (
        <RootPage title={title}>
            <SearchInput
                value={query}
                onChange={setQuery}
                placeholder="Rechercher un emplacement..."
                className="mb-4"
            />

            {isLoading && <LoadingSpinner />}
            {isError && <EmptyState message="Erreur de chargement" error />}

            <div className="flex flex-col gap-3">
                {filtered.map(location => (
                    <Card
                        key={location.id}
                        onClick={() => onSelect(location.id)}
                        className="gap-4 p-4 active:bg-sage-light/50 transition-colors text-left"
                    >
                        <div className="w-10 h-10 rounded-full bg-sage-light flex items-center justify-center shrink-0">
                            <FontAwesomeIcon icon={locationIcon(location.type)} className="text-earth" />
                        </div>
                        <span className="text-base font-medium text-bark">{location.name}</span>
                    </Card>
                ))}
            </div>
        </RootPage>
    )
}
