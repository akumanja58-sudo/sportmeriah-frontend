'use client';

import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Link from 'next/link';

// React Icons
import { FaTelegram } from 'react-icons/fa';
import { IoHome } from 'react-icons/io5';
import {
    MdSportsSoccer, MdSportsBasketball, MdSportsHockey, MdSportsBaseball,
    MdSportsFootball, MdSportsCricket, MdSportsGolf, MdSportsRugby,
    MdSportsHandball, MdSportsVolleyball, MdSportsMma, MdSportsTennis,
    MdSportsKabaddi, MdLiveTv, MdPlayCircle
} from 'react-icons/md';
import { GiLacrossStick, GiSoccerField } from 'react-icons/gi';

const API_URL = 'https://sportmeriah-backend-production.up.railway.app';

// ========== SPORT CONFIGS ==========
const SPORT_CONFIGS = {
    nhl: {
        name: 'NHL / Ice Hockey',
        nameId: 'NHL / Hockey Es',
        emoji: '🏒',
        icon: MdSportsHockey,
        color: 'text-blue-400',
        bgColor: 'bg-blue-600',
        hoverColor: 'group-hover:bg-blue-700',
        seoTitle: 'Live Streaming NHL Ice Hockey - Jadwal & Skor NHL Hari Ini',
        seoDesc: 'Nonton live streaming NHL Hockey gratis di SportMeriah. Jadwal lengkap pertandingan NHL, skor live, dan streaming HD!',
        seoText: 'Nonton streaming NHL Ice Hockey gratis di SportMeriah. Boston Bruins, New York Rangers, Toronto Maple Leafs, dan tim NHL lainnya.',
        placeholder: '🏒',
    },
    mlb: {
        name: 'MLB / Baseball',
        nameId: 'MLB / Bisbol',
        emoji: '⚾',
        icon: MdSportsBaseball,
        color: 'text-red-400',
        bgColor: 'bg-red-600',
        hoverColor: 'group-hover:bg-red-700',
        seoTitle: 'Live Streaming MLB Baseball - Jadwal & Skor MLB Hari Ini',
        seoDesc: 'Nonton live streaming MLB Baseball gratis di SportMeriah. Jadwal lengkap pertandingan MLB, skor live, dan streaming HD!',
        seoText: 'Nonton streaming MLB Baseball gratis di SportMeriah. New York Yankees, LA Dodgers, Houston Astros, dan tim MLB lainnya.',
        placeholder: '⚾',
    },
    nfl: {
        name: 'NFL / American Football',
        nameId: 'NFL / Football Amerika',
        emoji: '🏈',
        icon: MdSportsFootball,
        color: 'text-green-400',
        bgColor: 'bg-green-600',
        hoverColor: 'group-hover:bg-green-700',
        seoTitle: 'Live Streaming NFL American Football - Jadwal & Skor NFL Hari Ini',
        seoDesc: 'Nonton live streaming NFL Football gratis di SportMeriah. Super Bowl, jadwal NFL, dan streaming HD!',
        seoText: 'Nonton streaming NFL American Football gratis di SportMeriah. Kansas City Chiefs, Dallas Cowboys, dan tim NFL lainnya.',
        placeholder: '🏈',
    },
    cricket: {
        name: 'Cricket',
        nameId: 'Kriket',
        emoji: '🏏',
        icon: MdSportsCricket,
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-600',
        hoverColor: 'group-hover:bg-emerald-700',
        seoTitle: 'Live Streaming Cricket - Jadwal Pertandingan Cricket Hari Ini',
        seoDesc: 'Nonton live streaming Cricket gratis di SportMeriah. IPL, T20 World Cup, dan streaming HD!',
        seoText: 'Nonton streaming Cricket gratis di SportMeriah. IPL, ICC World Cup, T20, dan semua pertandingan kriket internasional.',
        placeholder: '🏏',
    },
    golf: {
        name: 'Golf',
        nameId: 'Golf',
        emoji: '⛳',
        icon: MdSportsGolf,
        color: 'text-lime-400',
        bgColor: 'bg-lime-600',
        hoverColor: 'group-hover:bg-lime-700',
        seoTitle: 'Live Streaming Golf - PGA Tour & Turnamen Golf Hari Ini',
        seoDesc: 'Nonton live streaming Golf gratis di SportMeriah. PGA Tour, The Masters, US Open Golf!',
        seoText: 'Nonton streaming Golf gratis di SportMeriah. PGA Tour, The Masters, US Open, dan turnamen golf dunia lainnya.',
        placeholder: '⛳',
    },
    rugby: {
        name: 'Rugby',
        nameId: 'Rugby',
        emoji: '🏉',
        icon: MdSportsRugby,
        color: 'text-amber-400',
        bgColor: 'bg-amber-600',
        hoverColor: 'group-hover:bg-amber-700',
        seoTitle: 'Live Streaming Rugby - Jadwal Pertandingan Rugby Hari Ini',
        seoDesc: 'Nonton live streaming Rugby gratis di SportMeriah. Six Nations, Rugby World Cup, dan streaming HD!',
        seoText: 'Nonton streaming Rugby gratis. Six Nations, Rugby World Cup, Major League Rugby, dan pertandingan rugby internasional.',
        placeholder: '🏉',
    },
    handball: {
        name: 'Handball',
        nameId: 'Bola Tangan',
        emoji: '🤾',
        icon: MdSportsHandball,
        color: 'text-cyan-400',
        bgColor: 'bg-cyan-600',
        hoverColor: 'group-hover:bg-cyan-700',
        seoTitle: 'Live Streaming Handball - Jadwal Pertandingan Bola Tangan Hari Ini',
        seoDesc: 'Nonton live streaming Handball/Bola Tangan gratis di SportMeriah!',
        seoText: 'Nonton streaming Handball/Bola Tangan gratis di SportMeriah. EHF Champions League dan pertandingan internasional.',
        placeholder: '🤾',
    },
    volleyball: {
        name: 'Volleyball',
        nameId: 'Bola Voli',
        emoji: '🏐',
        icon: MdSportsVolleyball,
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-600',
        hoverColor: 'group-hover:bg-yellow-700',
        seoTitle: 'Live Streaming Volleyball - Jadwal Pertandingan Voli Hari Ini',
        seoDesc: 'Nonton live streaming Volleyball/Bola Voli gratis di SportMeriah!',
        seoText: 'Nonton streaming Volleyball gratis di SportMeriah. NCAA Volleyball, FIVB, dan pertandingan voli internasional.',
        placeholder: '🏐',
    },
    ppv: {
        name: 'PPV Events',
        nameId: 'PPV / Boxing / MMA',
        emoji: '🥊',
        icon: MdSportsMma,
        color: 'text-rose-400',
        bgColor: 'bg-rose-600',
        hoverColor: 'group-hover:bg-rose-700',
        seoTitle: 'Live Streaming PPV Events - Boxing, MMA, UFC Hari Ini',
        seoDesc: 'Nonton live streaming PPV Events gratis di SportMeriah. UFC, Boxing, dan MMA streaming HD!',
        seoText: 'Nonton streaming PPV Events gratis. UFC Fight Night, Boxing Championship, MMA, dan event PPV lainnya.',
        placeholder: '🥊',
    },
    mls: {
        name: 'MLS',
        nameId: 'MLS / Liga Amerika',
        emoji: '⚽',
        icon: GiSoccerField,
        color: 'text-purple-400',
        bgColor: 'bg-purple-600',
        hoverColor: 'group-hover:bg-purple-700',
        seoTitle: 'Live Streaming MLS - Major League Soccer Hari Ini',
        seoDesc: 'Nonton live streaming MLS gratis di SportMeriah!',
        seoText: 'Nonton streaming MLS gratis di SportMeriah. Inter Miami, LA Galaxy, dan tim MLS lainnya.',
        placeholder: '⚽',
    },
    wnba: {
        name: 'WNBA',
        nameId: 'WNBA / Basket Wanita',
        emoji: '🏀',
        icon: MdSportsBasketball,
        color: 'text-orange-400',
        bgColor: 'bg-orange-600',
        hoverColor: 'group-hover:bg-orange-700',
        seoTitle: 'Live Streaming WNBA - Jadwal & Skor WNBA Hari Ini',
        seoDesc: 'Nonton live streaming WNBA gratis di SportMeriah!',
        seoText: 'Nonton streaming WNBA gratis di SportMeriah. Las Vegas Aces, New York Liberty, dan tim WNBA lainnya.',
        placeholder: '🏀',
    },
    lacrosse: {
        name: 'Lacrosse',
        nameId: 'Lacrosse',
        emoji: '🥍',
        icon: GiLacrossStick,
        color: 'text-teal-400',
        bgColor: 'bg-teal-600',
        hoverColor: 'group-hover:bg-teal-700',
        seoTitle: 'Live Streaming Lacrosse - Jadwal Pertandingan Lacrosse Hari Ini',
        seoDesc: 'Nonton live streaming Lacrosse gratis di SportMeriah!',
        seoText: 'Nonton streaming Lacrosse gratis di SportMeriah. PLL, NLL, dan pertandingan lacrosse profesional.',
        placeholder: '🥍',
    },
    espn_plus: {
        name: 'ESPN+ Events',
        nameId: 'ESPN+ Events',
        emoji: '📺',
        icon: MdLiveTv,
        color: 'text-red-400',
        bgColor: 'bg-red-600',
        hoverColor: 'group-hover:bg-red-700',
        seoTitle: 'Live Streaming ESPN+ Events Hari Ini',
        seoDesc: 'Nonton live streaming ESPN+ Events gratis di SportMeriah!',
        seoText: 'Nonton streaming ESPN+ Events gratis di SportMeriah. Berbagai olahraga dan event eksklusif ESPN+.',
        placeholder: '📺',
    },
    ncaa_basketball: {
        name: 'NCAA Basketball',
        nameId: 'NCAA Basketball / March Madness',
        emoji: '🏀',
        icon: MdSportsBasketball,
        color: 'text-indigo-400',
        bgColor: 'bg-indigo-600',
        hoverColor: 'group-hover:bg-indigo-700',
        seoTitle: 'Live Streaming NCAA Basketball - March Madness Hari Ini',
        seoDesc: 'Nonton live streaming NCAA Basketball / March Madness gratis di SportMeriah!',
        seoText: 'Nonton streaming NCAA Basketball gratis. March Madness, Big Ten, ACC, SEC, dan pertandingan basket universitas.',
        placeholder: '🏀',
    },
};

// ========== GENERIC SPORT PAGE ==========
export default function SportPageClient({ sport }) {
    const config = SPORT_CONFIGS[sport];
    const SportIcon = config?.icon || MdLiveTv;

    const [channels, setChannels] = useState({ matches: [], other: [], all: [] });
    const [sportsTVChannels, setSportsTVChannels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalSlots: 0, activeChannels: 0, emptySlots: 0,
        matchChannels: 0, otherChannels: 0, sportsTVChannels: 0
    });

    useEffect(() => {
        fetchSportData();
        const interval = setInterval(fetchSportData, 60000);
        return () => clearInterval(interval);
    }, [sport]);

    const fetchSportData = async () => {
        try {
            const res = await fetch(`${API_URL}/api/sports/${sport}`);
            const data = await res.json();

            if (data.success) {
                setChannels({
                    matches: data.channels?.matches || [],
                    other: data.channels?.other || [],
                    all: data.channels?.all || []
                });
                setSportsTVChannels(data.sportsTVChannels || []);
                setStats({
                    totalSlots: data.stats?.totalSlots || 0,
                    activeChannels: data.stats?.activeChannels || 0,
                    emptySlots: data.stats?.emptySlots || 0,
                    matchChannels: data.stats?.matchChannels || 0,
                    otherChannels: data.stats?.otherChannels || 0,
                    sportsTVChannels: data.stats?.sportsTVChannels || 0
                });
            }
        } catch (error) {
            console.error(`Failed to fetch ${sport} data:`, error);
        } finally {
            setLoading(false);
        }
    };

    if (!config) {
        return (
            <main className="min-h-screen bg-gray-900">
                <Navbar />
                <div className="container max-w-6xl mx-auto px-4 py-20 text-center">
                    <p className="text-4xl mb-4">❌</p>
                    <p className="text-gray-400 text-lg">Sport &quot;{sport}&quot; tidak ditemukan</p>
                    <Link href="/" className="text-orange-500 hover:underline mt-4 inline-block">← Kembali ke Beranda</Link>
                </div>
            </main>
        );
    }

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
                            <SportIcon className={config.color} />
                            {config.name}
                        </h1>
                    </div>
                </div>

                {/* Main Layout */}
                <div className="flex flex-col lg:flex-row gap-6">

                    {/* Sidebar Stats */}
                    <div className="w-full lg:w-1/4 order-2 lg:order-1">
                        <div className="bg-gray-800 rounded-lg p-4 sticky top-32">
                            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                <SportIcon className={config.color} />
                                {config.name} Stats
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Total Slots</span>
                                    <span className="text-white font-bold">{stats.totalSlots}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Active Channels</span>
                                    <span className="text-green-500 font-bold">{stats.activeChannels}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Match Channels</span>
                                    <span className={`${config.color} font-bold`}>{stats.matchChannels}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Sports TV</span>
                                    <span className="text-blue-400 font-bold">{stats.sportsTVChannels}</span>
                                </div>
                            </div>

                            {/* Quick Links */}
                            <div className="mt-6 pt-4 border-t border-gray-700">
                                <h4 className="text-white font-semibold mb-3 text-sm">Quick Links</h4>
                                <div className="space-y-2">
                                    <Link href="/" className="block text-gray-400 hover:text-white text-sm">
                                        ← Kembali ke Beranda
                                    </Link>
                                    <Link href="/football" className="block text-gray-400 hover:text-green-400 text-sm flex items-center gap-2">
                                        <MdSportsSoccer size={16} />
                                        Sepakbola
                                    </Link>
                                    <Link href="/basketball" className="block text-gray-400 hover:text-orange-400 text-sm flex items-center gap-2">
                                        <MdSportsBasketball size={16} />
                                        Basketball
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
                                <p className="text-gray-400">Memuat channel {config.nameId}...</p>
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
                                        border-left: 4px solid #f97316;
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
                                {/* Match Channels (channels with "vs") */}
                                {channels.matches.length > 0 && (
                                    <div>
                                        <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                            Live Events
                                        </h2>
                                        <div className="space-y-3">
                                            {channels.matches.map((channel) => (
                                                <MatchChannelCard
                                                    key={channel.id}
                                                    channel={channel}
                                                    config={config}
                                                    sport={sport}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Other Active Channels (team channels, etc) */}
                                {channels.other.length > 0 && (
                                    <div>
                                        <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                            📺 Channels
                                        </h2>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {channels.other.map((channel) => (
                                                <ChannelCard
                                                    key={channel.id}
                                                    channel={channel}
                                                    config={config}
                                                    sport={sport}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Sports TV Channels */}
                                {sportsTVChannels.length > 0 && (
                                    <div>
                                        <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                            🖥️ Sports TV
                                        </h2>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {sportsTVChannels.map((channel) => (
                                                <ChannelCard
                                                    key={channel.id}
                                                    channel={channel}
                                                    config={config}
                                                    sport={sport}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Empty State */}
                                {channels.all.length === 0 && sportsTVChannels.length === 0 && (
                                    <div className="bg-gray-800 rounded-lg p-8 text-center">
                                        <p className="text-4xl mb-4">{config.emoji}</p>
                                        <p className="text-gray-400">Tidak ada channel {config.nameId} tersedia saat ini</p>
                                        <p className="text-gray-500 text-sm mt-2">Channel akan muncul saat ada event/pertandingan</p>
                                        <Link href="/" className="text-orange-500 hover:underline mt-4 inline-block">
                                            ← Kembali ke Beranda
                                        </Link>
                                    </div>
                                )}
                            </>
                        )}

                        {/* SEO Description */}
                        <div className="mt-8 pt-6 border-t border-gray-700 text-gray-400 text-sm space-y-3">
                            <h2 className="text-xl font-semibold text-white">
                                Nonton Streaming {config.name} Gratis
                            </h2>
                            <p>{config.seoText}</p>
                            <p>Live streaming {config.nameId} dengan kualitas terbaik dan server tercepat. Tonton sekarang!</p>
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

            {/* Bottom padding for mobile nav */}
            <div className="h-20 md:hidden"></div>
        </main>
    );
}

// ========== MATCH CHANNEL CARD (channels with "vs") ==========
function MatchChannelCard({ channel, config, sport }) {
    const SportIcon = config.icon;
    const match = channel.match;

    return (
        <Link href={`/sports/${sport}/${channel.id}`}>
            <div className="bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer group overflow-hidden">

                {/* Header */}
                <div className="flex justify-between items-center px-3 py-1.5 bg-gray-800 text-[10px] sm:text-xs">
                    <span className="font-medium text-green-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                        Live Event
                    </span>
                    <span className={`${config.color} truncate max-w-[120px] sm:max-w-[200px] flex items-center gap-1`}>
                        <SportIcon size={12} />
                        {channel.category || config.name}
                    </span>
                </div>

                {/* Match Content */}
                <div className="flex items-center justify-between px-3 py-3 gap-2">

                    {/* Home Team */}
                    <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                        <span className="text-white text-xs sm:text-sm font-medium truncate text-right">
                            {match?.homeTeam || 'Team A'}
                        </span>
                        <div className={`w-7 h-7 sm:w-8 sm:h-8 ${config.bgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                            <SportIcon size={16} className="text-white" />
                        </div>
                    </div>

                    {/* VS */}
                    <div className="flex-shrink-0 px-2">
                        <span className="text-gray-400 text-xs sm:text-sm font-bold">VS</span>
                    </div>

                    {/* Away Team */}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className={`w-7 h-7 sm:w-8 sm:h-8 ${config.bgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                            <SportIcon size={16} className="text-white" />
                        </div>
                        <span className="text-white text-xs sm:text-sm font-medium truncate">
                            {match?.awayTeam || 'Team B'}
                        </span>
                    </div>

                    {/* Button */}
                    <div className="flex-shrink-0 ml-2">
                        <span className={`text-white text-[10px] sm:text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded transition-colors inline-flex items-center gap-1 ${config.bgColor} ${config.hoverColor}`}>
                            Tonton ▶
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

// ========== CHANNEL CARD (team channels, sports TV) ==========
function ChannelCard({ channel, config, sport }) {
    const SportIcon = config.icon;

    return (
        <Link href={`/sports/${sport}/${channel.id}`}>
            <div className="bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer group overflow-hidden">

                {/* Header */}
                <div className="flex justify-between items-center px-3 py-1.5 bg-gray-800 text-[10px] sm:text-xs">
                    <span className="font-medium text-blue-400">📺 {channel.type === 'tv_channel' ? 'Sports TV' : 'Channel'}</span>
                    <span className={`${config.color} truncate max-w-[120px] sm:max-w-[200px] flex items-center gap-1`}>
                        <SportIcon size={12} />
                        {channel.category || config.name}
                    </span>
                </div>

                {/* Content */}
                <div className="flex items-center justify-between px-3 py-3 gap-2">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-8 h-8 ${config.bgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                            <SportIcon size={18} className="text-white" />
                        </div>
                        <span className="text-white text-xs sm:text-sm font-medium truncate">
                            {channel.cleanName || channel.name || 'Channel'}
                        </span>
                    </div>

                    {/* Button */}
                    <div className="flex-shrink-0 ml-2">
                        <span className={`text-white text-[10px] sm:text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded transition-colors ${config.bgColor} ${config.hoverColor}`}>
                            Tonton ▶
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

// Export configs for use in page.jsx (SEO metadata)
export { SPORT_CONFIGS };
