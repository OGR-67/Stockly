import type { StorageLocation } from "../../models/StorageLocationModel"

export interface IStorageLocationService {
    getAll(): Promise<StorageLocation[]>
    getById(id: string): Promise<StorageLocation | null>
    create(location: Omit<StorageLocation, 'id'>): Promise<StorageLocation>
    update(id: string, location: Omit<StorageLocation, 'id'>): Promise<StorageLocation>
    delete(id: string): Promise<void>
}
