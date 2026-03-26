'use client';

import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Link from 'next/link';

import { FaTelegram } from 'react-icons/fa';
import { IoHome } from 'react-icons/io5';
import { MdSportsSoccer, MdSportsBasketball, MdSportsHockey, MdPlayArrow, MdLiveTv } from 'react-icons/md';
import { HiSignal, HiClock } from 'react-icons/hi2';

const API_URL = 'https://sportmeriah-backend-production.up.railway.app';

function formatKickoffTime(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} WIB`;
}

export default function HockeyPageClient() {
    const [matches, setMatches] = useState({ live: [], upcoming: [], finished: [] });
    const [extraChannels, setExtraChannels] = useState([]);
    const [sportsTVChannels, setSportsTVChannels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, live: 0, upcoming: 0, withStreams: 0, sphereChannels: 0 });

    useEffect(() => {
        fetchMatches();
        const interval = setInterval(fetchMatches, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchMatches = async () => {
        try {
            const res = await fetch(`${API_URL}/api/hockey`);
            const data = await res.json();
            if (data.success) {
                setMatches({
                    live: data.matches?.live || [],
                    upcoming: data.matches?.upcoming || [],
                    finished: data.matches?.finished || []
                });
                setExtraChannels(data.extraChannels || []);
                setSportsTVChannels(data.sportsTVChannels || []);
                setStats(data.stats || {});
            }
        } catch (error) {
            console.error('Failed to fetch hockey:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen" style={{ backgroundColor: '#0a0c14' }}>
            <Navbar />

            <div className="container max-w-7xl mx-auto px-4 py-8">

                <div className="flex items-center gap-3 mb-6">
                    <Link href="/" className="text-gray-500 hover:text-gray-300 transition-colors"><IoHome size={18} /></Link>
                    <span className="text-gray-700">/</span>
                    <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                        <MdSportsHockey className="text-blue-400" /> NHL / Ice Hockey
                    </h1>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">

                    <aside className="w-full lg:w-72 order-2 lg:order-1 flex-shrink-0">
                        <div className="sticky top-32 space-y-5">

                            <div className="rounded-xl p-5" style={{ backgroundColor: '#1a1d27' }}>
                                <h3 className="text-white font-semibold text-xs mb-4 flex items-center gap-2 uppercase tracking-widest">
                                    <MdSportsHockey className="text-blue-400" size={14} /> Statistik
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 flex items-center gap-1.5"><HiSignal size={12} className="text-red-400" /> Live Now</span>
                                        <span className="text-red-400 font-bold">{stats.live}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 flex items-center gap-1.5"><HiClock size={12} className="text-blue-400" /> Upcoming</span>
                                        <span className="text-blue-400 font-bold">{stats.upcoming}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Total Games</span>
                                        <span className="text-white font-bold">{stats.total}</span>
                                    </div>
                                    <div className="flex justify-between text-sm pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                        <span className="text-gray-500">With Stream</span>
                                        <span className="text-emerald-400 font-bold">{stats.withStreams}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Sphere Channels</span>
                                        <span className="text-blue-400 font-bold">{stats.sphereChannels}</span>
                                    </div>
                                </div>
                            </div>

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
                                    <Link href="/basketball" className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-500 hover:text-orange-400 text-sm transition-colors"
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#232733'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                        <MdSportsBasketball size={14} /> Basketball
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </aside>

                    <div className="flex-1 order-1 lg:order-2 space-y-6">

                        {loading ? (
                            <div className="rounded-xl p-12 text-center" style={{ backgroundColor: '#1a1d27' }}>
                                <div className="flex justify-center mb-4"><span className="loader"></span></div>
                                <p className="text-gray-500 text-sm">Memuat jadwal NHL...</p>
                                <style>{`
                                    .loader { width: 40px; height: 40px; border-radius: 50%; display: inline-block; border-top: 3px solid #fff; border-right: 3px solid transparent; box-sizing: border-box; animation: rot 1s linear infinite; position: relative; }
                                    .loader::after { content: ''; box-sizing: border-box; position: absolute; left: 0; top: 0; width: 40px; height: 40px; border-radius: 50%; border-left: 3px solid #60a5fa; border-bottom: 3px solid transparent; animation: rot 0.5s linear infinite reverse; }
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
                                            <HiClock size={18} className="text-blue-400" />
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
                                            {extraChannels.map((ch) => (
                                                <ExtraChannelCard key={ch.id} channel={ch} />
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* SPORTS TV */}
                                {sportsTVChannels.length > 0 && (
                                    <section>
                                        <div className="flex items-center gap-3 mb-4">
                                            <MdLiveTv size={18} className="text-blue-400" />
                                            <h2 className="text-white font-bold text-lg">Sports TV</h2>
                                            <span className="text-xs text-gray-500 px-2.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#232733' }}>{sportsTVChannels.length}</span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {sportsTVChannels.map((ch) => (
                                                <Link key={ch.stream_id} href={`/hockey/${ch.stream_id}`}>
                                                    <div className="rounded-lg overflow-hidden cursor-pointer group border border-transparent" style={{ backgroundColor: '#1a1d27' }}
                                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1e2130'}
                                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1a1d27'}>
                                                        <div className="flex items-center justify-between px-4 py-3 gap-2">
                                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#232733' }}>
                                                                    <MdLiveTv size={14} className="text-blue-400" />
                                                                </div>
                                                                <span className="text-white text-sm font-medium truncate">{ch.name}</span>
                                                            </div>
                                                            <span className="text-white text-xs font-semibold px-3.5 py-1.5 rounded-md inline-flex items-center gap-1 flex-shrink-0" style={{ backgroundColor: '#60a5fa' }}>
                                                                <MdPlayArrow size={14} /> Tonton
                                                            </span>
                                                        </div>
                                                    </div>
                                                </Link>
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
                                        <div className="space-y-2 opacity-50">
                                            {matches.finished.map((match) => (
                                                <MatchCard key={match.id} match={match} isLive={false} isFinished={true} />
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* EMPTY */}
                                {matches.live.length === 0 && matches.upcoming.length === 0 && matches.finished.length === 0 && extraChannels.length === 0 && (
                                    <div className="rounded-xl p-12 text-center" style={{ backgroundColor: '#1a1d27' }}>
                                        <MdSportsHockey size={40} className="text-gray-600 mx-auto mb-4" />
                                        <p className="text-gray-400 font-medium">Tidak ada pertandingan NHL tersedia saat ini</p>
                                        <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm mt-4 inline-block">Kembali ke Beranda</Link>
                                    </div>
                                )}
                            </>
                        )}

                        <div className="mt-10 pt-8 space-y-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                            <h2 className="text-lg font-semibold text-white">Nonton Streaming NHL Ice Hockey Gratis</h2>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Nonton streaming NHL Hockey gratis di SportMeriah. Boston Bruins, New York Rangers, Toronto Maple Leafs, dan tim NHL lainnya. Kualitas HD tanpa buffering.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden" style={{ backgroundColor: '#0a0c14', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex justify-around items-center py-2.5 px-1">
                    <Link href="/" className="flex flex-col items-center px-3 py-1 text-gray-500 hover:text-emerald-400 transition-colors"><IoHome size={20} /><span className="text-[10px] mt-1">Beranda</span></Link>
                    <Link href="/football" className="flex flex-col items-center px-3 py-1 text-gray-500 hover:text-emerald-400 transition-colors"><MdSportsSoccer size={20} /><span className="text-[10px] mt-1">Sepakbola</span></Link>
                    <Link href="/hockey" className="flex flex-col items-center px-3 py-1 text-blue-400"><MdSportsHockey size={20} /><span className="text-[10px] mt-1 font-medium">NHL</span></Link>
                    <a href="https://t.me/sportmeriah" target="_blank" className="flex flex-col items-center px-3 py-1 text-gray-500 hover:text-blue-400 transition-colors"><FaTelegram size={20} /><span className="text-[10px] mt-1">Telegram</span></a>
                </div>
            </nav>
            <div className="h-20 md:hidden"></div>
        </main>
    );
}

// ========== MATCH CARD ==========
function MatchCard({ match, isLive, isFinished = false }) {
    const hasStream = match.hasStream;
    const streamId = match.stream?.id;
    const matchUrl = hasStream ? `/hockey/${streamId}?fixture=${match.id}` : '#';

    return (
        <Link href={matchUrl}>
            <div className={`rounded-lg overflow-hidden transition-all cursor-pointer group border ${!hasStream ? 'opacity-50' : ''}`}
                style={{ backgroundColor: '#1a1d27', borderColor: isLive && hasStream ? 'rgba(96,165,250,0.2)' : 'transparent' }}
                onMouseEnter={(e) => { if (hasStream) e.currentTarget.style.backgroundColor = '#1e2130'; }}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1a1d27'}>

                <div className="flex justify-between items-center px-4 py-2 text-xs" style={{ backgroundColor: '#151720' }}>
                    <span className={`font-medium flex items-center gap-1.5 ${isLive ? 'text-red-400' : isFinished ? 'text-gray-600' : 'text-gray-500'}`}>
                        {isLive ? (
                            <>
                                <span className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                                </span>
                                {match.status?.long || 'LIVE'}
                            </>
                        ) : isFinished ? (
                            <span>{match.status?.long || 'Selesai'}</span>
                        ) : (
                            <><HiClock size={12} /> {formatKickoffTime(match.date)}</>
                        )}
                    </span>
                    <span className="text-gray-500 truncate max-w-[180px] flex items-center gap-1.5">
                        <MdSportsHockey size={12} className="text-blue-400" />
                        {match.league?.name || 'NHL'}
                    </span>
                </div>

                <div className="flex items-center justify-between px-4 py-3 gap-2">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0 justify-end">
                        <span className="text-white text-sm font-medium truncate text-right">{match.homeTeam?.name || 'Home'}</span>
                        <img src={match.homeTeam?.logo} alt="" className="w-7 h-7 object-contain flex-shrink-0" onError={(e) => e.target.src = 'https://placehold.co/28x28/232733/6b7280?text=T'} />
                    </div>
                    <div className="flex-shrink-0 px-3 min-w-[52px] text-center">
                        {(isLive || isFinished) && match.score?.home !== null ? (
                            <span className={`text-base font-bold tracking-wide ${isFinished ? 'text-gray-500' : 'text-white'}`}>{match.score.home ?? 0} — {match.score.away ?? 0}</span>
                        ) : (
                            <span className="text-gray-600 text-xs font-bold tracking-widest">VS</span>
                        )}
                    </div>
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <img src={match.awayTeam?.logo} alt="" className="w-7 h-7 object-contain flex-shrink-0" onError={(e) => e.target.src = 'https://placehold.co/28x28/232733/6b7280?text=T'} />
                        <span className="text-white text-sm font-medium truncate">{match.awayTeam?.name || 'Away'}</span>
                    </div>
                    <div className="flex-shrink-0 ml-3">
                        {hasStream ? (
                            <span className="text-white text-xs font-semibold px-3.5 py-1.5 rounded-md inline-flex items-center gap-1" style={{ backgroundColor: isLive ? '#dc2626' : isFinished ? '#374151' : '#60a5fa' }}>
                                <MdPlayArrow size={14} /> {isLive ? 'Live' : isFinished ? 'Replay' : 'Tonton'}
                            </span>
                        ) : (
                            <span className="text-gray-500 text-xs font-medium px-3 py-1.5 rounded-md" style={{ backgroundColor: '#232733' }}>No Stream</span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}

// ========== EXTRA CHANNEL CARD ==========
function ExtraChannelCard({ channel }) {
    return (
        <Link href={`/hockey/${channel.id}`}>
            <div className="rounded-lg overflow-hidden transition-all cursor-pointer group border border-transparent"
                style={{ backgroundColor: '#1a1d27' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1e2130'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1a1d27'}>
                <div className="flex justify-between items-center px-4 py-2 text-xs" style={{ backgroundColor: '#151720' }}>
                    <span className="font-medium text-blue-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span> Live
                    </span>
                    <span className="text-gray-500">{channel.category || 'NHL'}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3 gap-2">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#232733' }}>
                            <MdSportsHockey size={14} className="text-blue-400" />
                        </div>
                        <span className="text-white text-sm font-medium truncate">{channel.cleanName || channel.name}</span>
                    </div>
                    <span className="text-white text-xs font-semibold px-3.5 py-1.5 rounded-md inline-flex items-center gap-1 flex-shrink-0" style={{ backgroundColor: '#60a5fa' }}>
                        <MdPlayArrow size={14} /> Tonton
                    </span>
                </div>
            </div>
        </Link>
    );
}
