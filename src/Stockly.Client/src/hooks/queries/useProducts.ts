import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productService } from '../../services'
import { queryKeys } from './queryKeys'
import type { Product } from '../../models/ProductModel'

export function useProducts() {
    return useQuery({
        queryKey: queryKeys.products,
        queryFn: () => productService.getAll(),
    })
}

export function useProductMutations() {
    const qc = useQueryClient()
    const invalidate = () => qc.invalidateQueries({ queryKey: queryKeys.products })

    const create = useMutation({
        mutationFn: (data: Omit<Product, 'id'>) => productService.create(data),
        onSuccess: invalidate,
    })
    const update = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Omit<Product, 'id'> }) => productService.update(id, data),
        onSuccess: invalidate,
    })
    const remove = useMutation({
        mutationFn: (id: string) => productService.delete(id),
        onSuccess: invalidate,
    })
    const addBarcode = useMutation({
        mutationFn: ({ productId, barcode }: { productId: string; barcode: string }) => productService.addBarcode(productId, barcode),
        onSuccess: invalidate,
    })
    const deleteBarcode = useMutation({
        mutationFn: (barcode: string) => productService.deleteBarcode(barcode),
        onSuccess: invalidate,
    })

    return { create, update, remove, addBarcode, deleteBarcode }
}
