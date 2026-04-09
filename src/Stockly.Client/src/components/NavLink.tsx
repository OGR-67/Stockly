import { Link, useLocation } from '@tanstack/react-router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons'

interface NavLinkProps {
    to: string
    icon: IconDefinition
    label: string
}

export function NavLink({ to, icon, label }: NavLinkProps) {
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
