import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTableList, faBox, faTag, faLocationDot, faGear } from '@fortawesome/free-solid-svg-icons'
import { RootPage } from '../../components/layout/RootPage'
import { Modal } from '../../components/Modal'

export const Route = createFileRoute('/admin/')({
    component: RouteComponent,
})

const ENTITIES = [
    { label: 'Articles', icon: faBox, to: '/admin/products' },
    { label: 'Catégories', icon: faTag, to: '/admin/categories' },
    { label: 'Emplacements', icon: faLocationDot, to: '/admin/locations' },
] as const

function RouteComponent() {
    const navigate = useNavigate()
    const [modalOpen, setModalOpen] = useState(false)

    return (
        <RootPage title="Admin">
            <div className="flex flex-col gap-3">
            <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-3 w-full p-4 bg-cream rounded-xl border border-sage/30 shadow-sm text-bark font-medium"
            >
                <FontAwesomeIcon icon={faTableList} className="text-earth text-lg" />
                Référentiels
            </button>
            <button
                onClick={() => navigate({ to: '/admin/settings' })}
                className="flex items-center gap-3 w-full p-4 bg-cream rounded-xl border border-sage/30 shadow-sm text-bark font-medium"
            >
                <FontAwesomeIcon icon={faGear} className="text-earth text-lg" />
                Réglages
            </button>
            </div>

            {modalOpen && (
                <Modal title="Référentiels" onClose={() => setModalOpen(false)}>
                    <div className="flex flex-col gap-3">
                        {ENTITIES.map(({ label, icon, to }) => (
                            <button
                                key={to}
                                onClick={() => { setModalOpen(false); navigate({ to }) }}
                                className="flex items-center gap-3 p-4 bg-cream rounded-xl border border-sage/30 text-bark font-medium active:bg-sage-light/50"
                            >
                                <FontAwesomeIcon icon={icon} className="text-earth" />
                                {label}
                            </button>
                        ))}
                    </div>
                </Modal>
            )}
        </RootPage>
    )
}
