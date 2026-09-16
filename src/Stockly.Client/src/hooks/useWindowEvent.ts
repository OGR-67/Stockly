import { useEffect } from 'react'

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- T lets callers type the event detail explicitly (e.g. useWindowEvent<string>)
export function useWindowEvent<T = void>(event: string, handler: (detail: T) => void) {
    useEffect(() => {
        function listener(e: Event) {
            handler((e as CustomEvent<T>).detail)
        }
        window.addEventListener(event, listener)
        return () => { window.removeEventListener(event, listener); }
    }, [])
}
