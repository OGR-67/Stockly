import { useMutation } from '@tanstack/react-query'
import { aiService } from '../../services'

export function useParseReceipt() {
    return useMutation({
        mutationFn: (image: File) => aiService.parseReceipt(image),
    })
}
