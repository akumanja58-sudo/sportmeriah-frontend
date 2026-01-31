'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Hls from 'hls.js';

import { FaTelegram, FaWhatsapp, FaFacebook, FaTwitter, FaCopy, FaCheck } from 'react-icons/fa';
import { IoHome } from 'react-icons/io5';
import { MdSportsSoccer, MdSportsBasketball, MdPlayArrow, MdRefresh, MdShare, MdFullscreen, MdVolumeUp, MdVolumeOff } from 'react-icons/md';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://sportmeriah-backend-production.up.railway.app';

const BANNERS = [
  { id: 1, src: 'https://inigambarku.site/images/2026/01/20/GIFMERIAH4D965a1f7cfb6a4aac.gif', link: '#' },
  { id: 2, src: 'https://inigambarku.site/images/2026/01/20/promo-pesiarbet.gif', link: '#' },
  { id: 3, src: 'https://inigambarku.site/images/2026/01/20/promo-girang4d.gif', link: '#' },
];

export default function BasketballPlayerClient({ streamId }) {
  const [matchData, setMatchData] = useState(null);
  const [streamInfo, setStreamInfo] = useState(null);
  const [relatedMatches, setRelatedMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [matchStatus, setMatchStatus] = useState('scheduled');

  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const countdownRef = useRef(null);

  useEffect(() => {
    fetchStreamInfo();
    fetchRelatedMatches();
    return () => {
      if (hlsRef.current) hlsRef.current.destroy();
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [streamId]);

  const fetchStreamInfo = async () => {
    try {
      setError(null);
      const response = await fetch(`${API_URL}/api/basketball/stream/${streamId}`);
      const data = await response.json();
      if (data.success) {
        setStreamInfo(data.stream);
        if (data.match) {
          setMatchData(data.match);
          initializeMatchStatus(data.match);
        } else {
          setMatchStatus('live');
        }
      } else {
        setError('Stream tidak ditemukan');
      }
    } catch (err) {
      setError('Gagal memuat stream');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedMatches = async () => {
    try {
      const response = await fetch(`${API_URL}/api/basketball`);
      const data = await response.json();
      if (data.success && data.matches) {
        const liveMatches = (data.matches.live || [])
          .filter(m => m.hasStream && String(m.stream?.id) !== String(streamId))
          .slice(0, 5);
        setRelatedMatches(liveMatches);
      }
    } catch (err) { }
  };

  const initializeMatchStatus = (match) => {
    if (!match?.date) { setMatchStatus('live'); return; }
    const matchTime = new Date(match.date).getTime();
    const now = Date.now();
    const liveWindow = 3 * 60 * 60 * 1000;
    if (matchTime > now) {
      setMatchStatus('scheduled');
      startCountdown(matchTime);
    } else if (now - matchTime < liveWindow) {
      setMatchStatus('live');
      setTimeout(() => startStream(), 1000);
    } else {
      setMatchStatus('finished');
    }
  };

  const startCountdown = (matchTime) => {
    const updateCountdown = () => {
      const now = Date.now();
      const diff = matchTime - now;
      if (diff <= 0) {
        clearInterval(countdownRef.current);
        setMatchStatus('live');
        setTimeout(() => startStream(), 1000);
        return;
      }
      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000)
      });
    };
    updateCountdown();
    countdownRef.current = setInterval(updateCountdown, 1000);
  };

  const startStream = useCallback(() => {
    if (!streamId || !videoRef.current) return;
    const streamUrl = `${API_URL}/api/stream/${streamId}.m3u8`;
    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true, lowLatencyMode: true, backBufferLength: 90 });
      hls.loadSource(streamUrl);
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => { });
      });
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) hls.startLoad();
          else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) hls.recoverMediaError();
          else setError('Stream error. Silakan refresh.');
        }
      });
      hlsRef.current = hls;
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.current.src = streamUrl;
      videoRef.current.addEventListener('loadedmetadata', () => {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => { });
      });
    }
  }, [streamId]);

  const refreshStream = () => {
    setIsPlaying(false); setError(null);
    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
    setTimeout(() => startStream(), 500);
  };

  const toggleMute = () => { if (videoRef.current) { videoRef.current.muted = !videoRef.current.muted; setIsMuted(!isMuted); } };
  const toggleFullscreen = () => { if (videoRef.current) { document.fullscreenElement ? document.exitFullscreen() : videoRef.current.requestFullscreen(); } };
  const copyLink = () => { navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const formatMatchDate = (dateStr) => {
    if (!dateStr) return 'Live Channel 24/7';
    return new Date(dateStr).toLocaleString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' WIB';
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = matchData ? `Nonton ${matchData.homeTeam?.name} vs ${matchData.awayTeam?.name} live di SportMeriah!` : streamInfo?.name || 'Live NBA Streaming';

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <MdSportsBasketball className="text-6xl text-orange-500 animate-bounce mx-auto mb-4" />
            <p className="text-xl text-white">Memuat stream...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error && !streamInfo) {
    return (
      <main className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center bg-red-900/50 border border-red-700 rounded-lg p-8 max-w-md mx-4">
            <MdSportsBasketball className="text-6xl text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Oops! Terjadi Kesalahan</h2>
            <p className="text-red-200 mb-4">{error}</p>
            <Link href="/basketball" className="inline-block bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg transition">← Kembali</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="container max-w-6xl mx-auto px-4 py-6">
        <div className="mb-4 space-y-2">
          {BANNERS.map((banner) => (
            <div key={banner.id} className="banner-slot">
              <a href={banner.link} target="_blank" rel="noopener">
                <img src={banner.src} alt={`Banner ${banner.id}`} className="w-full rounded-lg hover:opacity-90 transition-opacity" onError={(e) => e.target.parentElement.parentElement.style.display = 'none'} />
              </a>
            </div>
          ))}
        </div>

        <div className="relative mb-4">
          <div className="bg-black rounded-lg aspect-video w-full overflow-hidden shadow-2xl relative">
            <video ref={videoRef} className="w-full h-full" controls={isPlaying} playsInline />
            {!isPlaying && (
              <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-sm flex flex-col justify-center items-center text-center p-4 cursor-pointer" onClick={() => matchStatus !== 'finished' && startStream()}>
                {matchData?.homeTeam && matchData?.awayTeam ? (
                  <div className="grid grid-cols-3 items-center text-center w-full max-w-lg mb-6">
                    <div className="flex flex-col items-center gap-2">
                      <img src={matchData.homeTeam.logo} alt={matchData.homeTeam.name} className="w-14 h-14 sm:w-20 sm:h-20 object-contain bg-gray-700 rounded-full p-1" onError={(e) => e.target.src = 'https://placehold.co/80x80/374151/ffffff?text=🏀'} />
                      <span className="text-sm sm:text-xl font-semibold text-white">{matchData.homeTeam.name}</span>
                    </div>
                    <div className="mx-4 text-center">
                      {matchStatus === 'live' && matchData.score ? (
                        <div>
                          <span className="text-3xl sm:text-5xl font-bold text-white">{matchData.score.home} - {matchData.score.away}</span>
                          <div className="mt-2 flex items-center justify-center gap-2">
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                            <span className="text-red-500 font-bold text-sm">{matchData.quarter || 'LIVE'}</span>
                          </div>
                        </div>
                      ) : (<span className="text-3xl sm:text-5xl font-bold text-gray-300">VS</span>)}
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <img src={matchData.awayTeam.logo} alt={matchData.awayTeam.name} className="w-14 h-14 sm:w-20 sm:h-20 object-contain bg-gray-700 rounded-full p-1" onError={(e) => e.target.src = 'https://placehold.co/80x80/374151/ffffff?text=🏀'} />
                      <span className="text-sm sm:text-xl font-semibold text-white">{matchData.awayTeam.name}</span>
                    </div>
                  </div>
                ) : (<h2 className="text-xl sm:text-3xl font-bold text-white mb-4">{streamInfo?.name || 'Live Stream'}</h2>)}
                <div className="mb-6">
                  <p className="text-sm text-gray-300 mb-2">{formatMatchDate(matchData?.date)}</p>
                  {matchStatus === 'scheduled' && (
                    <div className="text-3xl sm:text-4xl font-bold text-white font-mono">
                      {countdown.days > 0 && `${countdown.days}d `}{String(countdown.hours).padStart(2, '0')}:{String(countdown.minutes).padStart(2, '0')}:{String(countdown.seconds).padStart(2, '0')}
                    </div>
                  )}
                  {matchStatus === 'live' && <div className="text-3xl font-bold text-red-500 animate-pulse">🔴 LIVE NOW</div>}
                  {matchStatus === 'finished' && <div className="text-2xl font-bold text-gray-400">Pertandingan Selesai</div>}
                </div>
                {matchStatus !== 'finished' && (
                  <button onClick={(e) => { e.stopPropagation(); startStream(); }} className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg transition-all transform hover:scale-105 flex items-center gap-2">
                    <MdPlayArrow className="text-2xl" /> Mulai Nonton
                  </button>
                )}
                {matchStatus === 'finished' && <Link href="/basketball" className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg transition-all">Lihat Pertandingan Lain</Link>}
              </div>
            )}
            {error && isPlaying && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
                <p className="text-red-400 mb-4">{error}</p>
                <button onClick={refreshStream} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"><MdRefresh /> Coba Lagi</button>
              </div>
            )}
          </div>
          {isPlaying && (
            <div className="flex items-center justify-between mt-2 bg-gray-800 rounded-lg px-4 py-2">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-red-500 text-sm font-medium"><span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>LIVE</span>
                <span className="text-gray-400 text-sm hidden sm:block">{streamInfo?.name || matchData?.league?.name || 'NBA'}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={toggleMute} className="p-2 hover:bg-gray-700 rounded-lg transition text-gray-300">{isMuted ? <MdVolumeOff size={20} /> : <MdVolumeUp size={20} />}</button>
                <button onClick={refreshStream} className="p-2 hover:bg-gray-700 rounded-lg transition text-gray-300"><MdRefresh size={20} /></button>
                <button onClick={toggleFullscreen} className="p-2 hover:bg-gray-700 rounded-lg transition text-gray-300"><MdFullscreen size={20} /></button>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-3/4 space-y-4">
            <nav className="text-sm text-gray-400">
              <ol className="flex items-center gap-2">
                <li><Link href="/" className="hover:text-white flex items-center gap-1"><IoHome size={14} /> Home</Link></li>
                <li>/</li>
                <li><Link href="/basketball" className="hover:text-white flex items-center gap-1"><MdSportsBasketball size={14} /> Basketball</Link></li>
                <li>/</li>
                <li className="text-white truncate max-w-[200px]">{matchData ? `${matchData.homeTeam?.name} vs ${matchData.awayTeam?.name}` : streamInfo?.name}</li>
              </ol>
            </nav>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-white mb-1">{matchData ? `${matchData.homeTeam?.name} vs ${matchData.awayTeam?.name}` : streamInfo?.name}</h1>
                  <p className="text-gray-400 text-sm flex items-center gap-2"><MdSportsBasketball className="text-orange-500" />{matchData?.league?.name || streamInfo?.category || 'NBA'}</p>
                </div>
                {matchStatus === 'live' && <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded flex items-center gap-1 flex-shrink-0"><span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>LIVE</span>}
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><MdShare /> Bagikan</h3>
              <div className="flex flex-wrap gap-2">
                <a href={`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`} target="_blank" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition"><FaWhatsapp /> WhatsApp</a>
                <a href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`} target="_blank" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition"><FaTelegram /> Telegram</a>
                <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`} target="_blank" className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition"><FaTwitter /> Twitter</a>
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition"><FaFacebook /> Facebook</a>
                <button onClick={copyLink} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition">{copied ? <FaCheck /> : <FaCopy />}{copied ? 'Tersalin!' : 'Copy Link'}</button>
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-white mb-2">Streaming NBA Basketball Gratis</h2>
              <p className="text-gray-400 text-sm leading-relaxed">Tonton {matchData ? `${matchData.homeTeam?.name} vs ${matchData.awayTeam?.name}` : streamInfo?.name} secara gratis di SportMeriah. Live streaming NBA Basketball dengan kualitas HD. Nikmati pertandingan tanpa buffering.</p>
            </div>
          </div>
          <div className="w-full lg:w-1/4">
            <div className="bg-gray-800 rounded-lg p-4 sticky top-32">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>Sedang Live</h3>
              {relatedMatches.length > 0 ? (
                <div className="space-y-2">
                  {relatedMatches.map((match, index) => (
                    <Link key={match.id || index} href={`/basketball/${match.stream?.id}`} className="block bg-gray-700 hover:bg-gray-600 rounded-lg p-3 transition">
                      <div className="flex items-center gap-2 mb-1">
                        <img src={match.homeTeam?.logo} alt="" className="w-4 h-4 object-contain" onError={(e) => e.target.src = 'https://placehold.co/16x16/374151/ffffff?text=🏀'} />
                        <span className="text-white text-xs truncate flex-1">{match.homeTeam?.name}</span>
                        {match.score && <span className="text-white text-xs font-bold">{match.score.home}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <img src={match.awayTeam?.logo} alt="" className="w-4 h-4 object-contain" onError={(e) => e.target.src = 'https://placehold.co/16x16/374151/ffffff?text=🏀'} />
                        <span className="text-white text-xs truncate flex-1">{match.awayTeam?.name}</span>
                        {match.score && <span className="text-white text-xs font-bold">{match.score.away}</span>}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-gray-400 text-[10px]">{match.league?.name}</span>
                        <span className="text-red-400 text-[10px] flex items-center gap-1"><span className="w-1 h-1 bg-red-500 rounded-full animate-pulse"></span>LIVE</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (<p className="text-gray-400 text-sm">Tidak ada pertandingan live lainnya</p>)}
              <div className="mt-6 pt-4 border-t border-gray-700">
                <h4 className="text-white font-semibold mb-3 text-sm">Quick Links</h4>
                <div className="space-y-2">
                  <Link href="/basketball" className="block text-gray-400 hover:text-orange-400 text-sm">← Semua Pertandingan</Link>
                  <Link href="/football" className="block text-gray-400 hover:text-green-400 text-sm flex items-center gap-2"><MdSportsSoccer size={16} />Lihat Sepakbola</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 z-50 md:hidden">
        <div className="flex justify-around items-center py-2 px-1">
          <Link href="/" className="flex flex-col items-center px-2 sm:px-4 py-2 text-gray-400 hover:text-white transition-colors"><IoHome size={22} /><span className="text-[10px] sm:text-xs mt-1">Beranda</span></Link>
          <Link href="/football" className="flex flex-col items-center px-2 sm:px-4 py-2 text-gray-400 hover:text-green-400 transition-colors"><MdSportsSoccer size={22} /><span className="text-[10px] sm:text-xs mt-1">Sepakbola</span></Link>
          <Link href="/basketball" className="flex flex-col items-center px-2 sm:px-4 py-2 text-orange-400"><MdSportsBasketball size={22} /><span className="text-[10px] sm:text-xs mt-1">NBA</span></Link>
          <a href="https://t.me/sportmeriah" target="_blank" className="flex flex-col items-center px-2 sm:px-4 py-2 text-gray-400 hover:text-blue-400 transition-colors"><FaTelegram size={22} /><span className="text-[10px] sm:text-xs mt-1">Telegram</span></a>
        </div>
      </nav>
      <div className="h-20 md:hidden"></div>
    </main>
  );
}
