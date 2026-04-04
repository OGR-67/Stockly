export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <label className="flex items-center justify-between py-2 cursor-pointer">
            <span className="text-sm text-stone-700">{label}</span>
            <div
                onClick={() => onChange(!checked)}
                className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 ${checked ? 'bg-earth' : 'bg-stone-300'}`}
            >
                <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
            </div>
        </label>
    )
}
