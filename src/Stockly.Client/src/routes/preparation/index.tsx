import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUtensils, faClipboardList } from '@fortawesome/free-solid-svg-icons'
import { haptic } from 'ios-haptics'
import { RootPage } from '../../components/layout/RootPage'
import { Card } from '../../components/Card'

export const Route = createFileRoute('/preparation/')({
    component: RouteComponent,
})

function RouteComponent() {
    const navigate = useNavigate()

    return (
        <RootPage title="Préparation">
            <div className="flex flex-col gap-3">
                <Card
                  onClick={() => {
                    haptic.confirm();
                    navigate({ to: '/preparation/recipes' });
                  }}
                >
                    <div className="text-2xl text-earth">
                        <FontAwesomeIcon icon={faUtensils} />
                    </div>
                    <div className="flex-1 text-left">
                        <p className="font-medium text-bark">Recettes</p>
                        <p className="text-xs text-stone-400">Parcourir et gérer vos recettes</p>
                    </div>
                </Card>

                <Card
                    onClick={() => {
                        haptic.confirm();
                        navigate({ to: '/preparation/grocery-list' });
                    }}
                >
                    <div className="text-2xl text-earth">
                        <FontAwesomeIcon icon={faClipboardList} />
                    </div>
                    <div className="flex-1 text-left">
                        <p className="font-medium text-bark">Liste de courses</p>
                        <p className="text-xs text-stone-400">Générer et gérer votre liste de courses</p>
                    </div>
                </Card>
            </div>
        </RootPage>
    )
}
