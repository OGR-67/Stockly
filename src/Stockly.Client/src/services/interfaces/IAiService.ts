import type { AiConnectionTestResult } from '../../models/SettingsModel'

export interface IAiService {
    testConnection(): Promise<AiConnectionTestResult>
}
