import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { SearchOrCreate } from '../../components/SearchOrCreate'
import { Scanner } from '../../components/Scanner'
import { RootPage } from '../../components/layout/RootPage'

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
    const [scannerOpen, setScannerOpen] = useState(false)

    return (
        <RootPage title="Dev Sandbox">
            {scannerOpen && (
                <Scanner
                    onScan={(barcode) => {
                        alert(`Scanné : ${barcode}`)
                        setScannerOpen(false)
                    }}
                    onClose={() => setScannerOpen(false)}
                />
            )}
            <div>
                <h2 className="text-sm font-medium mb-2">SearchOrCreate</h2>
                <SearchOrCreate
                    items={mockCategories}
                    displayKey="name"
                    searchKeys={['name']}
                    value={selected}
                    onSelect={setSelected}
                    onClear={() => setSelected(undefined)}
                    onScanRequest={() => setScannerOpen(true)}
                    onScan={() => handleScan('1234567890')} // dummy handler to show the button
                    onCreate={() => alert('Créer nouveau')}
                    placeholder="Rechercher une catégorie..."
                />
                {selected && <p className="mt-2 text-sm text-stone-500">Sélectionné : {selected.name}</p>}
            </div>
        </RootPage>
    )
}
