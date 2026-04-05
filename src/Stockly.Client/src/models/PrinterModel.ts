export interface Printer {
    id: string
    name: string
    isDefault: boolean
}

export interface PrinterFormat {
    id: string
    name: string
    widthMm: number
    heightMm: number
}

export interface PrintJob {
    productName: string
    expirationDate: Date | null
    barcode: string
    note: string | null
}
