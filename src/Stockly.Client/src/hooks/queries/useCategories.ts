import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { categoryService } from '../../services'
import { queryKeys } from './queryKeys'
import type { Category } from '../../models/CategoryModel'

export function useCategories() {
    return useQuery({
        queryKey: queryKeys.categories,
        queryFn: () => categoryService.getAll(),
    })
}

export function useCategoryMutations() {
    const qc = useQueryClient()
    const invalidate = () => qc.invalidateQueries({ queryKey: queryKeys.categories })

    const create = useMutation({
        mutationFn: (data: Omit<Category, 'id'>) => categoryService.create(data),
        onSuccess: invalidate,
    })
    const update = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Omit<Category, 'id'> }) => categoryService.update(id, data),
        onSuccess: invalidate,
    })
    const remove = useMutation({
        mutationFn: (id: string) => categoryService.delete(id),
        onSuccess: invalidate,
    })

    return { create, update, remove }
}
