import { useState } from 'react'
import { Modal } from '../Modal'
import { FormField } from '../FormField'
import { FieldWrapper } from '../FieldWrapper'
import { ConfirmButton } from '../ConfirmButton'
import { SearchOrCreate } from '../SearchOrCreate'
import { BarcodeManager } from './BarcodeManager'
import { CategoryModal } from './CategoryModal'
import { useCategoryMutations } from '../../hooks/queries/useCategories'
import { haptic } from 'ios-haptics'
import type { Product, ProductDetail } from '../../models/ProductModel'
import type { Category } from '../../models/CategoryModel'

interface ProductModalProps {
    initial?: ProductDetail
    categories: Category[]
    onConfirm: (data: Omit<Product, 'id'>) => void
    onAddBarcode: (barcode: string) => void
    onDeleteBarcode: (barcode: string) => void
    onCategoryCreated?: (category: Category) => void
    onClose: () => void
}

export function ProductModal({ initial, categories, onConfirm, onAddBarcode, onDeleteBarcode, onCategoryCreated, onClose }: ProductModalProps) {
    const [name, setName] = useState(initial?.name ?? '')
    const [cats, setCats] = useState<Category[]>(categories)
    const [selectedCategory, setSelectedCategory] = useState<Category | undefined>(
        initial ? categories.find(c => c.id === initial.categoryId) : undefined
    )
    const [freeText, setFreeText] = useState(initial?.freeText ?? '')
    const [showCategoryModal, setShowCategoryModal] = useState(false)
    const { create: createCategory } = useCategoryMutations()

    async function handleCreateCategory(data: Omit<Category, 'id'>) {
        const created = await createCategory.mutateAsync(data)
        haptic.confirm()
        const newCat: Category = { id: created.id, ...data }
        setCats(prev => [...prev, newCat])
        setSelectedCategory(newCat)
        onCategoryCreated?.(newCat)
        setShowCategoryModal(false)
    }

    return (
        <>
            <Modal title={initial ? "Modifier l'article" : 'Nouvel article'} onClose={onClose}>
                <div className="flex flex-col gap-3">
                    <FormField label="Nom" value={name} onChange={setName} placeholder="Ex: Jambon blanc" />

                    <FieldWrapper label="Catégorie">
                        <SearchOrCreate
                            items={cats}
                            displayKey="name"
                            searchKeys={['name']}
                            value={selectedCategory}
                            onSelect={(cat) => {
                                setSelectedCategory(cat)
                                if (!freeText && cat.freeText) setFreeText(cat.freeText)
                            }}
                            onClear={() => setSelectedCategory(undefined)}
                            onCreate={() => setShowCategoryModal(true)}
                            placeholder="Rechercher une catégorie..."
                        />
                    </FieldWrapper>

                    <FormField label="Note (optionnel)" value={freeText} onChange={setFreeText} />

                    {initial && (
                        <BarcodeManager
                            barcodes={initial.barcodes}
                            onAdd={onAddBarcode}
                            onDelete={onDeleteBarcode}
                        />
                    )}

                    <ConfirmButton
                        onClick={() => onConfirm({ name, categoryId: selectedCategory!.id, freeText: freeText || null })}
                        disabled={!name.trim() || !selectedCategory}
                    />
                </div>
            </Modal>

            {showCategoryModal && (
                <CategoryModal
                    onConfirm={handleCreateCategory}
                    onClose={() => setShowCategoryModal(false)}
                />
            )}
        </>
    )
}
