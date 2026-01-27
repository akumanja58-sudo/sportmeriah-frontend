'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '../../components/Navbar';
import VideoPlayer from '../../components/VideoPlayer';
import Link from 'next/link';

// React Icons
import { FaTelegram, FaWhatsapp, FaFacebook, FaTwitter, FaPlay } from 'react-icons/fa';
import { IoHome } from 'react-icons/io5';
import { MdLiveTv } from 'react-icons/md';

const API_URL = 'https://sportmeriah-backend-production.up.railway.app';
const VPS_IP = '173.249.27.15';
const SITE_URL = 'https://sportmeriah.com';

// Banner images
const BANNERS = [
    { id: 1, src: 'https://inigambarku.site/images/2026/01/20/GIFMERIAH4D965a1f7cfb6a4aac.gif', link: '#' },
    { id: 2, src: 'https://inigambarku.site/images/2026/01/20/promo-pesiarbet.gif', link: '#' },
    { id: 3, src: 'https://inigambarku.site/images/2026/01/20/promo-girang4d.gif', link: '#' },
];

// ========== PARSE IPTV CHANNEL NAME ==========
function parseChannelName(channelName) {
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
        const vsMatch = cleaned.match(/(.+?)\s+vs\s+(.+)/i);

        if (vsMatch) {
            let beforeVs = vsMatch[1].trim();
            result.awayTeam = vsMatch[2].trim();

            // Check if there's league info before team name
            const leagueMatch = beforeVs.match(/^(.+?)\s*:\s*(.+)$/);

            if (leagueMatch) {
                result.league = leagueMatch[1].trim();
                result.homeTeam = leagueMatch[2].trim();

                // Clean league - remove country prefix if exists
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
            result.cleanTitle = cleaned || channelName;
        }

    } catch (e) {
        console.error('Error parsing channel name:', e);
    }

    return result;
}

// ========== FETCH TEAM LOGO FROM API-FOOTBALL ==========
async function fetchTeamLogo(teamName, apiUrl) {
    try {
        const res = await fetch(`${apiUrl}/api/football/today`);
        const data = await res.json();

        if (!data.response) return null;

        const teamNameLower = teamName.toLowerCase();
        const teamWords = teamNameLower.split(' ').filter(w => w.length >= 3);

        for (const match of data.response) {
            const homeName = match.teams.home.name.toLowerCase();
            const awayName = match.teams.away.name.toLowerCase();

            // Check home team
            const homeMatches = teamWords.some(word => homeName.includes(word)) ||
                homeName.split(' ').some(word => word.length >= 3 && teamNameLower.includes(word));
            if (homeMatches) return match.teams.home.logo;

            // Check away team
            const awayMatches = teamWords.some(word => awayName.includes(word)) ||
                awayName.split(' ').some(word => word.length >= 3 && teamNameLower.includes(word));
            if (awayMatches) return match.teams.away.logo;
        }

        return null;
    } catch (error) {
        console.error('Failed to fetch team logo:', error);
        return null;
    }
}

// ========== CHECK IF MATCH IS STILL RELEVANT ==========
function isMatchRelevant(kickoffWIB) {
    if (!kickoffWIB) return true;

    const now = new Date();
    const kickoff = new Date(kickoffWIB);
    const MATCH_DURATION_MS = 4 * 60 * 60 * 1000;

    if (kickoff > now) return true;

    const timeSinceKickoff = now - kickoff;
    if (timeSinceKickoff < MATCH_DURATION_MS) return true;

    return false;
}

// ========== CHECK IF MATCH IS LIVE ==========
function isMatchLive(kickoffWIB) {
    if (!kickoffWIB) return false;

    const now = new Date();
    const kickoff = new Date(kickoffWIB);
    const LIVE_WINDOW_MS = 2.5 * 60 * 60 * 1000;

    const timeSinceKickoff = now - kickoff;

    return timeSinceKickoff >= 0 && timeSinceKickoff < LIVE_WINDOW_MS;
}

export default function MatchPage() {
    const params = useParams();
    const [channel, setChannel] = useState(null);
    const [allChannels, setAllChannels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPlayer, setShowPlayer] = useState(false);
    const [countdown, setCountdown] = useState('--:--:--');
    const [parsed, setParsed] = useState(null);
    const [canWatch, setCanWatch] = useState(false);
    const [streamUrl, setStreamUrl] = useState(null);
    const [streamLoading, setStreamLoading] = useState(false);

    useEffect(() => {
        fetchChannel();
    }, [params.id]);

    // Function to start stream
    const startStream = async () => {
        try {
            setStreamLoading(true);
            const res = await fetch(`${API_URL}/api/streams/start/${params.id}`);
            const data = await res.json();

            if (data.success && data.stream_url) {
                setStreamUrl(data.stream_url);
                setShowPlayer(true);
            }
        } catch (error) {
            console.error('Failed to start stream:', error);
            // Fallback to direct URL
            setStreamUrl(`http://${VPS_IP}/hls/${params.id}.m3u8`);
            setShowPlayer(true);
        } finally {
            setStreamLoading(false);
        }
    };

    const fetchChannel = async () => {
        try {
            const [channelRes, allRes] = await Promise.all([
                fetch(`${API_URL}/api/matches/${params.id}`),
                fetch(`${API_URL}/api/matches`)
            ]);

            const channelData = await channelRes.json();
            const allData = await allRes.json();

            setChannel(channelData);
            setAllChannels(allData);

            if (channelData?.name) {
                const parsedData = parseChannelName(channelData.name);

                // Fetch logos for home and away teams
                if (parsedData.isValid) {
                    const [homeLogo, awayLogo] = await Promise.all([
                        fetchTeamLogo(parsedData.homeTeam, API_URL),
                        fetchTeamLogo(parsedData.awayTeam, API_URL)
                    ]);
                    parsedData.homeLogo = homeLogo;
                    parsedData.awayLogo = awayLogo;
                }

                setParsed(parsedData);

                // Auto show player if match is live
                if (parsedData.kickoffWIB && isMatchLive(parsedData.kickoffWIB)) {
                    setCanWatch(true);
                    startStream(); // Auto start stream
                }
            }
        } catch (error) {
            console.error('Failed to fetch channel:', error);
        } finally {
            setLoading(false);
        }
    };

    // Countdown timer with auto-play
    useEffect(() => {
        if (!parsed?.kickoffWIB) return;

        const kickoffTime = new Date(parsed.kickoffWIB).getTime();
        const FIVE_MINUTES = 5 * 60 * 1000; // 5 minutes in ms

        const updateCountdown = () => {
            const now = new Date().getTime();
            const diff = kickoffTime - now;

            // Countdown finished - AUTO PLAY!
            if (diff <= 0) {
                setCountdown('LIVE NOW');
                setCanWatch(true);
                startStream(); // Auto start stream
                return true; // Stop interval
            }

            // Less than 5 minutes - enable watch button
            if (diff <= FIVE_MINUTES) {
                setCanWatch(true);
            }

            const d = Math.floor(diff / (1000 * 60 * 60 * 24));
            const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);

            let countdownText = '';
            if (d > 0) countdownText += `${d}d `;
            countdownText += `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
            setCountdown(countdownText);

            return false; // Continue interval
        };

        // Initial check
        const shouldStop = updateCountdown();
        if (shouldStop) return;

        const interval = setInterval(() => {
            const shouldStop = updateCountdown();
            if (shouldStop) clearInterval(interval);
        }, 1000);

        return () => clearInterval(interval);
    }, [parsed]);

    // Check if match is still relevant
    const matchRelevant = parsed ? isMatchRelevant(parsed.kickoffWIB) : true;
    const matchLive = parsed ? isMatchLive(parsed.kickoffWIB) : false;

    // Get other live matches
    const otherLiveMatches = allChannels
        .filter(ch => ch.stream_id !== parseInt(params.id))
        .map(ch => ({ ...ch, parsed: parseChannelName(ch.name) }))
        .filter(ch => ch.parsed.isValid && isMatchLive(ch.parsed.kickoffWIB))
        .slice(0, 5);

    // Share URL
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareTitle = encodeURIComponent(parsed?.cleanTitle || 'SportMeriah');

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-900">
                <Navbar />
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <div className="flex justify-center mb-4">
                        <span className="loader"></span>
                    </div>
                    <p className="text-gray-400">Loading...</p>
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
                        .loader-small {
                            width: 20px;
                            height: 20px;
                            border-radius: 50%;
                            display: inline-block;
                            position: relative;
                            border-top: 3px solid #FFF;
                            border-right: 3px solid transparent;
                            box-sizing: border-box;
                            animation: rotation 1s linear infinite;
                        }
                        @keyframes rotation {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `}</style>
                </div>
            </main>
        );
    }

    if (!channel) {
        return (
            <main className="min-h-screen bg-gray-900">
                <Navbar />
                <div className="container max-w-6xl mx-auto px-4 py-6">
                    <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
                        <strong className="font-bold">Oops! An Error Occurred:</strong>
                        <span className="block sm:inline ml-1">
                            This content is currently unavailable.
                        </span>
                    </div>
                    <Link href="/" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                        ← Back to Home
                    </Link>
                </div>
            </main>
        );
    }

    // Match finished
    if (!matchRelevant) {
        return (
            <main className="min-h-screen bg-gray-900">
                <Navbar />
                <div className="container max-w-6xl mx-auto px-4 py-6">
                    <div className="bg-gray-800 rounded-lg p-8 text-center max-w-xl mx-auto">
                        <div className="text-6xl mb-4">⏰</div>
                        <h1 className="text-2xl font-bold text-white mb-2">Pertandingan Sudah Selesai</h1>
                        <p className="text-gray-400 mb-6">
                            Pertandingan ini sudah berakhir atau tidak tersedia lagi untuk ditonton.
                        </p>
                        {parsed && (
                            <div className="bg-gray-700 rounded-lg p-4 mb-6">
                                <p className="text-white font-semibold text-lg">{parsed.cleanTitle}</p>
                                {parsed.league && <p className="text-gray-400 text-sm">{parsed.league}</p>}
                            </div>
                        )}
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-full transition-colors"
                        >
                            <IoHome size={20} />
                            Kembali ke Beranda
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-900">
            <Navbar />

            <div className="container max-w-6xl mx-auto px-4 py-6">

                {/* ========== BANNER SECTION ========== */}
                <div className="mb-4 space-y-2">
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

                {/* ========== PLAYER SECTION ========== */}
                <div className="relative mb-4">
                    {!showPlayer ? (
                        /* Pre-game Overlay */
                        <div
                            className={`bg-black rounded-lg aspect-video w-full overflow-hidden shadow-2xl relative ${canWatch ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                            onClick={() => canWatch && startStream()}
                        >
                            {/* Background gradient */}
                            <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900 opacity-90"></div>

                            {/* Content */}
                            <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-2 sm:p-4">

                                {/* Team Logos + Match Title */}
                                {parsed?.isValid ? (
                                    <div className="flex items-center justify-center gap-2 sm:gap-4 mb-2 sm:mb-4">
                                        <div className="text-center flex-1 max-w-[120px]">
                                            {parsed.homeLogo ? (
                                                <img
                                                    src={parsed.homeLogo}
                                                    alt={parsed.homeTeam}
                                                    className="w-10 h-10 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain mx-auto mb-1 sm:mb-2"
                                                    onError={(e) => e.target.style.display = 'none'}
                                                />
                                            ) : (
                                                <div className="w-10 h-10 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2">
                                                    <span className="text-xl sm:text-3xl">⚽</span>
                                                </div>
                                            )}
                                            <p className="text-white font-semibold text-xs sm:text-sm md:text-base truncate">{parsed.homeTeam}</p>
                                        </div>
                                        <div className="text-lg sm:text-2xl md:text-4xl font-bold text-gray-400 px-1">VS</div>
                                        <div className="text-center flex-1 max-w-[120px]">
                                            {parsed.awayLogo ? (
                                                <img
                                                    src={parsed.awayLogo}
                                                    alt={parsed.awayTeam}
                                                    className="w-10 h-10 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain mx-auto mb-1 sm:mb-2"
                                                    onError={(e) => e.target.style.display = 'none'}
                                                />
                                            ) : (
                                                <div className="w-10 h-10 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2">
                                                    <span className="text-xl sm:text-3xl">⚽</span>
                                                </div>
                                            )}
                                            <p className="text-white font-semibold text-xs sm:text-sm md:text-base truncate">{parsed.awayTeam}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-white mb-2 px-2">
                                        {parsed?.cleanTitle || channel?.name}
                                    </h2>
                                )}

                                {parsed?.league && (
                                    <p className="text-gray-400 text-xs sm:text-sm mb-2 sm:mb-4">{parsed.league}</p>
                                )}

                                {/* Schedule & Countdown */}
                                <div className="mb-3 sm:mb-6">
                                    {parsed?.kickoffDate && (
                                        <p className="text-gray-400 text-xs sm:text-sm mb-0.5 sm:mb-1">{parsed.kickoffDate}</p>
                                    )}
                                    {parsed?.kickoffDisplay && (
                                        <p className="text-xs sm:text-base text-gray-300 mb-1 sm:mb-2">Kickoff: {parsed.kickoffDisplay}</p>
                                    )}
                                    {matchLive ? (
                                        <div className="text-xl sm:text-3xl font-bold text-red-500 animate-pulse">
                                            LIVE NOW
                                        </div>
                                    ) : (
                                        <div className="text-xl sm:text-3xl font-bold text-white">
                                            {countdown}
                                        </div>
                                    )}
                                </div>

                                {/* Play Button */}
                                {canWatch ? (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            startStream();
                                        }}
                                        disabled={streamLoading}
                                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 sm:py-3 sm:px-8 rounded-full text-sm sm:text-lg shadow-lg transition-all transform hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:cursor-wait"
                                    >
                                        {streamLoading ? (
                                            <>
                                                <span className="loader-small"></span>
                                                <span className="hidden sm:inline">Memuat Stream...</span>
                                                <span className="sm:hidden">Loading...</span>
                                            </>
                                        ) : (
                                            <>
                                                <FaPlay />
                                                <span className="hidden sm:inline">Start Watching</span>
                                                <span className="sm:hidden">Watch</span>
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <div className="text-center">
                                        <button
                                            disabled
                                            className="bg-gray-600 text-gray-400 font-bold py-2 px-4 sm:py-3 sm:px-8 rounded-full text-sm sm:text-lg cursor-not-allowed flex items-center gap-2 opacity-50"
                                        >
                                            <FaPlay />
                                            <span className="hidden sm:inline">Menunggu Kickoff...</span>
                                            <span className="sm:hidden">Menunggu...</span>
                                        </button>
                                        <p className="text-gray-500 text-xs sm:text-sm mt-1 sm:mt-2 px-2">
                                            <span className="hidden sm:inline">Stream akan otomatis dimulai saat pertandingan dimulai</span>
                                            <span className="sm:hidden">Auto-play saat kickoff</span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* Video Player */
                        <div>
                            {/* Live Badge */}
                            {matchLive && (
                                <div className="bg-red-600 text-white px-4 py-2 rounded-t-lg flex items-center gap-2">
                                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                                    <span className="font-bold">LIVE</span>
                                    <span className="ml-2">{parsed?.cleanTitle}</span>
                                </div>
                            )}
                            <VideoPlayer streamUrl={streamUrl} />
                        </div>
                    )}
                </div>

                {/* ========== MATCH DETAILS ========== */}
                <div className="flex flex-col">

                    {/* Title - Show first on mobile */}
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 sm:gap-4 mb-3 sm:mb-4 order-1">
                        <div className="flex-grow min-w-0">
                            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1 leading-tight">
                                {parsed?.cleanTitle || channel?.name}
                            </h1>
                            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-400">
                                {parsed?.kickoffDate && parsed?.kickoffDisplay && (
                                    <span>{parsed.kickoffDate} - {parsed.kickoffDisplay}</span>
                                )}
                                {parsed?.league && (
                                    <>
                                        <span className="hidden sm:inline">•</span>
                                        <span>{parsed.league}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Share Buttons */}
                    <div className="mb-3 sm:mb-4 flex flex-wrap items-center gap-2 sm:gap-3 order-2">
                        <span className="text-xs sm:text-sm font-semibold text-gray-400">Share this match:</span>
                        <div className="flex flex-wrap gap-2">
                            <a
                                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-gray-700 text-gray-300 hover:bg-blue-600 hover:text-white transition-colors"
                                title="Share on Facebook"
                            >
                                <FaFacebook size={16} />
                            </a>
                            <a
                                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${shareTitle}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-gray-700 text-gray-300 hover:bg-sky-500 hover:text-white transition-colors"
                                title="Share on Twitter"
                            >
                                <FaTwitter size={16} />
                            </a>
                            <a
                                href={`https://api.whatsapp.com/send?text=${shareTitle}%20${encodeURIComponent(shareUrl)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-gray-700 text-gray-300 hover:bg-green-500 hover:text-white transition-colors"
                                title="Share on WhatsApp"
                            >
                                <FaWhatsapp size={16} />
                            </a>
                            <a
                                href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${shareTitle}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-gray-700 text-gray-300 hover:bg-sky-600 hover:text-white transition-colors"
                                title="Share on Telegram"
                            >
                                <FaTelegram size={16} />
                            </a>
                        </div>
                    </div>

                    {/* Breadcrumb - Show last on mobile */}
                    <div className="mb-2 text-xs sm:text-sm text-gray-400 order-3">
                        <nav className="flex" aria-label="Breadcrumb">
                            <ol className="inline-flex items-center space-x-1">
                                <li className="inline-flex items-center">
                                    <Link href="/" className="hover:text-white">Home</Link>
                                </li>
                                <li>
                                    <div className="flex items-center">
                                        <span className="mx-1">/</span>
                                        <Link href="/football" className="capitalize hover:text-white">Football</Link>
                                    </div>
                                </li>
                                <li aria-current="page">
                                    <div className="flex items-center">
                                        <span className="mx-1">/</span>
                                        <span className="text-gray-500 capitalize truncate max-w-[120px] sm:max-w-[200px]">{parsed?.cleanTitle}</span>
                                    </div>
                                </li>
                            </ol>
                        </nav>
                    </div>
                </div>

                {/* ========== SEO DESCRIPTION ========== */}
                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-700 rounded-lg text-gray-300 text-xs sm:text-sm space-y-2">
                    <p>
                        Watch the <strong>{parsed?.cleanTitle || channel?.name}</strong> stream live and for free on SportMeriah.
                        {parsed?.kickoffDisplay && (
                            <> This football match kickoff at <strong>{parsed.kickoffDisplay}</strong>.</>
                        )}
                    </p>
                    <p>
                        Get the best quality stream and real-time updates right here. Don't miss any of the action!
                    </p>
                </div>

                {/* ========== OTHER LIVE MATCHES ========== */}
                {otherLiveMatches.length > 0 && (
                    <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-700">
                        <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
                            <MdLiveTv className="text-red-500" />
                            Other Live Matches
                        </h3>
                        <div className="space-y-2 sm:space-y-3">
                            {otherLiveMatches.map((ch) => (
                                <Link
                                    key={ch.stream_id}
                                    href={`/match/${ch.stream_id}`}
                                    className="block bg-gray-700 p-3 sm:p-4 rounded-lg shadow-md transition-all hover:bg-gray-600 flex justify-between items-center"
                                >
                                    <span className="text-sm sm:text-base font-medium text-white truncate pr-4">
                                        {ch.parsed.cleanTitle}
                                    </span>
                                    <span className="text-xs sm:text-sm font-bold text-red-500 animate-pulse flex-shrink-0">
                                        LIVE
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

            </div>

            {/* ========== BOTTOM NAV MOBILE ========== */}
            <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 z-50 md:hidden safe-area-bottom">
                <div className="flex justify-around items-center py-2 px-1">
                    <Link href="/" className="flex flex-col items-center px-2 sm:px-4 py-2 text-gray-400 hover:text-white transition-colors">
                        <IoHome size={22} />
                        <span className="text-[10px] sm:text-xs mt-1">Beranda</span>
                    </Link>
                    <button className="flex flex-col items-center px-2 sm:px-4 py-2 text-orange-400">
                        <FaPlay size={18} />
                        <span className="text-[10px] sm:text-xs mt-1">Nonton</span>
                    </button>
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

            {/* Bottom padding for mobile nav */}
            <div className="h-20 md:hidden"></div>
        </main>
    );
}
