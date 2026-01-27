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
    { id: 2, src: 'https://inigambarku.site/images/2026/01/20/promo-pesiarbet.gif', link: '#' },
    { id: 3, src: 'https://inigambarku.site/images/2026/01/20/promo-girang4d.gif', link: '#' },
];

// ========== PARSE IPTV CHANNEL NAME ==========
function parseChannelName(channelName) {
    // Default values
    let result = {
        homeTeam: '',
        awayTeam: '',
        league: '',
        kickoffWIB: null,
        kickoffDisplay: '',
        kickoffDate: '',
        cleanTitle: channelName,
        isValid: false,
        homeLogo: null,
        awayLogo: null
    };

    // Day names in Indonesian
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    try {
        // Remove prefix like "USA Soccer01: " or "USA Soccer02: "
        let cleaned = channelName.replace(/^USA\s*Soccer\d*:\s*/i, '');

        // Try to extract time @ HH:MMam/pm EST
        const timeMatch = cleaned.match(/@\s*(\d{1,2}):(\d{2})\s*(am|pm)\s*EST/i);

        if (timeMatch) {
            let hours = parseInt(timeMatch[1]);
            const minutes = parseInt(timeMatch[2]);
            const period = timeMatch[3].toLowerCase();

            // Convert to 24h format
            if (period === 'pm' && hours !== 12) hours += 12;
            if (period === 'am' && hours === 12) hours = 0;

            // EST to WIB = +12 hours
            let wibHours = hours + 12;
            let dayOffset = 0;
            if (wibHours >= 24) {
                wibHours -= 24;
                dayOffset = 1;
            }

            // Create kickoff date
            const now = new Date();
            const kickoff = new Date(now);
            kickoff.setHours(wibHours, minutes, 0, 0);

            // If kickoff already passed today, assume it's tomorrow (or add dayOffset)
            if (kickoff < now && dayOffset === 0) {
                kickoff.setDate(kickoff.getDate() + 1);
            } else if (dayOffset === 1) {
                kickoff.setDate(kickoff.getDate() + 1);
            }

            result.kickoffWIB = kickoff;
            result.kickoffDisplay = `${String(wibHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} WIB`;

            // Format date: "Rabu, 29 Jan"
            const dayName = dayNames[kickoff.getDay()];
            const date = kickoff.getDate();
            const monthName = monthNames[kickoff.getMonth()];
            result.kickoffDate = `${dayName}, ${date} ${monthName}`;

            // Remove time from cleaned string
            cleaned = cleaned.replace(/@\s*\d{1,2}:\d{2}\s*(am|pm)\s*EST/i, '').trim();
        }

        // Try to parse "Country - League : Team1 vs Team2"
        // Or "League : Team1 vs Team2"
        // Or just "Team1 vs Team2"

        const vsMatch = cleaned.match(/(.+?)\s+vs\s+(.+)/i);

        if (vsMatch) {
            let beforeVs = vsMatch[1].trim();
            result.awayTeam = vsMatch[2].trim();

            // Check if there's league info before team name
            // Format: "Country - League : TeamName" or "League : TeamName"
            const leagueMatch = beforeVs.match(/^(.+?)\s*:\s*(.+)$/);

            if (leagueMatch) {
                result.league = leagueMatch[1].trim();
                result.homeTeam = leagueMatch[2].trim();

                // Clean league - remove country prefix if exists
                // "England - Premier League" → "Premier League"
                const countryLeagueMatch = result.league.match(/^.+?\s*-\s*(.+)$/);
                if (countryLeagueMatch) {
                    result.league = countryLeagueMatch[1].trim();
                }
            } else {
                result.homeTeam = beforeVs;
            }

            result.cleanTitle = `${result.homeTeam} vs ${result.awayTeam}`;
            result.isValid = true;
        } else {
            // No "vs" found, just use cleaned name
            result.cleanTitle = cleaned || channelName;
        }

    } catch (e) {
        console.error('Error parsing channel name:', e);
    }

    return result;
}

// ========== FETCH TEAM LOGOS FROM API-FOOTBALL ==========
async function fetchTeamLogos(channels, apiUrl) {
    try {
        const res = await fetch(`${apiUrl}/api/football/today`);
        const data = await res.json();

        if (!data.response) return channels;

        // Create a map of team names to logos
        const teamLogos = {};
        data.response.forEach(match => {
            const homeName = match.teams.home.name.toLowerCase();
            const awayName = match.teams.away.name.toLowerCase();
            teamLogos[homeName] = match.teams.home.logo;
            teamLogos[awayName] = match.teams.away.logo;
        });

        // Match logos to parsed channels
        return channels.map(ch => {
            if (!ch.parsed.isValid) return ch;

            const homeTeamLower = ch.parsed.homeTeam.toLowerCase();
            const awayTeamLower = ch.parsed.awayTeam.toLowerCase();

            // Try exact match first
            let homeLogo = teamLogos[homeTeamLower];
            let awayLogo = teamLogos[awayTeamLower];

            // Try partial match if exact not found
            if (!homeLogo || !awayLogo) {
                Object.keys(teamLogos).forEach(teamName => {
                    // Check if team name contains or is contained in parsed name
                    if (!homeLogo) {
                        const homeWords = homeTeamLower.split(' ').filter(w => w.length >= 3);
                        const matchesHome = homeWords.some(word => teamName.includes(word)) ||
                            teamName.split(' ').some(word => word.length >= 3 && homeTeamLower.includes(word));
                        if (matchesHome) homeLogo = teamLogos[teamName];
                    }
                    if (!awayLogo) {
                        const awayWords = awayTeamLower.split(' ').filter(w => w.length >= 3);
                        const matchesAway = awayWords.some(word => teamName.includes(word)) ||
                            teamName.split(' ').some(word => word.length >= 3 && awayTeamLower.includes(word));
                        if (matchesAway) awayLogo = teamLogos[teamName];
                    }
                });
            }

            return {
                ...ch,
                parsed: {
                    ...ch.parsed,
                    homeLogo,
                    awayLogo
                }
            };
        });
    } catch (error) {
        console.error('Failed to fetch team logos:', error);
        return channels;
    }
}

// ========== CHECK IF MATCH IS STILL RELEVANT ==========
function isMatchRelevant(kickoffWIB) {
    if (!kickoffWIB) return true; // If no time, show it anyway

    const now = new Date();
    const kickoff = new Date(kickoffWIB);

    // Match duration buffer (4 hours after kickoff)
    const MATCH_DURATION_MS = 4 * 60 * 60 * 1000;

    // If kickoff is in the future → show
    if (kickoff > now) return true;

    // If kickoff was within last 4 hours → show (might still be live)
    const timeSinceKickoff = now - kickoff;
    if (timeSinceKickoff < MATCH_DURATION_MS) return true;

    // Otherwise → don't show
    return false;
}

// ========== CHECK IF MATCH IS LIVE ==========
function isMatchLive(kickoffWIB) {
    if (!kickoffWIB) return false;

    const now = new Date();
    const kickoff = new Date(kickoffWIB);

    // Match is live if: started (kickoff <= now) and within ~2.5 hours
    const LIVE_WINDOW_MS = 2.5 * 60 * 60 * 1000;

    const timeSinceKickoff = now - kickoff;

    return timeSinceKickoff >= 0 && timeSinceKickoff < LIVE_WINDOW_MS;
}

export default function Home() {
    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchChannels();
    }, []);

    const fetchChannels = async () => {
        try {
            const res = await fetch(`${API_URL}/api/matches`);
            const data = await res.json();

            // Parse and filter channels
            let parsed = data
                .map(ch => ({
                    ...ch,
                    parsed: parseChannelName(ch.name)
                }))
                .filter(ch => ch.parsed.isValid) // Only show valid matches with "vs"
                .filter(ch => isMatchRelevant(ch.parsed.kickoffWIB)) // Only show relevant matches
                .sort((a, b) => {
                    // Sort by kickoff time
                    if (a.parsed.kickoffWIB && b.parsed.kickoffWIB) {
                        return new Date(a.parsed.kickoffWIB) - new Date(b.parsed.kickoffWIB);
                    }
                    return 0;
                });

            // Fetch team logos from API-Football
            parsed = await fetchTeamLogos(parsed, API_URL);

            setChannels(parsed);
        } catch (error) {
            console.error('Failed to fetch channels:', error);
        } finally {
            setLoading(false);
        }
    };

    const liveMatches = channels.filter(ch => isMatchLive(ch.parsed.kickoffWIB));
    const upcomingMatches = channels.filter(ch => !isMatchLive(ch.parsed.kickoffWIB));

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
                                {SPORT_CATEGORIES.map((sport) => {
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
                                <p className="text-gray-400">Loading matches...</p>
                                <style jsx>{`
                                    .loader {
                                        width: 48px;
                                        height: 48px;
                                        border-radius: 50%;
                                        display: inline-block;
                                        position: relative;
                                        border-top: 4px solid #FFF;
                                        border-right: 4px solid transparent;
                                        box-sizing: border-box;
                                        animation: rotation 1s linear infinite;
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
                                {/* ========== SEDANG TAYANG ========== */}
                                {liveMatches.length > 0 && (
                                    <div className="bg-gray-800 rounded-lg p-4">
                                        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                                            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                                            Sedang Tayang
                                            <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">
                                                {liveMatches.length} Live
                                            </span>
                                        </h2>
                                        <div className="space-y-3">
                                            {liveMatches.map((channel) => (
                                                <MatchCard
                                                    key={channel.stream_id}
                                                    channel={channel}
                                                    isLive={true}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* ========== JADWAL PERTANDINGAN ========== */}
                                {upcomingMatches.length > 0 && (
                                    <div className="bg-gray-800 rounded-lg p-4">
                                        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                                            <span>📅</span> Jadwal Pertandingan
                                            <span className="text-xs text-gray-400 font-normal">
                                                ({upcomingMatches.length} pertandingan)
                                            </span>
                                        </h2>
                                        <div className="space-y-3">
                                            {upcomingMatches.map((channel) => (
                                                <MatchCard
                                                    key={channel.stream_id}
                                                    channel={channel}
                                                    isLive={false}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Empty State */}
                                {channels.length === 0 && (
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
                                Tersedia berbagai pertandingan dari liga top dunia. Tonton sekarang tanpa ribet!
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
                    <Link href="/jadwal" className="flex flex-col items-center px-2 sm:px-4 py-2 text-gray-400 hover:text-white transition-colors">
                        <IoCalendar size={22} />
                        <span className="text-[10px] sm:text-xs mt-1">Jadwal</span>
                    </Link>
                    <a href="https://t.me/sportmeriah" target="_blank" className="flex flex-col items-center px-2 sm:px-4 py-2 text-gray-400 hover:text-blue-400 transition-colors">
                        <FaTelegram size={22} />
                        <span className="text-[10px] sm:text-xs mt-1">Telegram</span>
                    </a>
                    <a href="https://wa.me/6281234567890" target="_blank" className="flex flex-col items-center px-2 sm:px-4 py-2 text-gray-400 hover:text-green-400 transition-colors">
                        <FaWhatsapp size={22} />
                        <span className="text-[10px] sm:text-xs mt-1">WhatsApp</span>
                    </a>
                </div>
            </nav>

            {/* Padding bottom untuk mobile nav */}
            <div className="h-20 md:hidden"></div>
        </main>
    );
}

// ========== MATCH CARD COMPONENT ==========
function MatchCard({ channel, isLive }) {
    const { parsed } = channel;

    return (
        <Link href={`/match/${channel.stream_id}`}>
            <div className="bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer group overflow-hidden">

                {/* Header - Date & League */}
                <div className="flex justify-between items-center px-3 py-1.5 bg-gray-800 text-[10px] sm:text-xs">
                    <span className="text-gray-400">
                        {parsed.kickoffDate ? `${parsed.kickoffDate.split(',')[1]?.trim() || parsed.kickoffDate}` : ''} - {parsed.kickoffDisplay || '--:--'}
                    </span>
                    <span className="text-gray-400 truncate max-w-[120px] sm:max-w-[200px]">
                        {parsed.league || 'Football'}
                    </span>
                </div>

                {/* Match Content */}
                <div className="flex items-center justify-between px-3 py-2.5 gap-2">

                    {/* Home Team */}
                    <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                        <span className="text-white text-xs sm:text-sm font-medium truncate text-right">
                            {parsed.homeTeam}
                        </span>
                        {parsed.homeLogo ? (
                            <img
                                src={parsed.homeLogo}
                                alt={parsed.homeTeam}
                                className="w-6 h-6 sm:w-8 sm:h-8 object-contain flex-shrink-0"
                                onError={(e) => e.target.style.display = 'none'}
                            />
                        ) : (
                            <span className="text-lg sm:text-xl flex-shrink-0">⚽</span>
                        )}
                    </div>

                    {/* VS */}
                    <div className="flex-shrink-0 px-2">
                        <span className="text-gray-400 text-xs sm:text-sm font-bold">VS</span>
                    </div>

                    {/* Away Team */}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        {parsed.awayLogo ? (
                            <img
                                src={parsed.awayLogo}
                                alt={parsed.awayTeam}
                                className="w-6 h-6 sm:w-8 sm:h-8 object-contain flex-shrink-0"
                                onError={(e) => e.target.style.display = 'none'}
                            />
                        ) : (
                            <span className="text-lg sm:text-xl flex-shrink-0">⚽</span>
                        )}
                        <span className="text-white text-xs sm:text-sm font-medium truncate">
                            {parsed.awayTeam}
                        </span>
                    </div>

                    {/* Tombol Tonton */}
                    <div className="flex-shrink-0 ml-2">
                        <span className="bg-orange-500 text-white text-[10px] sm:text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded group-hover:bg-orange-600 transition-colors inline-flex items-center gap-1">
                            Tonton
                        </span>
                    </div>
                </div>

                {/* Live Badge */}
                {isLive && (
                    <div className="absolute top-0 left-0 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-br font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                        LIVE
                    </div>
                )}
            </div>
        </Link>
    );
}
