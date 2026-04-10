import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { stockUnitService } from '../../services'
import { queryKeys } from './queryKeys'
import type { StockUnit } from '../../models/StockUnitModel'

export function useAllStockUnits() {
    return useQuery({
        queryKey: queryKeys.allStockUnits,
        queryFn: () => stockUnitService.getAll(),
    })
}

export function useAllStockUnitMutations() {
    const qc = useQueryClient()
    const invalidate = () => qc.invalidateQueries({ queryKey: queryKeys.allStockUnits })

    const update = useMutation({
        mutationFn: ({ id, data }: { id: string; data: { expirationDate: Date | null; freeText: string | null } }) =>
            stockUnitService.update(id, data),
        onSuccess: invalidate,
    })
    const open = useMutation({
        mutationFn: (id: string) => stockUnitService.open(id),
        onSuccess: invalidate,
    })
    const move = useMutation({
        mutationFn: ({ id, targetLocationId }: { id: string; targetLocationId: string }) =>
            stockUnitService.move(id, targetLocationId),
        onSuccess: invalidate,
    })
    const consume = useMutation({
        mutationFn: (id: string) => stockUnitService.consume(id),
        onSuccess: invalidate,
    })

    return { update, open, move, consume }
}

export function useStockUnits(locationId: string) {
    return useQuery({
        queryKey: queryKeys.stockUnits(locationId),
        queryFn: () => stockUnitService.getByLocation(locationId),
    })
}

export function useStockUnitMutations(locationId: string) {
    const qc = useQueryClient()
    const invalidate = () => qc.invalidateQueries({ queryKey: queryKeys.stockUnits(locationId) })

    const add = useMutation({
        mutationFn: (data: Omit<StockUnit, 'id' | 'createdAt' | 'isOpened' | 'openedAt' | 'consumedAt'>) => stockUnitService.add(data),
        onSuccess: invalidate,
    })
    const update = useMutation({
        mutationFn: ({ id, data }: { id: string; data: { expirationDate: Date | null; freeText: string | null } }) =>
            stockUnitService.update(id, data),
        onSuccess: invalidate,
    })
    const open = useMutation({
        mutationFn: (id: string) => stockUnitService.open(id),
        onSuccess: invalidate,
    })
    const move = useMutation({
        mutationFn: ({ id, targetLocationId }: { id: string; targetLocationId: string }) => stockUnitService.move(id, targetLocationId),
        onSuccess: invalidate,
    })
    const consume = useMutation({
        mutationFn: (id: string) => stockUnitService.consume(id),
        onSuccess: invalidate,
    })

    return { add, update, open, move, consume }
}
