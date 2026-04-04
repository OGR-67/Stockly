import { useState, useRef, useEffect } from 'react'
import Fuse from 'fuse.js'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBarcode, faXmark, faPlus } from '@fortawesome/free-solid-svg-icons'

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
    autoFocus?: boolean
}

export function SearchOrCreate<T extends object>({
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
    autoFocus,
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
            <div className="flex items-center border border-stone-300 rounded-lg px-3 py-2 gap-2 bg-cream">
                {onScan && onScanRequest && (
                    <button onClick={() => onScanRequest()} className="text-stone-400 hover:text-earth">
                        <FontAwesomeIcon icon={faBarcode} />
                    </button>
                )}
                <input
                    className="flex-1 outline-none text-sm"
                    placeholder={value ? String(value[displayKey]) : placeholder}
                    value={value ? String(value[displayKey]) : query}
                    autoFocus={autoFocus}
                    onChange={(e) => {
                        setQuery(e.target.value)
                        setIsOpen(true)
                    }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && query.trim() && onScan) {
                            onScan(query.trim())
                            setQuery('')
                        }
                    }}
                />
                <button onClick={handleClear} className="text-stone-400 hover:text-stone-600">
                    <FontAwesomeIcon icon={faXmark} />
                </button>
            </div>

            {isOpen && (
                <div className="absolute w-full z-40 mt-1 border border-stone-200 rounded-lg bg-cream shadow-lg">
                    <ul className="max-h-64 overflow-y-auto">
                        {results.map((item, index) => (
                            <li
                                key={index}
                                onClick={() => handleSelect(item)}
                                className="px-4 py-2 text-sm hover:bg-sage-light cursor-pointer"
                            >
                                {String(item[displayKey])}
                            </li>
                        ))}
                        {results.length === 0 && (
                            <li className="px-4 py-2 text-sm text-sage-light">
                                Aucun résultat
                            </li>
                        )}
                    </ul>
                    <div className="border-t border-stone-200">
                        <button
                            onClick={onCreate}
                            className="w-full px-4 py-2 text-sm text-left text-earth hover:bg-sage-light flex items-center gap-2 cursor-pointer"
                        >
                            <FontAwesomeIcon icon={faPlus} />
                            Créer nouveau
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
