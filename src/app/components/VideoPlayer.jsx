'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';

export default function VideoPlayer({ streamUrl, title, isLive = true, onRefresh, onSwitchServer, altServerLabel }) {
    const videoRef = useRef(null);
    const hlsRef = useRef(null);
    const containerRef = useRef(null);
    const controlsTimeoutRef = useRef(null);

    const [playing, setPlaying] = useState(false);
    const [muted, setMuted] = useState(false);
    const [volume, setVolume] = useState(1);
    const [showControls, setShowControls] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [buffered, setBuffered] = useState(0);
    const [showVolSlider, setShowVolSlider] = useState(false);

    // ========== HLS SETUP ==========
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !streamUrl) return;

        if (Hls.isSupported()) {
            const hls = new Hls({
                maxBufferLength: 60,
                maxMaxBufferLength: 120,
                maxBufferSize: 60 * 1000 * 1000,
                maxBufferHole: 1.0,
                liveSyncDurationCount: 4,
                liveMaxLatencyDurationCount: 8,
                liveDurationInfinity: true,
                manifestLoadingMaxRetry: 10,
                manifestLoadingRetryDelay: 1000,
                levelLoadingMaxRetry: 10,
                levelLoadingRetryDelay: 1000,
                fragLoadingMaxRetry: 10,
                fragLoadingRetryDelay: 1000,
                startPosition: -1,
                autoStartLoad: true,
                startLevel: 0,
            });

            hls.loadSource(streamUrl);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play().then(() => setPlaying(true)).catch(() => { });
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            hls.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            hls.recoverMediaError();
                            break;
                        default:
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
            video.src = streamUrl;
            video.addEventListener('loadedmetadata', () => {
                video.play().then(() => setPlaying(true)).catch(() => { });
            });
        }
    }, [streamUrl]);

    // ========== VIDEO EVENT LISTENERS ==========
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const onPlay = () => setPlaying(true);
        const onPause = () => setPlaying(false);
        const onTimeUpdate = () => setCurrentTime(video.currentTime);
        const onProgress = () => {
            if (video.buffered.length > 0) {
                setBuffered(video.buffered.end(video.buffered.length - 1));
            }
        };
        const onVolumeChange = () => {
            setMuted(video.muted);
            setVolume(video.volume);
        };

        video.addEventListener('play', onPlay);
        video.addEventListener('pause', onPause);
        video.addEventListener('timeupdate', onTimeUpdate);
        video.addEventListener('progress', onProgress);
        video.addEventListener('volumechange', onVolumeChange);

        return () => {
            video.removeEventListener('play', onPlay);
            video.removeEventListener('pause', onPause);
            video.removeEventListener('timeupdate', onTimeUpdate);
            video.removeEventListener('progress', onProgress);
            video.removeEventListener('volumechange', onVolumeChange);
        };
    }, []);

    // ========== FULLSCREEN LISTENER ==========
    useEffect(() => {
        const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', onFsChange);
        return () => document.removeEventListener('fullscreenchange', onFsChange);
    }, []);

    // ========== AUTO HIDE CONTROLS ==========
    const resetControlsTimeout = useCallback(() => {
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => {
            if (playing) setShowControls(false);
        }, 3000);
    }, [playing]);

    useEffect(() => {
        if (!playing) {
            setShowControls(true);
            if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        }
    }, [playing]);

    // ========== CONTROLS ==========
    const togglePlay = () => {
        const video = videoRef.current;
        if (!video) return;
        if (video.paused) {
            video.play();
        } else {
            video.pause();
        }
    };

    const toggleMute = () => {
        const video = videoRef.current;
        if (!video) return;
        video.muted = !video.muted;
    };

    const handleVolumeChange = (e) => {
        const video = videoRef.current;
        if (!video) return;
        const val = parseFloat(e.target.value);
        video.volume = val;
        video.muted = val === 0;
    };

    const toggleFullscreen = () => {
        const el = containerRef.current;
        if (!el) return;
        if (!document.fullscreenElement) {
            el.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    const togglePiP = async () => {
        const video = videoRef.current;
        if (!video) return;
        try {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
            } else {
                await video.requestPictureInPicture();
            }
        } catch (err) {
            console.log('PiP not supported');
        }
    };

    const seekToLive = () => {
        const video = videoRef.current;
        if (!video) return;
        if (video.buffered.length > 0) {
            video.currentTime = video.buffered.end(video.buffered.length - 1);
        }
    };

    // ========== ICONS (inline SVG for zero dependencies) ==========
    const PlayIcon = () => (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M8 5v14l11-7z" />
        </svg>
    );

    const PauseIcon = () => (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
        </svg>
    );

    const VolumeUpIcon = () => (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
        </svg>
    );

    const VolumeMuteIcon = () => (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
        </svg>
    );

    const FullscreenIcon = () => (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
        </svg>
    );

    const ExitFullscreenIcon = () => (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
        </svg>
    );

    const PipIcon = () => (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 1.98 2 1.98h18c1.1 0 2-.88 2-1.98V5c0-1.1-.9-2-2-2zm0 16.01H3V4.98h18v14.03z" />
        </svg>
    );

    const RefreshIcon = () => (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
        </svg>
    );

    const ServerIcon = () => (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M20 13H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zM7 19c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM20 3H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zM7 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
        </svg>
    );

    return (
        <div
            ref={containerRef}
            className="relative w-full aspect-video bg-black rounded-lg overflow-hidden group select-none"
            onMouseMove={resetControlsTimeout}
            onMouseLeave={() => { if (playing) setShowControls(false); }}
            onTouchStart={resetControlsTimeout}
        >
            {/* Video Element */}
            <video
                ref={videoRef}
                className="w-full h-full object-contain cursor-pointer"
                playsInline
                onClick={togglePlay}
            />

            {/* Click to play overlay (when paused) */}
            {!playing && (
                <div
                    className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/30"
                    onClick={togglePlay}
                >
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition">
                        <PlayIcon />
                    </div>
                </div>
            )}

            {/* Bottom Controls Bar */}
            <div
                className={`absolute bottom-0 left-0 right-0 transition-opacity duration-300 ${showControls || !playing ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
            >
                {/* Gradient overlay */}
                <div className="bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-10 pb-2 px-3">

                    {/* Controls row */}
                    <div className="flex items-center gap-2">

                        {/* Play/Pause */}
                        <button
                            onClick={togglePlay}
                            className="text-white hover:text-white/80 transition p-1"
                            title={playing ? 'Pause' : 'Play'}
                        >
                            {playing ? <PauseIcon /> : <PlayIcon />}
                        </button>

                        {/* Volume */}
                        <div
                            className="flex items-center gap-1 relative"
                            onMouseEnter={() => setShowVolSlider(true)}
                            onMouseLeave={() => setShowVolSlider(false)}
                        >
                            <button
                                onClick={toggleMute}
                                className="text-white hover:text-white/80 transition p-1"
                                title={muted ? 'Unmute' : 'Mute'}
                            >
                                {muted || volume === 0 ? <VolumeMuteIcon /> : <VolumeUpIcon />}
                            </button>

                            {/* Volume Slider */}
                            <div className={`flex items-center overflow-hidden transition-all duration-200 ${showVolSlider ? 'w-20 opacity-100' : 'w-0 opacity-0'}`}>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={muted ? 0 : volume}
                                    onChange={handleVolumeChange}
                                    className="w-full h-1 accent-white cursor-pointer"
                                    style={{
                                        background: `linear-gradient(to right, white ${(muted ? 0 : volume) * 100}%, rgba(255,255,255,0.3) ${(muted ? 0 : volume) * 100}%)`
                                    }}
                                />
                            </div>
                        </div>

                        {/* LIVE Badge */}
                        {isLive && (
                            <button
                                onClick={seekToLive}
                                className="flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold text-white hover:opacity-80 transition"
                                title="Jump to live"
                            >
                                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                LIVE
                            </button>
                        )}

                        {/* Title (truncated) */}
                        {title && (
                            <span className="text-white/60 text-xs truncate max-w-[200px] hidden sm:block">
                                {title}
                            </span>
                        )}

                        {/* Spacer */}
                        <div className="flex-1" />

                        {/* Refresh */}
                        {onRefresh && (
                            <button
                                onClick={onRefresh}
                                className="text-white/70 hover:text-white transition p-1.5"
                                title="Refresh stream"
                            >
                                <RefreshIcon />
                            </button>
                        )}

                        {/* Switch Server */}
                        {onSwitchServer && (
                            <button
                                onClick={onSwitchServer}
                                className="flex items-center gap-1 text-white/70 hover:text-white transition px-1.5 py-0.5 text-[10px] font-bold rounded hover:bg-white/10"
                                title={altServerLabel || 'Switch server'}
                            >
                                <ServerIcon />
                                <span className="hidden sm:inline">{altServerLabel || 'Server 2'}</span>
                            </button>
                        )}

                        {/* PiP */}
                        <button
                            onClick={togglePiP}
                            className="text-white/70 hover:text-white transition p-1"
                            title="Picture in Picture"
                        >
                            <PipIcon />
                        </button>

                        {/* Fullscreen */}
                        <button
                            onClick={toggleFullscreen}
                            className="text-white/70 hover:text-white transition p-1"
                            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                        >
                            {isFullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
