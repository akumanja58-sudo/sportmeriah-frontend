'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from './Navbar';
import VideoPlayer from './VideoPlayer';

import { FaTelegram, FaWhatsapp, FaFacebook, FaTwitter } from 'react-icons/fa';
import { IoHome } from 'react-icons/io5';
import { MdSportsTennis, MdSportsSoccer, MdSportsBasketball, MdSportsMotorsports, MdPlayArrow, MdShare, MdContentCopy, MdCheck, MdArrowBack } from 'react-icons/md';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://sportmeriah-backend-production.up.railway.app';

const parseChannelName = (name) => {
    if (!name) return { title: 'Tennis Live', league: 'Tennis' };
    let cleanName = name;
    cleanName = cleanName.replace(/^TENNIS\s*\d*\s*:\s*/i, '');
    cleanName = cleanName.replace(/\s*@\s*[\d:]+\s*(AM|PM)?.*$/i, '');
    let league = 'Tennis';
    const lower = name.toLowerCase();
    if (lower.includes('australian open')) league = 'Australian Open';
    else if (lower.includes('roland garros') || lower.includes('french open')) league = 'Roland Garros';
    else if (lower.includes('wimbledon')) league = 'Wimbledon';
    else if (lower.includes('us open')) league = 'US Open';
    else if (lower.includes('atp')) league = 'ATP';
    else if (lower.includes('wta')) league = 'WTA';
    return { title: cleanName.trim() || 'Tennis Live', league };
};

export default function TennisPlayerClient({ streamId }) {
    const searchParams = useSearchParams();
    const provider = searchParams.get('provider') || 'sphere';

    const [streamInfo, setStreamInfo] = useState(null);
    const [parsedInfo, setParsedInfo] = useState({ title: 'Tennis Live', league: 'Tennis' });
    const [relatedChannels, setRelatedChannels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [copied, setCopied] = useState(false);
    const [streamUrl, setStreamUrl] = useState(null);
    const [streamLoading, setStreamLoading] = useState(false);

    useEffect(() => {
        fetchStreamInfo();
        fetchRelatedChannels();
    }, [streamId, provider]);

    const fetchStreamInfo = async () => {
        try {
            setError(null);
            setLoading(true);
            const response = await fetch(`${API_URL}/api/tennis/stream/${streamId}`);
            const data = await response.json();
            if (data.success) {
                setStreamInfo(data.stream);
                if (data.stream?.name) setParsedInfo(parseChannelName(data.stream.name));

                setStreamLoading(true);
                const startRes = await fetch(`${API_URL}/api/streams/sphere/start/${streamId}`);
                const startData = await startRes.json();
                const waitTime = startData.message?.includes('already running') ? 1000 : 8000;
                await new Promise(resolve => setTimeout(resolve, waitTime));
                setStreamUrl(`https://stream.nobarmeriah.com/hls/sphere_${streamId}.m3u8`);
                setStreamLoading(false);
            } else {
                setError('Stream tidak ditemukan');
            }
        } catch (err) {
            console.error('Error fetching stream:', err);
            setError('Gagal memuat stream');
        } finally {
            setLoading(false);
        }
    };

    const fetchRelatedChannels = async () => {
        try {
            const response = await fetch(`${API_URL}/api/tennis`);
            const data = await response.json();
            if (data.success) {
                const channels = [...(data.channels?.all || []), ...(data.sportsTVChannels || [])]
                    .filter(ch => String(ch.id) !== String(streamId)).slice(0, 8);
                setRelatedChannels(channels);
            }
        } catch (err) { }
    };

    const refreshStream = () => { setIsPlaying(false); setStreamUrl(null); fetchStreamInfo(); };
    const copyLink = () => { navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); };

    const displayTitle = parsedInfo.title;
    const displayLeague = parsedInfo.league;
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareText = `Nonton ${displayTitle} live di NobarMeriah!`;

    // LOADING
    if (loading) {
        return (
            <main className="min-h-screen" style={{ backgroundColor: '#0a0c14' }}>
                <Navbar />
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <span className="loader"></span>
                    <p className="text-gray-500 mt-4 text-sm">Memuat stream...</p>
                    <style>{`
                        .loader { width: 40px; height: 40px; border-radius: 50%; display: inline-block; border-top: 3px solid #fff; border-right: 3px solid transparent; box-sizing: border-box; animation: rot 1s linear infinite; position: relative; }
                        .loader::after { content: ''; box-sizing: border-box; position: absolute; left: 0; top: 0; width: 40px; height: 40px; border-radius: 50%; border-left: 3px solid #eab308; border-bottom: 3px solid transparent; animation: rot 0.5s linear infinite reverse; }
                        @keyframes rot { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                    `}</style>
                </div>
            </main>
        );
    }

    // ERROR
    if (error && !streamInfo) {
        return (
            <main className="min-h-screen" style={{ backgroundColor: '#0a0c14' }}>
                <Navbar />
                <div className="max-w-6xl mx-auto px-4 py-8">
                    <div className="rounded-xl p-6 text-center" style={{ backgroundColor: '#1a1d27', border: '1px solid rgba(239,68,68,0.2)' }}>
                        <MdSportsTennis size={40} className="text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-300 font-medium mb-1">{error}</p>
                        <Link href="/tennis" className="text-yellow-400 hover:text-yellow-300 text-sm mt-3 inline-flex items-center gap-1">
                            <MdArrowBack size={16} /> Kembali ke Tennis
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen" style={{ backgroundColor: '#0a0c14' }}>
            <Navbar />

            <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">

                {/* VIDEO PLAYER */}
                <div className="relative mb-4">
                    {streamUrl && isPlaying ? (
                        <VideoPlayer
                            streamUrl={streamUrl}
                            title={displayTitle}
                            isLive={true}
                            onRefresh={refreshStream}
                        />
                    ) : streamLoading ? (
                        <div className="rounded-xl aspect-video flex items-center justify-center" style={{ backgroundColor: '#111318' }}>
                            <div className="text-center">
                                <span className="loader"></span>
                                <p className="text-gray-400 mt-4 text-sm">Memuat Stream...</p>
                                <style>{`
                                    .loader { width: 40px; height: 40px; border-radius: 50%; display: inline-block; border-top: 3px solid #fff; border-right: 3px solid transparent; box-sizing: border-box; animation: rot 1s linear infinite; position: relative; }
                                    .loader::after { content: ''; box-sizing: border-box; position: absolute; left: 0; top: 0; width: 40px; height: 40px; border-radius: 50%; border-left: 3px solid #eab308; border-bottom: 3px solid transparent; animation: rot 0.5s linear infinite reverse; }
                                    @keyframes rot { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                                `}</style>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-xl aspect-video w-full overflow-hidden relative" style={{ backgroundColor: '#111318' }}>
                            <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-4">
                                <h1 className="text-lg sm:text-2xl font-bold text-white mb-2">{displayTitle}</h1>
                                <p className="text-yellow-500 text-sm mb-4 flex items-center gap-2">
                                    <MdSportsTennis size={16} /> {displayLeague}
                                </p>
                                <div className="flex items-center justify-center gap-2 text-sm font-semibold text-emerald-400 mb-5">
                                    <span className="relative flex h-2.5 w-2.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                    </span>
                                    READY
                                </div>
                                <button
                                    onClick={() => { if (streamUrl) setIsPlaying(true); }}
                                    disabled={!streamUrl}
                                    className={`font-semibold py-3 px-8 rounded-xl text-base transition-all transform flex items-center gap-2 ${streamUrl ? 'bg-yellow-500 hover:bg-yellow-600 text-black hover:scale-105 shadow-lg' : 'text-gray-500 cursor-wait'}`}
                                    style={!streamUrl ? { backgroundColor: '#232733' } : {}}
                                >
                                    <MdPlayArrow size={22} />
                                    {streamUrl ? 'Tonton Sekarang' : 'Mempersiapkan...'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* CONTENT */}
                <div className="flex flex-col lg:flex-row gap-5">
                    <div className="w-full lg:w-3/4 space-y-4">

                        {/* Breadcrumb */}
                        <nav className="text-sm text-gray-500 hidden sm:block">
                            <ol className="flex items-center gap-2">
                                <li><Link href="/" className="hover:text-gray-300 flex items-center gap-1 transition-colors"><IoHome size={13} /> Home</Link></li>
                                <li className="text-gray-700">/</li>
                                <li><Link href="/tennis" className="hover:text-gray-300 flex items-center gap-1 transition-colors"><MdSportsTennis size={13} /> Tennis</Link></li>
                                <li className="text-gray-700">/</li>
                                <li className="text-gray-400 truncate max-w-[200px]">{displayTitle}</li>
                            </ol>
                        </nav>

                        {/* Info Card */}
                        <div className="rounded-xl p-4" style={{ backgroundColor: '#1a1d27' }}>
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                    <h2 className="text-base sm:text-lg font-bold text-white mb-1">{displayTitle}</h2>
                                    <p className="text-gray-500 text-xs sm:text-sm flex items-center gap-2">
                                        <MdSportsTennis className="text-yellow-500 flex-shrink-0" size={14} />
                                        <span className="truncate">{displayLeague}</span>
                                    </p>
                                </div>
                                <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-yellow-500 text-black flex-shrink-0">
                                    <span className="relative flex h-1.5 w-1.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-40"></span>
                                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-black"></span>
                                    </span>
                                    LIVE
                                </span>
                            </div>
                        </div>

                        {/* Share */}
                        <div className="rounded-xl p-4" style={{ backgroundColor: '#1a1d27' }}>
                            <h3 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm">
                                <MdShare size={16} className="text-gray-400" /> Bagikan
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                <a href={`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`} target="_blank" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-white" style={{ backgroundColor: '#25D366' }}><FaWhatsapp size={14} /> <span className="hidden sm:inline">WhatsApp</span></a>
                                <a href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`} target="_blank" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-white" style={{ backgroundColor: '#0088cc' }}><FaTelegram size={14} /> <span className="hidden sm:inline">Telegram</span></a>
                                <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`} target="_blank" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-white" style={{ backgroundColor: '#1DA1F2' }}><FaTwitter size={14} /> <span className="hidden sm:inline">Twitter</span></a>
                                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-white" style={{ backgroundColor: '#1877F2' }}><FaFacebook size={14} /> <span className="hidden sm:inline">Facebook</span></a>
                                <button onClick={copyLink} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-300" style={{ backgroundColor: '#232733' }}>
                                    {copied ? <MdCheck size={14} className="text-emerald-400" /> : <MdContentCopy size={14} />}
                                    <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
                                </button>
                            </div>
                        </div>

                        {/* SEO */}
                        <div className="rounded-xl p-4 hidden sm:block" style={{ backgroundColor: '#1a1d27' }}>
                            <h2 className="text-base font-semibold text-white mb-2">Streaming {displayLeague} Gratis</h2>
                            <p className="text-gray-500 text-sm leading-relaxed">Tonton {displayTitle} secara gratis di NobarMeriah. Live streaming tennis dengan kualitas HD.</p>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="w-full lg:w-1/4">
                        <div className="rounded-xl p-4 lg:sticky lg:top-32" style={{ backgroundColor: '#1a1d27' }}>
                            <h3 className="text-white font-semibold mb-4 flex items-center gap-2 text-sm">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                                </span>
                                Channel Lainnya
                            </h3>
                            {relatedChannels.length > 0 ? (
                                <div className="space-y-2">
                                    {relatedChannels.map((channel, index) => {
                                        const parsed = parseChannelName(channel.name);
                                        return (
                                            <Link key={channel.id || index} href={`/tennis/${channel.id}?provider=sphere`}
                                                className="block rounded-lg p-2.5 transition-colors"
                                                style={{ backgroundColor: '#232733' }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a2e3a'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#232733'}>
                                                <div className="flex items-center gap-2">
                                                    <MdSportsTennis size={12} className="text-yellow-500 flex-shrink-0" />
                                                    <span className="text-gray-300 text-xs truncate flex-1">{parsed.title}</span>
                                                </div>
                                                <span className="text-gray-600 text-[10px] mt-1 block">{parsed.league}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-gray-600 text-xs">Tidak ada channel lainnya</p>
                            )}

                            <div className="mt-5 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Quick Links</h4>
                                <div className="space-y-2">
                                    <Link href="/tennis" className="block text-gray-500 hover:text-yellow-400 text-sm flex items-center gap-2 transition-colors"><MdSportsTennis size={14} /> Semua Tennis</Link>
                                    <Link href="/football" className="block text-gray-500 hover:text-emerald-400 text-sm flex items-center gap-2 transition-colors"><MdSportsSoccer size={14} /> Sepakbola</Link>
                                    <Link href="/basketball" className="block text-gray-500 hover:text-orange-400 text-sm flex items-center gap-2 transition-colors"><MdSportsBasketball size={14} /> Basketball</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Nav */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden" style={{ backgroundColor: '#0a0c14', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex justify-around items-center py-2.5 px-1">
                    <Link href="/" className="flex flex-col items-center px-3 py-1 text-gray-500 hover:text-emerald-400 transition-colors"><IoHome size={20} /><span className="text-[10px] mt-1">Beranda</span></Link>
                    <Link href="/football" className="flex flex-col items-center px-3 py-1 text-gray-500 hover:text-emerald-400 transition-colors"><MdSportsSoccer size={20} /><span className="text-[10px] mt-1">Sepakbola</span></Link>
                    <Link href="/tennis" className="flex flex-col items-center px-3 py-1 text-yellow-400"><MdSportsTennis size={20} /><span className="text-[10px] mt-1 font-medium">Tennis</span></Link>
                    <a href="https://t.me/sportmeriah" target="_blank" className="flex flex-col items-center px-3 py-1 text-gray-500 hover:text-blue-400 transition-colors"><FaTelegram size={20} /><span className="text-[10px] mt-1">Telegram</span></a>
                </div>
            </nav>
            <div className="h-16 md:hidden"></div>
        </main>
    );
}
