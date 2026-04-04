import { Outlet, createRootRoute, Link, useLocation } from '@tanstack/react-router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWarehouse, faCartShopping, faGear, faCode } from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons'

export const Route = createRootRoute({
    component: RootComponent,
})

function NavLink({ to, icon, label }: { to: string; icon: IconDefinition; label: string }) {
    const { pathname } = useLocation()
    const isActive = pathname.startsWith(to)
    return (
        <Link
            to={to}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors ${isActive ? 'text-earth font-semibold' : 'text-sage font-normal'}`}
        >
            <FontAwesomeIcon icon={icon} className="text-lg" />
            <span>{label}</span>
        </Link>
    )
}

function RootComponent() {
    return (
        <div className="flex flex-col h-screen bg-sage-light/40">
            <main className="flex-1 overflow-y-auto">
                <Outlet />
            </main>
            <nav className="flex border-t border-sage bg-sage-light/50">
                <NavLink to="/stock" icon={faWarehouse} label="Stock" />
                <NavLink to="/store" icon={faCartShopping} label="Ranger" />
                <NavLink to="/admin" icon={faGear} label="Admin" />
                {import.meta.env.DEV && (
                    <NavLink to="/dev" icon={faCode} label="Dev" />
                )}
            </nav>
        </div>
    )
}
