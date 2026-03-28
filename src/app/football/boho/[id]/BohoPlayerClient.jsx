'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';

import { FaTelegram, FaWhatsapp, FaFacebook, FaTwitter } from 'react-icons/fa';
import { IoHome } from 'react-icons/io5';
import { MdSportsSoccer, MdSportsBasketball, MdPlayArrow, MdShare, MdContentCopy, MdCheck, MdArrowBack } from 'react-icons/md';
import { HiSignal, HiClock } from 'react-icons/hi2';

const BOHO_API = 'https://sport-meriah.com/debug.php';
const BOHO_STREAM_BASE = 'https://stream.sport-meriah.com';

export default function BohoPlayerClient({ matchId }) {
    const [match, setMatch] = useState(null);
    const [sources, setSources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [iframeUrl, setIframeUrl] = useState(null);
    const [activeServer, setActiveServer] = useState(null);
    const [copied, setCopied] = useState(false);
    const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    const countdownRef = useRef(null);

    useEffect(() => {
        fetchMatchDetail();
        return () => {
            if (countdownRef.current) clearInterval(countdownRef.current);
        };
    }, [matchId]);

    const fetchMatchDetail = async () => {
        try {
            setError(null);
            const res = await fetch(`${BOHO_API}?action=detail&id=${encodeURIComponent(matchId)}&sport=football`);
            const data = await res.json();

            if (data?.data) {
                setMatch(data.data);

                const now = Date.now();
                const matchTime = data.data.date || 0;
                const threeHoursAgo = now - (3 * 60 * 60 * 1000);
                const isLive = matchTime === 0 || (matchTime > threeHoursAgo && matchTime <= now);

                if (data.data.sources?.length > 0) {
                    const mappedSources = data.data.sources.map(src => ({
                        id: src.id,
                        streamNo: src.streamNo,
                        language: src.language || 'Multi',
                        hd: src.hd,
                        source: src.source,
                        viewers: src.viewers || 0,
                        proxyUrl: src.proxyUrl || `${BOHO_STREAM_BASE}/?source=${encodeURIComponent(src.source)}&id=${encodeURIComponent(src.id)}&variant=${src.streamNo}`,
                    }));
                    setSources(mappedSources);

                    // Auto-play if live
                    if (isLive) {
                        setTimeout(() => startStream(mappedSources[0]), 500);
                    }
                }

                // Start countdown if upcoming
                if (!isLive && matchTime > now) {
                    startCountdown(matchTime);
                }
            } else {
                setError('Pertandingan tidak ditemukan');
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Gagal memuat data pertandingan');
        } finally {
            setLoading(false);
        }
    };

    const startCountdown = (matchTime) => {
        const updateCountdown = () => {
            const now = Date.now();
            const diff = matchTime - now;
            if (diff <= 0) {
                clearInterval(countdownRef.current);
                fetchMatchDetail();
                return;
            }
            setCountdown({
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((diff % (1000 * 60)) / 1000)
            });
        };
        updateCountdown();
        countdownRef.current = setInterval(updateCountdown, 1000);
    };

    const startStream = (source) => {
        setIframeUrl(source.proxyUrl);
        setIsPlaying(true);
        setActiveServer(source);
    };

    const refreshStream = () => {
        if (!iframeUrl) return;
        const currentUrl = iframeUrl;
        setIframeUrl(null);
        setTimeout(() => setIframeUrl(currentUrl), 100);
    };

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Derived values
    const homeName = match?.teams?.home?.name || match?.title?.split(' vs ')[0] || 'Home';
    const awayName = match?.teams?.away?.name || match?.title?.split(' vs ')[1] || 'Away';
    const homeBadge = match?.teams?.home?.badge || '';
    const awayBadge = match?.teams?.away?.badge || '';
    const matchTitle = `${homeName} vs ${awayName}`;
    const category = match?.category || 'Football';

    const now = Date.now();
    const matchTime = match?.date || 0;
    const threeHoursAgo = now - (3 * 60 * 60 * 1000);
    const isLive = matchTime === 0 || (matchTime > threeHoursAgo && matchTime <= now);
    const isUpcoming = matchTime > now;

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareText = `Nonton ${matchTitle} LIVE di NobarMeriah!`;

    const formatKickoff = () => {
        if (!match?.date || match.date === 0) return 'Live Channel 24/7';
        const date = new Date(match.date);
        return date.toLocaleString('id-ID', {
            weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
        }) + ' WIB';
    };

    // ========== LOADING ==========
    if (loading) {
        return (
            <main className="min-h-screen" style={{ backgroundColor: '#0a0c14' }}>
                <Navbar />
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <span className="loader"></span>
                    <p className="text-gray-500 mt-4 text-sm">Memuat pertandingan...</p>
                    <style>{`.loader{width:40px;height:40px;border-radius:50%;display:inline-block;border-top:3px solid #fff;border-right:3px solid transparent;box-sizing:border-box;animation:rot 1s linear infinite;position:relative}.loader::after{content:'';box-sizing:border-box;position:absolute;left:0;top:0;width:40px;height:40px;border-radius:50%;border-left:3px solid #10b981;border-bottom:3px solid transparent;animation:rot .5s linear infinite reverse}@keyframes rot{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style>
                </div>
            </main>
        );
    }

    // ========== ERROR ==========
    if (error || !match) {
        return (
            <main className="min-h-screen" style={{ backgroundColor: '#0a0c14' }}>
                <Navbar />
                <div className="max-w-6xl mx-auto px-4 py-8">
                    <div className="rounded-xl p-6 text-center" style={{ backgroundColor: '#1a1d27', border: '1px solid rgba(239,68,68,0.2)' }}>
                        <MdSportsSoccer size={40} className="text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-300 font-medium mb-1">{error || 'Pertandingan tidak ditemukan'}</p>
                        <Link href="/football" className="text-emerald-400 hover:text-emerald-300 text-sm mt-3 inline-flex items-center gap-1">
                            <MdArrowBack size={16} /> Kembali ke Sepakbola
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    // ========== MAIN RENDER ==========
    return (
        <main className="min-h-screen" style={{ backgroundColor: '#0a0c14' }}>
            <Navbar />

            <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6">

                {/* PLAYER SECTION */}
                <div className="relative mb-4">
                    {iframeUrl && isPlaying ? (
                        <div className="rounded-xl overflow-hidden aspect-video bg-black relative">
                            <iframe
                                src={iframeUrl}
                                className="w-full h-full absolute inset-0 border-0"
                                allow="autoplay; encrypted-media; fullscreen"
                                allowFullScreen
                            />
                        </div>
                    ) : isLive && sources.length > 0 ? (
                        <div className="rounded-xl w-full overflow-hidden min-h-[350px] sm:min-h-[400px] md:aspect-video relative" style={{ backgroundColor: '#111318' }}>
                            <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-4">
                                <div className="flex items-center justify-center gap-4 sm:gap-8 mb-5">
                                    <div className="text-center">
                                        {homeBadge ? (
                                            <img src={homeBadge} alt={homeName} className="w-16 h-16 sm:w-20 sm:h-20 object-contain mx-auto mb-2" onError={(e) => e.target.src = 'https://placehold.co/80x80/232733/6b7280?text=T'} />
                                        ) : (
                                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: '#232733' }}>
                                                <MdSportsSoccer size={28} className="text-emerald-500" />
                                            </div>
                                        )}
                                        <p className="text-white font-semibold text-sm sm:text-base truncate max-w-[100px]">{homeName}</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-gray-600 text-2xl sm:text-3xl font-bold tracking-widest">VS</div>
                                        <p className="text-red-400 text-sm font-semibold mt-1 flex items-center justify-center gap-1.5">
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                            </span>
                                            LIVE
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        {awayBadge ? (
                                            <img src={awayBadge} alt={awayName} className="w-16 h-16 sm:w-20 sm:h-20 object-contain mx-auto mb-2" onError={(e) => e.target.src = 'https://placehold.co/80x80/232733/6b7280?text=T'} />
                                        ) : (
                                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: '#232733' }}>
                                                <MdSportsSoccer size={28} className="text-emerald-500" />
                                            </div>
                                        )}
                                        <p className="text-white font-semibold text-sm sm:text-base truncate max-w-[100px]">{awayName}</p>
                                    </div>
                                </div>

                                <p className="text-gray-500 text-sm mb-5">{category}</p>

                                <button
                                    onClick={() => startStream(sources[0])}
                                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-xl text-base transition-all transform hover:scale-105 flex items-center gap-2 shadow-lg"
                                >
                                    <MdPlayArrow size={22} />
                                    Tonton Sekarang
                                </button>
                                {sources.length > 1 && (
                                    <p className="text-gray-600 text-xs mt-3">{sources.length} server tersedia</p>
                                )}
                            </div>
                        </div>
                    ) : isUpcoming ? (
                        <div className="rounded-xl w-full overflow-hidden min-h-[350px] sm:min-h-[400px] md:aspect-video relative" style={{ backgroundColor: '#111318' }}>
                            <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-4">
                                <div className="flex items-center justify-center gap-4 sm:gap-8 mb-5">
                                    <div className="text-center">
                                        {homeBadge ? (
                                            <img src={homeBadge} alt={homeName} className="w-16 h-16 sm:w-20 sm:h-20 object-contain mx-auto mb-2" onError={(e) => e.target.src = 'https://placehold.co/80x80/232733/6b7280?text=T'} />
                                        ) : (
                                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: '#232733' }}>
                                                <MdSportsSoccer size={28} className="text-emerald-500" />
                                            </div>
                                        )}
                                        <p className="text-white font-semibold text-sm sm:text-base truncate max-w-[100px]">{homeName}</p>
                                    </div>
                                    <div className="text-2xl sm:text-4xl font-bold text-gray-600 tracking-widest">VS</div>
                                    <div className="text-center">
                                        {awayBadge ? (
                                            <img src={awayBadge} alt={awayName} className="w-16 h-16 sm:w-20 sm:h-20 object-contain mx-auto mb-2" onError={(e) => e.target.src = 'https://placehold.co/80x80/232733/6b7280?text=T'} />
                                        ) : (
                                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: '#232733' }}>
                                                <MdSportsSoccer size={28} className="text-emerald-500" />
                                            </div>
                                        )}
                                        <p className="text-white font-semibold text-sm sm:text-base truncate max-w-[100px]">{awayName}</p>
                                    </div>
                                </div>
                                <p className="text-gray-500 text-sm mb-1">{category}</p>
                                <p className="text-gray-500 text-sm mb-5 flex items-center gap-1.5"><HiClock size={13} /> {formatKickoff()}</p>
                                <div className="flex justify-center gap-3 sm:gap-4 mb-5">
                                    {countdown.days > 0 && (
                                        <div className="rounded-lg min-w-[50px] sm:min-w-[60px] px-3 py-2 sm:px-4 sm:py-3 text-center" style={{ backgroundColor: '#1a1d27', border: '1px solid rgba(255,255,255,0.06)' }}>
                                            <span className="text-xl sm:text-2xl font-bold text-white">{String(countdown.days).padStart(2, '0')}</span>
                                            <p className="text-[10px] sm:text-xs text-gray-600 mt-1">Hari</p>
                                        </div>
                                    )}
                                    <div className="rounded-lg min-w-[50px] sm:min-w-[60px] px-3 py-2 sm:px-4 sm:py-3 text-center" style={{ backgroundColor: '#1a1d27', border: '1px solid rgba(255,255,255,0.06)' }}>
                                        <span className="text-xl sm:text-2xl font-bold text-white">{String(countdown.hours).padStart(2, '0')}</span>
                                        <p className="text-[10px] sm:text-xs text-gray-600 mt-1">Jam</p>
                                    </div>
                                    <div className="rounded-lg min-w-[50px] sm:min-w-[60px] px-3 py-2 sm:px-4 sm:py-3 text-center" style={{ backgroundColor: '#1a1d27', border: '1px solid rgba(255,255,255,0.06)' }}>
                                        <span className="text-xl sm:text-2xl font-bold text-white">{String(countdown.minutes).padStart(2, '0')}</span>
                                        <p className="text-[10px] sm:text-xs text-gray-600 mt-1">Menit</p>
                                    </div>
                                    <div className="rounded-lg min-w-[50px] sm:min-w-[60px] px-3 py-2 sm:px-4 sm:py-3 text-center" style={{ backgroundColor: '#1a1d27', border: '1px solid rgba(255,255,255,0.06)' }}>
                                        <span className="text-xl sm:text-2xl font-bold text-emerald-400">{String(countdown.seconds).padStart(2, '0')}</span>
                                        <p className="text-[10px] sm:text-xs text-gray-600 mt-1">Detik</p>
                                    </div>
                                </div>
                                <p className="text-gray-600 text-xs mb-3">Stream akan tersedia saat match dimulai</p>
                                <Link href="/football" className="text-emerald-400 hover:text-emerald-300 text-sm font-medium flex items-center gap-1 transition-colors">
                                    <MdArrowBack size={16} /> Kembali ke Sepakbola
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-xl w-full overflow-hidden min-h-[350px] sm:min-h-[400px] md:aspect-video relative" style={{ backgroundColor: '#111318' }}>
                            <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-4">
                                <div className="flex items-center justify-center gap-4 sm:gap-8 mb-5">
                                    <div className="text-center">
                                        {homeBadge ? (
                                            <img src={homeBadge} alt={homeName} className="w-14 h-14 sm:w-16 sm:h-16 object-contain mx-auto mb-2 opacity-50" onError={(e) => e.target.src = 'https://placehold.co/64x64/232733/6b7280?text=T'} />
                                        ) : (
                                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-2 opacity-50" style={{ backgroundColor: '#232733' }}>
                                                <MdSportsSoccer size={24} className="text-gray-600" />
                                            </div>
                                        )}
                                        <p className="text-gray-500 font-medium text-xs sm:text-sm truncate max-w-[100px]">{homeName}</p>
                                    </div>
                                    <div className="text-2xl sm:text-3xl font-bold text-gray-700 tracking-widest">VS</div>
                                    <div className="text-center">
                                        {awayBadge ? (
                                            <img src={awayBadge} alt={awayName} className="w-14 h-14 sm:w-16 sm:h-16 object-contain mx-auto mb-2 opacity-50" onError={(e) => e.target.src = 'https://placehold.co/64x64/232733/6b7280?text=T'} />
                                        ) : (
                                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-2 opacity-50" style={{ backgroundColor: '#232733' }}>
                                                <MdSportsSoccer size={24} className="text-gray-600" />
                                            </div>
                                        )}
                                        <p className="text-gray-500 font-medium text-xs sm:text-sm truncate max-w-[100px]">{awayName}</p>
                                    </div>
                                </div>
                                <div className="rounded-lg px-4 py-3 mb-4" style={{ backgroundColor: '#1a1d27', border: '1px solid rgba(255,255,255,0.06)' }}>
                                    <p className="text-gray-300 font-medium text-sm mb-1">Stream belum tersedia</p>
                                    <p className="text-gray-600 text-xs">Server stream akan aktif mendekati kick-off. Silakan cek kembali nanti.</p>
                                </div>
                                <Link href="/football" className="text-emerald-400 hover:text-emerald-300 text-sm font-medium flex items-center gap-1 transition-colors">
                                    <MdArrowBack size={16} /> Kembali ke Sepakbola
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* SERVER SELECTOR */}
                {isPlaying && sources.length > 0 && (
                    <div className="mb-4 rounded-xl p-3 sm:p-4" style={{ backgroundColor: '#1a1d27' }}>
                        <div className="flex items-center gap-2 mb-3">
                            <HiSignal size={14} className="text-emerald-400" />
                            <span className="text-white text-xs sm:text-sm font-semibold">Pilih Server</span>
                            <span className="text-gray-600 text-[10px]">({sources.length} tersedia)</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {sources.map((src) => {
                                const isActive = activeServer?.streamNo === src.streamNo;
                                return (
                                    <button
                                        key={`srv-${src.streamNo}`}
                                        onClick={() => startStream(src)}
                                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${isActive ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                        style={!isActive ? { backgroundColor: '#232733' } : {}}
                                    >
                                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-gray-600'}`}></span>
                                        Server {src.streamNo}
                                        {src.hd && <span className="text-[9px] px-1 py-0.5 rounded bg-yellow-500/20 text-yellow-400 font-bold">HD</span>}
                                        {src.language && src.language !== 'Multi' && <span className="text-[9px] text-gray-500">{src.language}</span>}
                                    </button>
                                );
                            })}
                            <button onClick={refreshStream} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-400 hover:text-white transition-all ml-auto" style={{ backgroundColor: '#232733' }}>
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" /></svg>
                                Refresh
                            </button>
                        </div>
                    </div>
                )}

                {/* MAIN CONTENT */}
                <div className="flex flex-col lg:flex-row gap-5">
                    <div className="w-full lg:w-3/4 space-y-4">
                        <nav className="text-sm text-gray-500 hidden sm:block">
                            <ol className="flex items-center gap-2">
                                <li><Link href="/" className="hover:text-gray-300 flex items-center gap-1 transition-colors"><IoHome size={13} /> Home</Link></li>
                                <li className="text-gray-700">/</li>
                                <li><Link href="/football" className="hover:text-gray-300 flex items-center gap-1 transition-colors"><MdSportsSoccer size={13} /> Sepakbola</Link></li>
                                <li className="text-gray-700">/</li>
                                <li className="text-gray-400 truncate max-w-[200px]">{matchTitle}</li>
                            </ol>
                        </nav>

                        <div className="rounded-xl p-4" style={{ backgroundColor: '#1a1d27' }}>
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                    <h1 className="text-base sm:text-lg font-bold text-white mb-1">{matchTitle}</h1>
                                    <p className="text-gray-500 text-xs sm:text-sm flex items-center gap-2">
                                        <MdSportsSoccer className="text-emerald-500 flex-shrink-0" size={14} />
                                        <span className="truncate">{category}</span>
                                    </p>
                                </div>
                                {isLive && (
                                    <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-600 text-white flex-shrink-0">
                                        <span className="relative flex h-1.5 w-1.5">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                                        </span>
                                        LIVE
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="rounded-xl p-4" style={{ backgroundColor: '#1a1d27' }}>
                            <h3 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm">
                                <MdShare size={16} className="text-gray-400" /> Bagikan
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                <a href={`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`} target="_blank" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-white" style={{ backgroundColor: '#25D366' }}>
                                    <FaWhatsapp size={14} /> <span className="hidden sm:inline">WhatsApp</span>
                                </a>
                                <a href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`} target="_blank" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-white" style={{ backgroundColor: '#0088cc' }}>
                                    <FaTelegram size={14} /> <span className="hidden sm:inline">Telegram</span>
                                </a>
                                <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`} target="_blank" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-white" style={{ backgroundColor: '#1DA1F2' }}>
                                    <FaTwitter size={14} /> <span className="hidden sm:inline">Twitter</span>
                                </a>
                                <button onClick={copyLink} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-300" style={{ backgroundColor: '#232733' }}>
                                    {copied ? <MdCheck size={14} className="text-emerald-400" /> : <MdContentCopy size={14} />}
                                    <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
                                </button>
                            </div>
                        </div>

                        <div className="rounded-xl p-4 hidden sm:block" style={{ backgroundColor: '#1a1d27' }}>
                            <h2 className="text-base font-semibold text-white mb-2">Streaming {category} Gratis</h2>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Tonton {matchTitle} secara gratis di NobarMeriah. Live streaming dengan kualitas HD, multi server, tanpa buffering.
                            </p>
                        </div>
                    </div>

                    <div className="w-full lg:w-1/4">
                        <div className="rounded-xl p-4 lg:sticky lg:top-32" style={{ backgroundColor: '#1a1d27' }}>
                            <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Quick Links</h4>
                            <div className="space-y-2">
                                <Link href="/football" className="block text-gray-500 hover:text-emerald-400 text-sm flex items-center gap-2 transition-colors">
                                    <MdSportsSoccer size={14} /> Semua Pertandingan
                                </Link>
                                <Link href="/basketball" className="block text-gray-500 hover:text-orange-400 text-sm flex items-center gap-2 transition-colors">
                                    <MdSportsBasketball size={14} /> Basketball
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden" style={{ backgroundColor: '#0a0c14', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex justify-around items-center py-2.5 px-1">
                    <Link href="/" className="flex flex-col items-center px-3 py-1 text-gray-500 hover:text-emerald-400 transition-colors"><IoHome size={20} /><span className="text-[10px] mt-1">Beranda</span></Link>
                    <Link href="/football" className="flex flex-col items-center px-3 py-1 text-emerald-400"><MdSportsSoccer size={20} /><span className="text-[10px] mt-1 font-medium">Sepakbola</span></Link>
                    <Link href="/basketball" className="flex flex-col items-center px-3 py-1 text-gray-500 hover:text-orange-400 transition-colors"><MdSportsBasketball size={20} /><span className="text-[10px] mt-1">NBA</span></Link>
                    <a href="https://t.me/sportmeriah" target="_blank" className="flex flex-col items-center px-3 py-1 text-gray-500 hover:text-blue-400 transition-colors"><FaTelegram size={20} /><span className="text-[10px] mt-1">Telegram</span></a>
                </div>
            </nav>
            <div className="h-16 md:hidden"></div>
        </main>
    );
}
