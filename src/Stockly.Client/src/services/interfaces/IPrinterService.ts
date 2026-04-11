import type { Printer, PrinterFormat, DiscoveredPrinter } from '../../models/PrinterModel'

export interface IPrinterService {
    getAll(): Promise<Printer[]>
    getFormats(printerId: string): Promise<PrinterFormat[]>
    discover(): Promise<DiscoveredPrinter[]>
    register(name: string, queueName: string, port: number, isDefault: boolean): Promise<Printer>
    delete(id: string): Promise<void>
    print(printerId: string, formatId: string, imageBase64: string): Promise<void>
}
