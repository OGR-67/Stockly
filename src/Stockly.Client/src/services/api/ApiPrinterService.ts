import type { Printer, PrinterFormat, DiscoveredPrinter } from '../../models/PrinterModel'
import type { IPrinterService } from '../interfaces/IPrinterService'
import { apiClient } from './apiClient'

export class ApiPrinterService implements IPrinterService {
    async getAll(): Promise<Printer[]> {
        return apiClient.get('/api/printers')
    }

    async getFormats(printerId: string): Promise<PrinterFormat[]> {
        return apiClient.get(`/api/printers/${printerId}/formats`)
    }

    async discover(): Promise<DiscoveredPrinter[]> {
        return apiClient.get('/api/printers/discover')
    }

    async register(name: string, queueName: string, port: number, isDefault: boolean): Promise<Printer> {
        return apiClient.post('/api/printers', { name, queueName, port, isDefault })
    }

    async delete(id: string): Promise<void> {
        return apiClient.del(`/api/printers/${id}`)
    }

    async print(printerId: string, formatId: string, imageBase64: string): Promise<void> {
        return apiClient.post(`/api/printers/${printerId}/print`, { formatId, imageBase64 })
    }
}
