'use client';

import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Link from 'next/link';

import { FaTelegram } from 'react-icons/fa';
import { IoHome } from 'react-icons/io5';
import { MdSportsSoccer, MdSportsBasketball, MdPlayArrow, MdArrowForward, MdLiveTv } from 'react-icons/md';
import { HiSignal, HiClock, HiTrophy, HiChevronRight } from 'react-icons/hi2';

const API_URL = 'https://sportmeriah-backend-production.up.railway.app';

const PRIORITY_LEAGUES = [
    'UEFA Champions League', 'UEFA Europa League', 'UEFA Europa Conference League',
    'Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1',
    'Eredivisie', 'Primeira Liga', 'Super Lig', 'Saudi Pro League', 'MLS', 'Liga 1',
    'FA Cup', 'EFL Cup', 'Copa del Rey', 'Coppa Italia', 'DFB Pokal',
];

function formatKickoffTime(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} WIB`;
}

function sortByLeaguePriority(matches) {
    return [...matches].sort((a, b) => {
        const priorityA = PRIORITY_LEAGUES.findIndex(l => (a.league?.name || '') === l);
        const priorityB = PRIORITY_LEAGUES.findIndex(l => (b.league?.name || '') === l);
        if (priorityA !== -1 && priorityB !== -1) return priorityA - priorityB;
        if (priorityA !== -1) return -1;
        if (priorityB !== -1) return 1;
        return new Date(a.date) - new Date(b.date);
    });
}

export default function FootballPageClient() {
    const [liveMatches, setLiveMatches] = useState([]);
    const [upcomingMatches, setUpcomingMatches] = useState([]);
    const [extraChannels, setExtraChannels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ live: 0, upcoming: 0, extra: 0, total: 0 });

    useEffect(() => {
        fetchMatches();
        const interval = setInterval(fetchMatches, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchMatches = async () => {
        try {
            const res = await fetch(`${API_URL}/api/football`);
            const data = await res.json();
            if (data.success) {
                const liveWithStream = (data.matches?.live || []).filter(m => m.hasStream || m.stream?.id);
                const upcomingWithStream = (data.matches?.upcoming || []).filter(m => m.hasStream || m.stream?.id);
                setLiveMatches(sortByLeaguePriority(liveWithStream));
                setUpcomingMatches(sortByLeaguePriority(upcomingWithStream));
                setExtraChannels(data.extraChannels || []);
                setStats({
                    live: liveWithStream.length,
                    upcoming: upcomingWithStream.length,
                    extra: (data.extraChannels || []).length,
                    total: liveWithStream.length + upcomingWithStream.length + (data.extraChannels || []).length
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
                        <MdSportsSoccer className="text-emerald-500" /> Sepakbola
                    </h1>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Sidebar */}
                    <aside className="w-full lg:w-72 order-2 lg:order-1 flex-shrink-0">
                        <div className="sticky top-32 space-y-5">

                            {/* Stats */}
                            <div className="rounded-xl p-5" style={{ backgroundColor: '#1a1d27' }}>
                                <h3 className="text-white font-semibold text-xs mb-4 flex items-center gap-2 uppercase tracking-widest">
                                    <MdSportsSoccer className="text-emerald-500" size={14} /> Statistik
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 flex items-center gap-1.5"><HiSignal size={12} className="text-red-400" /> Live Now</span>
                                        <span className="text-red-400 font-bold">{stats.live}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 flex items-center gap-1.5"><HiClock size={12} className="text-emerald-400" /> Upcoming</span>
                                        <span className="text-emerald-400 font-bold">{stats.upcoming}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 flex items-center gap-1.5"><MdLiveTv size={12} className="text-blue-400" /> Extra Channels</span>
                                        <span className="text-blue-400 font-bold">{stats.extra}</span>
                                    </div>
                                    <div className="flex justify-between text-sm pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                        <span className="text-gray-500">Total Streams</span>
                                        <span className="text-white font-bold">{stats.total}</span>
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
                                <p className="text-gray-500 text-sm">Memuat jadwal pertandingan...</p>
                                <style>{`
                                    .loader { width: 40px; height: 40px; border-radius: 50%; display: inline-block; border-top: 3px solid #fff; border-right: 3px solid transparent; box-sizing: border-box; animation: rot 1s linear infinite; position: relative; }
                                    .loader::after { content: ''; box-sizing: border-box; position: absolute; left: 0; top: 0; width: 40px; height: 40px; border-radius: 50%; border-left: 3px solid #10b981; border-bottom: 3px solid transparent; animation: rot 0.5s linear infinite reverse; }
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
                                            <h2 className="text-white font-bold text-lg">Sedang Tayang</h2>
                                            <span className="text-xs text-gray-500 px-2.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#232733' }}>{liveMatches.length}</span>
                                        </div>
                                        <div className="space-y-2">
                                            {liveMatches.map((match, index) => (
                                                <MatchCard key={`live-${match.id || index}`} match={match} isLive={true} />
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* UPCOMING */}
                                {upcomingMatches.length > 0 && (
                                    <section>
                                        <div className="flex items-center gap-3 mb-4">
                                            <MdSportsSoccer size={18} className="text-emerald-500" />
                                            <h2 className="text-white font-bold text-lg">Akan Datang</h2>
                                            <span className="text-xs text-gray-500 px-2.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#232733' }}>{upcomingMatches.length}</span>
                                        </div>
                                        <div className="space-y-2">
                                            {upcomingMatches.map((match, index) => (
                                                <MatchCard key={`upcoming-${match.id || index}`} match={match} isLive={false} />
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
                                            {extraChannels.map((channel, index) => (
                                                <ChannelCard key={`ch-${channel.id || index}`} channel={channel} />
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* EMPTY */}
                                {liveMatches.length === 0 && upcomingMatches.length === 0 && extraChannels.length === 0 && (
                                    <div className="rounded-xl p-12 text-center" style={{ backgroundColor: '#1a1d27' }}>
                                        <MdSportsSoccer size={40} className="text-gray-600 mx-auto mb-4" />
                                        <p className="text-gray-400 font-medium">Tidak ada stream tersedia saat ini</p>
                                        <p className="text-gray-600 text-sm mt-1">Stream akan muncul saat ada pertandingan</p>
                                        <Link href="/" className="text-emerald-400 hover:text-emerald-300 text-sm mt-4 inline-block">
                                            Kembali ke Beranda
                                        </Link>
                                    </div>
                                )}
                            </>
                        )}

                        {/* SEO */}
                        <div className="mt-10 pt-8 space-y-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                            <h2 className="text-lg font-semibold text-white">Live Streaming Sepakbola Gratis</h2>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Nonton streaming sepakbola gratis di NobarMeriah. Tersedia pertandingan dari liga-liga top dunia seperti Premier League, La Liga, Serie A, Bundesliga, Ligue 1, dan banyak lagi.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Nav Mobile */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden" style={{ backgroundColor: '#0a0c14', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex justify-around items-center py-2.5 px-1">
                    <Link href="/" className="flex flex-col items-center px-3 py-1 text-gray-500 hover:text-emerald-400 transition-colors"><IoHome size={20} /><span className="text-[10px] mt-1">Beranda</span></Link>
                    <Link href="/football" className="flex flex-col items-center px-3 py-1 text-emerald-400"><MdSportsSoccer size={20} /><span className="text-[10px] mt-1 font-medium">Sepakbola</span></Link>
                    <Link href="/basketball" className="flex flex-col items-center px-3 py-1 text-gray-500 hover:text-orange-400 transition-colors"><MdSportsBasketball size={20} /><span className="text-[10px] mt-1">NBA</span></Link>
                    <a href="https://t.me/sportmeriah" target="_blank" className="flex flex-col items-center px-3 py-1 text-gray-500 hover:text-blue-400 transition-colors"><FaTelegram size={20} /><span className="text-[10px] mt-1">Telegram</span></a>
                </div>
            </nav>
            <div className="h-20 md:hidden"></div>
        </main>
    );
}

// ========== MATCH CARD ==========
function MatchCard({ match, isLive }) {
    const { homeTeam, awayTeam, league, score, stream, date, elapsed, id: fixtureId } = match;
    const streamId = stream?.id;
    const provider = stream?.provider || 'sphere';
    const matchUrl = `/football/${fixtureId}?stream=${streamId}&provider=${provider}`;

    return (
        <Link href={matchUrl}>
            <div className="rounded-lg overflow-hidden transition-all cursor-pointer group border"
                style={{ backgroundColor: '#1a1d27', borderColor: isLive ? 'rgba(239,68,68,0.2)' : 'transparent' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1e2130'}
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
                                {elapsed ? `${elapsed}'` : 'LIVE'}
                            </>
                        ) : (
                            <><HiClock size={12} /> {formatKickoffTime(date)}</>
                        )}
                    </span>
                    <span className="text-gray-500 truncate max-w-[180px] flex items-center gap-1.5">
                        <MdSportsSoccer size={12} className="text-emerald-500" />
                        {league?.name || 'Football'}
                    </span>
                </div>

                {/* Match */}
                <div className="flex items-center justify-between px-4 py-3 gap-2">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0 justify-end">
                        <span className="text-white text-sm font-medium truncate text-right">{homeTeam?.name || 'Home'}</span>
                        <img src={homeTeam?.logo} alt={homeTeam?.name} className="w-7 h-7 object-contain flex-shrink-0" onError={(e) => e.target.src = 'https://placehold.co/28x28/232733/6b7280?text=T'} />
                    </div>
                    <div className="flex-shrink-0 px-3 min-w-[52px] text-center">
                        {isLive && score?.home !== null ? (
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
                        <span className="text-white text-xs font-semibold px-3.5 py-1.5 rounded-md inline-flex items-center gap-1" style={{ backgroundColor: isLive ? '#dc2626' : '#10b981' }}>
                            <MdPlayArrow size={14} /> {isLive ? 'Live' : 'Tonton'}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

// ========== CHANNEL CARD ==========
function ChannelCard({ channel }) {
    const { id, name, category, parsedMatch } = channel;
    const displayName = parsedMatch?.homeTeam && parsedMatch?.awayTeam
        ? `${capitalize(parsedMatch.homeTeam)} vs ${capitalize(parsedMatch.awayTeam)}`
        : name;
    const leagueName = parsedMatch?.league || category || 'Football';

    return (
        <Link href={`/football/${id}`}>
            <div className="rounded-lg overflow-hidden transition-all cursor-pointer group border border-transparent"
                style={{ backgroundColor: '#1a1d27' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1e2130'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1a1d27'}>
                <div className="flex justify-between items-center px-4 py-2 text-xs" style={{ backgroundColor: '#151720' }}>
                    <span className="font-medium text-blue-400 flex items-center gap-1.5"><MdLiveTv size={12} /> Extra Channel</span>
                    <span className="text-gray-500 truncate max-w-[180px] flex items-center gap-1.5">
                        <MdSportsSoccer size={12} className="text-emerald-500" /> {leagueName}
                    </span>
                </div>
                <div className="flex items-center justify-between px-4 py-3 gap-2">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#232733' }}>
                            <MdSportsSoccer size={14} className="text-emerald-500" />
                        </div>
                        <span className="text-white text-sm font-medium truncate">{displayName}</span>
                    </div>
                    <span className="text-white text-xs font-semibold px-3.5 py-1.5 rounded-md inline-flex items-center gap-1 flex-shrink-0" style={{ backgroundColor: '#10b981' }}>
                        <MdPlayArrow size={14} /> Tonton
                    </span>
                </div>
            </div>
        </Link>
    );
}

function capitalize(str) {
    if (!str) return '';
    return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}
