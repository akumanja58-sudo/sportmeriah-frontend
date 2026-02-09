'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Hls from 'hls.js';

// React Icons
import { FaTelegram, FaWhatsapp, FaFacebook, FaTwitter, FaCopy, FaCheck } from 'react-icons/fa';
import { IoHome } from 'react-icons/io5';
import { MdSportsSoccer, MdSportsBasketball, MdPlayArrow, MdRefresh, MdShare, MdFullscreen, MdVolumeUp, MdVolumeOff } from 'react-icons/md';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://sportmeriah-backend-production.up.railway.app';
const VPS_IP = '173.249.27.15';

// Banner images
const BANNERS = [
  { id: 1, src: 'https://inigambarku.site/images/2026/01/20/GIFMERIAH4D965a1f7cfb6a4aac.gif', link: '#' },
  { id: 2, src: 'https://inigambarku.site/images/2026/02/01/promo-penaslot.gif', link: '#' },
  { id: 3, src: 'https://inigambarku.site/images/2026/01/20/promo-pesiarbet.gif', link: '#' },
  { id: 4, src: 'https://inigambarku.site/images/2026/01/20/promo-girang4d.gif', link: '#' },
];

// Status helpers
function isLiveStatus(status) {
  const liveStatuses = ['1H', '2H', 'HT', 'ET', 'P', 'LIVE', 'BT', 'LIVE'];
  return liveStatuses.includes(status);
}

function isFinishedStatus(status) {
  const finishedStatuses = ['FT', 'AET', 'PEN', 'AWD', 'WO'];
  return finishedStatuses.includes(status);
}

export default function FootballPlayerClient({ fixtureId }) {
  const searchParams = useSearchParams();
  const streamIdFromUrl = searchParams?.get('stream') || null;
  const providerFromUrl = searchParams?.get('provider') || 'sphere';

  const [fixture, setFixture] = useState(null);
  const [relatedMatches, setRelatedMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [streamUrl, setStreamUrl] = useState(null);
  const [streamLoading, setStreamLoading] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const countdownRef = useRef(null);
  const playerContainerRef = useRef(null);

  useEffect(() => {
    fetchFixtureData();
    fetchRelatedMatches();
    return () => {
      if (hlsRef.current) hlsRef.current.destroy();
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [fixtureId]);

  // ========== FETCH DATA ==========
  const fetchFixtureData = async () => {
    try {
      setError(null);
      const response = await fetch(`${API_URL}/api/fixtures/${fixtureId}`);
      const data = await response.json();

      if (data.success && data.fixture) {
        setFixture(data.fixture);

        // Check status and auto-start if LIVE
        const status = data.fixture.status?.short || 'NS';
        if (isLiveStatus(status)) {
          const sid = streamIdFromUrl || data.fixture.stream?.stream_id;
          const prov = data.fixture.stream?.provider || providerFromUrl;
          if (sid) {
            setTimeout(() => startStream(sid, prov), 500);
          }
        } else if (!isFinishedStatus(status)) {
          // Upcoming - start countdown
          startCountdown(new Date(data.fixture.date).getTime());
        }
      } else {
        setError('Pertandingan tidak ditemukan');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Gagal memuat data pertandingan');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedMatches = async () => {
    try {
      const response = await fetch(`${API_URL}/api/football`);
      const data = await response.json();
      if (data.success && data.matches) {
        const liveMatches = (data.matches.live || [])
          .filter(m => m.hasStream && String(m.id) !== String(fixtureId))
          .slice(0, 5);
        setRelatedMatches(liveMatches);
      }
    } catch (err) { }
  };

  // ========== COUNTDOWN ==========
  const startCountdown = (matchTime) => {
    const updateCountdown = () => {
      const now = Date.now();
      const diff = matchTime - now;
      if (diff <= 0) {
        clearInterval(countdownRef.current);
        // Refresh data when match should start
        fetchFixtureData();
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

  // ========== STREAM FUNCTIONS ==========
  const startStream = async (streamId, provider = 'sphere') => {
    if (!streamId) return;

    try {
      setStreamLoading(true);

      let hlsUrl;
      if (provider === 'pearl') {
        await fetch(`${API_URL}/api/streams/pearl/start/${streamId}`);
        hlsUrl = `${API_URL}/api/stream/pearl/${streamId}.m3u8`;
      } else {
        await fetch(`${API_URL}/api/streams/start/${streamId}`);
        hlsUrl = `${API_URL}/api/stream/${streamId}.m3u8`;
      }

      // Wait for stream to be ready
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Set states - video will render, then useEffect will initialize player
      setStreamUrl(hlsUrl);
      setIsPlaying(true);
    } catch (error) {
      console.error('Failed to start stream:', error);
      setError('Gagal memulai stream');
    } finally {
      setStreamLoading(false);
    }
  };

  const initializePlayer = useCallback((url) => {
    if (!videoRef.current || !url) return;

    // Destroy existing HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });

      hls.loadSource(url);
      hls.attachMedia(videoRef.current);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(err => console.log('Autoplay blocked:', err));
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.error('HLS fatal error:', data);
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            setTimeout(() => hls.startLoad(), 3000);
          }
        }
      });

      hlsRef.current = hls;
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS
      videoRef.current.src = url;
      videoRef.current.addEventListener('loadedmetadata', () => {
        videoRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(err => console.log('Autoplay blocked:', err));
      });
    }
  }, []);

  // Initialize player when streamUrl changes and video is rendered
  useEffect(() => {
    if (streamUrl && isPlaying && videoRef.current) {
      initializePlayer(streamUrl);
    }
  }, [streamUrl, isPlaying, initializePlayer]);

  // ========== PLAYER CONTROLS ==========
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const refreshStream = () => {
    const sid = streamIdFromUrl || fixture?.stream?.stream_id;
    const prov = fixture?.stream?.provider || providerFromUrl;
    if (sid) {
      startStream(sid, prov);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ========== DERIVED VALUES ==========
  const status = fixture?.status?.short || 'NS';
  const isLive = isLiveStatus(status);
  const isFinished = isFinishedStatus(status);
  const isUpcoming = !isLive && !isFinished;

  const homeTeam = fixture?.teams?.home || { name: 'Home Team', logo: null };
  const awayTeam = fixture?.teams?.away || { name: 'Away Team', logo: null };
  const league = fixture?.league || { name: 'Football' };
  const goals = fixture?.goals || { home: 0, away: 0 };

  const matchTitle = `${homeTeam.name} vs ${awayTeam.name}`;
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `🔴 Nonton ${matchTitle} LIVE di SportMeriah!`;

  const hasStream = !!(streamIdFromUrl || fixture?.stream?.stream_id);
  const actualStreamId = streamIdFromUrl || fixture?.stream?.stream_id;
  const streamProvider = fixture?.stream?.provider || providerFromUrl;

  // Format kickoff time
  const formatKickoff = () => {
    if (!fixture?.date) return '-';
    const date = new Date(fixture.date);
    return date.toLocaleString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    }) + ' WIB';
  };

  // ========== LOADING STATE ==========
  if (loading) {
    return (
      <main className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="container max-w-6xl mx-auto px-4 py-6 flex flex-col items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          <p className="text-gray-400 mt-4">Memuat pertandingan...</p>
        </div>
      </main>
    );
  }

  // ========== ERROR STATE ==========
  if (error || !fixture) {
    return (
      <main className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="container max-w-6xl mx-auto px-4 py-6">
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
            <strong className="font-bold">Error: </strong>
            <span>{error || 'Pertandingan tidak ditemukan'}</span>
          </div>
          <Link href="/football" className="mt-4 inline-block bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
            ← Kembali ke Sepakbola
          </Link>
        </div>
      </main>
    );
  }

  // ========== FINISHED STATE ==========
  if (isFinished) {
    return (
      <main className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="container max-w-6xl mx-auto px-4 py-6">
          <div className="bg-gray-800 rounded-lg p-8 text-center max-w-xl mx-auto">
            <div className="text-6xl mb-4">⏰</div>
            <h1 className="text-2xl font-bold text-white mb-2">Pertandingan Sudah Selesai</h1>
            <p className="text-gray-400 mb-6">Pertandingan ini sudah berakhir.</p>

            {/* Final Score */}
            <div className="bg-gray-700 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center gap-4 mb-2">
                <div className="text-center">
                  <img src={homeTeam.logo} alt={homeTeam.name} className="w-12 h-12 object-contain mx-auto mb-1" onError={(e) => e.target.src = 'https://placehold.co/48x48/374151/ffffff?text=⚽'} />
                  <p className="text-white text-sm">{homeTeam.name}</p>
                </div>
                <span className="text-white text-3xl font-bold">{goals.home ?? 0} - {goals.away ?? 0}</span>
                <div className="text-center">
                  <img src={awayTeam.logo} alt={awayTeam.name} className="w-12 h-12 object-contain mx-auto mb-1" onError={(e) => e.target.src = 'https://placehold.co/48x48/374151/ffffff?text=⚽'} />
                  <p className="text-white text-sm">{awayTeam.name}</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm">{league.name}</p>
            </div>

            <Link href="/football" className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full transition-colors">
              <IoHome size={20} />
              Lihat Pertandingan Lain
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ========== MAIN RENDER ==========
  return (
    <main className="min-h-screen bg-gray-900">
      <Navbar />

      <div className="container max-w-6xl mx-auto px-4 py-4 sm:py-6">

        {/* BANNERS */}
        <div className="mb-4 space-y-2">
          {BANNERS.map((banner) => (
            <div key={banner.id} className="banner-slot">
              <a href={banner.link} target="_blank" rel="noopener">
                <img src={banner.src} alt={`Banner ${banner.id}`} className="w-full rounded-lg hover:opacity-90 transition-opacity" onError={(e) => e.target.parentElement.parentElement.style.display = 'none'} />
              </a>
            </div>
          ))}
        </div>

        {/* PLAYER SECTION */}
        <div ref={playerContainerRef} className="relative mb-4">

          {/* PLAYING STATE */}
          {streamUrl && isPlaying ? (
            <div className="bg-black rounded-lg overflow-hidden">
              {/* Player Header */}
              <div className="bg-red-600 text-white px-3 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse flex-shrink-0"></span>
                  <span className="font-bold text-sm">{isLive ? (fixture?.status?.elapsed ? `${fixture.status.elapsed}'` : 'LIVE') : 'Playing'}</span>
                  {isLive && <span className="font-bold ml-2">{goals.home ?? 0} - {goals.away ?? 0}</span>}
                  <span className="text-xs truncate ml-2">{matchTitle}</span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={toggleMute} className="p-1.5 hover:bg-red-700 rounded transition">
                    {isMuted ? <MdVolumeOff size={18} /> : <MdVolumeUp size={18} />}
                  </button>
                  <button onClick={refreshStream} className="p-1.5 hover:bg-red-700 rounded transition">
                    <MdRefresh size={18} />
                  </button>
                  <button onClick={toggleFullscreen} className="p-1.5 hover:bg-red-700 rounded transition">
                    <MdFullscreen size={18} />
                  </button>
                </div>
              </div>

              {/* Video Element */}
              <video
                ref={videoRef}
                className="w-full aspect-video bg-black"
                playsInline
                controls
                onClick={togglePlay}
              />
            </div>
          ) : streamLoading ? (
            /* LOADING STREAM */
            <div className="bg-black rounded-lg aspect-video flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
                <p className="text-white mt-4">Memuat Stream...</p>
              </div>
            </div>
          ) : isLive && hasStream ? (
            /* LIVE - READY TO PLAY */
            <div className="bg-black rounded-lg w-full overflow-hidden min-h-[350px] sm:min-h-[400px] md:aspect-video relative">
              <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900 opacity-90"></div>
              <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-4">

                {/* Team Logos */}
                <div className="flex items-center justify-center gap-4 sm:gap-8 mb-4">
                  <div className="text-center">
                    <img src={homeTeam.logo} alt={homeTeam.name} className="w-16 h-16 sm:w-20 sm:h-20 object-contain mx-auto mb-2" onError={(e) => e.target.src = 'https://placehold.co/80x80/374151/ffffff?text=⚽'} />
                    <p className="text-white font-semibold text-sm sm:text-base truncate max-w-[100px]">{homeTeam.name}</p>
                  </div>
                  <div className="text-center">
                    <div className="text-white text-2xl sm:text-3xl font-bold">{goals.home ?? 0} - {goals.away ?? 0}</div>
                    <p className="text-red-400 text-sm font-bold mt-1">{fixture?.status?.elapsed ? `${fixture.status.elapsed}'` : 'LIVE'}</p>
                  </div>
                  <div className="text-center">
                    <img src={awayTeam.logo} alt={awayTeam.name} className="w-16 h-16 sm:w-20 sm:h-20 object-contain mx-auto mb-2" onError={(e) => e.target.src = 'https://placehold.co/80x80/374151/ffffff?text=⚽'} />
                    <p className="text-white font-semibold text-sm sm:text-base truncate max-w-[100px]">{awayTeam.name}</p>
                  </div>
                </div>

                <p className="text-gray-400 text-sm mb-4">{league.name}</p>

                <div className="text-2xl font-bold text-red-500 animate-pulse mb-4">🔴 LIVE NOW</div>

                <button
                  onClick={() => startStream(actualStreamId, streamProvider)}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg transition-all transform hover:scale-105 flex items-center gap-2"
                >
                  <MdPlayArrow size={24} />
                  Tonton Sekarang
                </button>
              </div>
            </div>
          ) : (
            /* UPCOMING */
            <div className="bg-black rounded-lg w-full overflow-hidden min-h-[350px] sm:min-h-[400px] md:aspect-video relative">
              <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900 opacity-90"></div>
              <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-4">

                {/* Team Logos */}
                <div className="flex items-center justify-center gap-4 sm:gap-8 mb-4">
                  <div className="text-center">
                    <img src={homeTeam.logo} alt={homeTeam.name} className="w-16 h-16 sm:w-20 sm:h-20 object-contain mx-auto mb-2" onError={(e) => e.target.src = 'https://placehold.co/80x80/374151/ffffff?text=⚽'} />
                    <p className="text-white font-semibold text-sm sm:text-base truncate max-w-[100px]">{homeTeam.name}</p>
                  </div>
                  <div className="text-2xl sm:text-4xl font-bold text-gray-400">VS</div>
                  <div className="text-center">
                    <img src={awayTeam.logo} alt={awayTeam.name} className="w-16 h-16 sm:w-20 sm:h-20 object-contain mx-auto mb-2" onError={(e) => e.target.src = 'https://placehold.co/80x80/374151/ffffff?text=⚽'} />
                    <p className="text-white font-semibold text-sm sm:text-base truncate max-w-[100px]">{awayTeam.name}</p>
                  </div>
                </div>

                <p className="text-gray-400 text-sm mb-2">{league.name}</p>
                <p className="text-gray-400 text-sm mb-4">{formatKickoff()}</p>

                {/* Countdown */}
                <div className="flex justify-center gap-3 sm:gap-4 mb-4">
                  {countdown.days > 0 && (
                    <div className="bg-gray-800 border border-gray-700 px-3 py-2 sm:px-4 sm:py-3 rounded-lg min-w-[50px] sm:min-w-[60px]">
                      <span className="text-xl sm:text-2xl font-bold text-white">{String(countdown.days).padStart(2, '0')}</span>
                      <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Hari</p>
                    </div>
                  )}
                  <div className="bg-gray-800 border border-gray-700 px-3 py-2 sm:px-4 sm:py-3 rounded-lg min-w-[50px] sm:min-w-[60px]">
                    <span className="text-xl sm:text-2xl font-bold text-white">{String(countdown.hours).padStart(2, '0')}</span>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Jam</p>
                  </div>
                  <div className="bg-gray-800 border border-gray-700 px-3 py-2 sm:px-4 sm:py-3 rounded-lg min-w-[50px] sm:min-w-[60px]">
                    <span className="text-xl sm:text-2xl font-bold text-white">{String(countdown.minutes).padStart(2, '0')}</span>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Menit</p>
                  </div>
                  <div className="bg-gray-800 border border-gray-700 px-3 py-2 sm:px-4 sm:py-3 rounded-lg min-w-[50px] sm:min-w-[60px]">
                    <span className="text-xl sm:text-2xl font-bold text-orange-500">{String(countdown.seconds).padStart(2, '0')}</span>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Detik</p>
                  </div>
                </div>

                <p className="text-gray-400 text-xs sm:text-sm mb-3">
                  {hasStream ? 'Stream akan tersedia saat match dimulai.' : 'Stream belum tersedia.'}
                </p>

                <Link href="/football" className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-5 rounded-full text-sm transition-colors">
                  ← Kembali ke Sepakbola
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* MAIN CONTENT */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">

          {/* Left Column */}
          <div className="w-full lg:w-3/4 space-y-4">

            {/* Breadcrumb */}
            <nav className="text-sm text-gray-400 hidden sm:block">
              <ol className="flex items-center gap-2">
                <li><Link href="/" className="hover:text-white flex items-center gap-1"><IoHome size={14} /> Home</Link></li>
                <li>/</li>
                <li><Link href="/football" className="hover:text-white flex items-center gap-1"><MdSportsSoccer size={14} /> Sepakbola</Link></li>
                <li>/</li>
                <li className="text-white truncate max-w-[200px]">{matchTitle}</li>
              </ol>
            </nav>

            {/* Match Info Card */}
            <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h1 className="text-base sm:text-xl font-bold text-white mb-1">{matchTitle}</h1>
                  <p className="text-gray-400 text-xs sm:text-sm flex items-center gap-2">
                    <MdSportsSoccer className="text-green-500 flex-shrink-0" />
                    <span className="truncate">{league.name}</span>
                  </p>
                </div>
                {isLive && (
                  <span className="bg-red-600 text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 rounded flex items-center gap-1 flex-shrink-0">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                    LIVE
                  </span>
                )}
              </div>
            </div>

            {/* Share Buttons */}
            <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base">
                <MdShare /> Bagikan
              </h3>
              <div className="flex flex-wrap gap-2">
                <a href={`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`} target="_blank" className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg flex items-center gap-1.5 text-xs sm:text-sm transition">
                  <FaWhatsapp />
                </a>
                <a href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`} target="_blank" className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg flex items-center gap-1.5 text-xs sm:text-sm transition">
                  <FaTelegram />
                </a>
                <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`} target="_blank" className="bg-sky-500 hover:bg-sky-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg flex items-center gap-1.5 text-xs sm:text-sm transition">
                  <FaTwitter />
                </a>
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg flex items-center gap-1.5 text-xs sm:text-sm transition">
                  <FaFacebook />
                </a>
                <button onClick={copyLink} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg flex items-center gap-1.5 text-xs sm:text-sm transition">
                  {copied ? <FaCheck /> : <FaCopy />}
                  <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* SEO Content */}
            <div className="bg-gray-800 rounded-lg p-4 hidden sm:block">
              <h2 className="text-lg font-semibold text-white mb-2">Streaming {league.name} Gratis</h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Tonton {matchTitle} secara gratis di SportMeriah. Live streaming sepakbola dengan kualitas HD, tanpa buffering!
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-1/4">
            <div className="bg-gray-800 rounded-lg p-3 sm:p-4 lg:sticky lg:top-32">
              <h3 className="text-white font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                Sedang Live
              </h3>

              {relatedMatches.length > 0 ? (
                <div className="space-y-2">
                  {relatedMatches.map((match, index) => (
                    <Link
                      key={match.id || index}
                      href={`/football/${match.id}?stream=${match.stream?.id}&provider=${match.stream?.provider || 'sphere'}`}
                      className="block bg-gray-700 hover:bg-gray-600 rounded-lg p-2.5 sm:p-3 transition"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <img src={match.homeTeam?.logo} alt="" className="w-4 h-4 object-contain" onError={(e) => e.target.src = 'https://placehold.co/16x16/374151/ffffff?text=⚽'} />
                        <span className="text-white text-xs truncate flex-1">{match.homeTeam?.name}</span>
                        {match.score && <span className="text-white text-xs font-bold">{match.score.home}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <img src={match.awayTeam?.logo} alt="" className="w-4 h-4 object-contain" onError={(e) => e.target.src = 'https://placehold.co/16x16/374151/ffffff?text=⚽'} />
                        <span className="text-white text-xs truncate flex-1">{match.awayTeam?.name}</span>
                        {match.score && <span className="text-white text-xs font-bold">{match.score.away}</span>}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-gray-400 text-[10px]">{match.league?.name}</span>
                        <span className="text-red-400 text-[10px] flex items-center gap-1">
                          <span className="w-1 h-1 bg-red-500 rounded-full animate-pulse"></span>
                          LIVE
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-xs sm:text-sm">Tidak ada pertandingan live lainnya</p>
              )}

              <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-700">
                <h4 className="text-white font-semibold mb-2 sm:mb-3 text-xs sm:text-sm">Quick Links</h4>
                <div className="space-y-2">
                  <Link href="/football" className="block text-gray-400 hover:text-green-400 text-xs sm:text-sm">← Semua Pertandingan</Link>
                  <Link href="/basketball" className="block text-gray-400 hover:text-orange-400 text-xs sm:text-sm flex items-center gap-2">
                    <MdSportsBasketball size={14} /> Lihat Basketball
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Nav Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 z-50 md:hidden">
        <div className="flex justify-around items-center py-2 px-1">
          <Link href="/" className="flex flex-col items-center px-2 py-2 text-gray-400 hover:text-white transition-colors">
            <IoHome size={20} />
            <span className="text-[10px] mt-1">Beranda</span>
          </Link>
          <Link href="/football" className="flex flex-col items-center px-2 py-2 text-green-400">
            <MdSportsSoccer size={20} />
            <span className="text-[10px] mt-1">Sepakbola</span>
          </Link>
          <Link href="/basketball" className="flex flex-col items-center px-2 py-2 text-gray-400 hover:text-orange-400 transition-colors">
            <MdSportsBasketball size={20} />
            <span className="text-[10px] mt-1">NBA</span>
          </Link>
          <a href="https://t.me/sportmeriah" target="_blank" className="flex flex-col items-center px-2 py-2 text-gray-400 hover:text-blue-400 transition-colors">
            <FaTelegram size={20} />
            <span className="text-[10px] mt-1">Telegram</span>
          </a>
        </div>
      </nav>

      <div className="h-16 md:hidden"></div>
    </main>
  );
}
