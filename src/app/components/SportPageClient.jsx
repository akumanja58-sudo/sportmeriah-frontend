'use client';

import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Link from 'next/link';

import { FaTelegram } from 'react-icons/fa';
import { IoHome } from 'react-icons/io5';
import {
    MdSportsSoccer, MdSportsBasketball, MdSportsHockey, MdSportsBaseball,
    MdSportsFootball, MdSportsCricket, MdSportsGolf, MdSportsRugby,
    MdSportsHandball, MdSportsVolleyball, MdSportsMma, MdSportsTennis,
    MdSportsKabaddi, MdLiveTv, MdPlayArrow
} from 'react-icons/md';
import { GiSoccerField } from 'react-icons/gi';
import { HiSignal } from 'react-icons/hi2';

const API_URL = 'https://sportmeriah-backend-production.up.railway.app';

const SPORT_CONFIGS = {
    nhl: { name: 'NHL / Ice Hockey', nameId: 'NHL / Hockey Es', icon: MdSportsHockey, color: 'text-blue-400', accentHex: '#60a5fa', seoTitle: 'Live Streaming NHL Ice Hockey - Jadwal & Skor NHL', seoDesc: 'Nonton live streaming NHL Hockey gratis di NobarMeriah. HD tanpa buffering!', seoText: 'Nonton streaming NHL Ice Hockey gratis di NobarMeriah. Boston Bruins, New York Rangers, Toronto Maple Leafs.' },
    mlb: { name: 'MLB / Baseball', nameId: 'MLB / Bisbol', icon: MdSportsBaseball, color: 'text-red-400', accentHex: '#f87171', seoTitle: 'Live Streaming MLB Baseball - Jadwal & Skor MLB', seoDesc: 'Nonton live streaming MLB Baseball gratis di NobarMeriah. HD tanpa buffering!', seoText: 'Nonton streaming MLB Baseball gratis di NobarMeriah. New York Yankees, LA Dodgers, Houston Astros.' },
    nfl: { name: 'NFL / American Football', nameId: 'NFL / Football Amerika', icon: MdSportsFootball, color: 'text-green-400', accentHex: '#4ade80', seoTitle: 'Live Streaming NFL American Football - Jadwal NFL', seoDesc: 'Nonton live streaming NFL Football gratis di NobarMeriah. Super Bowl, HD streaming!', seoText: 'Nonton streaming NFL American Football gratis di NobarMeriah. Kansas City Chiefs, Dallas Cowboys.' },
    cricket: { name: 'Cricket', nameId: 'Kriket', icon: MdSportsCricket, color: 'text-emerald-400', accentHex: '#34d399', seoTitle: 'Live Streaming Cricket - IPL & ICC World Cup', seoDesc: 'Nonton live streaming Cricket gratis di NobarMeriah!', seoText: 'Nonton streaming Cricket gratis di NobarMeriah. IPL, ICC World Cup, T20.' },
    golf: { name: 'Golf', nameId: 'Golf', icon: MdSportsGolf, color: 'text-lime-400', accentHex: '#a3e635', seoTitle: 'Live Streaming Golf - PGA Tour & Turnamen Golf', seoDesc: 'Nonton live streaming Golf gratis di NobarMeriah!', seoText: 'Nonton streaming Golf gratis di NobarMeriah. PGA Tour, The Masters, US Open.' },
    rugby: { name: 'Rugby', nameId: 'Rugby', icon: MdSportsRugby, color: 'text-amber-400', accentHex: '#fbbf24', seoTitle: 'Live Streaming Rugby - Six Nations & World Cup', seoDesc: 'Nonton live streaming Rugby gratis di NobarMeriah!', seoText: 'Nonton streaming Rugby gratis. Six Nations, Rugby World Cup.' },
    handball: { name: 'Handball', nameId: 'Bola Tangan', icon: MdSportsHandball, color: 'text-cyan-400', accentHex: '#22d3ee', seoTitle: 'Live Streaming Handball - EHF Champions League', seoDesc: 'Nonton live streaming Handball gratis di NobarMeriah!', seoText: 'Nonton streaming Handball gratis di NobarMeriah. EHF Champions League.' },
    volleyball: { name: 'Volleyball', nameId: 'Bola Voli', icon: MdSportsVolleyball, color: 'text-yellow-400', accentHex: '#facc15', seoTitle: 'Live Streaming Volleyball - FIVB & NCAA', seoDesc: 'Nonton live streaming Volleyball gratis di NobarMeriah!', seoText: 'Nonton streaming Volleyball gratis di NobarMeriah. FIVB, NCAA Volleyball.' },
    ppv: { name: 'PPV Events', nameId: 'PPV / Boxing / MMA', icon: MdSportsMma, color: 'text-rose-400', accentHex: '#fb7185', seoTitle: 'Live Streaming PPV - UFC, Boxing, MMA', seoDesc: 'Nonton live streaming PPV Events gratis di NobarMeriah!', seoText: 'Nonton streaming PPV Events gratis. UFC, Boxing, MMA.' },
    mls: { name: 'MLS', nameId: 'MLS / Liga Amerika', icon: GiSoccerField, color: 'text-purple-400', accentHex: '#c084fc', seoTitle: 'Live Streaming MLS - Major League Soccer', seoDesc: 'Nonton live streaming MLS gratis di NobarMeriah!', seoText: 'Nonton streaming MLS gratis di NobarMeriah. Inter Miami, LA Galaxy.' },
    wnba: { name: 'WNBA', nameId: 'WNBA / Basket Wanita', icon: MdSportsBasketball, color: 'text-orange-400', accentHex: '#fb923c', seoTitle: 'Live Streaming WNBA - Jadwal & Skor WNBA', seoDesc: 'Nonton live streaming WNBA gratis di NobarMeriah!', seoText: 'Nonton streaming WNBA gratis di NobarMeriah.' },
    lacrosse: { name: 'Lacrosse', nameId: 'Lacrosse', icon: MdSportsKabaddi, color: 'text-teal-400', accentHex: '#2dd4bf', seoTitle: 'Live Streaming Lacrosse - PLL & NLL', seoDesc: 'Nonton live streaming Lacrosse gratis di NobarMeriah!', seoText: 'Nonton streaming Lacrosse gratis di NobarMeriah. PLL, NLL.' },
    espn_plus: { name: 'ESPN+ Events', nameId: 'ESPN+ Events', icon: MdLiveTv, color: 'text-red-400', accentHex: '#f87171', seoTitle: 'Live Streaming ESPN+ Events', seoDesc: 'Nonton live streaming ESPN+ Events gratis di NobarMeriah!', seoText: 'Nonton streaming ESPN+ Events gratis di NobarMeriah.' },
    ncaa_basketball: { name: 'NCAA Basketball', nameId: 'NCAA Basketball / March Madness', icon: MdSportsBasketball, color: 'text-indigo-400', accentHex: '#818cf8', seoTitle: 'Live Streaming NCAA Basketball - March Madness', seoDesc: 'Nonton live streaming NCAA Basketball gratis di NobarMeriah!', seoText: 'Nonton streaming NCAA Basketball gratis. March Madness.' },
};

export default function SportPageClient({ sport }) {
    const config = SPORT_CONFIGS[sport];
    const SportIcon = config?.icon || MdLiveTv;
    const [channels, setChannels] = useState({ matches: [], other: [], all: [] });
    const [sportsTVChannels, setSportsTVChannels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalSlots: 0, activeChannels: 0, matchChannels: 0, sportsTVChannels: 0 });

    useEffect(() => { fetchSportData(); const i = setInterval(fetchSportData, 60000); return () => clearInterval(i); }, [sport]);

    const fetchSportData = async () => {
        try {
            const res = await fetch(`${API_URL}/api/sports/${sport}`);
            const data = await res.json();
            if (data.success) {
                setChannels({ matches: data.channels?.matches || [], other: data.channels?.other || [], all: data.channels?.all || [] });
                setSportsTVChannels(data.sportsTVChannels || []);
                setStats({ totalSlots: data.stats?.totalSlots || 0, activeChannels: data.stats?.activeChannels || 0, matchChannels: data.stats?.matchChannels || 0, sportsTVChannels: data.stats?.sportsTVChannels || 0 });
            }
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    if (!config) return (<main className="min-h-screen" style={{ backgroundColor: '#0a0c14' }}><Navbar /><div className="max-w-6xl mx-auto px-4 py-20 text-center"><MdLiveTv size={40} className="text-gray-600 mx-auto mb-4" /><p className="text-gray-400">Sport tidak ditemukan</p><Link href="/" className="text-emerald-400 mt-4 inline-block text-sm">Kembali</Link></div></main>);

    return (
        <main className="min-h-screen" style={{ backgroundColor: '#0a0c14' }}>
            <Navbar />
            <div className="container max-w-7xl mx-auto px-4 py-8">
                <div className="flex items-center gap-3 mb-6">
                    <Link href="/" className="text-gray-500 hover:text-gray-300"><IoHome size={18} /></Link>
                    <span className="text-gray-700">/</span>
                    <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2"><SportIcon className={config.color} /> {config.name}</h1>
                </div>
                <div className="flex flex-col lg:flex-row gap-8">
                    <aside className="w-full lg:w-72 order-2 lg:order-1 flex-shrink-0">
                        <div className="sticky top-32 space-y-5">
                            <div className="rounded-xl p-5" style={{ backgroundColor: '#1a1d27' }}>
                                <h3 className="text-white font-semibold text-xs mb-4 flex items-center gap-2 uppercase tracking-widest"><SportIcon className={config.color} size={14} /> Statistik</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm"><span className="text-gray-500 flex items-center gap-1.5"><HiSignal size={12} className="text-red-400" /> Active</span><span className="text-red-400 font-bold">{stats.activeChannels}</span></div>
                                    <div className="flex justify-between text-sm"><span className="text-gray-500">Match Channels</span><span className="font-bold" style={{ color: config.accentHex }}>{stats.matchChannels}</span></div>
                                    <div className="flex justify-between text-sm"><span className="text-gray-500">Sports TV</span><span className="text-blue-400 font-bold">{stats.sportsTVChannels}</span></div>
                                    <div className="flex justify-between text-sm pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}><span className="text-gray-500">Total Slots</span><span className="text-white font-bold">{stats.totalSlots}</span></div>
                                </div>
                            </div>
                            <div className="rounded-xl p-5" style={{ backgroundColor: '#1a1d27' }}>
                                <h3 className="text-white font-semibold text-xs mb-4 uppercase tracking-widest">Quick Links</h3>
                                <div className="space-y-1">
                                    <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-500 hover:text-gray-300 text-sm" onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#232733'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}><IoHome size={14} /> Beranda</Link>
                                    <Link href="/football" className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-500 hover:text-emerald-400 text-sm" onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#232733'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}><MdSportsSoccer size={14} /> Sepakbola</Link>
                                    <Link href="/basketball" className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-500 hover:text-orange-400 text-sm" onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#232733'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}><MdSportsBasketball size={14} /> Basketball</Link>
                                </div>
                            </div>
                        </div>
                    </aside>
                    <div className="flex-1 order-1 lg:order-2 space-y-6">
                        {loading ? (
                            <div className="rounded-xl p-12 text-center" style={{ backgroundColor: '#1a1d27' }}><div className="flex justify-center mb-4"><span className="loader"></span></div><p className="text-gray-500 text-sm">Memuat channel {config.nameId}...</p><style>{`.loader{width:40px;height:40px;border-radius:50%;display:inline-block;border-top:3px solid #fff;border-right:3px solid transparent;box-sizing:border-box;animation:rot 1s linear infinite;position:relative}.loader::after{content:'';box-sizing:border-box;position:absolute;left:0;top:0;width:40px;height:40px;border-radius:50%;border-left:3px solid ${config.accentHex};border-bottom:3px solid transparent;animation:rot .5s linear infinite reverse}@keyframes rot{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style></div>
                        ) : (<>
                            {channels.matches.length > 0 && (<section><div className="flex items-center gap-3 mb-4"><span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: config.accentHex }}></span><span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: config.accentHex }}></span></span><h2 className="text-white font-bold text-lg">Live Events</h2><span className="text-xs text-gray-500 px-2.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#232733' }}>{channels.matches.length}</span></div><div className="space-y-2">{channels.matches.map((ch) => <MatchCard key={ch.id} channel={ch} config={config} sport={sport} />)}</div></section>)}
                            {channels.other.length > 0 && (<section><div className="flex items-center gap-3 mb-4"><MdLiveTv size={18} className="text-blue-400" /><h2 className="text-white font-bold text-lg">Channels</h2><span className="text-xs text-gray-500 px-2.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#232733' }}>{channels.other.length}</span></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{channels.other.map((ch) => <ChCard key={ch.id} channel={ch} config={config} sport={sport} />)}</div></section>)}
                            {sportsTVChannels.length > 0 && (<section><div className="flex items-center gap-3 mb-4"><MdLiveTv size={18} className="text-blue-400" /><h2 className="text-white font-bold text-lg">Sports TV</h2><span className="text-xs text-gray-500 px-2.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#232733' }}>{sportsTVChannels.length}</span></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{sportsTVChannels.map((ch) => <ChCard key={ch.id} channel={ch} config={config} sport={sport} />)}</div></section>)}
                            {channels.all.length === 0 && sportsTVChannels.length === 0 && (<div className="rounded-xl p-12 text-center" style={{ backgroundColor: '#1a1d27' }}><SportIcon size={40} className="text-gray-600 mx-auto mb-4" /><p className="text-gray-400 font-medium">Tidak ada channel {config.nameId} saat ini</p><p className="text-gray-600 text-sm mt-1">Channel akan muncul saat ada event</p></div>)}
                        </>)}
                        <div className="mt-10 pt-8 space-y-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}><h2 className="text-lg font-semibold text-white">Nonton Streaming {config.name} Gratis</h2><p className="text-gray-500 text-sm leading-relaxed">{config.seoText} Kualitas HD tanpa buffering.</p></div>
                    </div>
                </div>
            </div>
            <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden" style={{ backgroundColor: '#0a0c14', borderTop: '1px solid rgba(255,255,255,0.06)' }}><div className="flex justify-around items-center py-2.5 px-1"><Link href="/" className="flex flex-col items-center px-3 py-1 text-gray-500 hover:text-emerald-400"><IoHome size={20} /><span className="text-[10px] mt-1">Beranda</span></Link><Link href="/football" className="flex flex-col items-center px-3 py-1 text-gray-500 hover:text-emerald-400"><MdSportsSoccer size={20} /><span className="text-[10px] mt-1">Sepakbola</span></Link><Link href="/basketball" className="flex flex-col items-center px-3 py-1 text-gray-500 hover:text-orange-400"><MdSportsBasketball size={20} /><span className="text-[10px] mt-1">NBA</span></Link><a href="https://t.me/sportmeriah" target="_blank" className="flex flex-col items-center px-3 py-1 text-gray-500 hover:text-blue-400"><FaTelegram size={20} /><span className="text-[10px] mt-1">Telegram</span></a></div></nav>
            <div className="h-20 md:hidden"></div>
        </main>
    );
}

function MatchCard({ channel, config, sport }) {
    const I = config.icon; const m = channel.match;
    return (<Link href={`/sports/${sport}/${channel.id}`}><div className="rounded-lg overflow-hidden cursor-pointer group border" style={{ backgroundColor: '#1a1d27', borderColor: 'rgba(255,255,255,0.04)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1e2130'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1a1d27'}><div className="flex justify-between items-center px-4 py-2 text-xs" style={{ backgroundColor: '#151720' }}><span className="font-medium flex items-center gap-1.5" style={{ color: config.accentHex }}><span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: config.accentHex }}></span><span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ backgroundColor: config.accentHex }}></span></span>Live</span><span className="text-gray-500 flex items-center gap-1.5"><I size={12} style={{ color: config.accentHex }} /> {channel.category || config.name}</span></div><div className="flex items-center justify-between px-4 py-3 gap-2"><div className="flex items-center gap-2.5 flex-1 min-w-0 justify-end"><span className="text-white text-sm font-medium truncate text-right">{m?.homeTeam || 'Team A'}</span><div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#232733' }}><I size={14} style={{ color: config.accentHex }} /></div></div><div className="flex-shrink-0 px-3"><span className="text-gray-600 text-xs font-bold tracking-widest">VS</span></div><div className="flex items-center gap-2.5 flex-1 min-w-0"><div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#232733' }}><I size={14} style={{ color: config.accentHex }} /></div><span className="text-white text-sm font-medium truncate">{m?.awayTeam || 'Team B'}</span></div><span className="text-white text-xs font-semibold px-3.5 py-1.5 rounded-md inline-flex items-center gap-1 flex-shrink-0 ml-3" style={{ backgroundColor: config.accentHex }}><MdPlayArrow size={14} /> Live</span></div></div></Link>);
}

function ChCard({ channel, config, sport }) {
    const I = config.icon;
    return (<Link href={`/sports/${sport}/${channel.id}`}><div className="rounded-lg overflow-hidden cursor-pointer group border border-transparent" style={{ backgroundColor: '#1a1d27' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1e2130'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1a1d27'}><div className="flex justify-between items-center px-4 py-2 text-xs" style={{ backgroundColor: '#151720' }}><span className="font-medium text-blue-400 flex items-center gap-1.5"><MdLiveTv size={12} /> {channel.type === 'tv_channel' ? 'Sports TV' : 'Channel'}</span><span className="text-gray-500 flex items-center gap-1.5"><I size={12} style={{ color: config.accentHex }} /> {channel.category || config.name}</span></div><div className="flex items-center justify-between px-4 py-3 gap-2"><div className="flex items-center gap-3 flex-1 min-w-0"><div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#232733' }}><I size={14} style={{ color: config.accentHex }} /></div><span className="text-white text-sm font-medium truncate">{channel.cleanName || channel.name || 'Channel'}</span></div><span className="text-white text-xs font-semibold px-3.5 py-1.5 rounded-md inline-flex items-center gap-1 flex-shrink-0" style={{ backgroundColor: config.accentHex }}><MdPlayArrow size={14} /> Tonton</span></div></div></Link>);
}

export { SPORT_CONFIGS };
