import type { StockUnitDetail } from '../models/StockUnitModel'

export interface StockGroup {
    key: string
    units: StockUnitDetail[]
}

export function groupUnits(units: StockUnitDetail[]): StockGroup[] {
    const map = new Map<string, StockUnitDetail[]>()
    for (const unit of units) {
        const dateStr = unit.expirationDate
            ? new Date(unit.expirationDate).toDateString()
            : 'null'
        const key = `${unit.productId}__${dateStr}`
        if (!map.has(key)) map.set(key, [])
        map.get(key)!.push(unit)
    }
    return [...map.entries()].map(([key, units]) => ({ key, units }))
}
