import type { Category } from "../../models/CategoryModel"

export interface ICategoryService {
    getAll(): Promise<Category[]>
    getById(id: string): Promise<Category | null>
    create(category: Omit<Category, 'id'>): Promise<Category>
    update(id: string, category: Omit<Category, 'id'>): Promise<Category>
    delete(id: string): Promise<void>
}
