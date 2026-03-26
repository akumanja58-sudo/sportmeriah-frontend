'use client';

import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Link from 'next/link';

import { MdSportsMotorsports, MdPlayArrow, MdLiveTv } from 'react-icons/md';
import { FaTelegram } from 'react-icons/fa';
import { IoHome } from 'react-icons/io5';
import { MdSportsSoccer, MdSportsBasketball, MdSportsTennis } from 'react-icons/md';
import { HiSignal, HiClock, HiTrophy } from 'react-icons/hi2';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://sportmeriah-backend-production.up.railway.app';

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

export default function MotorsportPageClient() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const response = await fetch(`${API_URL}/api/motorsport`);
            const result = await response.json();
            if (result.success) setData(result);
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const activeChannels = data?.channels?.all || [];
    const f1Channels = data?.channels?.f1 || [];
    const motogpChannels = data?.channels?.motogp || [];
    const otherChannels = data?.channels?.other || [];
    const sportsTVChannels = data?.sportsTVChannels || [];
    const f1Calendar = data?.f1Calendar || [];
    const stats = data?.stats || {};

    const upcomingRaces = f1Calendar.filter(r => r.status === 'UPCOMING');
    const nextRace = upcomingRaces[0];

    return (
        <main className="min-h-screen" style={{ backgroundColor: '#0a0c14' }}>
            <Navbar />

            <div className="container max-w-7xl mx-auto px-4 py-8">

                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <Link href="/" className="text-gray-500 hover:text-gray-300 transition-colors"><IoHome size={18} /></Link>
                    <span className="text-gray-700">/</span>
                    <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                        <MdSportsMotorsports className="text-red-500" /> Motorsport
                    </h1>
                    <span className="text-gray-500 text-sm hidden sm:block">F1, MotoGP, NASCAR</span>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Sidebar */}
                    <aside className="w-full lg:w-72 order-2 lg:order-1 flex-shrink-0">
                        <div className="sticky top-32 space-y-5">

                            <div className="rounded-xl p-5" style={{ backgroundColor: '#1a1d27' }}>
                                <h3 className="text-white font-semibold text-xs mb-4 flex items-center gap-2 uppercase tracking-widest">
                                    <MdSportsMotorsports className="text-red-500" size={14} /> Statistik
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 flex items-center gap-1.5"><HiSignal size={12} className="text-red-400" /> Active</span>
                                        <span className="text-red-400 font-bold">{stats.activeChannels || 0}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">F1 Channels</span>
                                        <span className="text-white font-bold">{stats.f1Channels || 0}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">MotoGP Channels</span>
                                        <span className="text-white font-bold">{stats.motogpChannels || 0}</span>
                                    </div>
                                    <div className="flex justify-between text-sm pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                        <span className="text-gray-500">Sports TV</span>
                                        <span className="text-blue-400 font-bold">{stats.sportsTVChannels || 0}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Next Race */}
                            {nextRace && (
                                <div className="rounded-xl p-5" style={{ backgroundColor: '#1a1d27' }}>
                                    <h3 className="text-white font-semibold text-xs mb-4 flex items-center gap-2 uppercase tracking-widest">
                                        <HiTrophy className="text-amber-400" size={14} /> Race Berikutnya
                                    </h3>
                                    <div className="rounded-lg p-3" style={{ backgroundColor: '#232733' }}>
                                        <h4 className="text-white font-semibold text-sm">{nextRace.name}</h4>
                                        <p className="text-gray-500 text-xs mt-1">{nextRace.circuit}</p>
                                        <p className="text-gray-500 text-xs">{nextRace.location}, {nextRace.country}</p>
                                        <p className="text-red-400 text-xs mt-2 font-medium">
                                            {new Date(nextRace.date).toLocaleString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="rounded-xl p-5" style={{ backgroundColor: '#1a1d27' }}>
                                <h3 className="text-white font-semibold text-xs mb-4 uppercase tracking-widest">Quick Links</h3>
                                <div className="space-y-1">
                                    <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-500 hover:text-gray-300 text-sm transition-colors"
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#232733'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                        <IoHome size={14} /> Beranda
                                    </Link>
                                    <Link href="/football" className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-500 hover:text-emerald-400 text-sm transition-colors"
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#232733'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                        <MdSportsSoccer size={14} /> Sepakbola
                                    </Link>
                                    <Link href="/basketball" className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-500 hover:text-orange-400 text-sm transition-colors"
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#232733'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                        <MdSportsBasketball size={14} /> Basketball
                                    </Link>
                                    <Link href="/tennis" className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-500 hover:text-yellow-400 text-sm transition-colors"
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#232733'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                        <MdSportsTennis size={14} /> Tennis
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1 order-1 lg:order-2 space-y-6">

                        {loading ? (
                            <div className="rounded-xl p-12 text-center" style={{ backgroundColor: '#1a1d27' }}>
                                <div className="flex justify-center mb-4"><span className="loader"></span></div>
                                <p className="text-gray-500 text-sm">Memuat data motorsport...</p>
                                <style>{`
                                    .loader { width: 40px; height: 40px; border-radius: 50%; display: inline-block; border-top: 3px solid #fff; border-right: 3px solid transparent; box-sizing: border-box; animation: rot 1s linear infinite; position: relative; }
                                    .loader::after { content: ''; box-sizing: border-box; position: absolute; left: 0; top: 0; width: 40px; height: 40px; border-radius: 50%; border-left: 3px solid #ef4444; border-bottom: 3px solid transparent; animation: rot 0.5s linear infinite reverse; }
                                    @keyframes rot { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                                `}</style>
                            </div>
                        ) : (
                            <>
                                {/* Active Channels */}
                                {activeChannels.length > 0 ? (
                                    <>
                                        {/* F1 */}
                                        {f1Channels.length > 0 && (
                                            <section>
                                                <div className="flex items-center gap-3 mb-4">
                                                    <span className="relative flex h-2.5 w-2.5">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                                    </span>
                                                    <h2 className="text-white font-bold text-lg">Formula 1</h2>
                                                    <span className="text-xs text-gray-500 px-2.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#232733' }}>{f1Channels.length}</span>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    {f1Channels.map((ch) => <ChannelCard key={ch.id} channel={ch} />)}
                                                </div>
                                            </section>
                                        )}

                                        {/* MotoGP */}
                                        {motogpChannels.length > 0 && (
                                            <section>
                                                <div className="flex items-center gap-3 mb-4">
                                                    <MdSportsMotorsports size={18} className="text-orange-500" />
                                                    <h2 className="text-white font-bold text-lg">MotoGP</h2>
                                                    <span className="text-xs text-gray-500 px-2.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#232733' }}>{motogpChannels.length}</span>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    {motogpChannels.map((ch) => <ChannelCard key={ch.id} channel={ch} />)}
                                                </div>
                                            </section>
                                        )}

                                        {/* Other */}
                                        {otherChannels.length > 0 && (
                                            <section>
                                                <div className="flex items-center gap-3 mb-4">
                                                    <MdLiveTv size={18} className="text-blue-400" />
                                                    <h2 className="text-white font-bold text-lg">Other</h2>
                                                    <span className="text-xs text-gray-500 px-2.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#232733' }}>{otherChannels.length}</span>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    {otherChannels.map((ch) => <ChannelCard key={ch.id} channel={ch} />)}
                                                </div>
                                            </section>
                                        )}
                                    </>
                                ) : (
                                    <div className="rounded-xl p-12 text-center" style={{ backgroundColor: '#1a1d27' }}>
                                        <MdSportsMotorsports size={40} className="text-gray-600 mx-auto mb-4" />
                                        <p className="text-gray-400 font-medium">Tidak ada channel motorsport aktif saat ini</p>
                                        <p className="text-gray-600 text-sm mt-1">Channel akan muncul saat ada event F1, MotoGP, atau NASCAR</p>
                                    </div>
                                )}

                                {/* Sports TV */}
                                {sportsTVChannels.length > 0 && (
                                    <section>
                                        <div className="flex items-center gap-3 mb-4">
                                            <MdLiveTv size={18} className="text-blue-400" />
                                            <h2 className="text-white font-bold text-lg">Sports TV</h2>
                                            <span className="text-xs text-gray-500 px-2.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#232733' }}>{sportsTVChannels.length}</span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {sportsTVChannels.map((ch) => <ChannelCard key={ch.id} channel={ch} isTv={true} />)}
                                        </div>
                                    </section>
                                )}

                                {/* F1 Calendar */}
                                {f1Calendar.length > 0 && (
                                    <section>
                                        <div className="flex items-center gap-3 mb-4">
                                            <HiTrophy size={18} className="text-amber-400" />
                                            <h2 className="text-white font-bold text-lg">F1 Calendar {new Date().getFullYear()}</h2>
                                        </div>
                                        <div className="space-y-2">
                                            {f1Calendar.map((race, idx) => {
                                                const raceDate = new Date(race.date);
                                                const isLive = race.status === 'LIVE';
                                                const isPast = race.status === 'FINISHED';
                                                return (
                                                    <div key={idx} className={`rounded-lg p-4 flex items-center gap-4 transition-all ${isPast ? 'opacity-40' : ''}`}
                                                        style={{ backgroundColor: isLive ? 'rgba(239,68,68,0.1)' : '#1a1d27', border: isLive ? '1px solid rgba(239,68,68,0.2)' : '1px solid transparent' }}>
                                                        <div className="text-center min-w-[45px]">
                                                            <span className={`text-xl font-bold ${isLive ? 'text-red-400' : 'text-white'}`}>{raceDate.getDate()}</span>
                                                            <p className="text-gray-500 text-[10px] uppercase">{raceDate.toLocaleString('id-ID', { month: 'short' })}</p>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className={`font-semibold text-sm truncate ${isLive ? 'text-red-400' : 'text-white'}`}>{race.name}</h3>
                                                            <p className="text-gray-500 text-xs mt-0.5">{race.circuit} — {race.country}</p>
                                                        </div>
                                                        <div className="flex-shrink-0">
                                                            {isLive ? (
                                                                <span className="flex items-center gap-1.5 text-xs font-semibold text-red-400">
                                                                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span> LIVE
                                                                </span>
                                                            ) : isPast ? (
                                                                <span className="text-gray-600 text-xs">Selesai</span>
                                                            ) : (
                                                                <span className="text-gray-500 text-xs">{raceDate.toLocaleString('id-ID', { day: 'numeric', month: 'short' })}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </section>
                                )}
                            </>
                        )}

                        {/* SEO */}
                        <div className="mt-10 pt-8 space-y-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                            <h2 className="text-lg font-semibold text-white">Live Streaming Motorsport Gratis</h2>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Nonton streaming Formula 1, MotoGP, NASCAR gratis di NobarMeriah. Kualitas HD, tanpa buffering. Race calendar F1 lengkap.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Nav */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden" style={{ backgroundColor: '#0a0c14', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex justify-around items-center py-2.5 px-1">
                    <Link href="/" className="flex flex-col items-center px-3 py-1 text-gray-500 hover:text-emerald-400 transition-colors"><IoHome size={20} /><span className="text-[10px] mt-1">Beranda</span></Link>
                    <Link href="/football" className="flex flex-col items-center px-3 py-1 text-gray-500 hover:text-emerald-400 transition-colors"><MdSportsSoccer size={20} /><span className="text-[10px] mt-1">Sepakbola</span></Link>
                    <Link href="/motorsport" className="flex flex-col items-center px-3 py-1 text-red-400"><MdSportsMotorsports size={20} /><span className="text-[10px] mt-1 font-medium">Motor</span></Link>
                    <a href="https://t.me/sportmeriah" target="_blank" className="flex flex-col items-center px-3 py-1 text-gray-500 hover:text-blue-400 transition-colors"><FaTelegram size={20} /><span className="text-[10px] mt-1">Telegram</span></a>
                </div>
            </nav>
            <div className="h-20 md:hidden"></div>
        </main>
    );
}

// ========== CHANNEL CARD ==========
function ChannelCard({ channel, isTv = false }) {
    const parsed = parseChannelName(channel.name);
    return (
        <Link href={`/motorsport/${channel.id}?provider=sphere`}>
            <div className="rounded-lg overflow-hidden transition-all cursor-pointer group border border-transparent"
                style={{ backgroundColor: '#1a1d27' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1e2130'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1a1d27'}>
                <div className="flex justify-between items-center px-4 py-2 text-xs" style={{ backgroundColor: '#151720' }}>
                    <span className="font-medium text-red-400 flex items-center gap-1.5">
                        {isTv ? <><MdLiveTv size={12} /> Sports TV</> : <><span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span> Live</>}
                    </span>
                    <span className="text-gray-500">{parsed.league}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3 gap-2">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#232733' }}>
                            <MdSportsMotorsports size={14} className="text-red-500" />
                        </div>
                        <span className="text-white text-sm font-medium truncate">{isTv ? channel.name : parsed.title}</span>
                    </div>
                    <span className="text-white text-xs font-semibold px-3.5 py-1.5 rounded-md inline-flex items-center gap-1 flex-shrink-0" style={{ backgroundColor: '#dc2626' }}>
                        <MdPlayArrow size={14} /> Tonton
                    </span>
                </div>
            </div>
        </Link>
    );
}
