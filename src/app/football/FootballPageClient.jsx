'use client';

import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Link from 'next/link';

// React Icons
import { FaTelegram, FaWhatsapp, FaTv } from 'react-icons/fa';
import { IoHome } from 'react-icons/io5';
import { MdSportsSoccer, MdSportsBasketball, MdLiveTv } from 'react-icons/md';

const API_URL = 'https://sportmeriah-backend-production.up.railway.app';

// ========== FORMAT TIME ==========
function formatKickoffTime(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes} WIB`;
}

export default function FootballPageClient() {
    const [matches, setMatches] = useState({ live: [], upcoming: [], finished: [] });
    const [extraChannels, setExtraChannels] = useState([]);
    const [sportsTVChannels, setSportsTVChannels] = useState([]); // NEW
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, live: 0, upcoming: 0, withStreams: 0 });

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
                setMatches({
                    live: data.matches?.live || [],
                    upcoming: data.matches?.upcoming || [],
                    finished: data.matches?.finished || []
                });
                setExtraChannels(data.extraChannels || []);
                setSportsTVChannels(data.sportsTVChannels || []); // NEW
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
                                    <span className="text-gray-400">Total Matches</span>
                                    <span className="text-white font-bold">{stats.total}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Live Now</span>
                                    <span className="text-red-500 font-bold">{stats.live}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Upcoming</span>
                                    <span className="text-orange-500 font-bold">{stats.upcoming}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">With Stream</span>
                                    <span className="text-green-500 font-bold">{stats.withStreams}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Sports TV</span>
                                    <span className="text-blue-500 font-bold">{sportsTVChannels.length}</span>
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
                                {/* SPORTS TV Section - NEW! */}
                                {sportsTVChannels.length > 0 && (
                                    <div>
                                        <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                            <MdLiveTv className="text-blue-500" />
                                            Live Sports TV
                                            <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full ml-2">
                                                {sportsTVChannels.length} Channels
                                            </span>
                                        </h2>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                            {sportsTVChannels.map((channel) => (
                                                <SportsTVCard
                                                    key={channel.id}
                                                    channel={channel}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* LIVE Section */}
                                {matches.live.length > 0 && (
                                    <div>
                                        <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                            LIVE NOW
                                        </h2>
                                        <div className="space-y-3">
                                            {matches.live.map((match) => (
                                                <MatchCard
                                                    key={match.id}
                                                    match={match}
                                                    isLive={true}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Upcoming Section */}
                                {matches.upcoming.length > 0 && (
                                    <div>
                                        <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                            ⏰ Upcoming
                                        </h2>
                                        <div className="space-y-3">
                                            {matches.upcoming.map((match) => (
                                                <MatchCard
                                                    key={match.id}
                                                    match={match}
                                                    isLive={false}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Extra Channels Section */}
                                {extraChannels.length > 0 && (
                                    <div>
                                        <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                            📺 Extra Channels
                                        </h2>
                                        <div className="space-y-3">
                                            {extraChannels.map((channel) => (
                                                <ChannelCard
                                                    key={channel.id}
                                                    channel={channel}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Finished Section */}
                                {matches.finished.length > 0 && (
                                    <div>
                                        <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                            ✅ Selesai
                                        </h2>
                                        <div className="space-y-3">
                                            {matches.finished.map((match) => (
                                                <MatchCard
                                                    key={match.id}
                                                    match={match}
                                                    isLive={false}
                                                    isFinished={true}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Empty State */}
                                {matches.live.length === 0 && matches.upcoming.length === 0 && matches.finished.length === 0 && sportsTVChannels.length === 0 && (
                                    <div className="bg-gray-800 rounded-lg p-8 text-center">
                                        <p className="text-4xl mb-4">⚽</p>
                                        <p className="text-gray-400">Tidak ada pertandingan tersedia saat ini</p>
                                        <Link href="/" className="text-green-500 hover:underline mt-4 inline-block">
                                            ← Kembali ke Beranda
                                        </Link>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Navigation - Mobile Only */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 px-4 py-2 z-50">
                <div className="flex justify-around items-center">
                    <Link href="/" className="flex flex-col items-center text-gray-400 hover:text-white">
                        <IoHome size={20} />
                        <span className="text-[10px] mt-1">Home</span>
                    </Link>
                    <Link href="/football" className="flex flex-col items-center text-green-500">
                        <MdSportsSoccer size={20} />
                        <span className="text-[10px] mt-1">Football</span>
                    </Link>
                    <Link href="/basketball" className="flex flex-col items-center text-gray-400 hover:text-orange-400">
                        <MdSportsBasketball size={20} />
                        <span className="text-[10px] mt-1">Basketball</span>
                    </Link>
                </div>
            </div>
        </main>
    );
}

// ========== SPORTS TV CARD COMPONENT - NEW! ==========
function SportsTVCard({ channel }) {
    const { id, name, league, icon } = channel;

    // Get icon based on channel name
    const getChannelIcon = () => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('espn')) return '🔴';
        if (lowerName.includes('bein')) return '🟠';
        if (lowerName.includes('fox')) return '🔵';
        if (lowerName.includes('cbs')) return '⚪';
        if (lowerName.includes('premier')) return '🟣';
        if (lowerName.includes('nba')) return '🏀';
        return '📺';
    };

    return (
        <Link href={`/football/${id}`}>
            <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg hover:from-blue-900 hover:to-blue-800 transition-all cursor-pointer group overflow-hidden border border-gray-600 hover:border-blue-500">
                <div className="p-3 text-center">
                    {/* Icon */}
                    <div className="text-2xl mb-2">{getChannelIcon()}</div>

                    {/* Channel Name */}
                    <h3 className="text-white text-xs sm:text-sm font-bold truncate mb-1">
                        {name}
                    </h3>

                    {/* League */}
                    <p className="text-gray-400 text-[10px] truncate">
                        {league}
                    </p>

                    {/* Watch Button */}
                    <div className="mt-2">
                        <span className="text-[10px] bg-blue-600 group-hover:bg-blue-500 text-white px-2 py-1 rounded-full transition-colors">
                            LIVE
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

// ========== MATCH CARD COMPONENT ==========
function MatchCard({ match, isLive = false, isFinished = false }) {
    const { id, homeTeam, awayTeam, league, date, score, hasStream, stream, elapsed } = match;

    return (
        <Link href={hasStream ? `/football/${stream?.id}` : '#'} className={!hasStream ? 'pointer-events-none' : ''}>
            <div className={`bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer group overflow-hidden ${isLive ? 'ring-1 ring-red-500' : ''}`}>

                {/* Header */}
                <div className="flex justify-between items-center px-3 py-1.5 bg-gray-800 text-[10px] sm:text-xs">
                    <span className="font-medium text-green-400 truncate max-w-[150px] sm:max-w-none flex items-center gap-1">
                        {league?.logo && (
                            <img src={league.logo} alt={league.name} className="w-4 h-4 object-contain" />
                        )}
                        {league?.name || 'Football'}
                    </span>
                    <span className={`${isLive ? 'text-red-400 animate-pulse font-bold' : 'text-gray-400'}`}>
                        {isLive ? `🔴 LIVE ${elapsed ? `${elapsed}'` : ''}` : isFinished ? 'FT' : formatKickoffTime(date)}
                    </span>
                </div>

                {/* Content */}
                <div className="flex items-center justify-between px-3 py-3 gap-2">

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

                    {/* Score or VS */}
                    <div className="flex-shrink-0 px-2 sm:px-3 text-center min-w-[50px]">
                        {(isLive || isFinished) && score?.home !== null ? (
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
                        {hasStream ? (
                            <span className={`text-white text-[10px] sm:text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded transition-colors inline-flex items-center gap-1 ${isLive ? 'bg-red-600 group-hover:bg-red-700' : isFinished ? 'bg-gray-500' : 'bg-green-600 group-hover:bg-green-700'}`}>
                                {isLive ? 'Tonton ▶' : isFinished ? 'Selesai' : 'Tonton'}
                            </span>
                        ) : (
                            <span className="text-gray-400 text-[10px] sm:text-xs font-medium px-2.5 sm:px-3 py-1.5 rounded bg-gray-600">
                                No Stream
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}

// ========== CHANNEL CARD COMPONENT ==========
function ChannelCard({ channel }) {
    const { id, name, category } = channel;

    return (
        <Link href={`/football/${id}`}>
            <div className="bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer group overflow-hidden">

                {/* Header */}
                <div className="flex justify-between items-center px-3 py-1.5 bg-gray-800 text-[10px] sm:text-xs">
                    <span className="font-medium text-blue-400">📺 Extra Channel</span>
                    <span className="text-green-400 truncate max-w-[120px] sm:max-w-[200px] flex items-center gap-1">
                        <MdSportsSoccer size={12} />
                        {category || 'Football'}
                    </span>
                </div>

                {/* Content */}
                <div className="flex items-center justify-between px-3 py-3 gap-2">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <MdSportsSoccer size={18} className="text-white" />
                        </div>
                        <span className="text-white text-xs sm:text-sm font-medium truncate">
                            {name || 'Unknown Channel'}
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
