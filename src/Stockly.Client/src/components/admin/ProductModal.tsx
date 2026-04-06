import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faXmark, faPlus, faBarcode } from '@fortawesome/free-solid-svg-icons'
import { Modal } from '../Modal'
import { Scanner } from '../Scanner'
import { SearchOrCreate } from '../SearchOrCreate'
import { CategoryModal } from './CategoryModal'
import { useCategoryMutations } from '../../hooks/queries/useCategories'
import { useSettings } from '../../hooks/useSettings'
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
    const [newBarcode, setNewBarcode] = useState('')
    const [showScanner, setShowScanner] = useState(false)
    const [showCategoryModal, setShowCategoryModal] = useState(false)
    const { create: createCategory } = useCategoryMutations()
    const { settings } = useSettings()

    async function handleCreateCategory(data: Omit<Category, 'id'>) {
        const created = await createCategory.mutateAsync(data)
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
                    <div>
                        <label className="block text-sm text-stone-500 mb-1">Nom</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none"
                            placeholder="Ex: Jambon blanc"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-stone-500 mb-1">Catégorie</label>
                        <SearchOrCreate
                            items={cats}
                            displayKey="name"
                            searchKeys={["name"]}
                            value={selectedCategory}
                            onSelect={setSelectedCategory}
                            onClear={() => setSelectedCategory(undefined)}
                            onCreate={() => setShowCategoryModal(true)}
                            placeholder="Rechercher une catégorie..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-stone-500 mb-1">Note (optionnel)</label>
                        <input
                            type="text"
                            value={freeText}
                            onChange={(e) => setFreeText(e.target.value)}
                            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none"
                        />
                    </div>

                    {initial && (
                        <div>
                            <label className="block text-sm text-stone-500 mb-2">Codes-barres</label>
                            <div className="flex flex-col gap-2">
                                {initial.barcodes.map(b => (
                                    <div key={b.code} className="flex items-center gap-2 px-3 py-2 bg-stone-50 rounded-lg border border-stone-200">
                                        <span className="flex-1 font-mono text-sm text-stone-700">{b.code}</span>
                                        <button onClick={() => onDeleteBarcode(b.code)}>
                                            <FontAwesomeIcon icon={faXmark} className="text-stone-400 hover:text-stone-600" />
                                        </button>
                                    </div>
                                ))}
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newBarcode}
                                        onChange={(e) => setNewBarcode(e.target.value)}
                                        placeholder="Ajouter un code-barres"
                                        className="flex-1 border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none font-mono"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && newBarcode.trim()) {
                                                onAddBarcode(newBarcode.trim())
                                                setNewBarcode('')
                                            }
                                        }}
                                    />
                                    {settings.cameraEnabled && (
                                        <button
                                            onClick={() => setShowScanner(true)}
                                            className="px-3 py-2 bg-sage-light rounded-lg text-earth"
                                        >
                                            <FontAwesomeIcon icon={faBarcode} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => { if (newBarcode.trim()) { onAddBarcode(newBarcode.trim()); setNewBarcode('') } }}
                                        className="px-3 py-2 bg-sage-light rounded-lg text-earth"
                                    >
                                        <FontAwesomeIcon icon={faPlus} />
                                    </button>
                                </div>
                                {showScanner && (
                                    <Scanner
                                        onScan={(code) => {
                                            onAddBarcode(code)
                                            setShowScanner(false)
                                        }}
                                        onClose={() => setShowScanner(false)}
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    <button
                        onClick={() => onConfirm({ name, categoryId: selectedCategory!.id, freeText: freeText || null })}
                        disabled={!name.trim() || !selectedCategory}
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-earth text-white font-medium disabled:opacity-50"
                    >
                        <FontAwesomeIcon icon={faCheck} />
                        Confirmer
                    </button>
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
