import type { AiConnectionTestResult } from '../../models/SettingsModel'
import type { ReceiptItem } from '../../models/AiModel'
import type { IAiService } from '../interfaces/IAiService'
import { apiClient } from './apiClient'

export class ApiAiService implements IAiService {
    async testConnection(): Promise<AiConnectionTestResult> {
        return apiClient.post('/api/ai/test-connection', undefined)
    }

    async parseReceipt(image: File): Promise<ReceiptItem[]> {
        const formData = new FormData()
        formData.append('image', image)
        return apiClient.postForm('/api/ai/parse-receipt', formData)
    }
}
