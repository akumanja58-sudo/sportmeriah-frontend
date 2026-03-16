'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { MdSportsMotorsports, MdPlayArrow, MdLiveTv, MdSchedule, MdRefresh } from 'react-icons/md';
import { IoCalendarOutline } from 'react-icons/io5';
import { FaTrophy, FaFlagCheckered } from 'react-icons/fa';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://sportmeriah-backend-production.up.railway.app';

// Parse channel name for clean display
const parseChannelName = (name) => {
    if (!name) return { title: 'Motorsport Live', league: 'Motorsport' };

    let cleanName = name;
    cleanName = cleanName.replace(/^MOTORSPORT\s*\d*\s*:\s*/i, '');
    cleanName = cleanName.replace(/\s*@\s*[\d:]+\s*(AM|PM)?.*$/i, '');

    let league = 'Motorsport';
    const lower = name.toLowerCase();
    if (lower.includes('formula') || lower.includes('f1')) league = 'Formula 1';
    else if (lower.includes('motogp') || lower.includes('moto gp')) league = 'MotoGP';
    else if (lower.includes('f1 academy')) league = 'F1 Academy';
    else if (lower.includes('nascar')) league = 'NASCAR';

    return { title: cleanName.trim() || 'Motorsport Live', league };
};

export default function MotorsportPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('live'); // live, calendar, tv

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`${API_URL}/api/motorsport`);
            const result = await response.json();
            if (result.success) {
                setData(result);
            } else {
                setError('Gagal memuat data motorsport');
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Gagal memuat data motorsport');
        } finally {
            setLoading(false);
        }
    };

    const activeChannels = data?.channels?.all || [];
    const f1Calendar = data?.f1Calendar || [];
    const sportsTVChannels = data?.sportsTVChannels || [];

    const upcomingRaces = f1Calendar.filter(r => r.status === 'UPCOMING').slice(0, 5);
    const nextRace = upcomingRaces[0];

    return (
        <main className="min-h-screen" style={{ backgroundColor: '#0f0f1e' }}>
            <Navbar />

            <div className="container max-w-7xl mx-auto px-4 py-4 sm:py-6">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <MdSportsMotorsports size={28} className="text-red-500" />
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-white">Motorsport</h1>
                            <p className="text-gray-400 text-xs sm:text-sm">Formula 1 • MotoGP • NASCAR • F1 Academy</p>
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
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${activeTab === 'live' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                            }`}
                    >
                        <MdLiveTv size={16} />
                        Live & Channels
                        {activeChannels.length > 0 && (
                            <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{activeChannels.length}</span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('calendar')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${activeTab === 'calendar' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                            }`}
                    >
                        <IoCalendarOutline size={16} />
                        F1 Calendar
                    </button>
                    <button
                        onClick={() => setActiveTab('tv')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${activeTab === 'tv' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                            }`}
                    >
                        <MdLiveTv size={16} />
                        Sports TV
                    </button>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-400">Memuat data motorsport...</p>
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
                                                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                                Channel Aktif ({activeChannels.length})
                                            </h2>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {activeChannels.map((channel) => {
                                                    const parsed = parseChannelName(channel.name);
                                                    return (
                                                        <Link
                                                            key={channel.id}
                                                            href={`/motorsport/${channel.id}?provider=sphere`}
                                                            className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 transition group"
                                                        >
                                                            <div className="flex items-start justify-between gap-3">
                                                                <div className="min-w-0 flex-1">
                                                                    <h3 className="text-white text-sm font-semibold truncate group-hover:text-red-400 transition">
                                                                        {parsed.title}
                                                                    </h3>
                                                                    <p className="text-gray-400 text-xs mt-1 flex items-center gap-1">
                                                                        <MdSportsMotorsports size={12} className="text-red-500" />
                                                                        {parsed.league}
                                                                    </p>
                                                                </div>
                                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                                    <span className="bg-red-600/20 text-red-400 text-[10px] px-2 py-0.5 rounded flex items-center gap-1">
                                                                        <span className="w-1 h-1 bg-red-500 rounded-full animate-pulse"></span>
                                                                        LIVE
                                                                    </span>
                                                                    <MdPlayArrow size={20} className="text-gray-500 group-hover:text-red-400 transition" />
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="bg-gray-800 rounded-lg p-8 text-center">
                                            <MdSportsMotorsports size={48} className="text-gray-600 mx-auto mb-3" />
                                            <h3 className="text-white font-semibold mb-2">Tidak Ada Event Live</h3>
                                            <p className="text-gray-400 text-sm">Belum ada event motorsport yang sedang berlangsung. Cek jadwal F1 atau channel Sports TV.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* F1 Calendar Tab */}
                            {activeTab === 'calendar' && (
                                <div className="space-y-4">
                                    <h2 className="text-white font-semibold text-lg flex items-center gap-2">
                                        <FaFlagCheckered className="text-red-500" />
                                        F1 Race Calendar {new Date().getFullYear()}
                                    </h2>

                                    {f1Calendar.length > 0 ? (
                                        <div className="space-y-2">
                                            {f1Calendar.map((race, index) => {
                                                const raceDate = new Date(race.date);
                                                const isToday = raceDate.toDateString() === new Date().toDateString();
                                                const isPast = raceDate < new Date() && !isToday;

                                                return (
                                                    <div
                                                        key={race.id || index}
                                                        className={`rounded-lg p-4 flex items-center gap-4 transition ${isToday ? 'bg-red-900/30 border border-red-700' :
                                                            isPast ? 'bg-gray-800/50 opacity-60' : 'bg-gray-800 hover:bg-gray-700'
                                                            }`}
                                                    >
                                                        <div className="text-center min-w-[50px]">
                                                            <span className={`text-2xl font-bold ${isToday ? 'text-red-500' : 'text-white'}`}>
                                                                {raceDate.getDate()}
                                                            </span>
                                                            <p className="text-gray-400 text-xs uppercase">
                                                                {raceDate.toLocaleString('id-ID', { month: 'short' })}
                                                            </p>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className={`font-semibold text-sm truncate ${isToday ? 'text-red-400' : 'text-white'}`}>
                                                                {race.name}
                                                            </h3>
                                                            <p className="text-gray-400 text-xs mt-0.5">
                                                                {race.circuit} • {race.location}, {race.country}
                                                            </p>
                                                        </div>
                                                        <div className="flex-shrink-0">
                                                            {isToday ? (
                                                                <span className="bg-red-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                                                                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                                                                    HARI INI
                                                                </span>
                                                            ) : isPast ? (
                                                                <span className="text-gray-500 text-xs">Selesai</span>
                                                            ) : (
                                                                <span className="text-gray-400 text-xs">
                                                                    {raceDate.toLocaleString('id-ID', { weekday: 'short', hour: '2-digit', minute: '2-digit' })}
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
                                            <p className="text-gray-400 text-sm">Data jadwal F1 belum tersedia untuk musim ini.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Sports TV Tab */}
                            {activeTab === 'tv' && (
                                <div className="space-y-4">
                                    <h2 className="text-white font-semibold text-lg flex items-center gap-2">
                                        <MdLiveTv className="text-red-500" />
                                        Sports TV Channels
                                    </h2>

                                    {sportsTVChannels.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {sportsTVChannels.map((channel) => (
                                                <Link
                                                    key={channel.id}
                                                    href={`/motorsport/${channel.id}?provider=sphere`}
                                                    className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 transition group"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="min-w-0 flex-1">
                                                            <h3 className="text-white text-sm font-semibold truncate group-hover:text-red-400 transition">
                                                                {channel.name}
                                                            </h3>
                                                            <p className="text-gray-400 text-xs mt-1">{channel.league}</p>
                                                        </div>
                                                        <MdPlayArrow size={20} className="text-gray-500 group-hover:text-red-400 transition flex-shrink-0" />
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
                            {/* Next Race Card */}
                            {nextRace && (
                                <div className="bg-gray-800 rounded-lg p-4 mb-4">
                                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm">
                                        <FaFlagCheckered className="text-red-500" />
                                        Race Berikutnya
                                    </h3>
                                    <div className="bg-gray-700/50 rounded-lg p-3">
                                        <h4 className="text-white font-semibold text-sm">{nextRace.name}</h4>
                                        <p className="text-gray-400 text-xs mt-1">{nextRace.circuit}</p>
                                        <p className="text-gray-400 text-xs">{nextRace.location}, {nextRace.country}</p>
                                        <p className="text-red-400 text-xs mt-2 font-medium">
                                            {new Date(nextRace.date).toLocaleString('id-ID', {
                                                weekday: 'long', day: 'numeric', month: 'long',
                                                hour: '2-digit', minute: '2-digit'
                                            })} WIB
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
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
