'use client';

import dynamic from 'next/dynamic';

// Dynamically import Map to avoid SSR issues with Leaflet
const NepalMap = dynamic(() => import('@/components/Map/NepalMap'), {
    ssr: false,
    loading: () => <div className="h-screen w-full flex items-center justify-center bg-gray-50 text-gray-400">Loading Map...</div>
});

export default function ElectionPage() {
    return (
        <div className="relative w-full h-screen bg-gray-50 overflow-hidden text-gray-900 font-sans">
            <NepalMap />
        </div>
    );
}
