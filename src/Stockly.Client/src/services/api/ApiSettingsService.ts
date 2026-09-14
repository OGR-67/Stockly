import type { Settings, SaveSettingsRequest } from '../../models/SettingsModel'
import type { ISettingsService } from '../interfaces/ISettingsService'
import { apiClient } from './apiClient'

export class ApiSettingsService implements ISettingsService {
    async get(): Promise<Settings> {
        return apiClient.get('/api/settings')
    }

    async update(request: SaveSettingsRequest): Promise<Settings> {
        return apiClient.put('/api/settings', request)
    }
}
