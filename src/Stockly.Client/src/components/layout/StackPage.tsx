import { useRouter } from '@tanstack/react-router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'

interface StackPageProps {
    title: string
    children: React.ReactNode
    action?: React.ReactNode
}

export function StackPage({ title, children, action }: StackPageProps) {
    const router = useRouter()

    return (
        <div className="flex flex-col h-full">
            <header className="flex items-center gap-3 px-4 py-4 bg-earth">
                <button onClick={() => router.history.back()} className="text-white/80 hover:text-white">
                    <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                <h1 className="flex-1 text-xl font-semibold text-white">{title}</h1>
                {action}
            </header>
            <div className="flex-1 overflow-y-auto p-4">
                {children}
            </div>
        </div>
    )
}
