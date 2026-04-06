import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faTrash, faPlus, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { StackPage } from '../../../components/layout/StackPage'
import { Toggle } from '../../../components/admin/Toggle'
import { useSettings } from '../../../hooks/useSettings'
import { usePrinters, usePrinterFormats, usePrinterMutations } from '../../../hooks/queries/usePrinter'
import { printerService } from '../../../services'
import type { DiscoveredPrinter } from '../../../models/PrinterModel'

export const Route = createFileRoute('/admin/settings/')({
    component: RouteComponent,
})

function RouteComponent() {
    const { settings, update } = useSettings()
    const { data: printers = [] } = usePrinters()
    const { data: formats = [] } = usePrinterFormats(settings.defaultPrinterId)
    const { register, remove } = usePrinterMutations()

    const [discovering, setDiscovering] = useState(false)
    const [discovered, setDiscovered] = useState<DiscoveredPrinter[]>([])
    const [showManualForm, setShowManualForm] = useState(false)
    const [manualName, setManualName] = useState('')
    const [manualIp, setManualIp] = useState('')
    const [manualPort, setManualPort] = useState('631')

    useEffect(() => {
        if (formats.length > 0 && settings.defaultPrinterId && !settings.defaultFormatId) {
            update({ defaultFormatId: formats[0].id })
        }
    }, [formats, settings.defaultPrinterId])

    async function handleDiscover() {
        setDiscovering(true)
        setDiscovered([])
        try {
            const found = await printerService.discover()
            setDiscovered(found)
        } finally {
            setDiscovering(false)
        }
    }

    async function handleRegister(d: DiscoveredPrinter) {
        await register.mutateAsync({ name: d.name, ipAddress: d.ipAddress, port: d.port, isDefault: printers.length === 0 })
        setDiscovered(prev => prev.filter(p => p.ipAddress !== d.ipAddress))
    }

    async function handleManualRegister() {
        if (!manualName.trim() || !manualIp.trim()) return
        await register.mutateAsync({ name: manualName.trim(), ipAddress: manualIp.trim(), port: parseInt(manualPort) || 631, isDefault: printers.length === 0 })
        setManualName('')
        setManualIp('')
        setManualPort('631')
        setShowManualForm(false)
    }

    async function handleDelete(id: string) {
        if (settings.defaultPrinterId === id) update({ defaultPrinterId: null, defaultFormatId: null })
        await remove.mutateAsync(id)
    }

    return (
        <StackPage title="Réglages">
            <div className="flex flex-col gap-4">
                <div className="bg-cream rounded-xl border border-sage/30 px-4 divide-y divide-stone-100">
                    <div>
                        <Toggle
                            label="Caméra intégrée"
                            checked={settings.cameraEnabled}
                            onChange={(v) => update({ cameraEnabled: v })}
                        />
                        <p className="text-xs text-stone-400 pb-2">
                            Désactiver si vous utilisez une douchette Bluetooth
                        </p>
                    </div>
                </div>

                <div className="bg-cream rounded-xl border border-sage/30 px-4 py-3 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-bark">Imprimantes</p>
                        <button
                            onClick={handleDiscover}
                            disabled={discovering}
                            className="flex items-center gap-2 text-sm text-earth disabled:opacity-50"
                        >
                            <FontAwesomeIcon icon={discovering ? faSpinner : faSearch} spin={discovering} />
                            Rechercher
                        </button>
                    </div>

                    {printers.length > 0 && (
                        <div className="flex flex-col gap-2">
                            {printers.map(p => (
                                <div key={p.id} className="flex items-center gap-2 px-3 py-2 bg-stone-50 rounded-lg border border-stone-200">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-bark truncate">{p.name}</p>
                                        <p className="text-xs text-stone-400 font-mono">{p.ipAddress}:{p.port}</p>
                                    </div>
                                    <button onClick={() => handleDelete(p.id)}>
                                        <FontAwesomeIcon icon={faTrash} className="text-stone-400 hover:text-stone-600" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {discovered.length > 0 && (
                        <div className="flex flex-col gap-2">
                            <p className="text-xs text-stone-500">Imprimantes détectées :</p>
                            {discovered.map(d => (
                                <div key={d.ipAddress} className="flex items-center gap-2 px-3 py-2 bg-sage-light/30 rounded-lg border border-sage/30">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-bark truncate">{d.name}</p>
                                        <p className="text-xs text-stone-400 font-mono">{d.ipAddress}:{d.port}</p>
                                    </div>
                                    <button onClick={() => handleRegister(d)} className="text-earth">
                                        <FontAwesomeIcon icon={faPlus} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {!discovering && discovered.length === 0 && printers.length === 0 && !showManualForm && (
                        <p className="text-xs text-stone-400 text-center py-2">
                            Aucune imprimante. Cliquez sur Rechercher.
                        </p>
                    )}

                    {showManualForm ? (
                        <div className="flex flex-col gap-2">
                            <input
                                type="text"
                                value={manualName}
                                onChange={e => setManualName(e.target.value)}
                                placeholder="Nom (ex: Brother QL-810W)"
                                className="border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none"
                            />
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={manualIp}
                                    onChange={e => setManualIp(e.target.value)}
                                    placeholder="Adresse IP"
                                    className="flex-1 border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none font-mono"
                                />
                                <input
                                    type="number"
                                    value={manualPort}
                                    onChange={e => setManualPort(e.target.value)}
                                    className="w-20 border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none font-mono"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowManualForm(false)}
                                    className="flex-1 py-2 rounded-lg border border-stone-300 text-stone-500 text-sm"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleManualRegister}
                                    disabled={!manualName.trim() || !manualIp.trim() || register.isPending}
                                    className="flex-1 py-2 rounded-lg bg-earth text-white text-sm disabled:opacity-50"
                                >
                                    Ajouter
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowManualForm(true)}
                            className="text-sm text-stone-400 text-center w-full py-1"
                        >
                            + Ajouter manuellement
                        </button>
                    )}
                </div>

                {printers.length > 0 && (
                    <div className="bg-cream rounded-xl border border-sage/30 px-4 py-3 flex flex-col gap-3">
                        <p className="text-sm font-medium text-bark">Impression par défaut</p>

                        <div>
                            <label className="block text-sm text-stone-500 mb-1">Imprimante</label>
                            <select
                                value={settings.defaultPrinterId ?? ''}
                                onChange={(e) => update({ defaultPrinterId: e.target.value || null, defaultFormatId: null })}
                                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none bg-cream"
                            >
                                <option value="">Aucune</option>
                                {printers.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        {formats.length > 0 && (
                            <div>
                                <label className="block text-sm text-stone-500 mb-1">Format</label>
                                <select
                                    value={settings.defaultFormatId ?? ''}
                                    onChange={(e) => update({ defaultFormatId: e.target.value })}
                                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none bg-cream"
                                >
                                    {formats.map(f => (
                                        <option key={f.id} value={f.id}>{f.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </StackPage>
    )
}
