const BASE_URL = import.meta.env.VITE_API_URL ?? ''

async function handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 401) {
        window.dispatchEvent(new CustomEvent('auth-required'))
        const error = new Error('Non authentifié') as Error & { status: number }
        error.status = 401
        throw error
    }

    if (!response.ok) {
        let message = response.statusText
        try {
            const problem = await response.json()
            message = problem.detail ?? problem.title ?? message
        } catch {
            // ignore
        }
        const error = new Error(message) as Error & { status: number }
        error.status = response.status
        throw error
    }

    if (response.status === 204) return undefined as T
    return response.json() as Promise<T>
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`, {
        method,
        credentials: 'include',
        headers: body !== undefined ? { 'Content-Type': 'application/json' } : {},
        body: body !== undefined ? JSON.stringify(body) : undefined,
    })

    return handleResponse<T>(response)
}

async function requestForm<T>(method: string, path: string, formData: FormData): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`, {
        method,
        credentials: 'include',
        body: formData,
    })

    return handleResponse<T>(response)
}

export const apiClient = {
    get: <T>(path: string) => request<T>('GET', path),
    post: <T>(path: string, body: unknown) => request<T>('POST', path, body),
    postForm: <T>(path: string, formData: FormData) => requestForm<T>('POST', path, formData),
    put: <T>(path: string, body: unknown) => request<T>('PUT', path, body),
    patch: <T>(path: string, body: unknown) => request<T>('PATCH', path, body),
    del: (path: string) => request<void>('DELETE', path),
}

export function toDate(value: string | null | undefined): Date | null {
    if (!value) return null
    return new Date(value)
}
