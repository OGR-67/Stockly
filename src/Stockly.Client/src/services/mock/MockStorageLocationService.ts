import { v4 as uuidv4 } from 'uuid'
import type { IStorageLocationService } from '../interfaces/IStorageLocationService'
import type { StorageLocation } from '../../models/StorageLocationModel'

const mockData: StorageLocation[] = [
    { id: uuidv4(), name: 'Frigo', type: 'fridge' },
    { id: uuidv4(), name: 'Congélateur', type: 'freezer' },
    { id: uuidv4(), name: 'Placard cuisine', type: 'normal' },
    { id: uuidv4(), name: 'Cave', type: 'normal' },
]

export class MockStorageLocationService implements IStorageLocationService {
    private data: StorageLocation[] = [...mockData]

    async getAll(): Promise<StorageLocation[]> {
        return this.data
    }

    async getById(id: string): Promise<StorageLocation | null> {
        return this.data.find(l => l.id === id) ?? null
    }

    async create(location: Omit<StorageLocation, 'id'>): Promise<StorageLocation> {
        const newLocation: StorageLocation = { id: uuidv4(), ...location }
        this.data.push(newLocation)
        return newLocation
    }

    async update(id: string, location: Omit<StorageLocation, 'id'>): Promise<StorageLocation> {
        const index = this.data.findIndex(l => l.id === id)
        if (index === -1) throw new Error(`StorageLocation ${id} not found`)
        this.data[index] = { id, ...location }
        return this.data[index]
    }

    async delete(id: string): Promise<void> {
        this.data = this.data.filter(l => l.id !== id)
    }
}
