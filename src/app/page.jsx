'use client';

import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Link from 'next/link';

// React Icons
import {
    MdSportsSoccer,
    MdSportsBasketball,
    MdSportsTennis,
    MdSportsMotorsports,
    MdSportsMma,
    MdSportsHockey,
    MdSportsFootball,
    MdSportsBaseball,
    MdSportsRugby,
    MdSportsGolf,
    MdSportsCricket
} from 'react-icons/md';
import { GiShuttlecock, GiPoolTriangle, GiDart } from 'react-icons/gi';
import { FaTrophy, FaTelegram, FaWhatsapp } from 'react-icons/fa';
import { IoHome, IoCalendar } from 'react-icons/io5';

const API_URL = 'https://sportmeriah-backend-production.up.railway.app';

// Priority leagues (liga besar yang diprioritaskan) - EXACT NAMES
const PRIORITY_LEAGUES_FOOTBALL = [
    // Top European Competitions
    'UEFA Champions League',
    'UEFA Europa League',
    'UEFA Europa Conference League',
    'UEFA Super Cup',
    // Top 5 Leagues
    'Premier League',
    'La Liga',
    'Serie A',
    'Bundesliga',
    'Ligue 1',
    // Other Major Leagues
    'Eredivisie',
    'Primeira Liga',
    'Super Lig',
    'Saudi Pro League',
    'MLS',
    'Liga 1',
    // Cups
    'FA Cup',
    'EFL Cup',
    'Carabao Cup',
    'Copa del Rey',
    'Coppa Italia',
    'DFB Pokal',
    'Coupe de France',
    // International
    'World Cup',
    'Euro Championship',
    'Copa America',
    'AFC Champions League',
    'AFC Cup',
    'CONMEBOL Libertadores',
    'CONMEBOL Sudamericana',
];

const PRIORITY_LEAGUES_BASKETBALL = [
    'NBA',
    'NBA - Play In Tournament',
    'NBA - Playoffs',
    'NBA - Finals',
    'EuroLeague',
    'NCAA',
    'NBA Cup',
];

// Sort matches by league priority - EXACT MATCH
function sortByLeaguePriority(matches, priorityList) {
    return [...matches].sort((a, b) => {
        const leagueA = a.league?.name || '';
        const leagueB = b.league?.name || '';

        const priorityA = priorityList.findIndex(l => leagueA === l);
        const priorityB = priorityList.findIndex(l => leagueB === l);

        if (priorityA !== -1 && priorityB !== -1) return priorityA - priorityB;
        if (priorityA !== -1) return -1;
        if (priorityB !== -1) return 1;
        return new Date(a.date) - new Date(b.date);
    });
}

// Sport Categories dengan react-icons
const SPORT_CATEGORIES = [
    { id: 'football', name: 'Sepakbola', icon: MdSportsSoccer, color: '#22c55e' },
    { id: 'basketball', name: 'Basketball', icon: MdSportsBasketball, color: '#f97316' },
    { id: 'tennis', name: 'Tennis', icon: MdSportsTennis, color: '#eab308' },
    { id: 'badminton', name: 'Badminton', icon: GiShuttlecock, color: '#3b82f6' },
    { id: 'motorsport', name: 'Motor Sports', icon: MdSportsMotorsports, color: '#ef4444' },
    { id: 'fight', name: 'UFC/Boxing', icon: MdSportsMma, color: '#dc2626' },
    { id: 'hockey', name: 'Hockey', icon: MdSportsHockey, color: '#06b6d4' },
    { id: 'american-football', name: 'American Football', icon: MdSportsFootball, color: '#854d0e' },
    { id: 'baseball', name: 'Baseball', icon: MdSportsBaseball, color: '#e11d48' },
    { id: 'rugby', name: 'Rugby', icon: MdSportsRugby, color: '#16a34a' },
    { id: 'golf', name: 'Golf', icon: MdSportsGolf, color: '#65a30d' },
    { id: 'cricket', name: 'Cricket', icon: MdSportsCricket, color: '#0891b2' },
    { id: 'billiards', name: 'Billiards', icon: GiPoolTriangle, color: '#059669' },
    { id: 'darts', name: 'Darts', icon: GiDart, color: '#dc2626' },
    { id: 'other', name: 'Lainnya', icon: FaTrophy, color: '#f59e0b' },
];

// Liga list untuk sidebar
const LIGA_LIST = [
    { name: 'UEFA Champions League', logo: 'https://media.api-sports.io/football/leagues/2.png', slug: 'football' },
    { name: 'Premier League', logo: 'https://media.api-sports.io/football/leagues/39.png', slug: 'football' },
    { name: 'La Liga', logo: 'https://media.api-sports.io/football/leagues/140.png', slug: 'football' },
    { name: 'Serie A', logo: 'https://media.api-sports.io/football/leagues/135.png', slug: 'football' },
    { name: 'Bundesliga', logo: 'https://media.api-sports.io/football/leagues/78.png', slug: 'football' },
    { name: 'Ligue 1', logo: 'https://media.api-sports.io/football/leagues/61.png', slug: 'football' },
    { name: 'Europa League', logo: 'https://media.api-sports.io/football/leagues/3.png', slug: 'football' },
    { name: 'Liga 1 Indonesia', logo: 'https://media.api-sports.io/football/leagues/274.png', slug: 'football' },
];

// Banner images
const BANNERS = [
    { id: 1, src: 'https://inigambarku.site/images/2026/01/20/GIFMERIAH4D965a1f7cfb6a4aac.gif', link: '#' },
    { id: 2, src: 'https://inigambarku.site/images/2026/02/01/promo-penaslot.gif', link: '#' },
    { id: 3, src: 'https://inigambarku.site/images/2026/01/20/promo-pesiarbet.gif', link: '#' },
    { id: 4, src: 'https://inigambarku.site/images/2026/01/20/promo-girang4d.gif', link: '#' },
];

// ========== FORMAT TIME ==========
function formatKickoffTime(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes} WIB`;
}

export default function Home() {
    const [footballData, setFootballData] = useState({ live: [], upcoming: [] });
    const [basketballData, setBasketballData] = useState({ live: [], upcoming: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAllSports();

        // Refresh setiap 60 detik untuk update status LIVE
        const interval = setInterval(fetchAllSports, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchAllSports = async () => {
        try {
            // Fetch Football & Basketball in parallel
            const [footballRes, basketballRes] = await Promise.all([
                fetch(`${API_URL}/api/football`).catch(() => ({ ok: false })),
                fetch(`${API_URL}/api/basketball`).catch(() => ({ ok: false }))
            ]);

            // Football - ONLY with streams + sort by priority
            if (footballRes.ok) {
                const data = await footballRes.json();
                if (data.success && data.matches) {
                    const liveWithStream = (data.matches.live || []).filter(m => m.hasStream || m.stream?.id);
                    const upcomingWithStream = (data.matches.upcoming || []).filter(m => m.hasStream || m.stream?.id);

                    setFootballData({
                        live: sortByLeaguePriority(liveWithStream, PRIORITY_LEAGUES_FOOTBALL),
                        upcoming: sortByLeaguePriority(upcomingWithStream, PRIORITY_LEAGUES_FOOTBALL)
                    });
                }
            }

            // Basketball - ONLY with streams + sort by priority
            if (basketballRes.ok) {
                const data = await basketballRes.json();
                if (data.success && data.matches) {
                    const liveWithStream = (data.matches.live || []).filter(m => m.hasStream || m.stream?.id);
                    const upcomingWithStream = (data.matches.upcoming || []).filter(m => m.hasStream || m.stream?.id);

                    setBasketballData({
                        live: sortByLeaguePriority(liveWithStream, PRIORITY_LEAGUES_BASKETBALL),
                        upcoming: sortByLeaguePriority(upcomingWithStream, PRIORITY_LEAGUES_BASKETBALL)
                    });
                }
            }
        } catch (error) {
            console.error('Failed to fetch sports:', error);
        } finally {
            setLoading(false);
        }
    };

    // Combined LIVE matches (Football + Basketball)
    const allLiveMatches = [
        ...footballData.live.map(m => ({ ...m, sport: 'football' })),
        ...basketballData.live.map(m => ({ ...m, sport: 'basketball' }))
    ];

    // Total counts
    const totalLive = allLiveMatches.length;
    const totalUpcoming = footballData.upcoming.length + basketballData.upcoming.length;

    return (
        <main className="min-h-screen bg-gray-900">
            <Navbar />

            <div className="container max-w-7xl mx-auto px-4 py-6">

                {/* ========== BANNER SECTION ========== */}
                <div className="mb-6 space-y-2">
                    {BANNERS.map((banner) => (
                        <div key={banner.id} className="banner-slot">
                            <a href={banner.link} target="_blank" rel="noopener">
                                <img
                                    src={banner.src}
                                    alt={`Banner ${banner.id}`}
                                    className="w-full rounded-lg hover:opacity-90 transition-opacity"
                                    onError={(e) => e.target.parentElement.parentElement.style.display = 'none'}
                                />
                            </a>
                        </div>
                    ))}
                </div>

                {/* ========== MAIN LAYOUT 2 KOLOM ========== */}
                <div className="flex flex-col lg:flex-row gap-6">

                    {/* ========== SIDEBAR (Kiri) ========== */}
                    <div className="w-full lg:w-1/4 order-2 lg:order-1">
                        <div className="bg-gray-800 rounded-lg p-4 sticky top-32">

                            {/* Stats */}
                            <div className="mb-6 p-3 bg-gray-700 rounded-lg">
                                <div className="grid grid-cols-2 gap-3 text-center">
                                    <div>
                                        <p className="text-2xl font-bold text-red-500">{totalLive}</p>
                                        <p className="text-xs text-gray-400">Live Now</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-orange-500">{totalUpcoming}</p>
                                        <p className="text-xs text-gray-400">Upcoming</p>
                                    </div>
                                </div>
                            </div>

                            {/* Liga Populer */}
                            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                <FaTrophy className="text-yellow-500" />
                                Liga Populer
                            </h3>
                            <ul className="space-y-1 mb-6">
                                {LIGA_LIST.map((liga, idx) => (
                                    <li key={idx}>
                                        <Link
                                            href={`/${liga.slug}`}
                                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700 transition-colors text-gray-300 hover:text-white text-sm"
                                        >
                                            <img
                                                src={liga.logo}
                                                alt={liga.name}
                                                className="w-6 h-6 object-contain bg-white rounded-full p-0.5"
                                                onError={(e) => e.target.src = 'https://placehold.co/24x24/374151/E5E7EB?text=⚽'}
                                            />
                                            <span>{liga.name}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>

                            {/* Kategori Sport */}
                            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                <span>🎮</span> Kategori Sport
                            </h3>
                            <ul className="space-y-1">
                                {SPORT_CATEGORIES.slice(0, 6).map((sport) => {
                                    const IconComponent = sport.icon;
                                    return (
                                        <li key={sport.id}>
                                            <Link
                                                href={`/${sport.id}`}
                                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700 transition-colors text-gray-300 hover:text-white text-sm"
                                            >
                                                <IconComponent size={18} style={{ color: sport.color }} />
                                                <span>{sport.name}</span>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>

                    {/* ========== CONTENT UTAMA (Kanan) ========== */}
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
                                        border-left: 4px solid #FF3D00;
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
                                {/* ========== 🔴 SEDANG TAYANG (ALL LIVE) ========== */}
                                {allLiveMatches.length > 0 && (
                                    <div className="bg-gray-800 rounded-lg p-4">
                                        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                                            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                                            Sedang Tayang
                                            <span className="text-xs text-gray-400 font-normal">
                                                ({allLiveMatches.length} pertandingan)
                                            </span>
                                        </h2>
                                        <div className="space-y-3">
                                            {allLiveMatches.map((match, index) => (
                                                match.sport === 'football' ? (
                                                    <FootballMatchCard
                                                        key={`live-football-${match.id || index}`}
                                                        match={match}
                                                        isLive={true}
                                                    />
                                                ) : (
                                                    <BasketballMatchCard
                                                        key={`live-basketball-${match.id || index}`}
                                                        match={match}
                                                        isLive={true}
                                                    />
                                                )
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* ========== ⚽ FOOTBALL - UPCOMING ========== */}
                                {footballData.upcoming.length > 0 && (
                                    <div className="bg-gray-800 rounded-lg p-4">
                                        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                                            <MdSportsSoccer className="text-green-500" size={20} />
                                            Sepakbola - Upcoming
                                            <span className="text-xs text-gray-400 font-normal">
                                                ({footballData.upcoming.length} pertandingan)
                                            </span>
                                            <Link href="/football" className="ml-auto text-xs text-green-400 hover:text-green-300">
                                                Lihat Semua →
                                            </Link>
                                        </h2>
                                        <div className="space-y-3">
                                            {footballData.upcoming.slice(0, 10).map((match, index) => (
                                                <FootballMatchCard
                                                    key={`upcoming-football-${match.id || index}`}
                                                    match={match}
                                                    isLive={false}
                                                />
                                            ))}
                                        </div>
                                        {footballData.upcoming.length > 10 && (
                                            <Link
                                                href="/football"
                                                className="block text-center mt-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-green-400 text-sm font-medium transition"
                                            >
                                                Lihat {footballData.upcoming.length - 10} Pertandingan Lainnya →
                                            </Link>
                                        )}
                                    </div>
                                )}

                                {/* ========== 🏀 BASKETBALL - UPCOMING ========== */}
                                {basketballData.upcoming.length > 0 && (
                                    <div className="bg-gray-800 rounded-lg p-4">
                                        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                                            <MdSportsBasketball className="text-orange-500" size={20} />
                                            Basketball (NBA) - Upcoming
                                            <span className="text-xs text-gray-400 font-normal">
                                                ({basketballData.upcoming.length} pertandingan)
                                            </span>
                                            <Link href="/basketball" className="ml-auto text-xs text-orange-400 hover:text-orange-300">
                                                Lihat Semua →
                                            </Link>
                                        </h2>
                                        <div className="space-y-3">
                                            {basketballData.upcoming.slice(0, 10).map((match, index) => (
                                                <BasketballMatchCard
                                                    key={`upcoming-basketball-${match.id || index}`}
                                                    match={match}
                                                    isLive={false}
                                                />
                                            ))}
                                        </div>
                                        {basketballData.upcoming.length > 10 && (
                                            <Link
                                                href="/basketball"
                                                className="block text-center mt-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-orange-400 text-sm font-medium transition"
                                            >
                                                Lihat {basketballData.upcoming.length - 10} Pertandingan Lainnya →
                                            </Link>
                                        )}
                                    </div>
                                )}

                                {/* Empty State */}
                                {footballData.live.length === 0 && footballData.upcoming.length === 0 &&
                                    basketballData.live.length === 0 && basketballData.upcoming.length === 0 && (
                                        <div className="bg-gray-800 rounded-lg p-8 text-center">
                                            <p className="text-4xl mb-4">😴</p>
                                            <p className="text-gray-400">Tidak ada pertandingan tersedia saat ini</p>
                                        </div>
                                    )}
                            </>
                        )}

                        {/* ========== SEO DESCRIPTION ========== */}
                        <div className="mt-8 pt-6 border-t border-gray-700 text-gray-400 text-sm space-y-3">
                            <h2 className="text-xl font-semibold text-white">
                                Nonton Streaming Sport Gratis di SportMeriah
                            </h2>
                            <p>
                                Nonton streaming Sport gratis di SportMeriah. Kualitas terbaik, server tercepat, dan update real-time.
                            </p>
                            <p>
                                Tersedia berbagai pertandingan dari liga top dunia termasuk sepakbola, basketball NBA, tennis, dan olahraga lainnya. Tonton sekarang tanpa ribet!
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ========== BOTTOM NAV MOBILE ========== */}
            <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 z-50 md:hidden">
                <div className="flex justify-around items-center py-2 px-1">
                    <Link href="/" className="flex flex-col items-center px-2 sm:px-4 py-2 text-orange-400">
                        <IoHome size={22} />
                        <span className="text-[10px] sm:text-xs mt-1">Beranda</span>
                    </Link>
                    <Link href="/football" className="flex flex-col items-center px-2 sm:px-4 py-2 text-gray-400 hover:text-green-400 transition-colors">
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

            {/* Padding bottom untuk mobile nav */}
            <div className="h-20 md:hidden"></div>
        </main>
    );
}

// ========== FOOTBALL MATCH CARD ==========
function FootballMatchCard({ match, isLive }) {
    const { homeTeam, awayTeam, league, score, stream, date, elapsed, id: fixtureId } = match;

    // Link ke match page - pake fixture ID jika ada, fallback ke stream ID
    const streamId = stream?.id;
    const provider = stream?.provider || 'sphere';
    const matchUrl = fixtureId
        ? `/match/${fixtureId}?stream=${streamId}&provider=${provider}`
        : `/football/${streamId}`;

    return (
        <Link href={matchUrl}>
            <div className="bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer group overflow-hidden relative">

                {/* Live Badge - Top Left */}
                {isLive && (
                    <div className="absolute top-0 left-0 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-br font-bold flex items-center gap-1 z-10">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                        {elapsed ? `${elapsed}'` : 'LIVE'}
                    </div>
                )}

                {/* Header - Status & League */}
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

                    {/* Tombol Tonton */}
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

// ========== BASKETBALL MATCH CARD ==========
function BasketballMatchCard({ match, isLive }) {
    const { homeTeam, awayTeam, league, score, stream, date, quarter, timer } = match;

    // Link ke player page dengan stream ID
    const matchUrl = `/basketball/${stream?.id}`;

    // Format quarter display
    const getQuarterDisplay = () => {
        if (quarter && timer) return `${quarter} ${timer}'`;
        if (quarter) return quarter;
        return 'LIVE';
    };

    return (
        <Link href={matchUrl}>
            <div className="bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer group overflow-hidden relative">

                {/* Live Badge - Top Left */}
                {isLive && (
                    <div className="absolute top-0 left-0 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-br font-bold flex items-center gap-1 z-10">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                        {getQuarterDisplay()}
                    </div>
                )}

                {/* Header - Status & League */}
                <div className="flex justify-between items-center px-3 py-1.5 bg-gray-800 text-[10px] sm:text-xs">
                    <span className={`font-medium ${isLive ? 'text-red-400' : 'text-gray-400'}`}>
                        {isLive ? '🔴 Sedang Tayang' : `Upcoming - ${formatKickoffTime(date)}`}
                    </span>
                    <span className="text-orange-400 truncate max-w-[120px] sm:max-w-[200px] flex items-center gap-1">
                        <MdSportsBasketball size={12} />
                        {league?.name || 'NBA'}
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
                            onError={(e) => e.target.src = 'https://placehold.co/32x32/374151/ffffff?text=🏀'}
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
                            onError={(e) => e.target.src = 'https://placehold.co/32x32/374151/ffffff?text=🏀'}
                        />
                        <span className="text-white text-xs sm:text-sm font-medium truncate">
                            {awayTeam?.name || 'Away'}
                        </span>
                    </div>

                    {/* Tombol Tonton */}
                    <div className="flex-shrink-0 ml-2">
                        <span className={`text-white text-[10px] sm:text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded transition-colors inline-flex items-center gap-1 ${isLive ? 'bg-red-600 group-hover:bg-red-700' : 'bg-orange-500 group-hover:bg-orange-600'}`}>
                            {isLive ? 'Tonton ▶' : 'Tonton'}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
