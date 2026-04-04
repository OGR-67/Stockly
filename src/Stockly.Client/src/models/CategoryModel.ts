export interface Category {
    id: string
    name: string
    isPerishable: boolean
    isFresh: boolean
    defaultClosedDays: number | null
    defaultOpenedDays: number | null
    defaultFrozenDays: number | null
    freeText: string | null
}
