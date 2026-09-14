import { useMutation } from '@tanstack/react-query'
import { aiService } from '../../services'

export function useAiConnectionTest() {
    return useMutation({
        mutationFn: () => aiService.testConnection(),
    })
}
