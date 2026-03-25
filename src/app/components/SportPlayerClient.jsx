'use client';

import { useEffect, useState, useRef } from 'react';
import Navbar from './Navbar';
import Link from 'next/link';
import Hls from 'hls.js';

import { IoHome } from 'react-icons/io5';
import { MdLiveTv, MdFullscreen, MdRefresh } from 'react-icons/md';
import { SPORT_CONFIGS } from './SportPageClient';

const API_URL = 'https://sportmeriah-backend-production.up.railway.app';
const VPS_STREAM_BASE = 'https://stream.nobarmeriah.com';

export default function SportPlayerClient({ sport, streamId }) {
    const config = SPORT_CONFIGS[sport];
    const SportIcon = config?.icon || MdLiveTv;

    const videoRef = useRef(null);
    const hlsRef = useRef(null);

    const [streamInfo, setStreamInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const streamUrl = `${VPS_STREAM_BASE}/hls/sphere_${streamId}.m3u8`;

    useEffect(() => {
        fetchStreamInfo();
    }, [streamId]);

    useEffect(() => {
        if (!loading && videoRef.current) {
            initHls();
        }

        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
            }
        };
    }, [loading]);

    const fetchStreamInfo = async () => {
        try {
            const res = await fetch(`${API_URL}/api/sports/${sport}/stream/${streamId}`);
            const data = await res.json();
            if (data.success) {
                setStreamInfo(data.stream);
            }
        } catch (err) {
            console.error('Failed to fetch stream info:', err);
        } finally {
            setLoading(false);
        }
    };

    const initHls = () => {
        const video = videoRef.current;
        if (!video) return;

        if (hlsRef.current) {
            hlsRef.current.destroy();
        }

        if (Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90,
                maxBufferLength: 30,
                maxMaxBufferLength: 600,
                maxBufferSize: 60 * 1000 * 1000,
                maxBufferHole: 0.5,
                liveSyncDurationCount: 3,
                liveMaxLatencyDurationCount: 10,
                fragLoadingTimeOut: 20000,
                fragLoadingMaxRetry: 6,
                fragLoadingRetryDelay: 1000,
                manifestLoadingTimeOut: 15000,
                manifestLoadingMaxRetry: 4,
            });

            hls.loadSource(streamUrl);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play().catch(() => {});
                setIsPlaying(true);
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            console.error('Network error, trying to recover...');
                            hls.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.error('Media error, trying to recover...');
                            hls.recoverMediaError();
                            break;
                        default:
                            setError('Stream tidak tersedia. Coba refresh atau kembali nanti.');
                            hls.destroy();
                            break;
                    }
                }
            });

            hlsRef.current = hls;
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
            video.addEventListener('loadedmetadata', () => {
                video.play().catch(() => {});
                setIsPlaying(true);
            });
        }
    };

    const handleRefresh = () => {
        setError(null);
        initHls();
    };

    const handleFullscreen = () => {
        const video = videoRef.current;
        if (!video) return;

        if (video.requestFullscreen) {
            video.requestFullscreen();
        } else if (video.webkitRequestFullscreen) {
            video.webkitRequestFullscreen();
        } else if (video.msRequestFullscreen) {
            video.msRequestFullscreen();
        }
    };

    return (
        <main className="min-h-screen bg-gray-900">
            <Navbar />

            <div className="container max-w-5xl mx-auto px-4 py-6">

                {/* Breadcrumb */}
                <div className="flex items-center gap-2 mb-4 text-sm">
                    <Link href="/" className="text-gray-400 hover:text-white">
                        <IoHome size={16} />
                    </Link>
                    <span className="text-gray-600">/</span>
                    <Link href={`/sports/${sport}`} className={`${config?.color || 'text-gray-400'} hover:text-white`}>
                        {config?.name || 'Sports'}
                    </Link>
                    <span className="text-gray-600">/</span>
                    <span className="text-gray-400 truncate max-w-[200px]">
                        {streamInfo?.name || `Stream ${streamId}`}
                    </span>
                </div>

                {/* Video Player */}
                <div className="bg-black rounded-lg overflow-hidden relative">
                    {loading ? (
                        <div className="aspect-video flex items-center justify-center">
                            <div className="text-center">
                                <div className="loader mb-4"></div>
                                <p className="text-gray-400">Memuat stream...</p>
                            </div>
                            <style jsx>{`
                                .loader {
                                    width: 48px;
                                    height: 48px;
                                    border-radius: 50%;
                                    display: inline-block;
                                    border-top: 4px solid #FFF;
                                    border-right: 4px solid transparent;
                                    box-sizing: border-box;
                                    animation: rotation 1s linear infinite;
                                }
                                @keyframes rotation {
                                    0% { transform: rotate(0deg); }
                                    100% { transform: rotate(360deg); }
                                }
                            `}</style>
                        </div>
                    ) : error ? (
                        <div className="aspect-video flex items-center justify-center">
                            <div className="text-center">
                                <p className="text-4xl mb-4">{config?.emoji || '📺'}</p>
                                <p className="text-gray-400 mb-4">{error}</p>
                                <button
                                    onClick={handleRefresh}
                                    className={`${config?.bgColor || 'bg-orange-600'} text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 mx-auto`}
                                >
                                    <MdRefresh size={20} />
                                    Coba Lagi
                                </button>
                            </div>
                        </div>
                    ) : (
                        <video
                            ref={videoRef}
                            className="w-full aspect-video"
                            controls
                            autoPlay
                            playsInline
                        />
                    )}
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between mt-3 bg-gray-800 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-3">
                        <SportIcon className={config?.color || 'text-orange-400'} size={24} />
                        <div>
                            <h2 className="text-white font-semibold text-sm sm:text-base truncate max-w-[250px] sm:max-w-[400px]">
                                {streamInfo?.name || `${config?.name || 'Sports'} Stream`}
                            </h2>
                            <p className="text-gray-400 text-xs">
                                {streamInfo?.league || config?.name || 'Sports'} • Sphere
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleRefresh}
                            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
                            title="Refresh Stream"
                        >
                            <MdRefresh size={20} />
                        </button>
                        <button
                            onClick={handleFullscreen}
                            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
                            title="Fullscreen"
                        >
                            <MdFullscreen size={20} />
                        </button>
                    </div>
                </div>

                {/* Back Link */}
                <div className="mt-6">
                    <Link
                        href={`/sports/${sport}`}
                        className={`${config?.color || 'text-orange-400'} hover:underline text-sm flex items-center gap-1`}
                    >
                        ← Kembali ke {config?.name || 'Sports'}
                    </Link>
                </div>
            </div>
        </main>
    );
}
