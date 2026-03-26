'use client';

import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Link from 'next/link';

import { MdSportsTennis, MdPlayArrow, MdLiveTv } from 'react-icons/md';
import { FaTelegram } from 'react-icons/fa';
import { IoHome } from 'react-icons/io5';
import { MdSportsSoccer, MdSportsBasketball } from 'react-icons/md';
import { HiSignal, HiClock, HiTrophy } from 'react-icons/hi2';

const API_URL = 'https://sportmeriah-backend-production.up.railway.app';

function isLiveStatus(match) {
    if (match?.status?.live === true || match?.status?.live === '1') return true;
    const status = (match?.status?.short || match?.status?.long || '').toUpperCase();
    const liveStatuses = ['SET 1', 'SET 2', 'SET 3', 'SET 4', 'SET 5', 'LIVE', 'IN PROGRESS', 'PLAYING'];
    return liveStatuses.some(s => status.includes(s));
}

function isFinishedStatus(match) {
    const status = (match?.status?.short || match?.status?.long || '').toUpperCase();
    const finishedStatuses = ['FINISHED', 'ENDED', 'RETIRED', 'WALKOVER', 'CANCELLED', 'POSTPONED'];
    return finishedStatuses.some(s => status.includes(s));
}

function isUpcomingStatus(match) {
    return !isLiveStatus(match) && !isFinishedStatus(match);
}

function formatKickoffTime(date, time) {
    if (time) return `${time} WIB`;
    if (date) {
        const d = new Date(date);
        return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')} WIB`;
    }
    return '-';
}

export default function TennisPageClient() {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMatches();
        const interval = setInterval(fetchMatches, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchMatches = async () => {
        try {
            const res = await fetch(`${API_URL}/api/tennis`);
            const data = await res.json();
            if (data.success && data.matches) setMatches(data.matches);
        } catch (error) {
            console.error('Failed to fetch Tennis matches:', error);
        } finally {
            setLoading(false);
        }
    };

    const liveMatches = matches.filter(m => isLiveStatus(m));
    const upcomingMatches = matches.filter(m => isUpcomingStatus(m));
    const finishedMatches = matches.filter(m => isFinishedStatus(m));

    return (
        <main className="min-h-screen" style={{ backgroundColor: '#0a0c14' }}>
            <Navbar />

            <div className="container max-w-7xl mx-auto px-4 py-8">

                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <Link href="/" className="text-gray-500 hover:text-gray-300 transition-colors"><IoHome size={18} /></Link>
                    <span className="text-gray-700">/</span>
                    <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                        <MdSportsTennis className="text-yellow-500" /> Tennis
                    </h1>
                    <span className="text-gray-500 text-sm hidden sm:block">ATP, WTA & Grand Slam</span>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Sidebar */}
                    <aside className="w-full lg:w-72 order-2 lg:order-1 flex-shrink-0">
                        <div className="sticky top-32 space-y-5">

                            <div className="rounded-xl p-5" style={{ backgroundColor: '#1a1d27' }}>
                                <h3 className="text-white font-semibold text-xs mb-4 flex items-center gap-2 uppercase tracking-widest">
                                    <MdSportsTennis className="text-yellow-500" size={14} /> Statistik
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 flex items-center gap-1.5"><HiSignal size={12} className="text-red-400" /> Live Now</span>
                                        <span className="text-red-400 font-bold">{liveMatches.length}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 flex items-center gap-1.5"><HiClock size={12} className="text-yellow-400" /> Upcoming</span>
                                        <span className="text-yellow-400 font-bold">{upcomingMatches.length}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Total Matches</span>
                                        <span className="text-white font-bold">{matches.length}</span>
                                    </div>
                                    <div className="flex justify-between text-sm pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                        <span className="text-gray-500">With Stream</span>
                                        <span className="text-emerald-400 font-bold">{matches.filter(m => m.hasStream).length}</span>
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

                    {/* Main Content */}
                    <div className="flex-1 order-1 lg:order-2 space-y-6">

                        {loading ? (
                            <div className="rounded-xl p-12 text-center" style={{ backgroundColor: '#1a1d27' }}>
                                <div className="flex justify-center mb-4">
                                    <span className="loader"></span>
                                </div>
                                <p className="text-gray-500 text-sm">Memuat pertandingan Tennis...</p>
                                <style>{`
                                    .loader { width: 40px; height: 40px; border-radius: 50%; display: inline-block; border-top: 3px solid #fff; border-right: 3px solid transparent; box-sizing: border-box; animation: rot 1s linear infinite; position: relative; }
                                    .loader::after { content: ''; box-sizing: border-box; position: absolute; left: 0; top: 0; width: 40px; height: 40px; border-radius: 50%; border-left: 3px solid #eab308; border-bottom: 3px solid transparent; animation: rot 0.5s linear infinite reverse; }
                                    @keyframes rot { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                                `}</style>
                            </div>
                        ) : (
                            <>
                                {/* LIVE */}
                                {liveMatches.length > 0 && (
                                    <section>
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="relative flex h-2.5 w-2.5">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                            </span>
                                            <h2 className="text-white font-bold text-lg">Live Now</h2>
                                            <span className="text-xs text-gray-500 px-2.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#232733' }}>{liveMatches.length}</span>
                                        </div>
                                        <div className="space-y-2">
                                            {liveMatches.map((match) => (
                                                <TennisMatchCard key={match.id} match={match} isLive={true} />
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* UPCOMING */}
                                {upcomingMatches.length > 0 && (
                                    <section>
                                        <div className="flex items-center gap-3 mb-4">
                                            <HiClock size={18} className="text-yellow-400" />
                                            <h2 className="text-white font-bold text-lg">Upcoming</h2>
                                            <span className="text-xs text-gray-500 px-2.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#232733' }}>{upcomingMatches.length}</span>
                                        </div>
                                        <div className="space-y-2">
                                            {upcomingMatches.map((match) => (
                                                <TennisMatchCard key={match.id} match={match} isLive={false} />
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* FINISHED */}
                                {finishedMatches.length > 0 && (
                                    <section>
                                        <div className="flex items-center gap-3 mb-4">
                                            <HiTrophy size={18} className="text-gray-500" />
                                            <h2 className="text-gray-400 font-bold text-lg">Selesai</h2>
                                            <span className="text-xs text-gray-500 px-2.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#232733' }}>{finishedMatches.length}</span>
                                        </div>
                                        <div className="space-y-2 opacity-60">
                                            {finishedMatches.map((match) => (
                                                <TennisMatchCard key={match.id} match={match} isLive={false} isFinished={true} />
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* EMPTY */}
                                {matches.length === 0 && (
                                    <div className="rounded-xl p-12 text-center" style={{ backgroundColor: '#1a1d27' }}>
                                        <MdSportsTennis size={40} className="text-gray-600 mx-auto mb-4" />
                                        <p className="text-gray-400 font-medium">Tidak ada pertandingan Tennis tersedia saat ini</p>
                                        <p className="text-gray-600 text-sm mt-1">Pertandingan akan muncul saat ada event ATP, WTA, atau Grand Slam</p>
                                    </div>
                                )}
                            </>
                        )}

                        {/* SEO */}
                        <div className="mt-10 pt-8 space-y-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                            <h2 className="text-lg font-semibold text-white">Nonton Streaming Tennis Gratis di NobarMeriah</h2>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Nonton streaming Tennis gratis di NobarMeriah. Tersedia berbagai pertandingan ATP, WTA, dan Grand Slam (Australian Open, French Open, Wimbledon, US Open). Kualitas HD tanpa buffering.
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
                    <Link href="/tennis" className="flex flex-col items-center px-3 py-1 text-yellow-400"><MdSportsTennis size={20} /><span className="text-[10px] mt-1 font-medium">Tennis</span></Link>
                    <a href="https://t.me/sportmeriah" target="_blank" className="flex flex-col items-center px-3 py-1 text-gray-500 hover:text-blue-400 transition-colors"><FaTelegram size={20} /><span className="text-[10px] mt-1">Telegram</span></a>
                </div>
            </nav>
            <div className="h-20 md:hidden"></div>
        </main>
    );
}

// ========== TENNIS MATCH CARD ==========
function TennisMatchCard({ match, isLive, isFinished = false }) {
    const { player1, player2, status, scores, stream, date, time, id, tournament, serve } = match;
    const hasStream = !!stream;
    const matchUrl = hasStream ? `/tennis/${id}?stream=${stream.streamId}` : `/tennis/${id}`;

    const getSetDisplay = () => {
        const statusStr = (status?.short || status?.long || '').toUpperCase();
        if (statusStr.includes('SET 1')) return 'Set 1';
        if (statusStr.includes('SET 2')) return 'Set 2';
        if (statusStr.includes('SET 3')) return 'Set 3';
        if (statusStr.includes('SET 4')) return 'Set 4';
        if (statusStr.includes('SET 5')) return 'Set 5';
        return statusStr || 'LIVE';
    };

    const getScoreDisplay = () => {
        if (!scores || scores.length === 0) return null;
        return scores.map(s => `${s.player1}-${s.player2}`).join(' ');
    };

    return (
        <Link href={matchUrl}>
            <div className={`rounded-lg overflow-hidden transition-all cursor-pointer group border ${!hasStream && !isFinished ? 'opacity-60' : ''}`}
                style={{ backgroundColor: '#1a1d27', borderColor: isLive ? 'rgba(239,68,68,0.2)' : 'transparent' }}
                onMouseEnter={(e) => { if (hasStream) e.currentTarget.style.backgroundColor = '#1e2130'; }}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1a1d27'}>

                {/* Header */}
                <div className="flex justify-between items-center px-4 py-2 text-xs" style={{ backgroundColor: '#151720' }}>
                    <span className={`font-medium flex items-center gap-1.5 ${isLive ? 'text-red-400' : isFinished ? 'text-gray-600' : 'text-gray-500'}`}>
                        {isLive ? (
                            <>
                                <span className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                                </span>
                                {getSetDisplay()}
                            </>
                        ) : isFinished ? 'Selesai' : (
                            <><HiClock size={12} /> {formatKickoffTime(date, time)}</>
                        )}
                    </span>
                    <span className="text-yellow-500 font-medium truncate max-w-[180px]">{tournament?.name || 'Tennis'}</span>
                </div>

                {/* Match */}
                <div className="flex items-center justify-between px-4 py-3 gap-2">
                    {/* Player 1 */}
                    <div className="flex items-center gap-2.5 flex-1 min-w-0 justify-end">
                        <span className="text-white text-sm font-medium truncate text-right">{player1?.name || 'Player 1'}</span>
                        {serve === 'First Player' && isLive && <span className="text-yellow-400 text-[10px] flex-shrink-0">●</span>}
                        {player1?.logo ? (
                            <img src={player1.logo} alt={player1.name} className="w-7 h-7 object-contain flex-shrink-0 rounded-full" onError={(e) => e.target.src = 'https://placehold.co/28x28/232733/6b7280?text=T'} />
                        ) : (
                            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#232733' }}>
                                <MdSportsTennis size={14} className="text-yellow-500" />
                            </div>
                        )}
                    </div>

                    {/* Score */}
                    <div className="flex-shrink-0 px-3 min-w-[52px] text-center">
                        {(isLive || isFinished) && scores && scores.length > 0 ? (
                            <span className={`text-sm font-bold tracking-wide ${isFinished ? 'text-gray-500' : 'text-white'}`}>{getScoreDisplay()}</span>
                        ) : (
                            <span className="text-gray-600 text-xs font-bold tracking-widest">VS</span>
                        )}
                    </div>

                    {/* Player 2 */}
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        {player2?.logo ? (
                            <img src={player2.logo} alt={player2.name} className="w-7 h-7 object-contain flex-shrink-0 rounded-full" onError={(e) => e.target.src = 'https://placehold.co/28x28/232733/6b7280?text=T'} />
                        ) : (
                            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#232733' }}>
                                <MdSportsTennis size={14} className="text-yellow-500" />
                            </div>
                        )}
                        {serve === 'Second Player' && isLive && <span className="text-yellow-400 text-[10px] flex-shrink-0">●</span>}
                        <span className="text-white text-sm font-medium truncate">{player2?.name || 'Player 2'}</span>
                    </div>

                    {/* CTA */}
                    <div className="flex-shrink-0 ml-3">
                        {hasStream ? (
                            <span className="text-white text-xs font-semibold px-3.5 py-1.5 rounded-md inline-flex items-center gap-1" style={{ backgroundColor: isLive ? '#dc2626' : '#eab308' }}>
                                <MdPlayArrow size={14} /> {isLive ? 'Live' : 'Tonton'}
                            </span>
                        ) : isFinished ? (
                            <span className="text-gray-500 text-xs font-medium px-3 py-1.5 rounded-md" style={{ backgroundColor: '#232733' }}>Selesai</span>
                        ) : (
                            <span className="text-gray-500 text-xs font-medium px-3 py-1.5 rounded-md" style={{ backgroundColor: '#232733' }}>No Stream</span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
