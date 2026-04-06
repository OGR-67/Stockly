import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { printerService } from '../../services'

export function usePrinters() {
    return useQuery({
        queryKey: ['printers'],
        queryFn: () => printerService.getAll(),
    })
}

export function usePrinterFormats(printerId: string | null) {
    return useQuery({
        queryKey: ['printerFormats', printerId],
        queryFn: () => printerService.getFormats(printerId!),
        enabled: !!printerId,
    })
}

export function usePrint() {
    return useMutation({
        mutationFn: ({ printerId, formatId, imageBase64 }: { printerId: string; formatId: string; imageBase64: string }) =>
            printerService.print(printerId, formatId, imageBase64),
    })
}

export function usePrinterMutations() {
    const qc = useQueryClient()
    const invalidate = () => qc.invalidateQueries({ queryKey: ['printers'] })

    const register = useMutation({
        mutationFn: ({ name, ipAddress, port, isDefault }: { name: string; ipAddress: string; port: number; isDefault: boolean }) =>
            printerService.register(name, ipAddress, port, isDefault),
        onSuccess: invalidate,
    })

    const remove = useMutation({
        mutationFn: (id: string) => printerService.delete(id),
        onSuccess: invalidate,
    })

    return { register, remove }
}
