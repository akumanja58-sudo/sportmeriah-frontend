'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { MdPlayArrow, MdLiveTv, MdRefresh } from 'react-icons/md';
import { IoCalendarOutline } from 'react-icons/io5';
import { FaTrophy } from 'react-icons/fa';
import { GiTennisRacket } from 'react-icons/gi';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://sportmeriah-backend-production.up.railway.app';

const parseChannelName = (name) => {
    if (!name) return { title: 'Tennis Live', league: 'Tennis' };

    let cleanName = name;
    cleanName = cleanName.replace(/^TENNIS\s*\d*\s*:\s*/i, '');
    cleanName = cleanName.replace(/\s*@\s*[\d:]+\s*(AM|PM)?.*$/i, '');

    let league = 'Tennis';
    const lower = name.toLowerCase();
    if (lower.includes('australian open')) league = 'Australian Open';
    else if (lower.includes('roland garros') || lower.includes('french open')) league = 'Roland Garros';
    else if (lower.includes('wimbledon')) league = 'Wimbledon';
    else if (lower.includes('us open')) league = 'US Open';
    else if (lower.includes('atp')) league = 'ATP';
    else if (lower.includes('wta')) league = 'WTA';

    return { title: cleanName.trim() || 'Tennis Live', league };
};

const getSurfaceColor = (surface) => {
    if (!surface) return 'text-gray-400';
    if (surface.toLowerCase().includes('clay')) return 'text-orange-400';
    if (surface.toLowerCase().includes('grass')) return 'text-green-400';
    return 'text-blue-400';
};

export default function TennisPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('live');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`${API_URL}/api/tennis`);
            const result = await response.json();
            if (result.success) {
                setData(result);
            } else {
                setError('Gagal memuat data tennis');
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Gagal memuat data tennis');
        } finally {
            setLoading(false);
        }
    };

    const activeChannels = data?.channels?.all || [];
    const sportsTVChannels = data?.sportsTVChannels || [];
    const tournaments = data?.upcomingTournaments || [];

    const upcomingTournaments = tournaments.filter(t => t.status === 'UPCOMING');
    const liveTournaments = tournaments.filter(t => t.status === 'LIVE');
    const nextTournament = [...liveTournaments, ...upcomingTournaments][0];

    return (
        <main className="min-h-screen bg-gray-900">
            <Navbar />

            <div className="container max-w-7xl mx-auto px-4 py-4 sm:py-6">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <GiTennisRacket size={28} className="text-green-500" />
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-white">Tennis</h1>
                            <p className="text-gray-400 text-xs sm:text-sm">ATP • WTA • Grand Slam • Masters 1000</p>
                        </div>
                    </div>
                    <button onClick={fetchData} className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition">
                        <MdRefresh size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    <button
                        onClick={() => setActiveTab('live')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${activeTab === 'live' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                    >
                        <MdLiveTv size={16} />
                        Live & Channels
                        {activeChannels.length > 0 && (
                            <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">{activeChannels.length}</span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('calendar')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${activeTab === 'calendar' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                    >
                        <IoCalendarOutline size={16} />
                        Tournament Calendar
                    </button>
                    <button
                        onClick={() => setActiveTab('tv')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${activeTab === 'tv' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                    >
                        <MdLiveTv size={16} />
                        Sports TV
                    </button>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-400">Memuat data tennis...</p>
                    </div>
                )}

                {/* Error */}
                {error && !loading && (
                    <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 text-center">
                        <p className="text-red-400 mb-3">{error}</p>
                        <button onClick={fetchData} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition">
                            Coba Lagi
                        </button>
                    </div>
                )}

                {/* Content */}
                {!loading && !error && data && (
                    <div className="flex flex-col lg:flex-row gap-6">

                        {/* Main Content */}
                        <div className="w-full lg:w-3/4">

                            {/* Live & Channels Tab */}
                            {activeTab === 'live' && (
                                <div className="space-y-4">
                                    {activeChannels.length > 0 ? (
                                        <>
                                            <h2 className="text-white font-semibold text-lg flex items-center gap-2">
                                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                                Channel Aktif ({activeChannels.length})
                                            </h2>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {activeChannels.map((channel) => {
                                                    const parsed = parseChannelName(channel.name);
                                                    return (
                                                        <Link
                                                            key={channel.id}
                                                            href={`/tennis/${channel.id}?provider=sphere`}
                                                            className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 transition group"
                                                        >
                                                            <div className="flex items-start justify-between gap-3">
                                                                <div className="min-w-0 flex-1">
                                                                    <h3 className="text-white text-sm font-semibold truncate group-hover:text-green-400 transition">
                                                                        {parsed.title}
                                                                    </h3>
                                                                    <p className="text-gray-400 text-xs mt-1 flex items-center gap-1">
                                                                        <GiTennisRacket size={12} className="text-green-500" />
                                                                        {parsed.league}
                                                                    </p>
                                                                </div>
                                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                                    <span className="bg-green-600/20 text-green-400 text-[10px] px-2 py-0.5 rounded flex items-center gap-1">
                                                                        <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></span>
                                                                        LIVE
                                                                    </span>
                                                                    <MdPlayArrow size={20} className="text-gray-500 group-hover:text-green-400 transition" />
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="bg-gray-800 rounded-lg p-8 text-center">
                                            <GiTennisRacket size={48} className="text-gray-600 mx-auto mb-3" />
                                            <h3 className="text-white font-semibold mb-2">Tidak Ada Match Live</h3>
                                            <p className="text-gray-400 text-sm">Belum ada tournament tennis yang sedang berlangsung. Cek jadwal tournament atau channel Sports TV.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Tournament Calendar Tab */}
                            {activeTab === 'calendar' && (
                                <div className="space-y-4">
                                    <h2 className="text-white font-semibold text-lg flex items-center gap-2">
                                        <FaTrophy className="text-yellow-500" />
                                        Tournament Calendar {new Date().getFullYear()}
                                    </h2>

                                    {tournaments.length > 0 ? (
                                        <div className="space-y-2">
                                            {tournaments.map((tournament, index) => {
                                                const tDate = new Date(tournament.date);
                                                const isLive = tournament.status === 'LIVE';
                                                const isPast = tournament.status === 'FINISHED';
                                                const isGrandSlam = tournament.type === 'Grand Slam';

                                                return (
                                                    <div
                                                        key={index}
                                                        className={`rounded-lg p-4 flex items-center gap-4 transition ${isLive ? 'bg-green-900/30 border border-green-700' :
                                                            isPast ? 'bg-gray-800/50 opacity-60' : 'bg-gray-800 hover:bg-gray-700'
                                                            }`}
                                                    >
                                                        <div className="text-center min-w-[50px]">
                                                            <span className={`text-2xl font-bold ${isLive ? 'text-green-500' : 'text-white'}`}>
                                                                {tDate.getDate()}
                                                            </span>
                                                            <p className="text-gray-400 text-xs uppercase">
                                                                {tDate.toLocaleString('id-ID', { month: 'short' })}
                                                            </p>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className={`font-semibold text-sm truncate ${isLive ? 'text-green-400' : 'text-white'}`}>
                                                                {isGrandSlam && '🏆 '}{tournament.name}
                                                            </h3>
                                                            <p className="text-gray-400 text-xs mt-0.5">
                                                                {tournament.location}
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-gray-500 text-[10px]">{tournament.type}</span>
                                                                <span className={`text-[10px] ${getSurfaceColor(tournament.surface)}`}>● {tournament.surface}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex-shrink-0">
                                                            {isLive ? (
                                                                <span className="bg-green-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                                                                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                                                                    LIVE
                                                                </span>
                                                            ) : isPast ? (
                                                                <span className="text-gray-500 text-xs">Selesai</span>
                                                            ) : (
                                                                <span className="text-gray-400 text-xs">
                                                                    {tDate.toLocaleString('id-ID', { day: 'numeric', month: 'short' })}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="bg-gray-800 rounded-lg p-8 text-center">
                                            <IoCalendarOutline size={48} className="text-gray-600 mx-auto mb-3" />
                                            <h3 className="text-white font-semibold mb-2">Kalendar Belum Tersedia</h3>
                                            <p className="text-gray-400 text-sm">Data jadwal tournament belum tersedia.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Sports TV Tab */}
                            {activeTab === 'tv' && (
                                <div className="space-y-4">
                                    <h2 className="text-white font-semibold text-lg flex items-center gap-2">
                                        <MdLiveTv className="text-green-500" />
                                        Sports TV Channels
                                    </h2>

                                    {sportsTVChannels.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {sportsTVChannels.map((channel) => (
                                                <Link
                                                    key={channel.id}
                                                    href={`/tennis/${channel.id}?provider=sphere`}
                                                    className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 transition group"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="min-w-0 flex-1">
                                                            <h3 className="text-white text-sm font-semibold truncate group-hover:text-green-400 transition">
                                                                {channel.name}
                                                            </h3>
                                                            <p className="text-gray-400 text-xs mt-1">{channel.league}</p>
                                                        </div>
                                                        <MdPlayArrow size={20} className="text-gray-500 group-hover:text-green-400 transition flex-shrink-0" />
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="bg-gray-800 rounded-lg p-8 text-center">
                                            <MdLiveTv size={48} className="text-gray-600 mx-auto mb-3" />
                                            <p className="text-gray-400 text-sm">Tidak ada Sports TV channel tersedia</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="w-full lg:w-1/4">
                            {/* Next Tournament Card */}
                            {nextTournament && (
                                <div className="bg-gray-800 rounded-lg p-4 mb-4">
                                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm">
                                        <FaTrophy className="text-yellow-500" />
                                        Tournament Berikutnya
                                    </h3>
                                    <div className="bg-gray-700/50 rounded-lg p-3">
                                        <h4 className="text-white font-semibold text-sm">{nextTournament.name}</h4>
                                        <p className="text-gray-400 text-xs mt-1">{nextTournament.location}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-gray-500 text-[10px]">{nextTournament.type}</span>
                                            <span className={`text-[10px] ${getSurfaceColor(nextTournament.surface)}`}>● {nextTournament.surface}</span>
                                        </div>
                                        <p className="text-green-400 text-xs mt-2 font-medium">
                                            {new Date(nextTournament.date).toLocaleString('id-ID', {
                                                weekday: 'long', day: 'numeric', month: 'long'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Quick Links */}
                            <div className="bg-gray-800 rounded-lg p-4">
                                <h3 className="text-white font-semibold mb-3 text-sm">Quick Links</h3>
                                <div className="space-y-2">
                                    <Link href="/" className="block text-gray-400 hover:text-green-400 text-xs sm:text-sm">← Beranda</Link>
                                    <Link href="/football" className="block text-gray-400 hover:text-green-400 text-xs sm:text-sm">Sepakbola</Link>
                                    <Link href="/basketball" className="block text-gray-400 hover:text-orange-400 text-xs sm:text-sm">Basketball</Link>
                                    <Link href="/motorsport" className="block text-gray-400 hover:text-red-400 text-xs sm:text-sm">Motorsport</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
