import { useState } from 'react'

const STORAGE_KEY = 'stockly_settings'

interface AppSettings {
    cameraEnabled: boolean
}

const defaults: AppSettings = { cameraEnabled: true }

function loadSettings(): AppSettings {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        return raw ? { ...defaults, ...JSON.parse(raw) } : defaults
    } catch {
        return defaults
    }
}

export function useSettings() {
    const [settings, setSettings] = useState<AppSettings>(loadSettings)

    function update(patch: Partial<AppSettings>) {
        setSettings(prev => {
            const next = { ...prev, ...patch }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
            return next
        })
    }

    return { settings, update }
}
