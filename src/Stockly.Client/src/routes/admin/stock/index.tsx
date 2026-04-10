import { useState, useMemo } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { StackPage } from '../../../components/layout/StackPage'
import { LoadingSpinner } from '../../../components/layout/LoadingSpinner'
import { SearchInput } from '../../../components/SearchInput'
import { StockUnitCard } from '../../../components/stock/StockUnitCard'
import { OpenModal } from '../../../components/stock/OpenModal'
import { TransferModal } from '../../../components/stock/TransferModal'
import { StockUnitEditModal } from '../../../components/stock/StockUnitEditModal'
import { useAllStockUnits, useAllStockUnitMutations } from '../../../hooks/queries/useStockUnits'
import { useLocations } from '../../../hooks/queries/useLocations'
import { getExpiryStatus } from '../../../utils/expiryStatus'
import type { StockUnitDetail } from '../../../models/StockUnitModel'

export const Route = createFileRoute('/admin/stock/')({
    validateSearch: (search: Record<string, unknown>) => {
        const f = search.filter
        return { filter: (f === 'soon' || f === 'expired') ? f : undefined }
    },
    component: RouteComponent,
})

function RouteComponent() {
    const { filter: initialFilter } = Route.useSearch()
    const { data: allUnits = [], isLoading } = useAllStockUnits()
    const { data: allLocations = [] } = useLocations()
    const { update, open, move, consume } = useAllStockUnitMutations()

    const [query, setQuery] = useState('')
    const [activeFilter, setActiveFilter] = useState<'soon' | 'expired' | undefined>(
        initialFilter as 'soon' | 'expired' | undefined
    )
    const [expandedLocations, setExpandedLocations] = useState<Set<string>>(new Set())
    const [openModalUnit, setOpenModalUnit] = useState<StockUnitDetail | null>(null)
    const [transferModalUnit, setTransferModalUnit] = useState<StockUnitDetail | null>(null)
    const [editModalUnit, setEditModalUnit] = useState<StockUnitDetail | null>(null)

    const filtered = useMemo(() => {
        let units = allUnits
        if (query.trim()) {
            const q = query.toLowerCase()
            units = units.filter(u => u.product.name.toLowerCase().includes(q))
        }
        if (activeFilter === 'expired') {
            units = units.filter(u => getExpiryStatus(u.expirationDate) === 'expired')
        } else if (activeFilter === 'soon') {
            units = units.filter(u => getExpiryStatus(u.expirationDate) === 'soon')
        }
        return units
    }, [allUnits, query, activeFilter])

    const byLocation = useMemo(() => {
        const map = new Map<string, StockUnitDetail[]>()
        for (const unit of filtered) {
            if (!map.has(unit.locationId)) map.set(unit.locationId, [])
            map.get(unit.locationId)!.push(unit)
        }
        return map
    }, [filtered])

    function toggleLocation(id: string) {
        setExpandedLocations(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    async function handleOpen(_newExpirationDate: Date | null, newLocationId: string | null) {
        const unit = openModalUnit!
        await open.mutateAsync(unit.id)
        if (newLocationId) await move.mutateAsync({ id: unit.id, targetLocationId: newLocationId })
        setOpenModalUnit(null)
    }

    async function handleTransfer(destinationLocationId: string) {
        const unit = transferModalUnit ?? editModalUnit
        if (!unit) return
        await move.mutateAsync({ id: unit.id, targetLocationId: destinationLocationId })
        setTransferModalUnit(null)
    }

    return (
        <StackPage title="Unités de stock">
            <div className="flex flex-col gap-3 mb-4">
                <SearchInput value={query} onChange={setQuery} placeholder="Rechercher un article..." />
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveFilter(f => f === 'soon' ? undefined : 'soon')}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${activeFilter === 'soon' ? 'bg-orange-100 text-orange-600 border-orange-200' : 'bg-cream border-stone-200 text-stone-500'}`}
                    >
                        Bientôt périmés
                    </button>
                    <button
                        onClick={() => setActiveFilter(f => f === 'expired' ? undefined : 'expired')}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${activeFilter === 'expired' ? 'bg-red-100 text-red-600 border-red-200' : 'bg-cream border-stone-200 text-stone-500'}`}
                    >
                        Périmés
                    </button>
                </div>
            </div>

            {isLoading && <LoadingSpinner />}

            <div className="flex flex-col gap-3">
                {[...byLocation.entries()].map(([locationId, units]) => {
                    const locationName = units[0].location.name
                    const expanded = expandedLocations.has(locationId)
                    return (
                        <div key={locationId}>
                            <div
                                onClick={() => toggleLocation(locationId)}
                                className="flex items-center gap-3 p-3 bg-cream rounded-xl shadow-sm border-2 border-sage/50 cursor-pointer"
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-bark truncate">
                                        {locationName}{' '}
                                        <span className="text-stone-400 font-normal">({units.length})</span>
                                    </p>
                                </div>
                                <FontAwesomeIcon
                                    icon={expanded ? faChevronDown : faChevronRight}
                                    className="text-stone-400 text-sm shrink-0"
                                />
                            </div>

                            {expanded && (
                                <div className="ml-3 mt-2 flex flex-col gap-2">
                                    {units.map(unit => (
                                        <StockUnitCard
                                            key={unit.id}
                                            unit={unit}
                                            onEdit={setEditModalUnit}
                                            onOpen={setOpenModalUnit}
                                            onTransfer={setTransferModalUnit}
                                            onConsume={(id) => consume.mutate(id)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )
                })}
                {!isLoading && byLocation.size === 0 && (
                    <p className="text-center text-stone-400 py-8">Aucun article</p>
                )}
            </div>

            {openModalUnit && (
                <OpenModal
                    stockUnit={openModalUnit}
                    locations={allLocations}
                    onConfirm={handleOpen}
                    onClose={() => setOpenModalUnit(null)}
                />
            )}
            {transferModalUnit && (
                <TransferModal
                    stockUnit={transferModalUnit}
                    locations={allLocations}
                    onConfirm={handleTransfer}
                    onClose={() => setTransferModalUnit(null)}
                />
            )}
            {editModalUnit && (
                <StockUnitEditModal
                    stockUnit={editModalUnit}
                    locations={allLocations}
                    onSave={async (expirationDate, freeText) => {
                        await update.mutateAsync({ id: editModalUnit.id, data: { expirationDate, freeText } })
                    }}
                    onOpen={(unit) => { setEditModalUnit(null); setOpenModalUnit(unit) }}
                    onConsume={(unit) => { consume.mutate(unit.id) }}
                    onTransfer={async (destinationLocationId) => {
                        await move.mutateAsync({ id: editModalUnit.id, targetLocationId: destinationLocationId })
                    }}
                    onClose={() => setEditModalUnit(null)}
                />
            )}
        </StackPage>
    )
}
