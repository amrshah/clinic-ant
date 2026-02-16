import Image from 'next/image'

export default function Loading() {
    return (
        <div className="flex h-screen w-screen items-center justify-center">
            <div className="flex flex-col items-center gap-2">
                <div className="size-16 animate-pulse overflow-hidden rounded-xl border bg-card p-2 shadow-sm">
                    <Image
                        src="/logo.webp"
                        alt="Loading..."
                        width={64}
                        height={64}
                        className="size-full object-contain opacity-50"
                    />
                </div>
                <div className="h-1 w-24 overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-1/2 animate-[loading_1s_ease-in-out_infinite] rounded-full bg-primary" />
                </div>
            </div>
        </div>
    )
}
