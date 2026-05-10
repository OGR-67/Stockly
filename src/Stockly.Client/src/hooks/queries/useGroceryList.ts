import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { groceryListService } from '../../services'
import { queryKeys } from './queryKeys'

export function useCurrentGroceryList() {
    return useQuery({
        queryKey: queryKeys.groceryList,
        queryFn: () => groceryListService.getCurrent(),
    })
}

export function useGenerateGroceryList() {
    const qc = useQueryClient()

    return useMutation({
        mutationFn: ({ recipeIds, manualProductIds }: { recipeIds: string[]; manualProductIds: string[] }) =>
            groceryListService.generate(recipeIds, manualProductIds),
        onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.groceryList }),
    })
}

export function useRemoveGroceryListItem() {
    const qc = useQueryClient()

    return useMutation({
        mutationFn: (itemId: string) => groceryListService.removeItem(itemId),
        onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.groceryList }),
    })
}

export function useClearGroceryList() {
    const qc = useQueryClient()

    return useMutation({
        mutationFn: () => groceryListService.clear(),
        onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.groceryList }),
    })
}
