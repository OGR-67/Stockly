type BannerVariant = 'success' | 'warning'

interface StatusBannerProps {
    variant: BannerVariant
    children: React.ReactNode
}

const variantStyles: Record<BannerVariant, { bg: string; border: string; text: string }> = {
    success: { bg: 'bg-sage-light/50', border: 'border-sage/30', text: 'text-bark' },
    warning: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-900' },
}

export function StatusBanner({ variant, children }: StatusBannerProps) {
    const styles = variantStyles[variant]
    return (
        <div className={`p-3 ${styles.bg} border ${styles.border} rounded-lg mb-2`}>
            <p className={`text-sm ${styles.text}`}>{children}</p>
        </div>
    )
}
