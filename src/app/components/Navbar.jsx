'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

// React Icons - Material Design & Font Awesome
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
    MdSportsCricket,
    MdSchedule,
    MdMoreHoriz
} from 'react-icons/md';
import { GiShuttlecock, GiPoolTriangle, GiDart } from 'react-icons/gi';
import { IoCalendarOutline } from 'react-icons/io5';
import { BiCategory } from 'react-icons/bi';
import { FaTrophy } from 'react-icons/fa';

// Kategori untuk navbar dengan react-icons
const NAV_CATEGORIES = [
    { id: 'football', name: 'Sepakbola', icon: MdSportsSoccer, color: '#22c55e' },
    { id: 'basketball', name: 'Basket', icon: MdSportsBasketball, color: '#f97316' },
    { id: 'tennis', name: 'Tenis', icon: MdSportsTennis, color: '#eab308' },
    { id: 'badminton', name: 'Bulu Tangkis', icon: GiShuttlecock, color: '#3b82f6' },
    { id: 'motorsport', name: 'MotoGP', icon: MdSportsMotorsports, color: '#ef4444' },
];

// Semua kategori untuk dropdown
const ALL_CATEGORIES = [
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
    { id: 'afl', name: 'AFL', icon: MdSportsRugby, color: '#7c3aed' },
    { id: 'other', name: 'Lainnya', icon: FaTrophy, color: '#f59e0b' },
];

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const pathname = usePathname();

    const isActive = (path) => pathname === path;
    const isCategoryActive = (catId) => pathname === `/${catId}` || pathname.startsWith(`/${catId}/`);

    return (
        <>
            {/* ========== HEADER TOP (Logo + Main Menu) ========== */}
            <header
                className="sticky top-0 z-50 shadow-lg"
                style={{ backgroundColor: '#1a1a2e' }}
            >
                <div className="container max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between h-14">

                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2">
                            <img
                                src="https://inigambarku.site/images/2026/01/20/4984651061651065165566.png"
                                alt="SportMeriah"
                                className="h-14"
                            />
                        </Link>

                        {/* Desktop Menu */}
                        <nav className="hidden md:flex items-center gap-1">
                            <Link
                                href="/"
                                className={`text-xs font-semibold px-3 py-2 uppercase tracking-wide transition-colors ${isActive('/') ? 'text-green-500' : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                Live Olahraga
                            </Link>
                            <Link
                                href="/football"
                                className={`text-xs font-semibold px-3 py-2 uppercase tracking-wide transition-colors ${pathname.includes('/football') ? 'text-green-500' : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                Live Sepakbola
                            </Link>
                            <a
                                href="https://www.nobarmeriah.com/"
                                target="_blank"
                                className="text-xs font-semibold px-3 py-2 uppercase tracking-wide text-gray-400 hover:text-white transition-colors"
                            >
                                Live Skor
                            </a>
                            <a href="#" className="text-xs font-semibold px-3 py-2 uppercase tracking-wide text-gray-400 hover:text-white transition-colors">
                                Highlight
                            </a>
                            <a href="#" className="text-xs font-semibold px-3 py-2 uppercase tracking-wide text-gray-400 hover:text-white transition-colors">
                                Berita
                            </a>
                        </nav>

                        {/* Language Switcher (Desktop) */}
                        <div className="hidden md:flex items-center gap-2">
                            <span className="text-green-500 font-semibold text-sm cursor-pointer">ID</span>
                            <span className="text-gray-500 text-sm">|</span>
                            <span className="text-gray-400 text-sm cursor-pointer hover:text-white">EN</span>
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {mobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden px-4 py-3" style={{ backgroundColor: '#1a1a2e' }}>
                        <Link href="/" className="block px-4 py-3 text-gray-300 hover:text-green-500 hover:bg-gray-800 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                            🏠 Live Olahraga
                        </Link>
                        <Link href="/football" className="block px-4 py-3 text-gray-300 hover:text-green-500 hover:bg-gray-800 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                            ⚽ Live Sepakbola
                        </Link>
                        <a href="https://www.nobarmeriah.com/" target="_blank" className="block px-4 py-3 text-gray-300 hover:text-green-500 hover:bg-gray-800 rounded-lg">
                            📊 Live Skor
                        </a>
                        <a href="#" className="block px-4 py-3 text-gray-300 hover:text-green-500 hover:bg-gray-800 rounded-lg">🎬 Highlight</a>
                        <a href="#" className="block px-4 py-3 text-gray-300 hover:text-green-500 hover:bg-gray-800 rounded-lg">📰 Berita</a>

                        <hr className="border-gray-700 my-2" />
                        <p className="text-gray-500 text-xs px-4 py-2">KATEGORI SPORT</p>

                        {ALL_CATEGORIES.map((cat) => {
                            const IconComponent = cat.icon;
                            return (
                                <Link
                                    key={cat.id}
                                    href={`/${cat.id}`}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isCategoryActive(cat.id)
                                            ? 'text-green-500 bg-green-500/10'
                                            : 'text-gray-300 hover:text-green-500 hover:bg-gray-800'
                                        }`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <IconComponent
                                        size={18}
                                        style={{ color: isCategoryActive(cat.id) ? '#22c55e' : cat.color }}
                                    />
                                    <span>{cat.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </header>

            {/* ========== HEADER BOTTOM (Category Bar + Search) ========== */}
            <div
                className="hidden md:block sticky top-14 z-40 border-t border-gray-700"
                style={{ backgroundColor: '#252540' }}
            >
                <div className="container max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between h-12">

                        {/* Category Links */}
                        <div className="flex items-center gap-1">
                            {NAV_CATEGORIES.map((cat) => {
                                const IconComponent = cat.icon;
                                return (
                                    <Link
                                        key={cat.id}
                                        href={`/${cat.id}`}
                                        className={`flex items-center gap-2 text-sm px-4 py-2 whitespace-nowrap transition-colors ${isCategoryActive(cat.id)
                                                ? 'text-green-500'
                                                : 'text-gray-300 hover:text-green-500'
                                            }`}
                                    >
                                        <IconComponent
                                            size={18}
                                            style={{ color: isCategoryActive(cat.id) ? '#22c55e' : cat.color }}
                                        />
                                        <span>{cat.name}</span>
                                    </Link>
                                );
                            })}

                            {/* Dropdown Selengkapnya */}
                            <div className="relative">
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center gap-2 text-sm px-4 py-2 text-gray-300 hover:text-green-500 transition-colors cursor-pointer"
                                >
                                    <BiCategory size={18} style={{ color: '#a855f7' }} />
                                    <span>Selengkapnya</span>
                                    <svg
                                        className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {dropdownOpen && (
                                    <>
                                        {/* Overlay to close dropdown */}
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setDropdownOpen(false)}
                                        />

                                        {/* Dropdown Menu */}
                                        <div
                                            className="absolute top-full left-0 mt-1 z-50 rounded-lg shadow-xl border border-gray-600 min-w-[220px] max-h-[400px] overflow-y-auto py-2"
                                            style={{ backgroundColor: '#1a1a2e' }}
                                        >
                                            {ALL_CATEGORIES.map((cat) => {
                                                const IconComponent = cat.icon;
                                                return (
                                                    <Link
                                                        key={cat.id}
                                                        href={`/${cat.id}`}
                                                        className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${isCategoryActive(cat.id)
                                                                ? 'text-green-500 bg-green-500/10'
                                                                : 'text-gray-300 hover:text-green-500 hover:bg-gray-700'
                                                            }`}
                                                        onClick={() => setDropdownOpen(false)}
                                                    >
                                                        <IconComponent
                                                            size={18}
                                                            style={{ color: isCategoryActive(cat.id) ? '#22c55e' : cat.color }}
                                                        />
                                                        <span>{cat.name}</span>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Jadwal */}
                            <Link
                                href="/jadwal"
                                className={`flex items-center gap-2 text-sm px-4 py-2 whitespace-nowrap transition-colors ${isActive('/jadwal')
                                        ? 'text-green-500'
                                        : 'text-gray-300 hover:text-green-500'
                                    }`}
                            >
                                <IoCalendarOutline
                                    size={18}
                                    style={{ color: isActive('/jadwal') ? '#22c55e' : '#60a5fa' }}
                                />
                                <span>Jadwal</span>
                            </Link>
                        </div>

                        {/* Search Bar */}
                        <div className="hidden sm:flex items-center">
                            <form className="flex">
                                <input
                                    type="text"
                                    placeholder="Cari..."
                                    className="bg-gray-600 border-none text-gray-200 text-sm px-4 py-2 rounded-l-md outline-none w-36 focus:bg-gray-500 placeholder-gray-400"
                                    style={{ backgroundColor: '#3a3a5c' }}
                                />
                                <button
                                    type="submit"
                                    className="bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-r-md transition-colors"
                                >
                                    Cari
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
