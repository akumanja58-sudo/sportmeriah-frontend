'use client';

import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Link from 'next/link';

import { FaTelegram } from 'react-icons/fa';
import { IoHome } from 'react-icons/io5';
import { MdSportsSoccer, MdSportsBasketball, MdPlayArrow, MdLiveTv } from 'react-icons/md';
import { HiSignal, HiClock } from 'react-icons/hi2';

const API_URL = 'https://sportmeriah-backend-production.up.railway.app';

function formatKickoffTime(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} WIB`;
}

export default function BasketballPageClient() {
    const [matches, setMatches] = useState({ live: [], upcoming: [], finished: [] });
    const [extraChannels, setExtraChannels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, live: 0, upcoming: 0, withStreams: 0 });

    useEffect(() => {
        fetchMatches();
        const interval = setInterval(fetchMatches, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchMatches = async () => {
        try {
            const res = await fetch(`${API_URL}/api/basketball`);
            const data = await res.json();
            if (data.success) {
                setMatches({
                    live: data.matches?.live || [],
                    upcoming: data.matches?.upcoming || [],
                    finished: data.matches?.finished || []
                });
                setExtraChannels(data.extraChannels || []);
                setStats({
                    total: data.stats?.total || 0,
                    live: data.stats?.live || 0,
                    upcoming: data.stats?.upcoming || 0,
                    withStreams: data.stats?.withStreams || 0
                });
            }
        } catch (error) {
            console.error('Failed to fetch matches:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen" style={{ backgroundColor: '#0a0c14' }}>
            <Navbar />

            <div className="container max-w-7xl mx-auto px-4 py-8">

                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <Link href="/" className="text-gray-500 hover:text-gray-300 transition-colors"><IoHome size={18} /></Link>
                    <span className="text-gray-700">/</span>
                    <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                        <MdSportsBasketball className="text-orange-500" /> Basketball
                    </h1>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Sidebar */}
                    <aside className="w-full lg:w-72 order-2 lg:order-1 flex-shrink-0">
                        <div className="sticky top-32 space-y-5">

                            {/* Stats */}
                            <div className="rounded-xl p-5" style={{ backgroundColor: '#1a1d27' }}>
                                <h3 className="text-white font-semibold text-xs mb-4 flex items-center gap-2 uppercase tracking-widest">
                                    <MdSportsBasketball className="text-orange-500" size={14} /> Statistik
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 flex items-center gap-1.5"><HiSignal size={12} className="text-red-400" /> Live Now</span>
                                        <span className="text-red-400 font-bold">{stats.live}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 flex items-center gap-1.5"><HiClock size={12} className="text-orange-400" /> Upcoming</span>
                                        <span className="text-orange-400 font-bold">{stats.upcoming}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Total Matches</span>
                                        <span className="text-white font-bold">{stats.total}</span>
                                    </div>
                                    <div className="flex justify-between text-sm pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                        <span className="text-gray-500">With Stream</span>
                                        <span className="text-emerald-400 font-bold">{stats.withStreams}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Links */}
                            <div className="rounded-xl p-5" style={{ backgroundColor: '#1a1d27' }}>
                                <h3 className="text-white font-semibold text-xs mb-4 uppercase tracking-widest">Quick Links</h3>
                                <div className="space-y-1">
                                    <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-500 hover:text-gray-300 text-sm transition-colors"
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#232733'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                        <IoHome size={14} /> Beranda
                                    </Link>
                                    <Link href="/football" className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-500 hover:text-emerald-400 text-sm transition-colors"
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#232733'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                        <MdSportsSoccer size={14} /> Sepakbola
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1 order-1 lg:order-2 space-y-6">

                        {loading ? (
                            <div className="rounded-xl p-12 text-center" style={{ backgroundColor: '#1a1d27' }}>
                                <div className="flex justify-center mb-4">
                                    <span className="loader"></span>
                                </div>
                                <p className="text-gray-500 text-sm">Memuat jadwal pertandingan...</p>
                                <style>{`
                                    .loader { width: 40px; height: 40px; border-radius: 50%; display: inline-block; border-top: 3px solid #fff; border-right: 3px solid transparent; box-sizing: border-box; animation: rot 1s linear infinite; position: relative; }
                                    .loader::after { content: ''; box-sizing: border-box; position: absolute; left: 0; top: 0; width: 40px; height: 40px; border-radius: 50%; border-left: 3px solid #f97316; border-bottom: 3px solid transparent; animation: rot 0.5s linear infinite reverse; }
                                    @keyframes rot { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                                `}</style>
                            </div>
                        ) : (
                            <>
                                {/* LIVE */}
                                {matches.live.length > 0 && (
                                    <section>
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="relative flex h-2.5 w-2.5">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                            </span>
                                            <h2 className="text-white font-bold text-lg">Live Now</h2>
                                            <span className="text-xs text-gray-500 px-2.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#232733' }}>{matches.live.length}</span>
                                        </div>
                                        <div className="space-y-2">
                                            {matches.live.map((match) => (
                                                <MatchCard key={match.id} match={match} isLive={true} />
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* UPCOMING */}
                                {matches.upcoming.length > 0 && (
                                    <section>
                                        <div className="flex items-center gap-3 mb-4">
                                            <HiClock size={18} className="text-orange-400" />
                                            <h2 className="text-white font-bold text-lg">Upcoming</h2>
                                            <span className="text-xs text-gray-500 px-2.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#232733' }}>{matches.upcoming.length}</span>
                                        </div>
                                        <div className="space-y-2">
                                            {matches.upcoming.map((match) => (
                                                <MatchCard key={match.id} match={match} isLive={false} />
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* EXTRA CHANNELS */}
                                {extraChannels.length > 0 && (
                                    <section>
                                        <div className="flex items-center gap-3 mb-4">
                                            <MdLiveTv size={18} className="text-blue-400" />
                                            <h2 className="text-white font-bold text-lg">Extra Channels</h2>
                                            <span className="text-xs text-gray-500 px-2.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#232733' }}>{extraChannels.length}</span>
                                        </div>
                                        <div className="space-y-2">
                                            {extraChannels.map((channel) => (
                                                <ChannelCard key={channel.id} channel={channel} />
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* FINISHED */}
                                {matches.finished.length > 0 && (
                                    <section>
                                        <div className="flex items-center gap-3 mb-4">
                                            <HiClock size={18} className="text-gray-500" />
                                            <h2 className="text-gray-400 font-bold text-lg">Selesai</h2>
                                            <span className="text-xs text-gray-500 px-2.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#232733' }}>{matches.finished.length}</span>
                                        </div>
                                        <div className="space-y-2 opacity-60">
                                            {matches.finished.map((match) => (
                                                <MatchCard key={match.id} match={match} isLive={false} isFinished={true} />
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* EMPTY */}
                                {matches.live.length === 0 && matches.upcoming.length === 0 && matches.finished.length === 0 && (
                                    <div className="rounded-xl p-12 text-center" style={{ backgroundColor: '#1a1d27' }}>
                                        <MdSportsBasketball size={40} className="text-gray-600 mx-auto mb-4" />
                                        <p className="text-gray-400 font-medium">Tidak ada pertandingan tersedia saat ini</p>
                                        <Link href="/" className="text-orange-400 hover:text-orange-300 text-sm mt-4 inline-block">
                                            Kembali ke Beranda
                                        </Link>
                                    </div>
                                )}
                            </>
                        )}

                        {/* SEO */}
                        <div className="mt-10 pt-8 space-y-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                            <h2 className="text-lg font-semibold text-white">Nonton Streaming NBA Basketball Gratis</h2>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Nonton streaming NBA Basketball gratis di NobarMeriah. Los Angeles Lakers, Golden State Warriors, Boston Celtics, dan tim NBA lainnya. Kualitas HD tanpa buffering.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Nav */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden" style={{ backgroundColor: '#0a0c14', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex justify-around items-center py-2.5 px-1">
                    <Link href="/" className="flex flex-col items-center px-3 py-1 text-gray-500 hover:text-emerald-400 transition-colors"><IoHome size={20} /><span className="text-[10px] mt-1">Beranda</span></Link>
                    <Link href="/football" className="flex flex-col items-center px-3 py-1 text-gray-500 hover:text-emerald-400 transition-colors"><MdSportsSoccer size={20} /><span className="text-[10px] mt-1">Sepakbola</span></Link>
                    <Link href="/basketball" className="flex flex-col items-center px-3 py-1 text-orange-400"><MdSportsBasketball size={20} /><span className="text-[10px] mt-1 font-medium">NBA</span></Link>
                    <a href="https://t.me/sportmeriah" target="_blank" className="flex flex-col items-center px-3 py-1 text-gray-500 hover:text-blue-400 transition-colors"><FaTelegram size={20} /><span className="text-[10px] mt-1">Telegram</span></a>
                </div>
            </nav>
            <div className="h-20 md:hidden"></div>
        </main>
    );
}

// ========== MATCH CARD ==========
function MatchCard({ match, isLive, isFinished = false }) {
    const { homeTeam, awayTeam, league, score, stream, date, quarter, timer } = match;
    const hasStream = !!stream?.id;
    const provider = stream?.provider || 'sphere';
    const matchUrl = hasStream ? `/basketball/${stream.id}?provider=${provider}` : '#';

    const getQuarterDisplay = () => {
        if (quarter && timer) return `${quarter} ${timer}'`;
        if (quarter) return quarter;
        return 'LIVE';
    };

    return (
        <Link href={matchUrl}>
            <div className={`rounded-lg overflow-hidden transition-all cursor-pointer group border ${!hasStream ? 'opacity-60' : ''}`}
                style={{ backgroundColor: '#1a1d27', borderColor: isLive ? 'rgba(239,68,68,0.2)' : 'transparent' }}
                onMouseEnter={(e) => { if (hasStream) e.currentTarget.style.backgroundColor = '#1e2130'; }}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1a1d27'}>

                {/* Header */}
                <div className="flex justify-between items-center px-4 py-2 text-xs" style={{ backgroundColor: '#151720' }}>
                    <span className={`font-medium flex items-center gap-1.5 ${isLive ? 'text-red-400' : 'text-gray-500'}`}>
                        {isLive ? (
                            <>
                                <span className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                                </span>
                                {getQuarterDisplay()}
                            </>
                        ) : isFinished ? (
                            <span className="text-gray-600">Selesai</span>
                        ) : (
                            <><HiClock size={12} /> {formatKickoffTime(date)}</>
                        )}
                    </span>
                    <span className="text-gray-500 truncate max-w-[180px] flex items-center gap-1.5">
                        <MdSportsBasketball size={12} className="text-orange-500" />
                        {league?.name || 'NBA'}
                    </span>
                </div>

                {/* Match */}
                <div className="flex items-center justify-between px-4 py-3 gap-2">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0 justify-end">
                        <span className="text-white text-sm font-medium truncate text-right">{homeTeam?.name || 'Home'}</span>
                        <img src={homeTeam?.logo} alt={homeTeam?.name} className="w-7 h-7 object-contain flex-shrink-0" onError={(e) => e.target.src = 'https://placehold.co/28x28/232733/6b7280?text=T'} />
                    </div>
                    <div className="flex-shrink-0 px-3 min-w-[52px] text-center">
                        {(isLive || isFinished) && score?.home !== null ? (
                            <span className="text-white text-base font-bold tracking-wide">{score?.home ?? 0} — {score?.away ?? 0}</span>
                        ) : (
                            <span className="text-gray-600 text-xs font-bold tracking-widest">VS</span>
                        )}
                    </div>
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <img src={awayTeam?.logo} alt={awayTeam?.name} className="w-7 h-7 object-contain flex-shrink-0" onError={(e) => e.target.src = 'https://placehold.co/28x28/232733/6b7280?text=T'} />
                        <span className="text-white text-sm font-medium truncate">{awayTeam?.name || 'Away'}</span>
                    </div>
                    <div className="flex-shrink-0 ml-3">
                        {hasStream ? (
                            <span className="text-white text-xs font-semibold px-3.5 py-1.5 rounded-md inline-flex items-center gap-1" style={{ backgroundColor: isLive ? '#dc2626' : isFinished ? '#374151' : '#f97316' }}>
                                <MdPlayArrow size={14} /> {isLive ? 'Live' : isFinished ? 'Selesai' : 'Tonton'}
                            </span>
                        ) : (
                            <span className="text-gray-500 text-xs font-medium px-3 py-1.5 rounded-md" style={{ backgroundColor: '#232733' }}>
                                No Stream
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}

// ========== CHANNEL CARD ==========
function ChannelCard({ channel }) {
    const { id, name, category, provider } = channel;
    const channelProvider = provider || 'sphere';

    return (
        <Link href={`/basketball/${id}?provider=${channelProvider}`}>
            <div className="rounded-lg overflow-hidden transition-all cursor-pointer group border border-transparent"
                style={{ backgroundColor: '#1a1d27' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1e2130'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1a1d27'}>
                <div className="flex justify-between items-center px-4 py-2 text-xs" style={{ backgroundColor: '#151720' }}>
                    <span className="font-medium text-blue-400 flex items-center gap-1.5"><MdLiveTv size={12} /> Extra Channel</span>
                    <span className="text-gray-500 truncate max-w-[180px] flex items-center gap-1.5">
                        <MdSportsBasketball size={12} className="text-orange-500" /> {category || 'Basketball'}
                    </span>
                </div>
                <div className="flex items-center justify-between px-4 py-3 gap-2">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#232733' }}>
                            <MdSportsBasketball size={14} className="text-orange-500" />
                        </div>
                        <span className="text-white text-sm font-medium truncate">{name || 'Channel'}</span>
                    </div>
                    <span className="text-white text-xs font-semibold px-3.5 py-1.5 rounded-md inline-flex items-center gap-1 flex-shrink-0" style={{ backgroundColor: '#f97316' }}>
                        <MdPlayArrow size={14} /> Tonton
                    </span>
                </div>
            </div>
        </Link>
    );
}
