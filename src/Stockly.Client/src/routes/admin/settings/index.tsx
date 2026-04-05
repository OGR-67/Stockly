import { useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { StackPage } from '../../../components/layout/StackPage'
import { Toggle } from '../../../components/admin/Toggle'
import { useSettings } from '../../../hooks/useSettings'
import { usePrinters, usePrinterFormats } from '../../../hooks/queries/usePrinter'

export const Route = createFileRoute('/admin/settings/')({
    component: RouteComponent,
})

function RouteComponent() {
    const { settings, update } = useSettings()
    const { data: printers = [] } = usePrinters()
    const { data: formats = [] } = usePrinterFormats(settings.defaultPrinterId)

    // Auto-select first format when printer is selected and format not yet set
    useEffect(() => {
        if (formats.length > 0 && settings.defaultPrinterId && !settings.defaultFormatId) {
            update({ defaultFormatId: formats[0].id })
        }
    }, [formats, settings.defaultPrinterId])

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

                {printers.length > 0 && (
                    <div className="bg-cream rounded-xl border border-sage/30 px-4 py-3 flex flex-col gap-3">
                        <p className="text-sm font-medium text-bark">Impression</p>

                        <div>
                            <label className="block text-sm text-stone-500 mb-1">Imprimante par défaut</label>
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
                                <label className="block text-sm text-stone-500 mb-1">Format par défaut</label>
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
