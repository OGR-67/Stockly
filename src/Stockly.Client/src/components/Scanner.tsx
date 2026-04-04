import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader, BarcodeFormat } from '@zxing/browser'
import type { IScannerControls } from '@zxing/browser'
import { DecodeHintType } from '@zxing/library'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faBolt, faLightbulb } from '@fortawesome/free-solid-svg-icons'

interface ScannerProps {
    onScan: (barcode: string) => void
    onClose: () => void
}

export function Scanner({ onScan, onClose }: ScannerProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const controlsRef = useRef<IScannerControls | null>(null)
    const onScanRef = useRef(onScan)
    const onCloseRef = useRef(onClose)
    const hasScannedRef = useRef(false)
    const [error, setError] = useState<'permission' | 'no-camera' | null>(null)
    const [torchAvailable, setTorchAvailable] = useState(false)
    const [torchOn, setTorchOn] = useState(false)
    const streamRef = useRef<MediaStream | null>(null)


    useEffect(() => {
        onScanRef.current = onScan
    }, [onScan])

    useEffect(() => {
        onCloseRef.current = onClose
    }, [onClose])

    useEffect(() => {
        hasScannedRef.current = false
        const hints = new Map()
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [
            BarcodeFormat.EAN_13,
            BarcodeFormat.EAN_8,
            BarcodeFormat.CODE_128,
            BarcodeFormat.QR_CODE,
        ])
        const reader = new BrowserMultiFormatReader(hints, {
            delayBetweenScanAttempts: 100,
            delayBetweenScanSuccess: 2000,
        })

        function stopCamera() {
            controlsRef.current?.stop()
            if (videoRef.current) {
                videoRef.current.pause()
                videoRef.current.srcObject = null
            }
            streamRef.current?.getTracks().forEach(track => {
                track.enabled = false
                track.stop()
            })
            streamRef.current = null
        }

        async function startScan() {
            try {
                controlsRef.current = await reader.decodeFromVideoDevice(
                    undefined,
                    videoRef.current!,
                    (result) => {
                        if (result && !hasScannedRef.current) {
                            hasScannedRef.current = true
                            stopCamera()
                            onScanRef.current(result.getText())
                            onCloseRef.current()
                        }
                    }
                )

                const stream = videoRef.current?.srcObject as MediaStream
                streamRef.current = stream
                const track = stream?.getVideoTracks()[0]
                const capabilities = track?.getCapabilities() as MediaTrackCapabilities & { torch?: boolean }
                if (capabilities?.torch) {
                    setTorchAvailable(true)
                }

            } catch (e: unknown) {
                if (e instanceof Error && e.message.includes('Permission')) {
                    setError('permission')
                } else {
                    setError('no-camera')
                }
            }
        }

        startScan()

        return () => {
            hasScannedRef.current = true
            stopCamera()
        }
    }, [])

    async function toggleTorch() {
        const stream = videoRef.current?.srcObject as MediaStream
        const track = stream?.getVideoTracks()[0]
        await track?.applyConstraints({ advanced: [{ torch: !torchOn } as MediaTrackConstraintSet] })
        setTorchOn(!torchOn)
    }

    if (error === 'permission') {
        return (
            <div className="fixed inset-0 bg-black flex flex-col items-center justify-center gap-4 z-50">
                <p className="text-white text-center px-8">
                    L'accès à la caméra est nécessaire pour scanner.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-earth text-white rounded-lg"
                >
                    Autoriser la caméra
                </button>
                <button onClick={onClose} className="text-stone-400 text-sm">
                    Annuler
                </button>
            </div>
        )
    }

    if (error === 'no-camera') {
        return (
            <div className="fixed inset-0 bg-black flex flex-col items-center justify-center gap-4 z-50">
                <p className="text-white text-center px-8">
                    Aucune caméra détectée sur cet appareil.
                </p>
                <button onClick={onClose} className="px-4 py-2 bg-earth text-white rounded-lg">
                    Fermer
                </button>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-black z-50">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 text-white text-xl w-9 h-9 flex items-center justify-center rounded-full bg-black/40"
            >
                <FontAwesomeIcon icon={faXmark} />
            </button>

            <video ref={videoRef} className="w-full h-full object-cover" />

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 border-2 border-white rounded-lg opacity-70" />
            </div>

            {torchAvailable && (
                <button
                    onClick={toggleTorch}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white text-2xl w-12 h-12 flex items-center justify-center rounded-full bg-black/40"
                >
                    <FontAwesomeIcon icon={torchOn ? faBolt : faLightbulb} />
                </button>
            )}
        </div>
    )
}
