import type { AiConnectionTestResult } from '../../models/SettingsModel'
import type { IAiService } from '../interfaces/IAiService'
import { apiClient } from './apiClient'

export class ApiAiService implements IAiService {
    async testConnection(): Promise<AiConnectionTestResult> {
        return apiClient.post('/api/ai/test-connection', undefined)
    }
}
