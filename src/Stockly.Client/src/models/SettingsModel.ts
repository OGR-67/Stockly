export type AiProvider = 'none' | 'anthropic' | 'openAi'

export interface Settings {
    id: string
    aiProvider: AiProvider
    hasAiApiKey: boolean
}

export interface SaveSettingsRequest {
    aiProvider: AiProvider
    aiApiKey?: string | null
}
