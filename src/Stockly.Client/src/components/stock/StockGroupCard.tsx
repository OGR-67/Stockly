import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { ExpiryBadge } from './ExpiryBadge'
import { StockUnitCard } from './StockUnitCard'
import type { StockGroup } from '../../utils/sortByExpiry'
import type { StockUnitDetail } from '../../models/StockUnitModel'

interface StockGroupCardProps {
    group: StockGroup
    expanded: boolean
    onToggle: () => void
    onEdit: (unit: StockUnitDetail) => void
    onOpen: (unit: StockUnitDetail) => void
    onTransfer: (unit: StockUnitDetail) => void
    onConsume: (id: string) => void
}

export function StockGroupCard({ group, expanded, onToggle, onEdit, onOpen, onTransfer, onConsume }: StockGroupCardProps) {
    const first = group.units[0]
    const count = group.units.length

    return (
        <div>
            <div
                onClick={onToggle}
                className="flex items-center gap-3 p-3 bg-cream rounded-xl shadow-sm border-2 border-sage/50 cursor-pointer"
            >
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-bark truncate">
                        {first.product.name}{' '}
                        <span className="text-stone-400 font-normal">({count})</span>
                    </p>
                    <div className="flex items-center gap-2 flex-wrap mt-0.5">
                        <p className="text-xs text-stone-500">
                            DLC :{' '}
                            {first.expirationDate
                                ? new Date(first.expirationDate).toLocaleDateString('fr-FR')
                                : '—'}
                        </p>
                        <ExpiryBadge date={first.expirationDate} />
                    </div>
                </div>
                <FontAwesomeIcon
                    icon={expanded ? faChevronDown : faChevronRight}
                    className="text-stone-400 text-sm shrink-0"
                />
            </div>

            {expanded && (
                <div className="ml-3 mt-2 flex flex-col gap-2">
                    {group.units.map((unit) => (
                        <StockUnitCard
                            key={unit.id}
                            unit={unit}
                            onEdit={onEdit}
                            onOpen={onOpen}
                            onTransfer={onTransfer}
                            onConsume={onConsume}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
