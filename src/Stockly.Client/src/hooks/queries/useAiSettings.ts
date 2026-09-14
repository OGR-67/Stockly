import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { settingsService } from '../../services'
import type { SaveSettingsRequest } from '../../models/SettingsModel'

export function useAiSettings() {
    return useQuery({
        queryKey: ['ai-settings'],
        queryFn: () => settingsService.get(),
    })
}

export function useAiSettingsMutations() {
    const qc = useQueryClient()

    const update = useMutation({
        mutationFn: (request: SaveSettingsRequest) => settingsService.update(request),
        onSuccess: (data) => qc.setQueryData(['ai-settings'], data),
    })

    return { update }
}
