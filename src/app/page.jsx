'use client';

import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Link from 'next/link';

// Icons — clean, no emoji
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
    MdSportsCricket,
    MdSportsVolleyball,
    MdSportsHandball,
    MdLiveTv,
    MdArrowForward,
    MdPlayArrow,
    MdSchedule,
    MdTrendingUp
} from 'react-icons/md';
import { GiShuttlecock } from 'react-icons/gi';
import { IoHome } from 'react-icons/io5';
import { FaTelegram } from 'react-icons/fa';
import { HiSignal, HiClock, HiTrophy, HiChevronRight } from 'react-icons/hi2';

const API_URL = 'https://sportmeriah-backend-production.up.railway.app';

// Priority leagues
const PRIORITY_LEAGUES_FOOTBALL = [
    'UEFA Champions League', 'UEFA Europa League', 'UEFA Europa Conference League', 'UEFA Super Cup',
    'Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1',
    'Eredivisie', 'Primeira Liga', 'Super Lig', 'Saudi Pro League', 'MLS', 'Liga 1',
    'FA Cup', 'EFL Cup', 'Carabao Cup', 'Copa del Rey', 'Coppa Italia', 'DFB Pokal', 'Coupe de France',
    'World Cup', 'Euro Championship', 'Copa America', 'AFC Champions League', 'CONMEBOL Libertadores',
];

const PRIORITY_LEAGUES_BASKETBALL = [
    'NBA', 'NBA - Play In Tournament', 'NBA - Playoffs', 'NBA - Finals', 'EuroLeague', 'NCAA', 'NBA Cup',
];

function sortByLeaguePriority(matches, priorityList) {
    return [...matches].sort((a, b) => {
        const priorityA = priorityList.findIndex(l => (a.league?.name || '') === l);
        const priorityB = priorityList.findIndex(l => (b.league?.name || '') === l);
        if (priorityA !== -1 && priorityB !== -1) return priorityA - priorityB;
        if (priorityA !== -1) return -1;
        if (priorityB !== -1) return 1;
        return new Date(a.date) - new Date(b.date);
    });
}

// Liga list for sidebar
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

// Sport categories for sidebar — with correct hrefs
const SPORT_CATEGORIES = [
    { name: 'Sepakbola', icon: MdSportsSoccer, color: '#10b981', href: '/football' },
    { name: 'Basketball', icon: MdSportsBasketball, color: '#f97316', href: '/basketball' },
    { name: 'Tennis', icon: MdSportsTennis, color: '#eab308', href: '/tennis' },
    { name: 'Motorsport', icon: MdSportsMotorsports, color: '#ef4444', href: '/motorsport' },
    { name: 'NHL Hockey', icon: MdSportsHockey, color: '#06b6d4', href: '/hockey' },
    { name: 'NFL', icon: MdSportsFootball, color: '#854d0e', href: '/sports/nfl' },
    { name: 'MLB Baseball', icon: MdSportsBaseball, color: '#e11d48', href: '/sports/mlb' },
    { name: 'UFC / Boxing', icon: MdSportsMma, color: '#dc2626', href: '/sports/ppv' },
];

function formatKickoffTime(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} WIB`;
}

// ========== HOMEPAGE ==========
export default function Home() {
    const [footballData, setFootballData] = useState({ live: [], upcoming: [] });
    const [basketballData, setBasketballData] = useState({ live: [], upcoming: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAllSports();
        const interval = setInterval(fetchAllSports, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchAllSports = async () => {
        try {
            const [footballRes, basketballRes] = await Promise.all([
                fetch(`${API_URL}/api/football`).catch(() => ({ ok: false })),
                fetch(`${API_URL}/api/basketball`).catch(() => ({ ok: false }))
            ]);

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

    const allLiveMatches = [
        ...footballData.live.map(m => ({ ...m, sport: 'football' })),
        ...basketballData.live.map(m => ({ ...m, sport: 'basketball' }))
    ];

    const totalLive = allLiveMatches.length;
    const totalUpcoming = footballData.upcoming.length + basketballData.upcoming.length;

    return (
        <main className="min-h-screen" style={{ backgroundColor: '#0f1117' }}>
            <Navbar />

            <div className="container max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* ========== SIDEBAR ========== */}
                    <aside className="w-full lg:w-72 order-2 lg:order-1 flex-shrink-0">
                        <div className="sticky top-32 space-y-6">

                            {/* Stats Card */}
                            <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#1a1d27' }}>
                                <div className="p-5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center p-3 rounded-lg" style={{ backgroundColor: '#232733' }}>
                                            <div className="flex items-center justify-center gap-1.5 mb-1">
                                                <HiSignal className="text-red-400" size={14} />
                                                <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Live</span>
                                            </div>
                                            <p className="text-2xl font-bold text-white">{totalLive}</p>
                                        </div>
                                        <div className="text-center p-3 rounded-lg" style={{ backgroundColor: '#232733' }}>
                                            <div className="flex items-center justify-center gap-1.5 mb-1">
                                                <HiClock className="text-emerald-400" size={14} />
                                                <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Upcoming</span>
                                            </div>
                                            <p className="text-2xl font-bold text-white">{totalUpcoming}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Liga Populer */}
                            <div className="rounded-xl p-5" style={{ backgroundColor: '#1a1d27' }}>
                                <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2 uppercase tracking-wider">
                                    <HiTrophy className="text-amber-400" size={16} />
                                    Liga Populer
                                </h3>
                                <ul className="space-y-0.5">
                                    {LIGA_LIST.map((liga, idx) => (
                                        <li key={idx}>
                                            <Link
                                                href={`/${liga.slug}`}
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-gray-400 hover:text-white text-sm"
                                                style={{ ':hover': { backgroundColor: '#232733' } }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#232733'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            >
                                                <img
                                                    src={liga.logo}
                                                    alt={liga.name}
                                                    className="w-5 h-5 object-contain"
                                                    onError={(e) => e.target.src = 'https://placehold.co/20x20/374151/E5E7EB?text=L'}
                                                />
                                                <span>{liga.name}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Kategori Sport */}
                            <div className="rounded-xl p-5" style={{ backgroundColor: '#1a1d27' }}>
                                <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2 uppercase tracking-wider">
                                    <MdTrendingUp className="text-emerald-400" size={16} />
                                    Kategori Sport
                                </h3>
                                <ul className="space-y-0.5">
                                    {SPORT_CATEGORIES.map((sport, idx) => {
                                        const IconComponent = sport.icon;
                                        return (
                                            <li key={idx}>
                                                <Link
                                                    href={sport.href}
                                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-gray-400 hover:text-white text-sm"
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#232733'}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                >
                                                    <IconComponent size={16} style={{ color: sport.color }} />
                                                    <span>{sport.name}</span>
                                                    <HiChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </div>
                    </aside>

                    {/* ========== MAIN CONTENT ========== */}
                    <div className="flex-1 order-1 lg:order-2 space-y-6">

                        {loading ? (
                            <div className="rounded-xl p-12 text-center" style={{ backgroundColor: '#1a1d27' }}>
                                <div className="flex justify-center mb-4">
                                    <span className="loader"></span>
                                    <style>{`
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
                                            border-left: 4px solid #10b981;
                                            border-bottom: 4px solid transparent;
                                            animation: rotation 0.5s linear infinite reverse;
                                        }
                                        @keyframes rotation {
                                            0% { transform: rotate(0deg); }
                                            100% { transform: rotate(360deg); }
                                        }
                                    `}</style>
                                </div>
                                <p className="text-gray-500 text-sm">Memuat jadwal pertandingan...</p>
                            </div>
                        ) : (
                            <>
                                {/* ========== LIVE NOW ========== */}
                                {allLiveMatches.length > 0 && (
                                    <section>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="flex items-center gap-2">
                                                <span className="relative flex h-2.5 w-2.5">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                                </span>
                                                <h2 className="text-white font-semibold text-lg">Sedang Tayang</h2>
                                            </div>
                                            <span className="text-xs text-gray-500 font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: '#232733' }}>
                                                {allLiveMatches.length}
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            {allLiveMatches.map((match, index) => (
                                                match.sport === 'football' ? (
                                                    <FootballMatchCard key={`live-f-${match.id || index}`} match={match} isLive={true} />
                                                ) : (
                                                    <BasketballMatchCard key={`live-b-${match.id || index}`} match={match} isLive={true} />
                                                )
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* ========== FOOTBALL UPCOMING ========== */}
                                {footballData.upcoming.length > 0 && (
                                    <section>
                                        <SectionHeader
                                            icon={MdSportsSoccer}
                                            iconColor="#10b981"
                                            title="Sepakbola"
                                            subtitle="Upcoming"
                                            count={footballData.upcoming.length}
                                            linkHref="/football"
                                            linkColor="text-emerald-400"
                                        />
                                        <div className="space-y-2">
                                            {footballData.upcoming.slice(0, 10).map((match, index) => (
                                                <FootballMatchCard key={`up-f-${match.id || index}`} match={match} isLive={false} />
                                            ))}
                                        </div>
                                        {footballData.upcoming.length > 10 && (
                                            <Link
                                                href="/football"
                                                className="flex items-center justify-center gap-2 mt-3 py-2.5 rounded-lg text-emerald-400 text-sm font-medium transition-all hover:text-emerald-300"
                                                style={{ backgroundColor: '#1a1d27' }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#232733'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1a1d27'}
                                            >
                                                Lihat {footballData.upcoming.length - 10} pertandingan lainnya
                                                <MdArrowForward size={16} />
                                            </Link>
                                        )}
                                    </section>
                                )}

                                {/* ========== BASKETBALL UPCOMING ========== */}
                                {basketballData.upcoming.length > 0 && (
                                    <section>
                                        <SectionHeader
                                            icon={MdSportsBasketball}
                                            iconColor="#f97316"
                                            title="Basketball (NBA)"
                                            subtitle="Upcoming"
                                            count={basketballData.upcoming.length}
                                            linkHref="/basketball"
                                            linkColor="text-orange-400"
                                        />
                                        <div className="space-y-2">
                                            {basketballData.upcoming.slice(0, 10).map((match, index) => (
                                                <BasketballMatchCard key={`up-b-${match.id || index}`} match={match} isLive={false} />
                                            ))}
                                        </div>
                                        {basketballData.upcoming.length > 10 && (
                                            <Link
                                                href="/basketball"
                                                className="flex items-center justify-center gap-2 mt-3 py-2.5 rounded-lg text-orange-400 text-sm font-medium transition-all hover:text-orange-300"
                                                style={{ backgroundColor: '#1a1d27' }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#232733'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1a1d27'}
                                            >
                                                Lihat {basketballData.upcoming.length - 10} pertandingan lainnya
                                                <MdArrowForward size={16} />
                                            </Link>
                                        )}
                                    </section>
                                )}

                                {/* ========== EMPTY STATE ========== */}
                                {footballData.live.length === 0 && footballData.upcoming.length === 0 &&
                                    basketballData.live.length === 0 && basketballData.upcoming.length === 0 && (
                                        <div className="rounded-xl p-12 text-center" style={{ backgroundColor: '#1a1d27' }}>
                                            <MdLiveTv size={48} className="text-gray-600 mx-auto mb-4" />
                                            <p className="text-gray-400 font-medium">Tidak ada pertandingan tersedia saat ini</p>
                                            <p className="text-gray-600 text-sm mt-1">Pertandingan akan muncul saat ada event yang ditayangkan</p>
                                        </div>
                                    )}
                            </>
                        )}

                        {/* ========== SEO SECTION ========== */}
                        <div className="mt-10 pt-8 border-t border-gray-800/50 space-y-3">
                            <h2 className="text-lg font-semibold text-white">
                                Nonton Streaming Sport Gratis di NobarMeriah
                            </h2>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Platform streaming olahraga terlengkap di Indonesia. Kualitas HD, server tercepat, dan update real-time
                                untuk sepakbola, basketball NBA, tennis, dan 14+ cabang olahraga lainnya.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ========== BOTTOM NAV MOBILE ========== */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t" style={{ backgroundColor: '#0f1117', borderColor: '#1a1d27' }}>
                <div className="flex justify-around items-center py-2.5 px-1">
                    <Link href="/" className="flex flex-col items-center px-3 py-1 text-emerald-400">
                        <IoHome size={20} />
                        <span className="text-[10px] mt-1 font-medium">Beranda</span>
                    </Link>
                    <Link href="/football" className="flex flex-col items-center px-3 py-1 text-gray-500 hover:text-emerald-400 transition-colors">
                        <MdSportsSoccer size={20} />
                        <span className="text-[10px] mt-1">Sepakbola</span>
                    </Link>
                    <Link href="/basketball" className="flex flex-col items-center px-3 py-1 text-gray-500 hover:text-orange-400 transition-colors">
                        <MdSportsBasketball size={20} />
                        <span className="text-[10px] mt-1">NBA</span>
                    </Link>
                    <a href="https://t.me/sportmeriah" target="_blank" className="flex flex-col items-center px-3 py-1 text-gray-500 hover:text-blue-400 transition-colors">
                        <FaTelegram size={20} />
                        <span className="text-[10px] mt-1">Telegram</span>
                    </a>
                </div>
            </nav>

            <div className="h-20 md:hidden"></div>
        </main>
    );
}

// ========== SECTION HEADER ==========
function SectionHeader({ icon: Icon, iconColor, title, subtitle, count, linkHref, linkColor }) {
    return (
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
                <Icon size={20} style={{ color: iconColor }} />
                <h2 className="text-white font-semibold text-lg">{title}</h2>
                <span className="text-gray-500 text-sm font-normal">— {subtitle}</span>
                <span className="text-xs text-gray-500 font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: '#232733' }}>
                    {count}
                </span>
            </div>
            <Link href={linkHref} className={`${linkColor} hover:opacity-80 text-sm font-medium flex items-center gap-1 transition-opacity`}>
                Lihat Semua
                <MdArrowForward size={14} />
            </Link>
        </div>
    );
}

// ========== FOOTBALL MATCH CARD ==========
function FootballMatchCard({ match, isLive }) {
    const { homeTeam, awayTeam, league, score, stream, date, elapsed, id: fixtureId } = match;
    const streamId = stream?.id;
    const provider = stream?.provider || 'sphere';
    const matchUrl = `/football/${fixtureId}?stream=${streamId}&provider=${provider}`;

    return (
        <Link href={matchUrl}>
            <div
                className="rounded-lg overflow-hidden transition-all cursor-pointer group border"
                style={{
                    backgroundColor: '#1a1d27',
                    borderColor: isLive ? 'rgba(239, 68, 68, 0.2)' : 'transparent'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1e2130'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1a1d27'}
            >
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
                            <>
                                <HiClock size={12} />
                                {formatKickoffTime(date)}
                            </>
                        )}
                    </span>
                    <span className="text-gray-500 truncate max-w-[180px] flex items-center gap-1.5">
                        <MdSportsSoccer size={12} className="text-emerald-500" />
                        {league?.name || 'Football'}
                    </span>
                </div>

                {/* Match Content */}
                <div className="flex items-center justify-between px-4 py-3 gap-2">
                    {/* Home */}
                    <div className="flex items-center gap-2.5 flex-1 min-w-0 justify-end">
                        <span className="text-white text-sm font-medium truncate text-right">
                            {homeTeam?.name || 'Home'}
                        </span>
                        <img
                            src={homeTeam?.logo}
                            alt={homeTeam?.name}
                            className="w-7 h-7 object-contain flex-shrink-0"
                            onError={(e) => e.target.src = 'https://placehold.co/28x28/232733/6b7280?text=T'}
                        />
                    </div>

                    {/* Score / VS */}
                    <div className="flex-shrink-0 px-3 min-w-[52px] text-center">
                        {isLive && score?.home !== null ? (
                            <span className="text-white text-base font-bold tracking-wide">
                                {score?.home ?? 0} — {score?.away ?? 0}
                            </span>
                        ) : (
                            <span className="text-gray-600 text-xs font-bold tracking-widest">VS</span>
                        )}
                    </div>

                    {/* Away */}
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <img
                            src={awayTeam?.logo}
                            alt={awayTeam?.name}
                            className="w-7 h-7 object-contain flex-shrink-0"
                            onError={(e) => e.target.src = 'https://placehold.co/28x28/232733/6b7280?text=T'}
                        />
                        <span className="text-white text-sm font-medium truncate">
                            {awayTeam?.name || 'Away'}
                        </span>
                    </div>

                    {/* Button */}
                    <div className="flex-shrink-0 ml-3">
                        <span
                            className="text-white text-xs font-semibold px-3.5 py-1.5 rounded-md transition-all inline-flex items-center gap-1"
                            style={{
                                backgroundColor: isLive ? '#dc2626' : '#10b981',
                            }}
                        >
                            <MdPlayArrow size={14} />
                            {isLive ? 'Live' : 'Tonton'}
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
    const matchUrl = `/basketball/${stream?.id}?provider=${stream?.provider || 'sphere'}`;

    const getQuarterDisplay = () => {
        if (quarter && timer) return `${quarter} ${timer}'`;
        if (quarter) return quarter;
        return 'LIVE';
    };

    return (
        <Link href={matchUrl}>
            <div
                className="rounded-lg overflow-hidden transition-all cursor-pointer group border"
                style={{
                    backgroundColor: '#1a1d27',
                    borderColor: isLive ? 'rgba(239, 68, 68, 0.2)' : 'transparent'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1e2130'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1a1d27'}
            >
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
                        ) : (
                            <>
                                <HiClock size={12} />
                                {formatKickoffTime(date)}
                            </>
                        )}
                    </span>
                    <span className="text-gray-500 truncate max-w-[180px] flex items-center gap-1.5">
                        <MdSportsBasketball size={12} className="text-orange-500" />
                        {league?.name || 'NBA'}
                    </span>
                </div>

                {/* Match Content */}
                <div className="flex items-center justify-between px-4 py-3 gap-2">
                    {/* Home */}
                    <div className="flex items-center gap-2.5 flex-1 min-w-0 justify-end">
                        <span className="text-white text-sm font-medium truncate text-right">
                            {homeTeam?.name || 'Home'}
                        </span>
                        <img
                            src={homeTeam?.logo}
                            alt={homeTeam?.name}
                            className="w-7 h-7 object-contain flex-shrink-0"
                            onError={(e) => e.target.src = 'https://placehold.co/28x28/232733/6b7280?text=T'}
                        />
                    </div>

                    {/* Score / VS */}
                    <div className="flex-shrink-0 px-3 min-w-[52px] text-center">
                        {isLive && score?.home !== null ? (
                            <span className="text-white text-base font-bold tracking-wide">
                                {score?.home ?? 0} — {score?.away ?? 0}
                            </span>
                        ) : (
                            <span className="text-gray-600 text-xs font-bold tracking-widest">VS</span>
                        )}
                    </div>

                    {/* Away */}
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <img
                            src={awayTeam?.logo}
                            alt={awayTeam?.name}
                            className="w-7 h-7 object-contain flex-shrink-0"
                            onError={(e) => e.target.src = 'https://placehold.co/28x28/232733/6b7280?text=T'}
                        />
                        <span className="text-white text-sm font-medium truncate">
                            {awayTeam?.name || 'Away'}
                        </span>
                    </div>

                    {/* Button */}
                    <div className="flex-shrink-0 ml-3">
                        <span
                            className="text-white text-xs font-semibold px-3.5 py-1.5 rounded-md transition-all inline-flex items-center gap-1"
                            style={{
                                backgroundColor: isLive ? '#dc2626' : '#f97316',
                            }}
                        >
                            <MdPlayArrow size={14} />
                            {isLive ? 'Live' : 'Tonton'}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
