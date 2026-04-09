import { useState, useMemo } from 'react'
import Fuse from 'fuse.js'

export function useCrudList<T>(items: T[], searchKeys: string[]) {
    const [editTarget, setEditTarget] = useState<T | 'new' | null>(null)
    const [query, setQuery] = useState('')

    const fuse = useMemo(
        () => new Fuse(items, { keys: searchKeys, threshold: 0.3 }),
        [items, searchKeys]
    )
    const filtered = query ? fuse.search(query).map(r => r.item) : items

    return { editTarget, setEditTarget, query, setQuery, filtered }
}
