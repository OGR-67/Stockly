import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { locationService } from '../../services'
import { queryKeys } from './queryKeys'
import type { StorageLocation } from '../../models/StorageLocationModel'

export function useLocations() {
    return useQuery({
        queryKey: queryKeys.locations,
        queryFn: () => locationService.getAll(),
    })
}

export function useLocation(id: string) {
    return useQuery({
        queryKey: queryKeys.location(id),
        queryFn: () => locationService.getById(id),
    })
}

export function useLocationMutations() {
    const qc = useQueryClient()
    const invalidate = () => qc.invalidateQueries({ queryKey: queryKeys.locations })

    const create = useMutation({
        mutationFn: (data: Omit<StorageLocation, 'id'>) => locationService.create(data),
        onSuccess: invalidate,
    })
    const update = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Omit<StorageLocation, 'id'> }) => locationService.update(id, data),
        onSuccess: invalidate,
    })
    const remove = useMutation({
        mutationFn: (id: string) => locationService.delete(id),
        onSuccess: invalidate,
    })

    return { create, update, remove }
}
