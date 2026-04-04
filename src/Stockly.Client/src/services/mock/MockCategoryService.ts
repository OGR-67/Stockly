import { v4 as uuidv4 } from 'uuid'
import type { ICategoryService } from '../interfaces/ICategoryService'
import type { Category } from '../../models/categoryModel'

const mockData: Category[] = [
    {
        id: uuidv4(),
        name: 'Jambon cuit / charcuterie tranchée',
        isPerishable: true,
        isFresh: true,
        defaultClosedDays: 10,
        defaultOpenedDays: 3,
        defaultFrozenDays: 90,
        freeText: null,
    },
    {
        id: uuidv4(),
        name: 'Charcuterie séchée',
        isPerishable: true,
        isFresh: true,
        defaultClosedDays: 30,
        defaultOpenedDays: 14,
        defaultFrozenDays: 90,
        freeText: null,
    },
    {
        id: uuidv4(),
        name: 'Viande / poisson cru',
        isPerishable: true,
        isFresh: true,
        defaultClosedDays: 3,
        defaultOpenedDays: 2,
        defaultFrozenDays: 180,
        freeText: null,
    },
    {
        id: uuidv4(),
        name: 'Viande / poisson cuit',
        isPerishable: true,
        isFresh: true,
        defaultClosedDays: 4,
        defaultOpenedDays: 3,
        defaultFrozenDays: 90,
        freeText: null,
    },
    {
        id: uuidv4(),
        name: 'Fromage frais',
        isPerishable: true,
        isFresh: true,
        defaultClosedDays: 14,
        defaultOpenedDays: 3,
        defaultFrozenDays: null,
        freeText: null,
    },
    {
        id: uuidv4(),
        name: 'Fromage affiné',
        isPerishable: true,
        isFresh: true,
        defaultClosedDays: 30,
        defaultOpenedDays: 14,
        defaultFrozenDays: null,
        freeText: null,
    },
    {
        id: uuidv4(),
        name: 'Lait / crème',
        isPerishable: true,
        isFresh: true,
        defaultClosedDays: 20,
        defaultOpenedDays: 5,
        defaultFrozenDays: null,
        freeText: null,
    },
    {
        id: uuidv4(),
        name: 'Yaourt / dessert lacté',
        isPerishable: true,
        isFresh: true,
        defaultClosedDays: 21,
        defaultOpenedDays: 3,
        defaultFrozenDays: null,
        freeText: null,
    },
    {
        id: uuidv4(),
        name: 'Œufs',
        isPerishable: true,
        isFresh: true,
        defaultClosedDays: 28,
        defaultOpenedDays: null,
        defaultFrozenDays: null,
        freeText: null,
    },
    {
        id: uuidv4(),
        name: 'Fruits / légumes',
        isPerishable: true,
        isFresh: true,
        defaultClosedDays: 7,
        defaultOpenedDays: 5,
        defaultFrozenDays: 180,
        freeText: null,
    },
    {
        id: uuidv4(),
        name: 'Préparation maison',
        isPerishable: true,
        isFresh: true,
        defaultClosedDays: null,
        defaultOpenedDays: 3,
        defaultFrozenDays: 90,
        freeText: null,
    },
    {
        id: uuidv4(),
        name: 'Surgelés',
        isPerishable: true,
        isFresh: true,
        defaultClosedDays: 90,
        defaultOpenedDays: 2,
        defaultFrozenDays: null,
        freeText: null,
    },
    {
        id: uuidv4(),
        name: 'Conserves',
        isPerishable: true,
        isFresh: false,
        defaultClosedDays: 365,
        defaultOpenedDays: null,
        defaultFrozenDays: null,
        freeText: null,
    },
    {
        id: uuidv4(),
        name: 'Épicerie sèche',
        isPerishable: false,
        isFresh: false,
        defaultClosedDays: null,
        defaultOpenedDays: null,
        defaultFrozenDays: null,
        freeText: null,
    },
    {
        id: uuidv4(),
        name: 'Boissons',
        isPerishable: true,
        isFresh: false,
        defaultClosedDays: 30,
        defaultOpenedDays: 3,
        defaultFrozenDays: null,
        freeText: null,
    },
]

export class MockCategoryService implements ICategoryService {
    private data: Category[] = [...mockData]

    async getAll(): Promise<Category[]> {
        return this.data
    }

    async getById(id: string): Promise<Category | null> {
        return this.data.find(c => c.id === id) ?? null
    }

    async create(category: Omit<Category, 'id'>): Promise<Category> {
        const newCategory: Category = { id: uuidv4(), ...category }
        this.data.push(newCategory)
        return newCategory
    }

    async update(id: string, category: Omit<Category, 'id'>): Promise<Category> {
        const index = this.data.findIndex(c => c.id === id)
        if (index === -1) throw new Error(`Category ${id} not found`)
        this.data[index] = { id, ...category }
        return this.data[index]
    }

    async delete(id: string): Promise<void> {
        this.data = this.data.filter(c => c.id !== id)
    }
}
