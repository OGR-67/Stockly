import { createFileRoute } from '@tanstack/react-router'
import { RootPage } from '../../components/layout/RootPage'

export const Route = createFileRoute('/store/')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <RootPage title="Ranger">
            <div>Hello "/store/"!</div>
        </RootPage>
    )
}
