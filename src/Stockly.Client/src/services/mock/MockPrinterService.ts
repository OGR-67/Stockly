import type { IPrinterService } from '../interfaces/IPrinterService'
import type { Printer, PrinterFormat, DiscoveredPrinter } from '../../models/PrinterModel'

export class MockPrinterService implements IPrinterService {
    async getAll(): Promise<Printer[]> { return [] }
    async getFormats(_printerId: string): Promise<PrinterFormat[]> { return [] }
    async discover(): Promise<DiscoveredPrinter[]> { return [] }
    async register(name: string, ipAddress: string, port: number, isDefault: boolean): Promise<Printer> {
        return { id: crypto.randomUUID(), name, ipAddress, port, isDefault }
    }
    async delete(_id: string): Promise<void> {}
    async print(_printerId: string, _formatId: string, _imageBase64: string): Promise<void> {
        console.log('Mock print')
    }
}
