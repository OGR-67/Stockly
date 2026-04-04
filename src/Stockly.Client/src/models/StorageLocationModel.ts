export type LocationType = 'fridge' | 'freezer' | 'normal'

export interface StorageLocation {
    id: string
    name: string
    type: LocationType
}
