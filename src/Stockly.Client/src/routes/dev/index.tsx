import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { SearchOrCreate } from '../../components/SearchOrCreate'

const mockCategories = [
    { id: '1', name: 'Charcuterie tranchée' },
    { id: '2', name: 'Fromage affiné' },
    { id: '3', name: 'Produits laitiers' },
    { id: '4', name: 'Fruits / légumes' },
]

export const Route = createFileRoute('/dev/')({
    component: DevPage,
})

function DevPage() {
    if (!import.meta.env.DEV) return null

    function handleScan(barcode: string) {
        alert(`Scan effectué pour le code-barres : ${barcode}`)
    }

    const [selected, setSelected] = useState<typeof mockCategories[0] | undefined>()

    return (
        <div className="p-4 flex flex-col gap-8">
            <h1 className="text-xl font-bold">Dev Sandbox</h1>
            <div>
                <h2 className="text-sm font-medium mb-2">SearchOrCreate</h2>
                <SearchOrCreate
                    items={mockCategories}
                    displayKey="name"
                    searchKeys={['name']}
                    value={selected}
                    onSelect={setSelected}
                    onClear={() => setSelected(undefined)}
                    onScanRequest={() => alert('Ouverture scan')}
                    onScan={() => handleScan('1234567890')} // dummy handler to show the button
                    onCreate={() => alert('Créer nouveau')}
                    placeholder="Rechercher une catégorie..."
                />
                {selected && <p className="mt-2 text-sm text-gray-500">Sélectionné : {selected.name}</p>}
            </div>
        </div>
    )
}
