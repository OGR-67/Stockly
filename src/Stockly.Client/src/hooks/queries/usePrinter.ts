import { useQuery, useMutation } from '@tanstack/react-query'
import { printerService } from '../../services'
import type { PrintJob } from '../../models/PrinterModel'

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
        mutationFn: ({ printerId, formatId, job }: { printerId: string; formatId: string; job: PrintJob }) =>
            printerService.print(printerId, formatId, job),
    })
}
