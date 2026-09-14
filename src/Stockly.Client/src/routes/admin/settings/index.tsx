import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faTrash, faPlus, faSpinner, faRobot, faCircleCheck, faCircleXmark } from '@fortawesome/free-solid-svg-icons'
import { haptic } from 'ios-haptics'
import { StackPage } from '../../../components/layout/StackPage'
import { FieldWrapper } from '../../../components/FieldWrapper'
import { Toggle } from '../../../components/Toggle'
import { useSettings } from '../../../hooks/useSettings'
import { usePrinters, usePrinterFormats, usePrinterMutations } from '../../../hooks/queries/usePrinter'
import { useAiSettings, useAiSettingsMutations } from '../../../hooks/queries/useAiSettings'
import { useAiConnectionTest } from '../../../hooks/queries/useAiConnectionTest'
import { printerService } from '../../../services'
import type { DiscoveredPrinter } from '../../../models/PrinterModel'
import type { AiProvider } from '../../../models/SettingsModel'

const AI_PROVIDER_LABELS: Record<AiProvider, string> = {
    none: 'Aucune (désactivée)',
    anthropic: 'Anthropic (Claude)',
    openAi: 'OpenAI',
}

export const Route = createFileRoute('/admin/settings/')({
    component: RouteComponent,
})

function RouteComponent() {
    const { settings, update } = useSettings()
    const { data: printers = [] } = usePrinters()
    const { data: formats = [] } = usePrinterFormats(settings.defaultPrinterId)
    const { register, remove } = usePrinterMutations()
    const { data: aiSettings } = useAiSettings()
    const { update: updateAiSettings } = useAiSettingsMutations()
    const testConnection = useAiConnectionTest()

    const [discovering, setDiscovering] = useState(false)
    const [discovered, setDiscovered] = useState<DiscoveredPrinter[]>([])
    const [showManualForm, setShowManualForm] = useState(false)
    const [manualName, setManualName] = useState('')
    const [manualQueueName, setManualQueueName] = useState('')
    const [manualPort, setManualPort] = useState('631')
    const [apiKeyInput, setApiKeyInput] = useState('')

    const aiProvider = aiSettings?.aiProvider ?? 'none'

    function handleAiProviderChange(provider: AiProvider) {
        haptic()
        testConnection.reset()
        updateAiSettings.mutate({ aiProvider: provider })
    }

    function handleSaveApiKey() {
        if (!apiKeyInput.trim()) return
        testConnection.reset()
        updateAiSettings.mutate({ aiProvider, aiApiKey: apiKeyInput.trim() })
        haptic.confirm()
        setApiKeyInput('')
    }

    function handleClearApiKey() {
        if (!window.confirm('Supprimer la clé API enregistrée ?')) return
        testConnection.reset()
        updateAiSettings.mutate({ aiProvider, aiApiKey: '' })
        haptic.error()
    }

    function handleTestConnection() {
        haptic()
        testConnection.mutate()
    }

    useEffect(() => {
        if (formats.length > 0 && settings.defaultPrinterId && !settings.defaultFormatId) {
            update({ defaultFormatId: formats[0].id })
        }
    }, [formats, settings.defaultPrinterId])

    async function handleDiscover() {
        haptic()
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
        await register.mutateAsync({ name: d.name, queueName: d.queueName, port: d.port, isDefault: printers.length === 0 })
        haptic.confirm()
        setDiscovered(prev => prev.filter(p => p.queueName !== d.queueName))
    }

    async function handleManualRegister() {
        if (!manualName.trim() || !manualQueueName.trim()) return
        await register.mutateAsync({ name: manualName.trim(), queueName: manualQueueName.trim(), port: parseInt(manualPort) || 631, isDefault: printers.length === 0 })
        haptic.confirm()
        setManualName('')
        setManualQueueName('')
        setManualPort('631')
        setShowManualForm(false)
    }

    async function handleDelete(id: string) {
        if (settings.defaultPrinterId === id) update({ defaultPrinterId: null, defaultFormatId: null })
        await remove.mutateAsync(id)
        haptic.error()
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
                    <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faRobot} className="text-earth" />
                        <p className="text-sm font-medium text-bark">Intelligence artificielle</p>
                    </div>

                    <FieldWrapper label="Fournisseur">
                        <select
                            value={aiProvider}
                            onChange={(e) => handleAiProviderChange(e.target.value as AiProvider)}
                            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none bg-cream"
                        >
                            {Object.entries(AI_PROVIDER_LABELS).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                    </FieldWrapper>

                    {aiProvider !== 'none' && (
                        <FieldWrapper label="Clé API">
                            <div className="flex gap-2">
                                <input
                                    type="password"
                                    value={apiKeyInput}
                                    onChange={(e) => setApiKeyInput(e.target.value)}
                                    placeholder={aiSettings?.hasAiApiKey ? 'Clé déjà configurée — laisser vide pour la conserver' : 'Coller votre clé API'}
                                    className="flex-1 min-w-0 border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none font-mono"
                                />
                                <button
                                    onClick={handleSaveApiKey}
                                    disabled={!apiKeyInput.trim() || updateAiSettings.isPending}
                                    className="px-3 py-2 rounded-lg bg-earth text-white text-sm disabled:opacity-50"
                                >
                                    Enregistrer
                                </button>
                            </div>
                            {aiSettings?.hasAiApiKey && (
                                <button
                                    onClick={handleClearApiKey}
                                    className="text-xs text-stone-400 hover:text-stone-600 mt-1"
                                >
                                    Supprimer la clé enregistrée
                                </button>
                            )}
                        </FieldWrapper>
                    )}

                    {aiProvider !== 'none' && aiSettings?.hasAiApiKey && (
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={handleTestConnection}
                                disabled={testConnection.isPending}
                                className="flex items-center justify-center gap-2 py-2 rounded-lg border border-stone-300 text-sm text-bark disabled:opacity-50"
                            >
                                <FontAwesomeIcon icon={faSpinner} spin={testConnection.isPending} className={testConnection.isPending ? '' : 'hidden'} />
                                Tester la connexion
                            </button>

                            {testConnection.data && (
                                <div className={`flex items-start gap-2 text-xs px-3 py-2 rounded-lg ${testConnection.data.success ? 'bg-sage-light/40 text-bark' : 'bg-red-50 text-red-700'}`}>
                                    <FontAwesomeIcon icon={testConnection.data.success ? faCircleCheck : faCircleXmark} className="mt-0.5" />
                                    <span>{testConnection.data.success ? 'Connexion réussie.' : (testConnection.data.errorMessage ?? 'Échec de la connexion.')}</span>
                                </div>
                            )}
                        </div>
                    )}
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
                                        <p className="text-xs text-stone-400 font-mono">{p.queueName}:{p.port}</p>
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
                                <div key={d.queueName} className="flex items-center gap-2 px-3 py-2 bg-sage-light/30 rounded-lg border border-sage/30">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-bark truncate">{d.name}</p>
                                        <p className="text-xs text-stone-400 font-mono">{d.queueName}:{d.port}</p>
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
                                    value={manualQueueName}
                                    onChange={e => setManualQueueName(e.target.value)}
                                    placeholder="Nom de queue CUPS"
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
                                    disabled={!manualName.trim() || !manualQueueName.trim() || register.isPending}
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

                        <FieldWrapper label="Imprimante">
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
                        </FieldWrapper>

                        {formats.length > 0 && (
                            <FieldWrapper label="Format">
                                <select
                                    value={settings.defaultFormatId ?? ''}
                                    onChange={(e) => update({ defaultFormatId: e.target.value })}
                                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none bg-cream"
                                >
                                    {formats.map(f => (
                                        <option key={f.id} value={f.id}>{f.name}</option>
                                    ))}
                                </select>
                            </FieldWrapper>
                        )}
                    </div>
                )}
            </div>
        </StackPage>
    )
}
