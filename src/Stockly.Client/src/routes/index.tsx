import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
    beforeLoad: () => {
        // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router's redirect() is designed to be thrown, it extends Response not Error
        throw redirect({ to: '/stock' })
    },
})
