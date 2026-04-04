interface RootPageProps {
    title: string
    children: React.ReactNode
}

export function RootPage({ title, children }: RootPageProps) {
    return (
        <div className="flex flex-col h-full">
            <header className="px-4 py-4 bg-earth">
                <h1 className="text-xl font-semibold text-white text-center">{title}</h1>
            </header>
            <div className="flex-1 overflow-y-auto p-4">
                {children}
            </div>
        </div>
    )
}
