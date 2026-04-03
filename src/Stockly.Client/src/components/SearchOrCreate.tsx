import { useState, useRef, useEffect } from 'react'
import Fuse from 'fuse.js'

interface SearchOrCreateProps<T> {
    items: T[]
    onSelect: (item: T) => void
    onClear: () => void
    onCreate: () => void
    onScanRequest?: () => void
    onScan?: (barcode: string) => void
    displayKey: keyof T
    searchKeys: (keyof T)[]
    placeholder?: string
    value?: T
}

export function SearchOrCreate<T extends Record<string, unknown>>({
    items,
    onSelect,
    onClear,
    onCreate,
    onScanRequest,
    onScan,
    displayKey,
    searchKeys,
    placeholder = 'Rechercher...',
    value,
}: SearchOrCreateProps<T>) {
    const [query, setQuery] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    const fuse = new Fuse(items, {
        keys: searchKeys as string[],
        threshold: 0.3,
    })

    const results = query
        ? fuse.search(query).map((r) => r.item)
        : items

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    function handleSelect(item: T) {
        onSelect(item)
        setQuery('')
        setIsOpen(false)
    }

    function handleClear() {
        onClear()
        setQuery('')
        setIsOpen(false)
    }

    return (
        <div ref={containerRef} className="relative w-full">
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 gap-2">
                {onScan && onScanRequest && (
                    <button onClick={() => onScanRequest()} className="text-gray-400 hover:text-gray-600">
                        📷
                    </button>
                )}
                <input
                    className="flex-1 outline-none text-sm"
                    placeholder={value ? String(value[displayKey]) : placeholder}
                    value={value ? String(value[displayKey]) : query}
                    onChange={(e) => {
                        setQuery(e.target.value)
                        setIsOpen(true)
                    }}
                    onFocus={() => setIsOpen(true)}
                />
                <button onClick={handleClear} className="text-gray-400 hover:text-gray-600">
                    ✕
                </button>
            </div>

            {isOpen && (
                <div className="absolute w-full z-10 mt-1 border border-gray-200 rounded-lg bg-white shadow-lg">
                    <ul className="max-h-64 overflow-y-auto">
                        {results.map((item, index) => (
                            <li
                                key={index}
                                onClick={() => handleSelect(item)}
                                className="px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                            >
                                {String(item[displayKey])}
                            </li>
                        ))}
                        {results.length === 0 && (
                            <li className="px-4 py-2 text-sm text-gray-400">
                                Aucun résultat
                            </li>
                        )}
                    </ul>
                    <div className="border-t border-gray-200">
                        <button
                            onClick={onCreate}
                            className="w-full px-4 py-2 text-sm text-left text-blue-600 hover:bg-gray-50"
                        >
                            + Créer nouveau
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
