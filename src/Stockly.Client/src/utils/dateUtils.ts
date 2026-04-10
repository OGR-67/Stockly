export function toInputDate(date: Date): string {
    return date.toISOString().split('T')[0]
}

export function addDays(days: number): Date {
    return new Date(Date.now() + days * 86400000)
}
