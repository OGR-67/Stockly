import { faArrowUpFromBracket, faBoxOpen, faArrowRightArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { Card } from '../Card'
import { IconButton } from '../IconButton'
import { Badge } from '../Badge'
import { ExpiryBadge } from './ExpiryBadge'
import type { StockUnitDetail } from '../../models/StockUnitModel'

interface StockUnitCardProps {
    unit: StockUnitDetail
    onEdit: (unit: StockUnitDetail) => void
    onOpen: (unit: StockUnitDetail) => void
    onTransfer: (unit: StockUnitDetail) => void
    onConsume: (id: string) => void
}

export function StockUnitCard({ unit, onEdit, onOpen, onTransfer, onConsume }: StockUnitCardProps) {
    return (
        <Card>
            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onEdit(unit)}>
                <p className="font-medium text-bark truncate">{unit.product.name}</p>
                {(unit.freeText ?? unit.product.freeText) && (
                    <p className="text-sm text-stone-400 truncate">
                        {unit.freeText ?? unit.product.freeText}
                    </p>
                )}
                <div className="flex items-center gap-2 flex-wrap mt-0.5">
                    <p className="text-xs text-stone-500">
                        DLC :{' '}
                        {unit.expirationDate
                            ? new Date(unit.expirationDate).toLocaleDateString('fr-FR')
                            : '—'}
                    </p>
                    <ExpiryBadge date={unit.expirationDate} />
                    {unit.isOpened && (
                        <Badge variant="earth">Ouvert</Badge>
                    )}
                </div>
            </div>
            <div className="flex gap-2">
                <IconButton icon={faArrowUpFromBracket} onClick={() => onConsume(unit.id)} title="Sortir du stock" />
                {!unit.isOpened && unit.product.category.defaultOpenedDays !== null && (
                    <IconButton icon={faBoxOpen} onClick={() => onOpen(unit)} variant="primary" title="Ouvrir" />
                )}
                <IconButton icon={faArrowRightArrowLeft} onClick={() => onTransfer(unit)} variant="primary" title="Transférer" />
            </div>
        </Card>
    )
}
