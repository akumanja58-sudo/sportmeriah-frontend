'use client';

import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Link from 'next/link';

// React Icons
import { FaTelegram, FaWhatsapp } from 'react-icons/fa';
import { IoHome } from 'react-icons/io5';
import { MdSportsSoccer, MdSportsBasketball } from 'react-icons/md';

const API_URL = 'https://sportmeriah-backend-production.up.railway.app';

// Priority leagues for sorting
const PRIORITY_LEAGUES = [
    'UEFA Champions League',
    'UEFA Europa League',
    'UEFA Europa Conference League',
    'Premier League',
    'La Liga',
    'Serie A',
    'Bundesliga',
    'Ligue 1',
    'Eredivisie',
    'Primeira Liga',
    'Super Lig',
    'Saudi Pro League',
    'MLS',
    'Liga 1',
    'FA Cup',
    'EFL Cup',
    'Copa del Rey',
    'Coppa Italia',
    'DFB Pokal',
];

// ========== FORMAT TIME ==========
function formatKickoffTime(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes} WIB`;
}

// Sort by league priority
function sortByLeaguePriority(matches) {
    return [...matches].sort((a, b) => {
        const leagueA = a.league?.name || '';
        const leagueB = b.league?.name || '';

        const priorityA = PRIORITY_LEAGUES.findIndex(l => leagueA === l);
        const priorityB = PRIORITY_LEAGUES.findIndex(l => leagueB === l);

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
                // ONLY matches with streams
                const liveWithStream = (data.matches?.live || []).filter(m => m.hasStream || m.stream?.id);
                const upcomingWithStream = (data.matches?.upcoming || []).filter(m => m.hasStream || m.stream?.id);

                // Sort by league priority
                const sortedLive = sortByLeaguePriority(liveWithStream);
                const sortedUpcoming = sortByLeaguePriority(upcomingWithStream);

                setLiveMatches(sortedLive);
                setUpcomingMatches(sortedUpcoming);
                setExtraChannels(data.extraChannels || []);

                setStats({
                    live: sortedLive.length,
                    upcoming: sortedUpcoming.length,
                    extra: (data.extraChannels || []).length,
                    total: sortedLive.length + sortedUpcoming.length + (data.extraChannels || []).length
                });
            }
        } catch (error) {
            console.error('Failed to fetch matches:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-900">
            <Navbar />

            <div className="container max-w-6xl mx-auto px-4 py-6">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="text-gray-400 hover:text-white">
                            <IoHome size={20} />
                        </Link>
                        <span className="text-gray-600">/</span>
                        <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                            <MdSportsSoccer className="text-green-500" />
                            Sepakbola
                        </h1>
                    </div>
                </div>

                {/* Main Layout */}
                <div className="flex flex-col lg:flex-row gap-6">

                    {/* Sidebar Stats */}
                    <div className="w-full lg:w-1/4 order-2 lg:order-1">
                        <div className="bg-gray-800 rounded-lg p-4 sticky top-32">
                            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                <MdSportsSoccer className="text-green-500" />
                                Football Stats
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">🔴 Live Now</span>
                                    <span className="text-red-500 font-bold">{stats.live}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">📅 Upcoming</span>
                                    <span className="text-orange-500 font-bold">{stats.upcoming}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">📺 Extra Channels</span>
                                    <span className="text-blue-500 font-bold">{stats.extra}</span>
                                </div>
                                <div className="flex justify-between text-sm border-t border-gray-700 pt-3">
                                    <span className="text-gray-400">Total Streams</span>
                                    <span className="text-green-500 font-bold">{stats.total}</span>
                                </div>
                            </div>

                            {/* Quick Links */}
                            <div className="mt-6 pt-4 border-t border-gray-700">
                                <h4 className="text-white font-semibold mb-3 text-sm">Quick Links</h4>
                                <div className="space-y-2">
                                    <Link href="/" className="block text-gray-400 hover:text-white text-sm">
                                        ← Kembali ke Beranda
                                    </Link>
                                    <Link href="/basketball" className="block text-gray-400 hover:text-orange-400 text-sm flex items-center gap-2">
                                        <MdSportsBasketball size={16} />
                                        Lihat Basketball
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="w-full lg:w-3/4 order-1 lg:order-2 space-y-6">

                        {loading ? (
                            <div className="bg-gray-800 rounded-lg p-8 text-center">
                                <div className="flex justify-center mb-4">
                                    <span className="loader"></span>
                                </div>
                                <p className="text-gray-400">Memuat jadwal pertandingan...</p>
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
                                        position: relative;
                                    }
                                    .loader::after {
                                        content: '';
                                        box-sizing: border-box;
                                        position: absolute;
                                        left: 0;
                                        top: 0;
                                        width: 48px;
                                        height: 48px;
                                        border-radius: 50%;
                                        border-left: 4px solid #22c55e;
                                        border-bottom: 4px solid transparent;
                                        animation: rotation 0.5s linear infinite reverse;
                                    }
                                    @keyframes rotation {
                                        0% { transform: rotate(0deg); }
                                        100% { transform: rotate(360deg); }
                                    }
                                `}</style>
                            </div>
                        ) : (
                            <>
                                {/* LIVE MATCHES */}
                                {liveMatches.length > 0 && (
                                    <div className="bg-gray-800 rounded-lg p-4">
                                        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                                            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                                            Sedang Tayang
                                            <span className="text-xs text-gray-400 font-normal">
                                                ({liveMatches.length} pertandingan)
                                            </span>
                                        </h2>
                                        <div className="space-y-3">
                                            {liveMatches.map((match, index) => (
                                                <MatchCard
                                                    key={`live-${match.id || index}`}
                                                    match={match}
                                                    isLive={true}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* UPCOMING MATCHES */}
                                {upcomingMatches.length > 0 && (
                                    <div className="bg-gray-800 rounded-lg p-4">
                                        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                                            <MdSportsSoccer className="text-green-500" />
                                            Akan Datang
                                            <span className="text-xs text-gray-400 font-normal">
                                                ({upcomingMatches.length} pertandingan)
                                            </span>
                                        </h2>
                                        <div className="space-y-3">
                                            {upcomingMatches.map((match, index) => (
                                                <MatchCard
                                                    key={`upcoming-${match.id || index}`}
                                                    match={match}
                                                    isLive={false}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* EXTRA CHANNELS */}
                                {extraChannels.length > 0 && (
                                    <div className="bg-gray-800 rounded-lg p-4">
                                        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                                            📺 Extra Channels
                                            <span className="text-xs text-gray-400 font-normal">
                                                ({extraChannels.length} channel)
                                            </span>
                                        </h2>
                                        <p className="text-gray-400 text-xs mb-4">
                                            Channel yang belum ter-match dengan jadwal pertandingan
                                        </p>
                                        <div className="space-y-3">
                                            {extraChannels.map((channel, index) => (
                                                <ChannelCard
                                                    key={`channel-${channel.id || index}`}
                                                    channel={channel}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Empty State */}
                                {liveMatches.length === 0 && upcomingMatches.length === 0 && extraChannels.length === 0 && (
                                    <div className="bg-gray-800 rounded-lg p-8 text-center">
                                        <p className="text-4xl mb-4">😴</p>
                                        <p className="text-gray-400">Tidak ada stream tersedia saat ini</p>
                                        <Link href="/" className="inline-block mt-4 text-green-400 hover:text-green-300">
                                            ← Kembali ke Beranda
                                        </Link>
                                    </div>
                                )}
                            </>
                        )}

                        {/* SEO */}
                        <div className="mt-8 pt-6 border-t border-gray-700 text-gray-400 text-sm space-y-3">
                            <h2 className="text-lg font-semibold text-white">
                                Live Streaming Sepakbola Gratis
                            </h2>
                            <p>
                                Nonton streaming sepakbola gratis di SportMeriah. Tersedia pertandingan dari liga-liga top dunia seperti Premier League, La Liga, Serie A, Bundesliga, Ligue 1, dan banyak lagi.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Nav Mobile */}
            <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 z-50 md:hidden">
                <div className="flex justify-around items-center py-2 px-1">
                    <Link href="/" className="flex flex-col items-center px-2 sm:px-4 py-2 text-gray-400 hover:text-white transition-colors">
                        <IoHome size={22} />
                        <span className="text-[10px] sm:text-xs mt-1">Beranda</span>
                    </Link>
                    <Link href="/football" className="flex flex-col items-center px-2 sm:px-4 py-2 text-green-400">
                        <MdSportsSoccer size={22} />
                        <span className="text-[10px] sm:text-xs mt-1">Sepakbola</span>
                    </Link>
                    <Link href="/basketball" className="flex flex-col items-center px-2 sm:px-4 py-2 text-gray-400 hover:text-orange-400 transition-colors">
                        <MdSportsBasketball size={22} />
                        <span className="text-[10px] sm:text-xs mt-1">NBA</span>
                    </Link>
                    <a href="https://t.me/sportmeriah" target="_blank" className="flex flex-col items-center px-2 sm:px-4 py-2 text-gray-400 hover:text-blue-400 transition-colors">
                        <FaTelegram size={22} />
                        <span className="text-[10px] sm:text-xs mt-1">Telegram</span>
                    </a>
                </div>
            </nav>

            {/* Bottom padding for mobile nav */}
            <div className="h-20 md:hidden"></div>
        </main>
    );
}

// ========== MATCH CARD COMPONENT ==========
function MatchCard({ match, isLive }) {
    const { homeTeam, awayTeam, league, score, stream, date, elapsed } = match;

    // Semua match disini pasti punya stream
    const matchUrl = `/football/${stream?.id}`;

    return (
        <Link href={matchUrl}>
            <div className="bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer group overflow-hidden relative">

                {/* Live Badge */}
                {isLive && (
                    <div className="absolute top-0 left-0 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-br font-bold flex items-center gap-1 z-10">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                        {elapsed ? `${elapsed}'` : 'LIVE'}
                    </div>
                )}

                {/* Header */}
                <div className="flex justify-between items-center px-3 py-1.5 bg-gray-800 text-[10px] sm:text-xs">
                    <span className={`font-medium ${isLive ? 'text-red-400' : 'text-gray-400'}`}>
                        {isLive ? '🔴 Sedang Tayang' : `Upcoming - ${formatKickoffTime(date)}`}
                    </span>
                    <span className="text-green-400 truncate max-w-[120px] sm:max-w-[200px] flex items-center gap-1">
                        <MdSportsSoccer size={12} />
                        {league?.name || 'Football'}
                    </span>
                </div>

                {/* Match Content */}
                <div className="flex items-center justify-between px-3 py-2.5 gap-2">

                    {/* Home Team */}
                    <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                        <span className="text-white text-xs sm:text-sm font-medium truncate text-right">
                            {homeTeam?.name || 'Home'}
                        </span>
                        <img
                            src={homeTeam?.logo}
                            alt={homeTeam?.name}
                            className="w-6 h-6 sm:w-8 sm:h-8 object-contain flex-shrink-0"
                            onError={(e) => e.target.src = 'https://placehold.co/32x32/374151/ffffff?text=⚽'}
                        />
                    </div>

                    {/* Score / VS */}
                    <div className="flex-shrink-0 px-2">
                        {isLive && score?.home !== null ? (
                            <span className="text-white text-sm sm:text-base font-bold">
                                {score?.home ?? 0} - {score?.away ?? 0}
                            </span>
                        ) : (
                            <span className="text-gray-400 text-xs sm:text-sm font-bold">VS</span>
                        )}
                    </div>

                    {/* Away Team */}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <img
                            src={awayTeam?.logo}
                            alt={awayTeam?.name}
                            className="w-6 h-6 sm:w-8 sm:h-8 object-contain flex-shrink-0"
                            onError={(e) => e.target.src = 'https://placehold.co/32x32/374151/ffffff?text=⚽'}
                        />
                        <span className="text-white text-xs sm:text-sm font-medium truncate">
                            {awayTeam?.name || 'Away'}
                        </span>
                    </div>

                    {/* Button */}
                    <div className="flex-shrink-0 ml-2">
                        <span className={`text-white text-[10px] sm:text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded transition-colors inline-flex items-center gap-1 ${isLive ? 'bg-red-600 group-hover:bg-red-700' : 'bg-green-600 group-hover:bg-green-700'}`}>
                            {isLive ? 'Tonton ▶' : 'Tonton'}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

// ========== CHANNEL CARD COMPONENT ==========
function ChannelCard({ channel }) {
    const { id, name, category, parsedMatch } = channel;

    // Parse team names from channel name for display
    const displayName = parsedMatch?.homeTeam && parsedMatch?.awayTeam
        ? `${capitalize(parsedMatch.homeTeam)} vs ${capitalize(parsedMatch.awayTeam)}`
        : name;

    const leagueName = parsedMatch?.league || category || 'Football';

    return (
        <Link href={`/football/${id}`}>
            <div className="bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer group overflow-hidden">

                {/* Header */}
                <div className="flex justify-between items-center px-3 py-1.5 bg-gray-800 text-[10px] sm:text-xs">
                    <span className="font-medium text-blue-400">📺 Extra Channel</span>
                    <span className="text-green-400 truncate max-w-[120px] sm:max-w-[200px] flex items-center gap-1">
                        <MdSportsSoccer size={12} />
                        {leagueName}
                    </span>
                </div>

                {/* Content */}
                <div className="flex items-center justify-between px-3 py-3 gap-2">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <MdSportsSoccer size={18} className="text-white" />
                        </div>
                        <span className="text-white text-xs sm:text-sm font-medium truncate">
                            {displayName}
                        </span>
                    </div>

                    {/* Button */}
                    <div className="flex-shrink-0 ml-2">
                        <span className="text-white text-[10px] sm:text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded bg-green-600 group-hover:bg-green-700 transition-colors">
                            Tonton ▶
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

// Helper: Capitalize words
function capitalize(str) {
    if (!str) return '';
    return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}
