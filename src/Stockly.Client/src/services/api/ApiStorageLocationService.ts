import type { StorageLocation } from '../../models/StorageLocationModel'
import type { IStorageLocationService } from '../interfaces/IStorageLocationService'
import { apiClient } from './apiClient'

export class ApiStorageLocationService implements IStorageLocationService {
    async getAll(): Promise<StorageLocation[]> {
        return apiClient.get('/api/storage-locations')
    }

    async getById(id: string): Promise<StorageLocation | null> {
        try {
            return await apiClient.get(`/api/storage-locations/${id}`)
        } catch (e: unknown) {
            if ((e as { status?: number }).status === 404) return null
            throw e
        }
    }

    async create(location: Omit<StorageLocation, 'id'>): Promise<StorageLocation> {
        return apiClient.post('/api/storage-locations', location)
    }

    async update(id: string, location: Omit<StorageLocation, 'id'>): Promise<StorageLocation> {
        return apiClient.put(`/api/storage-locations/${id}`, location)
    }

    async delete(id: string): Promise<void> {
        return apiClient.del(`/api/storage-locations/${id}`)
    }
}
