import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'

interface IconButtonProps {
    icon: IconDefinition
    onClick?: () => void
    variant?: 'neutral' | 'primary'
    shape?: 'round' | 'tile'
    title?: string
}

const variants = {
    neutral: { bg: 'bg-stone-100', icon: 'text-stone-500 text-sm' },
    primary: { bg: 'bg-sage-light', icon: 'text-earth' },
}

const shapes = {
    round: 'w-9 h-9 rounded-full flex items-center justify-center shrink-0',
    tile: 'px-3 py-2 rounded-lg',
}

export function IconButton({ icon, onClick, variant = 'neutral', shape = 'round', title }: IconButtonProps) {
    const { bg, icon: iconClass } = variants[variant]
    const className = `${shapes[shape]} ${bg}`

    if (onClick) {
        return (
            <button onClick={onClick} className={className} title={title}>
                <FontAwesomeIcon icon={icon} className={iconClass} />
            </button>
        )
    }

    return (
        <div className={className}>
            <FontAwesomeIcon icon={icon} className={iconClass} />
        </div>
    )
}
