import { createFileRoute } from '@tanstack/react-router'
import { RootPage } from '../../components/layout/RootPage'

export const Route = createFileRoute('/stock/')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <RootPage title="Stock">
            <div>Hello "/stock/"!</div>
        </RootPage>
    )
}
