import { v4 as uuidv4 } from 'uuid'
import type { IStockUnitService } from '../interfaces/IStockUnitService'
import type { IProductService } from '../interfaces/IProductService'
import type { IStorageLocationService } from '../interfaces/IStorageLocationService'
import type { StockUnit, StockUnitDetail } from '../../models/StockUnitModel'
import { mockLocations } from './MockStorageLocationService'

const mockStockUnits: StockUnit[] = [
    {
        id: '1',
        productId: '2',
        locationId: mockLocations[0].id,
        expirationDate: new Date('2026-04-10'),
        isOpened: false,
        createdAt: new Date('2026-04-01'),
        openedAt: null,
        consumedAt: null,
    },
    {
        id: '2',
        productId: '2',
        locationId: mockLocations[0].id,
        expirationDate: new Date('2026-04-15'),
        isOpened: false,
        createdAt: new Date('2026-04-01'),
        openedAt: null,
        consumedAt: null,
    },
    {
        id: '3',
        productId: '3',
        locationId: mockLocations[1].id,
        expirationDate: new Date('2026-04-05'),
        isOpened: true,
        createdAt: new Date('2026-03-28'),
        openedAt: new Date('2026-04-01'),
        consumedAt: null,
    },
]

export class MockStockUnitService implements IStockUnitService {
    private data: StockUnit[] = [...mockStockUnits]
    private productService: IProductService
    private locationService: IStorageLocationService

    constructor(productService: IProductService, locationService: IStorageLocationService) {
        this.productService = productService
        this.locationService = locationService
    }

    private async toDetail(stockUnit: StockUnit): Promise<StockUnitDetail> {
        const product = await this.productService.getById(stockUnit.productId)
        const location = await this.locationService.getById(stockUnit.locationId)
        return {
            ...stockUnit,
            product: product!,
            location: location!,
        }
    }

    async getAll(): Promise<StockUnitDetail[]> {
        const active = this.data.filter(s => s.consumedAt === null)
        return Promise.all(active.map(s => this.toDetail(s)))
    }

    async getByLocation(locationId: string): Promise<StockUnitDetail[]> {
        const active = this.data.filter(s => s.locationId === locationId && s.consumedAt === null)
        return Promise.all(active.map(s => this.toDetail(s)))
    }

    async add(stockUnit: Omit<StockUnit, 'id' | 'createdAt' | 'isOpened' | 'openedAt' | 'consumedAt'>): Promise<StockUnit> {
        const newStockUnit: StockUnit = {
            id: uuidv4(),
            ...stockUnit,
            isOpened: false,
            createdAt: new Date(),
            openedAt: null,
            consumedAt: null,
        }
        this.data.push(newStockUnit)
        return newStockUnit
    }

    async open(id: string): Promise<StockUnit> {
        const index = this.data.findIndex(s => s.id === id)
        if (index === -1) throw new Error(`StockUnit ${id} not found`)
        this.data[index] = {
            ...this.data[index],
            isOpened: true,
            openedAt: new Date(),
        }
        return this.data[index]
    }

    async move(id: string, locationId: string): Promise<StockUnit> {
        const index = this.data.findIndex(s => s.id === id)
        if (index === -1) throw new Error(`StockUnit ${id} not found`)
        this.data[index] = {
            ...this.data[index],
            locationId,
        }
        return this.data[index]
    }

    async consume(id: string): Promise<StockUnit> {
        const index = this.data.findIndex(s => s.id === id)
        if (index === -1) throw new Error(`StockUnit ${id} not found`)
        this.data[index] = {
            ...this.data[index],
            consumedAt: new Date(),
        }
        return this.data[index]
    }

    async delete(id: string): Promise<void> {
        this.data = this.data.filter(s => s.id !== id)
    }
}
