import { Outlet, createRootRoute, Link } from '@tanstack/react-router'

export const Route = createRootRoute({
    component: RootComponent,
})

function RootComponent() {
    const linkStyle = 'flex-1 flex flex-col items-center py-3 text-sm'
    return (
        <div className="flex flex-col h-screen">
            <main className="flex-1 overflow-y-auto">
                <Outlet />
            </main>
            <nav className="flex border-t border-gray-200">
                <Link
                    to="/stock"
                    className={linkStyle}
                    activeProps={{ className: 'text-blue-600' }}
                >
                    <span>📦</span>
                    <span>Stock</span>
                </Link>
                <Link
                    to="/store"
                    className={linkStyle}
                    activeProps={{ className: 'text-blue-600' }}
                >
                    <span>🛒</span>
                    <span>Ranger</span>
                </Link>
                <Link
                    to="/admin"
                    className={linkStyle}
                    activeProps={{ className: 'text-blue-600' }}
                >
                    <span>⚙️</span>
                    <span>Admin</span>
                </Link>
                {import.meta.env.DEV && (
                    <Link
                        to="/dev"
                        className={linkStyle}
                        activeProps={{ className: 'text-blue-600' }}
                    >
                        <span>🔧</span>
                        <span>Dev</span>
                    </Link>)}
            </nav>
        </div>
    )
}
