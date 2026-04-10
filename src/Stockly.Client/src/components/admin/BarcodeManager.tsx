import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faPlus, faBarcode } from '@fortawesome/free-solid-svg-icons'
import { Scanner } from '../Scanner'
import { IconButton } from '../IconButton'
import { FieldWrapper } from '../FieldWrapper'
import { useSettings } from '../../hooks/useSettings'
import type { Barcode } from '../../models/BarcodeModel'

interface BarcodeManagerProps {
    barcodes: Barcode[]
    onAdd: (barcode: string) => void
    onDelete: (barcode: string) => void
}

export function BarcodeManager({ barcodes, onAdd, onDelete }: BarcodeManagerProps) {
    const [newBarcode, setNewBarcode] = useState('')
    const [showScanner, setShowScanner] = useState(false)
    const { settings } = useSettings()

    function handleAdd() {
        if (!newBarcode.trim()) return
        onAdd(newBarcode.trim())
        setNewBarcode('')
    }

    return (
        <FieldWrapper label="Codes-barres">
            <div className="flex flex-col gap-2">
                {barcodes.map((b) => (
                    <div key={b.code} className="flex items-center gap-2 px-3 py-2 bg-stone-50 rounded-lg border border-stone-200">
                        <span className="flex-1 font-mono text-sm text-stone-700">{b.code}</span>
                        <button onClick={() => onDelete(b.code)}>
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
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAdd() }}
                    />
                    {settings.cameraEnabled && (
                        <IconButton icon={faBarcode} onClick={() => setShowScanner(true)} variant="primary" shape="tile" />
                    )}
                    <IconButton icon={faPlus} onClick={handleAdd} variant="primary" shape="tile" />
                </div>
                {showScanner && (
                    <Scanner
                        onScan={(code) => { onAdd(code); setShowScanner(false) }}
                        onClose={() => setShowScanner(false)}
                    />
                )}
            </div>
        </FieldWrapper>
    )
}
