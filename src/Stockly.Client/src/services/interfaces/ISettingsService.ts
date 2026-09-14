import type { Settings, SaveSettingsRequest } from '../../models/SettingsModel'

export interface ISettingsService {
    get(): Promise<Settings>
    update(request: SaveSettingsRequest): Promise<Settings>
}
