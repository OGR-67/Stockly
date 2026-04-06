import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import Fuse from 'fuse.js'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPencil, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons'
import { StackPage } from '../../../components/layout/StackPage'
import { LoadingSpinner } from '../../../components/layout/LoadingSpinner'
import { SearchInput } from '../../../components/SearchInput'
import { CategoryModal } from '../../../components/admin/CategoryModal'
import { useCategories, useCategoryMutations } from '../../../hooks/queries/useCategories'
import type { Category } from '../../../models/CategoryModel'

export const Route = createFileRoute('/admin/categories/')({
    component: RouteComponent,
})

function RouteComponent() {
    const { data: categories = [], isLoading, isError } = useCategories()
    const { create, update, remove } = useCategoryMutations()
    const [editTarget, setEditTarget] = useState<Category | 'new' | null>(null)
    const [query, setQuery] = useState('')

    const fuse = new Fuse(categories, { keys: ['name'], threshold: 0.3 })
    const filtered = query ? fuse.search(query).map(r => r.item) : categories

    async function handleSave(data: Omit<Category, 'id'>) {
        if (editTarget === 'new') {
            await create.mutateAsync(data)
        } else {
            await update.mutateAsync({ id: editTarget!.id, data })
        }
        setEditTarget(null)
    }

    async function handleDelete(id: string) {
        if (!window.confirm('Supprimer cette catégorie ?')) return
        await remove.mutateAsync(id)
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
            <SearchInput value={query} onChange={setQuery} placeholder="Rechercher une catégorie..." className="mb-4" />

            {isLoading && <LoadingSpinner />}
            {isError && <p className="text-center text-stone-400 py-8">Erreur de chargement</p>}

            <div className="flex flex-col gap-3">
                {filtered.map(category => (
                    <div key={category.id} className="flex items-center gap-3 p-3 bg-cream rounded-xl border border-sage/30">
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
                        <button onClick={() => setEditTarget(category)} className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center shrink-0">
                            <FontAwesomeIcon icon={faPencil} className="text-stone-500 text-sm" />
                        </button>
                        <button onClick={() => handleDelete(category.id)} className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center shrink-0">
                            <FontAwesomeIcon icon={faTrash} className="text-stone-500 text-sm" />
                        </button>
                    </div>
                ))}
                {!isLoading && filtered.length === 0 && (
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
