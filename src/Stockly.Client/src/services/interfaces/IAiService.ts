import type { AiConnectionTestResult } from '../../models/SettingsModel'
import type { ReceiptItem } from '../../models/AiModel'

export interface IAiService {
    testConnection(): Promise<AiConnectionTestResult>
    parseReceipt(image: File): Promise<ReceiptItem[]>
}
