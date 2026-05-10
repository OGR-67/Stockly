import { createFileRoute } from '@tanstack/react-router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPencil, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons'
import { haptic } from 'ios-haptics'
import { StackPage } from '../../../components/layout/StackPage'
import { LoadingSpinner } from '../../../components/layout/LoadingSpinner'
import { SearchInput } from '../../../components/SearchInput'
import { Card } from '../../../components/Card'
import { IconButton } from '../../../components/IconButton'
import { EmptyState } from '../../../components/EmptyState'
import { CategoryModal } from '../../../components/admin/CategoryModal'
import { useCategories, useCategoryMutations } from '../../../hooks/queries/useCategories'
import { useCrudList } from '../../../hooks/useCrudList'
import type { Category } from '../../../models/CategoryModel'

export const Route = createFileRoute('/admin/categories/')({
    component: RouteComponent,
})

function RouteComponent() {
    const { data: categories = [], isLoading, isError } = useCategories()
    const { create, update, remove } = useCategoryMutations()
    const { editTarget, setEditTarget, query, setQuery, filtered } = useCrudList(categories, ['name'])

    async function handleSave(data: Omit<Category, 'id'>) {
        if (editTarget === 'new') {
            await create.mutateAsync(data)
        } else {
            await update.mutateAsync({ id: editTarget!.id, data })
        }
        haptic.confirm()
        setEditTarget(null)
    }

    async function handleDelete(id: string) {
        if (!window.confirm('Supprimer cette catégorie ?')) return
        await remove.mutateAsync(id)
        haptic.error()
    }

    return (
        <StackPage
            title="Catégories"
            action={
                <button onClick={() => { haptic(); setEditTarget('new'); }} className="text-white/80 hover:text-white">
                    <FontAwesomeIcon icon={faPlus} />
                </button>
            }
        >
            <SearchInput value={query} onChange={setQuery} placeholder="Rechercher une catégorie..." className="mb-4" />

            {isLoading && <LoadingSpinner />}
            {isError && <EmptyState message="Erreur de chargement" error />}

            <div className="flex flex-col gap-3">
                {filtered.map(category => (
                    <Card key={category.id}>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-bark truncate">{category.name}</p>
                            {category.freeText && <p className="text-xs text-stone-400 truncate">{category.freeText}</p>}
                            <div className="flex gap-2 mt-1">
                                {category.isPerishable && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-earth/10 text-earth">Périssable</span>
                                )}
                                {category.isFresh && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-sage/30 text-bark">Frais</span>
                                )}
                            </div>
                        </div>
                        <IconButton icon={faPencil} onClick={() => { haptic(); setEditTarget(category); }} title="Modifier" />
                        <IconButton icon={faTrash} onClick={() => handleDelete(category.id)} title="Supprimer" />
                    </Card>
                ))}
                {!isLoading && filtered.length === 0 && (
                    <EmptyState message="Aucune catégorie" />
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
