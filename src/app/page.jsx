'use client';
import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Link from 'next/link';
import { MdSportsSoccer, MdSportsBasketball, MdSportsTennis, MdSportsMotorsports, MdSportsMma, MdSportsHockey, MdSportsFootball, MdSportsBaseball, MdLiveTv, MdArrowForward, MdPlayArrow, MdTrendingUp } from 'react-icons/md';
import { IoHome } from 'react-icons/io5';
import { FaTelegram } from 'react-icons/fa';
import { HiSignal, HiClock, HiTrophy } from 'react-icons/hi2';

const API_URL = 'https://sportmeriah-backend-production.up.railway.app';
const BOHO_API = 'https://sport-meriah.com/debug.php';
const PRIORITY_LEAGUES_FOOTBALL = ['UEFA Champions League', 'UEFA Europa League', 'Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1', 'Eredivisie', 'Primeira Liga', 'Super Lig', 'Saudi Pro League', 'MLS', 'Liga 1', 'FA Cup', 'EFL Cup', 'Copa del Rey', 'Coppa Italia', 'DFB Pokal'];

function sortByPriority(matches, list) {
    return [...matches].sort((a, b) => {
        const pA = list.findIndex(l => (a.league?.name || '') === l);
        const pB = list.findIndex(l => (b.league?.name || '') === l);
        if (pA !== -1 && pB !== -1) return pA - pB;
        if (pA !== -1) return -1;
        if (pB !== -1) return 1;
        return new Date(a.date) - new Date(b.date);
    });
}

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

const SPORT_CATEGORIES = [
    { name: 'Sepakbola', icon: MdSportsSoccer, color: '#10b981', href: '/football' },
    { name: 'Basketball', icon: MdSportsBasketball, color: '#f97316', href: '/basketball' },
    { name: 'NHL Hockey', icon: MdSportsHockey, color: '#60a5fa', href: '/hockey' },
    { name: 'MLB Baseball', icon: MdSportsBaseball, color: '#f87171', href: '/baseball' },
    { name: 'NFL', icon: MdSportsFootball, color: '#4ade80', href: '/nfl' },
    { name: 'Tennis', icon: MdSportsTennis, color: '#eab308', href: '/tennis' },
    { name: 'Motorsport', icon: MdSportsMotorsports, color: '#ef4444', href: '/motorsport' },
    { name: 'UFC / Boxing', icon: MdSportsMma, color: '#fb7185', href: '/sports/ppv' },
];

// BOHOSport sport mapping to NobarMeriah routes
const BOHO_SPORT_MAP = {
    football: { route: '/football/boho', icon: MdSportsSoccer, color: '#10b981', label: 'Sepakbola', sectionKey: 'football' },
    basketball: { route: '/basketball/boho', icon: MdSportsBasketball, color: '#f97316', label: 'Basketball', sectionKey: 'basketball' },
    hockey: { route: '/hockey', icon: MdSportsHockey, color: '#60a5fa', label: 'NHL / Ice Hockey', sectionKey: 'hockey' },
    baseball: { route: '/baseball', icon: MdSportsBaseball, color: '#f87171', label: 'MLB / Baseball', sectionKey: 'baseball' },
    tennis: { route: '/tennis', icon: MdSportsTennis, color: '#eab308', label: 'Tennis', sectionKey: 'tennis' },
    motorsport: { route: '/motorsport', icon: MdSportsMotorsports, color: '#ef4444', label: 'Motorsport', sectionKey: 'motorsport' },
    fight: { route: '/sports/ppv', icon: MdSportsMma, color: '#fb7185', label: 'UFC / Boxing', sectionKey: 'fight' },
    cricket: { route: '/football/boho', icon: MdSportsSoccer, color: '#10b981', label: 'Cricket', sectionKey: 'cricket' },
    rugby: { route: '/football/boho', icon: MdSportsFootball, color: '#4ade80', label: 'Rugby', sectionKey: 'rugby' },
    afl: { route: '/football/boho', icon: MdSportsFootball, color: '#4ade80', label: 'AFL', sectionKey: 'afl' },
    other: { route: '/football/boho', icon: MdLiveTv, color: '#9ca3af', label: 'Lainnya', sectionKey: 'other' },
};

function formatTime(d) { if (!d) return '-'; const dt = new Date(d); return `${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')} WIB`; }
function formatBohoTime(ts) { if (!ts || ts === 0) return 'LIVE 24/7'; const dt = new Date(ts); return `${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')} WIB`; }

function normalizeTeam(name) {
    if (!name) return '';
    return name.toLowerCase().replace(/fc|cf|sc|ac|as|ss|us|rc|cd|ud|rcd|ca|se|sv|vfb|vfl|tsg|rb|bsc|fk|sk|nk|gfc|bc/gi, '').trim().split(' ').pop() || '';
}

function isDuplicateBoho(bohoMatch, sphereMatches) {
    const bohoTitle = (bohoMatch.title || '').toLowerCase();
    return sphereMatches.some(sm => {
        const homeNorm = normalizeTeam(sm.homeTeam?.name);
        const awayNorm = normalizeTeam(sm.awayTeam?.name);
        if (!homeNorm || !awayNorm) return false;
        return bohoTitle.includes(homeNorm) && bohoTitle.includes(awayNorm);
    });
}

const BOHO_SPORT_LABELS = {
    football: 'Sepakbola',
    basketball: 'Basketball',
    hockey: 'Ice Hockey',
    baseball: 'Baseball',
    tennis: 'Tennis',
    motorsport: 'Motorsport',
    fight: 'UFC / Boxing',
    cricket: 'Cricket',
    rugby: 'Rugby',
    afl: 'AFL',
    other: 'Lainnya',
};

export default function Home() {
    const [fb, setFb] = useState({ live: [], upcoming: [] });
    const [bb, setBb] = useState({ live: [], upcoming: [] });
    const [hk, setHk] = useState({ live: [], upcoming: [] });
    const [bs, setBs] = useState({ live: [], upcoming: [] });
    const [nf, setNf] = useState({ live: [], upcoming: [] });
    const [bohoLive, setBohoLive] = useState([]);
    const [bohoUpcoming, setBohoUpcoming] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchAll(); const i = setInterval(fetchAll, 60000); return () => clearInterval(i); }, []);

    const fetchAll = async () => {
        try {
            const [r1, r2, r3, r4, r5, bohoResult] = await Promise.allSettled([
                fetch(`${API_URL}/api/football`).catch(() => ({ ok: false })),
                fetch(`${API_URL}/api/basketball`).catch(() => ({ ok: false })),
                fetch(`${API_URL}/api/hockey`).catch(() => ({ ok: false })),
                fetch(`${API_URL}/api/baseball`).catch(() => ({ ok: false })),
                fetch(`${API_URL}/api/nfl`).catch(() => ({ ok: false })),
                fetchBohoAllSports(),
            ]);

            const parse = async (r, setter, sort) => {
                const res = r.status === 'fulfilled' ? r.value : { ok: false };
                if (res.ok) { const d = await res.json(); if (d.success && d.matches) { const l = (d.matches.live || []).filter(m => m.hasStream || m.stream?.id); const u = (d.matches.upcoming || []).filter(m => m.hasStream || m.stream?.id); setter({ live: sort ? sortByPriority(l, sort) : l, upcoming: sort ? sortByPriority(u, sort) : u }); } }
            };

            await Promise.all([
                parse(r1, setFb, PRIORITY_LEAGUES_FOOTBALL),
                parse(r2, setBb, null),
                parse(r3, setHk, null),
                parse(r4, setBs, null),
                parse(r5, setNf, null),
            ]);

            // Process BOHOSport data
            if (bohoResult.status === 'fulfilled' && bohoResult.value) {
                const boho = bohoResult.value;

                // Collect all Sphere matches for dedup
                const allSphere = [];
                [r1, r2, r3, r4, r5].forEach(async (r) => {
                    if (r.status === 'fulfilled' && r.value?.ok) {
                        try {
                            const d = await r.value.clone().json();
                            if (d.success && d.matches) {
                                allSphere.push(...(d.matches.live || []), ...(d.matches.upcoming || []));
                            }
                        } catch (e) { }
                    }
                });

                // Wait a tick for sphere parsing
                setTimeout(() => {
                    const filteredLive = boho.live.filter(bm => !isDuplicateBoho(bm, allSphere));
                    const filteredUpcoming = {};
                    Object.keys(boho.upcoming).forEach(sport => {
                        filteredUpcoming[sport] = boho.upcoming[sport].filter(bm => !isDuplicateBoho(bm, allSphere));
                    });
                    setBohoLive(filteredLive);
                    setBohoUpcoming(filteredUpcoming);
                }, 100);
            }
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const fetchBohoAllSports = async () => {
        const sports = ['football', 'basketball', 'tennis', 'hockey', 'baseball', 'afl', 'fight', 'motorsport', 'cricket', 'rugby'];
        const now = Date.now();
        const threeHoursAgo = now - (3 * 60 * 60 * 1000);
        const allLive = [];
        const allUpcoming = {};

        const results = await Promise.allSettled(
            sports.map(s => fetch(`${BOHO_API}?action=matches&sport=${s}`).then(r => r.json()).then(d => ({ sport: s, data: d?.data || [] })))
        );

        results.forEach(r => {
            if (r.status !== 'fulfilled') return;
            const { sport, data } = r.value;
            const sportConf = BOHO_SPORT_MAP[sport];
            if (!sportConf) return;

            data.forEach(match => {
                const time = match.date || 0;
                const enriched = { ...match, _bohoSport: sport, _sportConf: sportConf };
                if (time === 0 || (time > threeHoursAgo && time <= now)) {
                    allLive.push(enriched);
                } else if (time > now) {
                    if (!allUpcoming[sport]) allUpcoming[sport] = [];
                    allUpcoming[sport].push(enriched);
                }
            });
        });

        // Sort upcoming by time and limit
        Object.keys(allUpcoming).forEach(sport => {
            allUpcoming[sport].sort((a, b) => (a.date || 0) - (b.date || 0));
            allUpcoming[sport] = allUpcoming[sport].slice(0, 10);
        });

        return { live: allLive, upcoming: allUpcoming };
    };

    const allLive = [
        ...fb.live.map(m => ({ ...m, sport: 'football', SI: MdSportsSoccer, SC: '#10b981' })),
        ...bb.live.map(m => ({ ...m, sport: 'basketball', SI: MdSportsBasketball, SC: '#f97316' })),
        ...hk.live.map(m => ({ ...m, sport: 'hockey', SI: MdSportsHockey, SC: '#60a5fa' })),
        ...bs.live.map(m => ({ ...m, sport: 'baseball', SI: MdSportsBaseball, SC: '#f87171' })),
        ...nf.live.map(m => ({ ...m, sport: 'nfl', SI: MdSportsFootball, SC: '#4ade80' })),
        ...bohoLive.map(m => {
            const conf = m._sportConf || BOHO_SPORT_MAP[m._bohoSport] || BOHO_SPORT_MAP.other;
            return { ...m, sport: m._bohoSport, SI: conf.icon, SC: conf.color, _isBoho: true };
        }),
    ];

    // Count boho upcoming
    const bohoUpTotal = Object.values(bohoUpcoming).reduce((sum, arr) => sum + arr.length, 0);
    const totalUp = fb.upcoming.length + bb.upcoming.length + hk.upcoming.length + bs.upcoming.length + nf.upcoming.length + bohoUpTotal;

    const sections = [
        { k: 'football', t: 'Sepakbola', I: MdSportsSoccer, ic: '#10b981', lc: 'text-emerald-400', h: '/football', d: fb.upcoming },
        { k: 'basketball', t: 'Basketball (NBA)', I: MdSportsBasketball, ic: '#f97316', lc: 'text-orange-400', h: '/basketball', d: bb.upcoming },
        { k: 'hockey', t: 'NHL / Ice Hockey', I: MdSportsHockey, ic: '#60a5fa', lc: 'text-blue-400', h: '/hockey', d: hk.upcoming },
        { k: 'baseball', t: 'MLB / Baseball', I: MdSportsBaseball, ic: '#f87171', lc: 'text-red-400', h: '/baseball', d: bs.upcoming },
        { k: 'nfl', t: 'NFL', I: MdSportsFootball, ic: '#4ade80', lc: 'text-green-400', h: '/nfl', d: nf.upcoming },
    ];

    // Build BOHOSport upcoming sections
    const bohoSections = Object.keys(bohoUpcoming).filter(sport => bohoUpcoming[sport].length > 0).map(sport => {
        const conf = BOHO_SPORT_MAP[sport] || BOHO_SPORT_MAP.other;
        return { k: `boho-${sport}`, t: conf.label, I: conf.icon, ic: conf.color, lc: `text-gray-400`, h: conf.route.split('/boho')[0] || '/football', d: bohoUpcoming[sport], isBoho: true, bohoSport: sport };
    });

    return (
        <main className="min-h-screen" style={{ backgroundColor: '#0a0c14' }}>
            <Navbar />
            <div className="container max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    <aside className="w-full lg:w-72 order-2 lg:order-1 flex-shrink-0">
                        <div className="sticky top-32 space-y-6">
                            <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#1a1d27' }}>
                                <div className="p-5"><div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-3 rounded-lg" style={{ backgroundColor: '#232733' }}><div className="flex items-center justify-center gap-1.5 mb-1"><HiSignal className="text-red-400" size={14} /><span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Live</span></div><p className="text-2xl font-bold text-white">{allLive.length}</p></div>
                                    <div className="text-center p-3 rounded-lg" style={{ backgroundColor: '#232733' }}><div className="flex items-center justify-center gap-1.5 mb-1"><HiClock className="text-emerald-400" size={14} /><span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Upcoming</span></div><p className="text-2xl font-bold text-white">{totalUp}</p></div>
                                </div></div>
                            </div>
                            <div className="rounded-xl p-5" style={{ backgroundColor: '#1a1d27' }}>
                                <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2 uppercase tracking-wider"><HiTrophy className="text-amber-400" size={16} /> Liga Populer</h3>
                                <ul className="space-y-0.5">{LIGA_LIST.map((l, i) => (<li key={i}><Link href={`/${l.slug}`} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white text-sm" onMouseEnter={e => e.currentTarget.style.backgroundColor = '#232733'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}><img src={l.logo} alt={l.name} className="w-5 h-5 object-contain" onError={e => e.target.src = 'https://placehold.co/20x20/374151/E5E7EB?text=L'} /><span>{l.name}</span></Link></li>))}</ul>
                            </div>
                            <div className="rounded-xl p-5" style={{ backgroundColor: '#1a1d27' }}>
                                <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2 uppercase tracking-wider"><MdTrendingUp className="text-emerald-400" size={16} /> Kategori Sport</h3>
                                <ul className="space-y-0.5">{SPORT_CATEGORIES.map((s, i) => { const Icon = s.icon; return (<li key={i}><Link href={s.href} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white text-sm" onMouseEnter={e => e.currentTarget.style.backgroundColor = '#232733'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}><Icon size={16} style={{ color: s.color }} /><span>{s.name}</span></Link></li>); })}</ul>
                            </div>
                        </div>
                    </aside>
                    <div className="flex-1 order-1 lg:order-2 space-y-6">
                        {loading ? (
                            <div className="rounded-xl p-12 text-center" style={{ backgroundColor: '#1a1d27' }}><div className="flex justify-center mb-4"><span className="loader"></span></div><p className="text-gray-500 text-sm">Memuat jadwal pertandingan...</p><style>{`.loader{width:40px;height:40px;border-radius:50%;display:inline-block;border-top:3px solid #fff;border-right:3px solid transparent;box-sizing:border-box;animation:rot 1s linear infinite;position:relative}.loader::after{content:'';box-sizing:border-box;position:absolute;left:0;top:0;width:40px;height:40px;border-radius:50%;border-left:3px solid #10b981;border-bottom:3px solid transparent;animation:rot .5s linear infinite reverse}@keyframes rot{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style></div>
                        ) : (<>
                            {/* ALL LIVE */}
                            {allLive.length > 0 && (<section><div className="flex items-center gap-3 mb-4"><span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span></span><h2 className="text-white font-semibold text-lg">Sedang Tayang</h2><span className="text-xs text-gray-500 font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: '#232733' }}>{allLive.length}</span></div><div className="space-y-2">{allLive.map((m, i) => (
                                m._isBoho
                                    ? <BohoMC key={`live-boho-${m.id || i}`} match={m} isLive={true} />
                                    : <MC key={`live-${m.sport}-${m.id || i}`} match={m} isLive={true} sport={m.sport} SI={m.SI} SC={m.SC} />
                            ))}</div></section>)}

                            {/* SPHERE UPCOMING SECTIONS */}
                            {sections.map(s => (s.d.length > 0 && (<section key={s.k}><div className="flex items-center justify-between mb-4"><div className="flex items-center gap-3"><s.I size={20} style={{ color: s.ic }} /><h2 className="text-white font-semibold text-lg">{s.t}</h2><span className="text-gray-500 text-sm font-normal">— Upcoming</span><span className="text-xs text-gray-500 font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: '#232733' }}>{s.d.length}</span></div><Link href={s.h} className={`${s.lc} hover:opacity-80 text-sm font-medium flex items-center gap-1`}>Lihat Semua <MdArrowForward size={14} /></Link></div><div className="space-y-2">{s.d.slice(0, 10).map((m, i) => (<MC key={`up-${s.k}-${m.id || i}`} match={m} isLive={false} sport={s.k} SI={s.I} SC={s.ic} />))}</div>{s.d.length > 10 && (<Link href={s.h} className={`flex items-center justify-center gap-2 mt-3 py-2.5 rounded-lg ${s.lc} text-sm font-medium`} style={{ backgroundColor: '#1a1d27' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#232733'} onMouseLeave={e => e.currentTarget.style.backgroundColor = '#1a1d27'}>Lihat {s.d.length - 10} lainnya <MdArrowForward size={16} /></Link>)}</section>)))}

                            {/* BOHOSPORT UPCOMING SECTIONS */}
                            {bohoSections.map(s => (<section key={s.k}><div className="flex items-center justify-between mb-4"><div className="flex items-center gap-3"><s.I size={20} style={{ color: s.ic }} /><h2 className="text-white font-semibold text-lg">{s.t}</h2><span className="text-gray-500 text-sm font-normal">— Upcoming</span><span className="text-xs text-emerald-400 px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: 'rgba(16,185,129,0.1)' }}>Multi Server</span><span className="text-xs text-gray-500 font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: '#232733' }}>{s.d.length}</span></div></div><div className="space-y-2">{s.d.slice(0, 10).map((m, i) => (<BohoMC key={`boho-up-${s.k}-${m.id || i}`} match={m} isLive={false} />))}</div></section>))}

                            {allLive.length === 0 && totalUp === 0 && (<div className="rounded-xl p-12 text-center" style={{ backgroundColor: '#1a1d27' }}><MdLiveTv size={48} className="text-gray-600 mx-auto mb-4" /><p className="text-gray-400 font-medium">Tidak ada pertandingan tersedia saat ini</p><p className="text-gray-600 text-sm mt-1">Pertandingan akan muncul saat ada event</p></div>)}
                        </>)}
                        <div className="mt-10 pt-8 space-y-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}><h2 className="text-lg font-semibold text-white">Nonton Streaming Sport Gratis di NobarMeriah</h2><p className="text-gray-500 text-sm leading-relaxed">Platform streaming olahraga terlengkap di Indonesia. Kualitas HD, server tercepat, dan update real-time untuk sepakbola, basketball NBA, NHL, MLB, NFL, tennis, dan 14+ cabang olahraga lainnya.</p></div>
                    </div>
                </div>
            </div>
            <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden" style={{ backgroundColor: '#0a0c14', borderTop: '1px solid rgba(255,255,255,0.06)' }}><div className="flex justify-around items-center py-2.5 px-1"><Link href="/" className="flex flex-col items-center px-3 py-1 text-emerald-400"><IoHome size={20} /><span className="text-[10px] mt-1 font-medium">Beranda</span></Link><Link href="/football" className="flex flex-col items-center px-3 py-1 text-gray-500 hover:text-emerald-400"><MdSportsSoccer size={20} /><span className="text-[10px] mt-1">Sepakbola</span></Link><Link href="/basketball" className="flex flex-col items-center px-3 py-1 text-gray-500 hover:text-orange-400"><MdSportsBasketball size={20} /><span className="text-[10px] mt-1">NBA</span></Link><a href="https://t.me/sportmeriah" target="_blank" className="flex flex-col items-center px-3 py-1 text-gray-500 hover:text-blue-400"><FaTelegram size={20} /><span className="text-[10px] mt-1">Telegram</span></a></div></nav>
            <div className="h-20 md:hidden"></div>
        </main>
    );
}

// ========== SPHERE MATCH CARD ==========
function MC({ match, isLive, sport, SI, SC }) {
    const { homeTeam, awayTeam, league, score, stream, date, elapsed, id } = match;
    let url = '#';
    if (sport === 'football') url = `/football/${id}?stream=${stream?.id}&provider=${stream?.provider || 'sphere'}`;
    else if (sport === 'basketball') url = `/basketball/${stream?.id}?provider=${stream?.provider || 'sphere'}`;
    else if (sport === 'hockey') url = `/hockey/${stream?.id}?fixture=${id}`;
    else if (sport === 'baseball') url = `/baseball/${stream?.id}?fixture=${id}`;
    else if (sport === 'nfl') url = `/nfl/${stream?.id}?fixture=${id}`;

    const status = () => { if (elapsed) return `${elapsed}'`; if (match.quarter && match.timer) return `${match.quarter} ${match.timer}'`; if (match.quarter) return match.quarter; if (match.status?.long && match.status.long !== 'Not Started') return match.status.long; return 'LIVE'; };

    return (
        <Link href={url}><div className="rounded-lg overflow-hidden cursor-pointer group border" style={{ backgroundColor: '#1a1d27', borderColor: isLive ? `${SC}33` : 'transparent' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1e2130'} onMouseLeave={e => e.currentTarget.style.backgroundColor = '#1a1d27'}>
            <div className="flex justify-between items-center px-4 py-2 text-xs" style={{ backgroundColor: '#151720' }}>
                <span className={`font-medium flex items-center gap-1.5 ${isLive ? 'text-red-400' : 'text-gray-500'}`}>{isLive ? (<><span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span></span>{status()}</>) : (<><HiClock size={12} /> {formatTime(date)}</>)}</span>
                <span className="text-gray-400 truncate max-w-[180px] flex items-center gap-1.5 font-semibold uppercase text-[11px] tracking-wide">{SI && <SI size={13} style={{ color: SC }} />}{league?.name || sport?.toUpperCase()}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3 gap-2">
                <div className="flex items-center gap-2.5 flex-1 min-w-0 justify-end"><span className="text-white text-sm font-medium truncate text-right">{homeTeam?.name || 'Home'}</span><img src={homeTeam?.logo} alt="" className="w-7 h-7 object-contain flex-shrink-0" onError={e => e.target.src = 'https://placehold.co/28x28/232733/6b7280?text=T'} /></div>
                <div className="flex-shrink-0 px-3 min-w-[52px] text-center">{isLive && score?.home !== null ? <span className="text-white text-base font-bold tracking-wide">{score?.home ?? 0} — {score?.away ?? 0}</span> : <span className="text-gray-600 text-xs font-bold tracking-widest">VS</span>}</div>
                <div className="flex items-center gap-2.5 flex-1 min-w-0"><img src={awayTeam?.logo} alt="" className="w-7 h-7 object-contain flex-shrink-0" onError={e => e.target.src = 'https://placehold.co/28x28/232733/6b7280?text=T'} /><span className="text-white text-sm font-medium truncate">{awayTeam?.name || 'Away'}</span></div>
                <div className="flex-shrink-0 ml-3"><span className="text-white text-xs font-semibold px-3.5 py-1.5 rounded-md inline-flex items-center gap-1" style={{ backgroundColor: isLive ? '#dc2626' : SC }}><MdPlayArrow size={14} /> {isLive ? 'Live' : 'Tonton'}</span></div>
            </div>
        </div></Link>
    );
}

// ========== BOHOSPORT MATCH CARD ==========
function BohoMC({ match, isLive }) {
    const conf = match._sportConf || BOHO_SPORT_MAP[match._bohoSport] || BOHO_SPORT_MAP.other;
    const SI = conf.icon;
    const SC = conf.color;
    const sport = match._bohoSport || 'football';

    const homeName = match.teams?.home?.name || match.title?.split(' vs ')[0] || 'Home';
    const awayName = match.teams?.away?.name || match.title?.split(' vs ')[1] || 'Away';
    const homeBadge = match.teams?.home?.badge || '';
    const awayBadge = match.teams?.away?.badge || '';

    // Route to appropriate boho player page
    let url = `/football/boho/${match.id}?sport=${sport}`;
    if (sport === 'basketball') url = `/basketball/boho/${match.id}?sport=${sport}`;

    return (
        <Link href={url}><div className="rounded-lg overflow-hidden cursor-pointer group border" style={{ backgroundColor: '#1a1d27', borderColor: isLive ? `${SC}33` : 'transparent' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1e2130'} onMouseLeave={e => e.currentTarget.style.backgroundColor = '#1a1d27'}>
            <div className="flex justify-between items-center px-4 py-2 text-xs" style={{ backgroundColor: '#151720' }}>
                <span className={`font-medium flex items-center gap-1.5 ${isLive ? 'text-red-400' : 'text-gray-500'}`}>{isLive ? (<><span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span></span>LIVE</>) : (<><HiClock size={12} /> {formatBohoTime(match.date)}</>)}</span>
                <span className="text-gray-400 truncate max-w-[180px] flex items-center gap-1.5 font-semibold uppercase text-[11px] tracking-wide"><SI size={13} style={{ color: SC }} />{BOHO_SPORT_LABELS[sport] || match.category || sport}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3 gap-2">
                <div className="flex items-center gap-2.5 flex-1 min-w-0 justify-end">
                    <span className="text-white text-sm font-medium truncate text-right">{homeName}</span>
                    {homeBadge ? <img src={homeBadge} alt="" className="w-7 h-7 object-contain flex-shrink-0" onError={e => e.target.src = 'https://placehold.co/28x28/232733/6b7280?text=T'} /> : <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#232733' }}><SI size={14} style={{ color: SC }} /></div>}
                </div>
                <div className="flex-shrink-0 px-3 min-w-[52px] text-center"><span className="text-gray-600 text-xs font-bold tracking-widest">VS</span></div>
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    {awayBadge ? <img src={awayBadge} alt="" className="w-7 h-7 object-contain flex-shrink-0" onError={e => e.target.src = 'https://placehold.co/28x28/232733/6b7280?text=T'} /> : <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#232733' }}><SI size={14} style={{ color: SC }} /></div>}
                    <span className="text-white text-sm font-medium truncate">{awayName}</span>
                </div>
                <div className="flex-shrink-0 ml-3"><span className="text-white text-xs font-semibold px-3.5 py-1.5 rounded-md inline-flex items-center gap-1" style={{ backgroundColor: isLive ? '#dc2626' : SC }}><MdPlayArrow size={14} /> {isLive ? 'Live' : 'Tonton'}</span></div>
            </div>
        </div></Link>
    );
}
