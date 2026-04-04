import { createFileRoute } from '@tanstack/react-router'
import { StackPage } from '../../../components/layout/StackPage'
import { Toggle } from '../../../components/admin/Toggle'
import { useSettings } from '../../../hooks/useSettings'

export const Route = createFileRoute('/admin/settings/')({
    component: RouteComponent,
})

function RouteComponent() {
    const { settings, update } = useSettings()

    return (
        <StackPage title="Réglages">
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
        </StackPage>
    )
}
