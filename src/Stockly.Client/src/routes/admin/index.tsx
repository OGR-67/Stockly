import { createFileRoute } from '@tanstack/react-router'
import { RootPage } from '../../components/layout/RootPage'

export const Route = createFileRoute('/admin/')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <RootPage title="Admin">
            <div>Hello "/admin/"!</div>
        </RootPage>
    )
}
