import { useRouter } from '@tanstack/react-router'

interface StackPageProps {
    title: string
    children: React.ReactNode
}

export function StackPage({ title, children }: StackPageProps) {
    const router = useRouter()

    return (
        <div className="flex flex-col h-full">
            <header className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
                <button onClick={() => router.history.back()}>←</button>
                <h1 className="text-xl font-semibold">{title}</h1>
            </header>
            <div className="flex-1 overflow-y-auto p-4">
                {children}
            </div>
        </div>
    )
}
