import type { Printer, PrinterFormat, PrintJob } from '../../models/PrinterModel'

export interface IPrinterService {
    getAll(): Promise<Printer[]>
    getFormats(printerId: string): Promise<PrinterFormat[]>
    print(printerId: string, formatId: string, job: PrintJob): Promise<void>
}
