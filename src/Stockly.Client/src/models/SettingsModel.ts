export type AiProvider = 'none' | 'anthropic' | 'openAi'

export interface Settings {
    id: string
    aiProvider: AiProvider
    hasAiApiKey: boolean
    aiModel: string
}

export interface SaveSettingsRequest {
    aiProvider: AiProvider
    aiApiKey?: string | null
    aiModel?: string | null
}

export interface AiConnectionTestResult {
    success: boolean
    errorMessage: string | null
}
