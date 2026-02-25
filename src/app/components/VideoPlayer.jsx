'use client';

import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

export default function VideoPlayer({ streamUrl }) {
    const videoRef = useRef(null);
    const hlsRef = useRef(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !streamUrl) return;

        if (Hls.isSupported()) {
            const hls = new Hls({
                // Buffer settings - lebih besar biar gak lag
                maxBufferLength: 60,           // buffer max 60 detik
                maxMaxBufferLength: 120,        // absolute max 120 detik
                maxBufferSize: 60 * 1000 * 1000, // 60MB buffer
                maxBufferHole: 1.0,             // toleransi gap antar segment

                // Live stream settings
                liveSyncDurationCount: 4,       // sync ke 4 segment dari live edge
                liveMaxLatencyDurationCount: 8, // max 8 segment delay
                liveDurationInfinity: true,     // treat sebagai infinite live stream

                // Retry & recovery
                manifestLoadingMaxRetry: 10,
                manifestLoadingRetryDelay: 1000,
                levelLoadingMaxRetry: 10,
                levelLoadingRetryDelay: 1000,
                fragLoadingMaxRetry: 10,
                fragLoadingRetryDelay: 1000,

                // Start dari live edge langsung
                startPosition: -1,

                // Disable ABR (kita cuma punya 1 quality)
                autoStartLoad: true,
                startLevel: 0,
            });

            hls.loadSource(streamUrl);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play().catch(() => { });
            });

            // Auto recovery kalau ada error
            hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            console.log('[HLS] Network error, trying to recover...');
                            hls.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.log('[HLS] Media error, trying to recover...');
                            hls.recoverMediaError();
                            break;
                        default:
                            console.log('[HLS] Fatal error, reloading source...');
                            hls.destroy();
                            hls.loadSource(streamUrl);
                            hls.attachMedia(video);
                            break;
                    }
                }
            });

            hlsRef.current = hls;

            return () => {
                hls.destroy();
            };
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // Safari native HLS
            video.src = streamUrl;
            video.addEventListener('loadedmetadata', () => {
                video.play().catch(() => { });
            });
        }
    }, [streamUrl]);

    return (
        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
            <video
                ref={videoRef}
                className="w-full h-full"
                controls
                playsInline
            />
        </div>
    );
}
