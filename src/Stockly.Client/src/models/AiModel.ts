export interface ReceiptItem {
    productName: string
    quantity: number
    suggestedLocationId: string | null
    suggestedExpiration: string | null
    matchedProductId: string | null
}
