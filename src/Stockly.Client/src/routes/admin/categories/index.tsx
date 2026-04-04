import { useState, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPencil, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons'
import { StackPage } from '../../../components/layout/StackPage'
import { CategoryModal } from '../../../components/admin/CategoryModal'
import { categoryService } from '../../../services'
import type { Category } from '../../../models/CategoryModel'

export const Route = createFileRoute('/admin/categories/')({
    component: RouteComponent,
})

function RouteComponent() {
    const [categories, setCategories] = useState<Category[]>([])
    const [editTarget, setEditTarget] = useState<Category | 'new' | null>(null)

    useEffect(() => {
        categoryService.getAll().then(setCategories)
    }, [])

    async function handleSave(data: Omit<Category, 'id'>) {
        if (editTarget === 'new') {
            const created = await categoryService.create(data)
            setCategories(prev => [...prev, { id: created.id, ...data }])
        } else {
            await categoryService.update(editTarget!.id, data)
            setCategories(prev => prev.map(c => c.id === editTarget!.id ? { ...c, ...data } : c))
        }
        setEditTarget(null)
    }

    async function handleDelete(id: string) {
        if (!window.confirm('Supprimer cette catégorie ?')) return
        await categoryService.delete(id)
        setCategories(prev => prev.filter(c => c.id !== id))
    }

    return (
        <StackPage
            title="Catégories"
            action={
                <button onClick={() => setEditTarget('new')} className="text-white/80 hover:text-white">
                    <FontAwesomeIcon icon={faPlus} />
                </button>
            }
        >
            <div className="flex flex-col gap-3">
                {categories.map(category => (
                    <div
                        key={category.id}
                        className="flex items-center gap-3 p-3 bg-cream rounded-xl border border-sage/30"
                    >
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-bark truncate">{category.name}</p>
                            <div className="flex gap-2 mt-1">
                                {category.isPerishable && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-earth/10 text-earth">Périssable</span>
                                )}
                                {category.isFresh && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-sage/30 text-bark">Frais</span>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() => setEditTarget(category)}
                            className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center shrink-0"
                        >
                            <FontAwesomeIcon icon={faPencil} className="text-stone-500 text-sm" />
                        </button>
                        <button
                            onClick={() => handleDelete(category.id)}
                            className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center shrink-0"
                        >
                            <FontAwesomeIcon icon={faTrash} className="text-stone-500 text-sm" />
                        </button>
                    </div>
                ))}
                {categories.length === 0 && (
                    <p className="text-center text-stone-400 py-8">Aucune catégorie</p>
                )}
            </div>

            {editTarget && (
                <CategoryModal
                    initial={editTarget === 'new' ? undefined : editTarget}
                    onConfirm={handleSave}
                    onClose={() => setEditTarget(null)}
                />
            )}
        </StackPage>
    )
}
