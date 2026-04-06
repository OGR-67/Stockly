export interface Printer {
    id: string
    name: string
    ipAddress: string
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
    ipAddress: string
    port: number
}
