import type { StockUnit, StockUnitDetail } from "../../models/stockUnitModel"

export interface IStockUnitService {
    getAll(): Promise<StockUnitDetail[]>
    getByLocation(locationId: string): Promise<StockUnitDetail[]>
    add(stockUnit: Omit<StockUnit, 'id' | 'createdAt' | 'isOpened' | 'openedAt' | 'consumedAt'>): Promise<StockUnit>
    open(id: string): Promise<StockUnit>
    move(id: string, locationId: string): Promise<StockUnit>
    consume(id: string): Promise<StockUnit>
    delete(id: string): Promise<void>
}
