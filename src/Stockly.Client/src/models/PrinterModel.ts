export interface Printer {
    id: string
    name: string
    queueName: string
    port: number
    isDefault: boolean
}

export interface PrinterFormat {
    id: string
    name: string
    widthMm: number
    heightMm: number
}

export interface DiscoveredPrinter {
    name: string
    queueName: string
    port: number
}
