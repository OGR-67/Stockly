import { faTemperatureQuarter, faSnowflake, faCubesStacked } from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons'
import type { LocationType } from '../models/StorageLocationModel'

export function locationIcon(type: LocationType): IconDefinition {
    switch (type) {
        case 'fridge': return faTemperatureQuarter
        case 'freezer': return faSnowflake
        case 'normal': return faCubesStacked
    }
}
