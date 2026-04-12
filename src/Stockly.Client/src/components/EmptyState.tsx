interface EmptyStateProps {
    message: string
    error?: boolean
}

export function EmptyState({ message, error }: EmptyStateProps) {
    return (
        <p className={`text-center py-8 ${error ? 'text-red-400' : 'text-stone-400'}`}>
            {message}
        </p>
    )
}
