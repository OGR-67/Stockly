import type { IPrinterService } from '../interfaces/IPrinterService'
import type { Printer, PrinterFormat, PrintJob } from '../../models/PrinterModel'

const mockPrinters: Printer[] = [
    { id: 'p1', name: 'Brother QL-810W', isDefault: true },
]

const mockFormats: Record<string, PrinterFormat[]> = {
    p1: [
        { id: 'f1', name: '62mm × 29mm', widthMm: 62, heightMm: 29 },
        { id: 'f2', name: '62mm × 100mm', widthMm: 62, heightMm: 100 },
    ],
}

export class MockPrinterService implements IPrinterService {
    async getAll(): Promise<Printer[]> {
        return mockPrinters
    }

    async getFormats(printerId: string): Promise<PrinterFormat[]> {
        return mockFormats[printerId] ?? []
    }

    async print(_printerId: string, _formatId: string, job: PrintJob): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 500))
        console.log('🖨️ Impression simulée', job)
    }
}
