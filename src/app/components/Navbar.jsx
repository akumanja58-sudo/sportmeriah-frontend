'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

import {
    MdSportsSoccer, MdSportsBasketball, MdSportsTennis, MdSportsMotorsports,
    MdSportsMma, MdSportsHockey, MdSportsFootball, MdSportsBaseball,
    MdSportsRugby, MdSportsGolf, MdSportsCricket, MdSportsVolleyball,
    MdSportsHandball, MdSearch
} from 'react-icons/md';
import { GiShuttlecock } from 'react-icons/gi';
import { FaTrophy } from 'react-icons/fa';
import { HiChevronDown } from 'react-icons/hi2';

const CHIP_CATEGORIES = [
    { id: 'football', name: 'Sepakbola', icon: MdSportsSoccer, href: '/football' },
    { id: 'basketball', name: 'Basket', icon: MdSportsBasketball, href: '/basketball' },
    { id: 'tennis', name: 'Tennis', icon: MdSportsTennis, href: '/tennis' },
    { id: 'motorsport', name: 'Motor', icon: MdSportsMotorsports, href: '/motorsport' },
    { id: 'nhl', name: 'NHL', icon: MdSportsHockey, href: '/hockey' },
    { id: 'nfl', name: 'NFL', icon: MdSportsFootball, href: '/sports/nfl' },
    { id: 'mlb', name: 'MLB', icon: MdSportsBaseball, href: '/sports/mlb' },
    { id: 'ppv', name: 'UFC/Boxing', icon: MdSportsMma, href: '/sports/ppv' },
];

const ALL_CATEGORIES = [
    { id: 'football', name: 'Sepakbola', icon: MdSportsSoccer, href: '/football' },
    { id: 'basketball', name: 'Basketball', icon: MdSportsBasketball, href: '/basketball' },
    { id: 'tennis', name: 'Tennis', icon: MdSportsTennis, href: '/tennis' },
    { id: 'badminton', name: 'Badminton', icon: GiShuttlecock, href: '/badminton' },
    { id: 'motorsport', name: 'Motorsport', icon: MdSportsMotorsports, href: '/motorsport' },
    { id: 'ppv', name: 'UFC / Boxing / PPV', icon: MdSportsMma, href: '/sports/ppv' },
    { id: 'nhl', name: 'NHL / Hockey', icon: MdSportsHockey, href: '/hockey' },
    { id: 'nfl', name: 'NFL', icon: MdSportsFootball, href: '/sports/nfl' },
    { id: 'mlb', name: 'MLB / Baseball', icon: MdSportsBaseball, href: '/sports/mlb' },
    { id: 'rugby', name: 'Rugby', icon: MdSportsRugby, href: '/sports/rugby' },
    { id: 'golf', name: 'Golf', icon: MdSportsGolf, href: '/sports/golf' },
    { id: 'cricket', name: 'Cricket', icon: MdSportsCricket, href: '/sports/cricket' },
    { id: 'volleyball', name: 'Volleyball', icon: MdSportsVolleyball, href: '/sports/volleyball' },
    { id: 'handball', name: 'Handball', icon: MdSportsHandball, href: '/sports/handball' },
    { id: 'mls', name: 'MLS', icon: MdSportsSoccer, href: '/sports/mls' },
    { id: 'wnba', name: 'WNBA', icon: MdSportsBasketball, href: '/sports/wnba' },
    { id: 'ncaa_basketball', name: 'NCAA Basketball', icon: MdSportsBasketball, href: '/sports/ncaa_basketball' },
    { id: 'espn_plus', name: 'ESPN+ Events', icon: FaTrophy, href: '/sports/espn_plus' },
];

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const pathname = usePathname();

    const isCategoryActive = (href) => pathname === href || pathname.startsWith(href + '/');

    useEffect(() => {
        function handleClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="sticky top-0 z-50" style={{ backgroundColor: '#0a0c14' }}>

            {/* TOP BAR */}
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between h-14">
                        <Link href="/" className="flex-shrink-0">
                            <img src="https://i.gyazo.com/712643ab3b631188e6c4ac1b1227a898.png" alt="NobarMeriah" className="h-14" />
                        </Link>
                        <nav className="hidden md:flex items-center gap-5 ml-auto">
                            <a href="https://www.scoremeriah.com/" target="_blank" className="text-xs font-semibold uppercase tracking-wide text-gray-500 hover:text-gray-300 transition-colors">Live Skor</a>
                            <a href="https://www.scoremeriah.com/" className="text-xs font-semibold uppercase tracking-wide text-gray-500 hover:text-gray-300 transition-colors">Highlight</a>
                            <a href="#" className="text-xs font-semibold uppercase tracking-wide text-gray-500 hover:text-gray-300 transition-colors">Berita</a>
                        </nav>
                        <div className="flex items-center gap-4">
                            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-white">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {mobileMenuOpen
                                        ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />}
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* BOTTOM BAR */}
            <div className="hidden md:block">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center gap-3 h-12">

                        {/* Chips — overflow scroll, NO dropdown inside */}
                        <div className="flex-1 flex items-center gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                            {CHIP_CATEGORIES.map((cat) => {
                                const active = isCategoryActive(cat.href);
                                const Icon = cat.icon;
                                return (
                                    <Link key={cat.id} href={cat.href}
                                        className="flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-xs font-semibold flex-shrink-0 transition-all"
                                        style={{
                                            backgroundColor: active ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.04)',
                                            border: active ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.08)',
                                            color: active ? '#6ee7b7' : '#d1d5db',
                                        }}>
                                        <Icon size={15} />{cat.name}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Lainnya — OUTSIDE overflow container */}
                        <div ref={dropdownRef} style={{ position: 'relative', flexShrink: 0 }}>
                            <button type="button"
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-full whitespace-nowrap text-xs font-semibold cursor-pointer transition-all"
                                style={{
                                    backgroundColor: dropdownOpen ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
                                    border: dropdownOpen ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(255,255,255,0.08)',
                                    color: '#d1d5db',
                                }}>
                                Lainnya
                                <HiChevronDown size={12} style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                            </button>

                            <div style={{
                                display: dropdownOpen ? 'block' : 'none',
                                position: 'absolute',
                                top: '100%',
                                right: 0,
                                marginTop: 8,
                                zIndex: 9999,
                                backgroundColor: '#13151e',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 12,
                                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                                padding: '8px 0',
                                minWidth: 230,
                                maxHeight: 420,
                                overflowY: 'auto',
                            }}>
                                {ALL_CATEGORIES.map((cat) => {
                                    const Icon = cat.icon;
                                    const active = isCategoryActive(cat.href);
                                    return (
                                        <Link key={cat.id} href={cat.href}
                                            onClick={() => setDropdownOpen(false)}
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm"
                                            style={{
                                                color: active ? '#6ee7b7' : '#9ca3af',
                                                backgroundColor: active ? 'rgba(16,185,129,0.08)' : 'transparent',
                                                transition: 'background-color 0.15s',
                                            }}
                                            onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'; }}
                                            onMouseLeave={(e) => { if (!active) e.currentTarget.style.backgroundColor = 'transparent'; }}>
                                            <Icon size={15} style={{ opacity: 0.7 }} />{cat.name}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Search */}
                        <form className="flex-shrink-0 flex items-center rounded-full overflow-hidden"
                            style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                            onSubmit={(e) => e.preventDefault()}>
                            <MdSearch size={16} className="ml-3 text-gray-500" />
                            <input type="text" placeholder="Cari tim, liga..." className="bg-transparent text-gray-200 text-xs px-2.5 py-2 outline-none w-36 placeholder-gray-600" />
                        </form>
                    </div>
                </div>
            </div>

            {/* MOBILE MENU */}
            {mobileMenuOpen && (
                <div className="md:hidden overflow-y-auto max-h-[80vh]" style={{ backgroundColor: '#0a0c14' }}>
                    <div className="px-4 py-3 space-y-1">
                        <div className="mb-3">
                            <form className="flex items-center rounded-lg overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <MdSearch size={16} className="ml-3 text-gray-500" />
                                <input type="text" placeholder="Cari tim, liga, pertandingan..." className="bg-transparent text-gray-200 text-sm px-3 py-2.5 outline-none flex-1 placeholder-gray-600" />
                            </form>
                        </div>
                        <Link href="/" className="block px-3 py-2.5 text-gray-400 hover:text-white rounded-lg text-sm" onClick={() => setMobileMenuOpen(false)}>Live Olahraga</Link>
                        <Link href="/football" className="block px-3 py-2.5 text-gray-400 hover:text-white rounded-lg text-sm" onClick={() => setMobileMenuOpen(false)}>Live Sepakbola</Link>
                        <a href="https://www.scoremeriah.com/" target="_blank" className="block px-3 py-2.5 text-gray-400 hover:text-white rounded-lg text-sm">Live Skor</a>
                        <a href="#" className="block px-3 py-2.5 text-gray-400 hover:text-white rounded-lg text-sm">Highlight</a>
                        <a href="#" className="block px-3 py-2.5 text-gray-400 hover:text-white rounded-lg text-sm">Berita</a>
                        <div className="py-2"><div className="h-px" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} /></div>
                        <p className="text-gray-600 text-[10px] px-3 py-1 uppercase tracking-widest font-medium">Kategori Sport</p>
                        {ALL_CATEGORIES.map((cat) => {
                            const Icon = cat.icon;
                            const active = isCategoryActive(cat.href);
                            return (
                                <Link key={cat.id} href={cat.href}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm"
                                    style={{ color: active ? '#6ee7b7' : '#9ca3af', backgroundColor: active ? 'rgba(16,185,129,0.08)' : 'transparent' }}
                                    onClick={() => setMobileMenuOpen(false)}>
                                    <Icon size={16} style={{ opacity: 0.7 }} />{cat.name}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </header>
    );
}
