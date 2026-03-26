'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Navbar from '../../components/Navbar';
import VideoPlayer from '../../components/VideoPlayer';

import { FaTelegram, FaWhatsapp, FaFacebook, FaTwitter } from 'react-icons/fa';
import { IoHome } from 'react-icons/io5';
import { MdSportsSoccer, MdSportsBasketball, MdPlayArrow, MdShare, MdContentCopy, MdCheck, MdArrowBack } from 'react-icons/md';
import { HiSignal, HiClock, HiTrophy } from 'react-icons/hi2';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://sportmeriah-backend-production.up.railway.app';
const STREAM_BASE = 'https://stream.nobarmeriah.com';

function isLiveStatus(status) {
  const liveStatuses = ['1H', '2H', 'HT', 'ET', 'P', 'LIVE', 'BT'];
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
  const [copied, setCopied] = useState(false);
  const [streamUrl, setStreamUrl] = useState(null);
  const [altStream, setAltStream] = useState(null);
  const [streamLoading, setStreamLoading] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const countdownRef = useRef(null);

  useEffect(() => {
    fetchFixtureData();
    fetchRelatedMatches();
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [fixtureId]);

  const fetchFixtureData = async () => {
    try {
      setError(null);
      const response = await fetch(`${API_URL}/api/fixtures/${fixtureId}`);
      const data = await response.json();

      if (data.success && data.fixture) {
        setFixture(data.fixture);
        setAltStream(data.fixture.altStream || null);

        const status = data.fixture.status?.short || 'NS';
        if (isLiveStatus(status)) {
          const sid = streamIdFromUrl || data.fixture.stream?.stream_id;
          const prov = data.fixture.stream?.provider || providerFromUrl;
          if (sid) {
            setTimeout(() => startStream(sid, prov), 500);
          }
        } else if (!isFinishedStatus(status)) {
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

  const startCountdown = (matchTime) => {
    const updateCountdown = () => {
      const now = Date.now();
      const diff = matchTime - now;
      if (diff <= 0) {
        clearInterval(countdownRef.current);
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

  const startStream = async (streamId, provider = 'sphere') => {
    if (!streamId) return;
    try {
      setStreamLoading(true);
      await fetch(`${API_URL}/api/streams/sphere/start/${streamId}`);
      const hlsUrl = `${STREAM_BASE}/hls/sphere_${streamId}.m3u8`;
      await new Promise(resolve => setTimeout(resolve, 5000));
      setStreamUrl(hlsUrl);
      setIsPlaying(true);
    } catch (error) {
      console.error('Failed to start stream:', error);
      setError('Gagal memulai stream');
    } finally {
      setStreamLoading(false);
    }
  };

  const refreshStream = () => {
    const sid = streamIdFromUrl || fixture?.stream?.stream_id;
    const prov = fixture?.stream?.provider || providerFromUrl;
    if (sid) startStream(sid, prov);
  };

  const switchServer = () => {
    if (!altStream) return;
    startStream(altStream.stream_id, altStream.provider);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Derived values
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
  const shareText = `Nonton ${matchTitle} LIVE di SportMeriah!`;

  const hasStream = !!(streamIdFromUrl || fixture?.stream?.stream_id);
  const actualStreamId = streamIdFromUrl || fixture?.stream?.stream_id;
  const streamProvider = fixture?.stream?.provider || providerFromUrl;

  const formatKickoff = () => {
    if (!fixture?.date) return '-';
    const date = new Date(fixture.date);
    return date.toLocaleString('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
    }) + ' WIB';
  };

  // ========== LOADING ==========
  if (loading) {
    return (
      <main className="min-h-screen" style={{ backgroundColor: '#0a0c14' }}>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <span className="loader"></span>
          <p className="text-gray-500 mt-4 text-sm">Memuat pertandingan...</p>
          <style>{`
            .loader { width: 40px; height: 40px; border-radius: 50%; display: inline-block; border-top: 3px solid #fff; border-right: 3px solid transparent; box-sizing: border-box; animation: rot 1s linear infinite; position: relative; }
            .loader::after { content: ''; box-sizing: border-box; position: absolute; left: 0; top: 0; width: 40px; height: 40px; border-radius: 50%; border-left: 3px solid #10b981; border-bottom: 3px solid transparent; animation: rot 0.5s linear infinite reverse; }
            @keyframes rot { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          `}</style>
        </div>
      </main>
    );
  }

  // ========== ERROR ==========
  if (error || !fixture) {
    return (
      <main className="min-h-screen" style={{ backgroundColor: '#0a0c14' }}>
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="rounded-xl p-6 text-center" style={{ backgroundColor: '#1a1d27', border: '1px solid rgba(239,68,68,0.2)' }}>
            <MdSportsSoccer size={40} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-300 font-medium mb-1">{error || 'Pertandingan tidak ditemukan'}</p>
            <Link href="/football" className="text-emerald-400 hover:text-emerald-300 text-sm mt-3 inline-flex items-center gap-1">
              <MdArrowBack size={16} /> Kembali ke Sepakbola
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ========== FINISHED ==========
  if (isFinished) {
    return (
      <main className="min-h-screen" style={{ backgroundColor: '#0a0c14' }}>
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="rounded-xl p-8 text-center" style={{ backgroundColor: '#1a1d27' }}>
            <HiClock size={36} className="text-gray-500 mx-auto mb-3" />
            <h1 className="text-xl font-bold text-white mb-2">Pertandingan Sudah Selesai</h1>
            <p className="text-gray-500 text-sm mb-6">Pertandingan ini sudah berakhir</p>

            <div className="rounded-xl p-5 mb-6" style={{ backgroundColor: '#232733' }}>
              <div className="flex items-center justify-center gap-6">
                <div className="text-center">
                  <img src={homeTeam.logo} alt={homeTeam.name} className="w-12 h-12 object-contain mx-auto mb-2" onError={(e) => e.target.src = 'https://placehold.co/48x48/232733/6b7280?text=T'} />
                  <p className="text-white text-sm font-medium">{homeTeam.name}</p>
                </div>
                <div className="text-white text-3xl font-bold tracking-wide">{goals.home ?? 0} — {goals.away ?? 0}</div>
                <div className="text-center">
                  <img src={awayTeam.logo} alt={awayTeam.name} className="w-12 h-12 object-contain mx-auto mb-2" onError={(e) => e.target.src = 'https://placehold.co/48x48/232733/6b7280?text=T'} />
                  <p className="text-white text-sm font-medium">{awayTeam.name}</p>
                </div>
              </div>
              <p className="text-gray-500 text-xs mt-3">{league.name}</p>
            </div>

            <Link href="/football" className="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors">
              <MdArrowBack size={16} /> Lihat Pertandingan Lain
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ========== MAIN RENDER ==========
  return (
    <main className="min-h-screen" style={{ backgroundColor: '#0a0c14' }}>
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6">

        {/* PLAYER SECTION */}
        <div className="relative mb-4">

          {/* PLAYING */}
          {streamUrl && isPlaying ? (
            <VideoPlayer
              streamUrl={streamUrl}
              title={matchTitle}
              isLive={isLive}
              onRefresh={refreshStream}
              onSwitchServer={altStream ? switchServer : null}
              altServerLabel={altStream ? 'Server 2' : null}
            />
          ) : streamLoading ? (
            <div className="rounded-xl aspect-video flex items-center justify-center" style={{ backgroundColor: '#111318' }}>
              <div className="text-center">
                <span className="loader"></span>
                <p className="text-gray-400 mt-4 text-sm">Memuat Stream...</p>
                <style>{`
                  .loader { width: 40px; height: 40px; border-radius: 50%; display: inline-block; border-top: 3px solid #fff; border-right: 3px solid transparent; box-sizing: border-box; animation: rot 1s linear infinite; position: relative; }
                  .loader::after { content: ''; box-sizing: border-box; position: absolute; left: 0; top: 0; width: 40px; height: 40px; border-radius: 50%; border-left: 3px solid #10b981; border-bottom: 3px solid transparent; animation: rot 0.5s linear infinite reverse; }
                  @keyframes rot { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                `}</style>
              </div>
            </div>
          ) : isLive && hasStream ? (
            /* LIVE — READY TO PLAY */
            <div className="rounded-xl w-full overflow-hidden min-h-[350px] sm:min-h-[400px] md:aspect-video relative" style={{ backgroundColor: '#111318' }}>
              <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-4">

                <div className="flex items-center justify-center gap-4 sm:gap-8 mb-5">
                  <div className="text-center">
                    <img src={homeTeam.logo} alt={homeTeam.name} className="w-16 h-16 sm:w-20 sm:h-20 object-contain mx-auto mb-2" onError={(e) => e.target.src = 'https://placehold.co/80x80/232733/6b7280?text=T'} />
                    <p className="text-white font-semibold text-sm sm:text-base truncate max-w-[100px]">{homeTeam.name}</p>
                  </div>
                  <div className="text-center">
                    <div className="text-white text-2xl sm:text-3xl font-bold">{goals.home ?? 0} — {goals.away ?? 0}</div>
                    <p className="text-red-400 text-sm font-semibold mt-1 flex items-center justify-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                      {fixture?.status?.elapsed ? `${fixture.status.elapsed}'` : 'LIVE'}
                    </p>
                  </div>
                  <div className="text-center">
                    <img src={awayTeam.logo} alt={awayTeam.name} className="w-16 h-16 sm:w-20 sm:h-20 object-contain mx-auto mb-2" onError={(e) => e.target.src = 'https://placehold.co/80x80/232733/6b7280?text=T'} />
                    <p className="text-white font-semibold text-sm sm:text-base truncate max-w-[100px]">{awayTeam.name}</p>
                  </div>
                </div>

                <p className="text-gray-500 text-sm mb-5">{league.name}</p>

                <button
                  onClick={() => startStream(actualStreamId, streamProvider)}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-xl text-base transition-all transform hover:scale-105 flex items-center gap-2 shadow-lg"
                >
                  <MdPlayArrow size={22} />
                  Tonton Sekarang
                </button>
              </div>
            </div>
          ) : (
            /* UPCOMING */
            <div className="rounded-xl w-full overflow-hidden min-h-[350px] sm:min-h-[400px] md:aspect-video relative" style={{ backgroundColor: '#111318' }}>
              <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-4">

                <div className="flex items-center justify-center gap-4 sm:gap-8 mb-5">
                  <div className="text-center">
                    <img src={homeTeam.logo} alt={homeTeam.name} className="w-16 h-16 sm:w-20 sm:h-20 object-contain mx-auto mb-2" onError={(e) => e.target.src = 'https://placehold.co/80x80/232733/6b7280?text=T'} />
                    <p className="text-white font-semibold text-sm sm:text-base truncate max-w-[100px]">{homeTeam.name}</p>
                  </div>
                  <div className="text-2xl sm:text-4xl font-bold text-gray-600 tracking-widest">VS</div>
                  <div className="text-center">
                    <img src={awayTeam.logo} alt={awayTeam.name} className="w-16 h-16 sm:w-20 sm:h-20 object-contain mx-auto mb-2" onError={(e) => e.target.src = 'https://placehold.co/80x80/232733/6b7280?text=T'} />
                    <p className="text-white font-semibold text-sm sm:text-base truncate max-w-[100px]">{awayTeam.name}</p>
                  </div>
                </div>

                <p className="text-gray-500 text-sm mb-1">{league.name}</p>
                <p className="text-gray-500 text-sm mb-5 flex items-center gap-1.5"><HiClock size={13} /> {formatKickoff()}</p>

                {/* Countdown */}
                <div className="flex justify-center gap-3 sm:gap-4 mb-5">
                  {countdown.days > 0 && (
                    <div className="rounded-lg min-w-[50px] sm:min-w-[60px] px-3 py-2 sm:px-4 sm:py-3 text-center" style={{ backgroundColor: '#1a1d27', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <span className="text-xl sm:text-2xl font-bold text-white">{String(countdown.days).padStart(2, '0')}</span>
                      <p className="text-[10px] sm:text-xs text-gray-600 mt-1">Hari</p>
                    </div>
                  )}
                  <div className="rounded-lg min-w-[50px] sm:min-w-[60px] px-3 py-2 sm:px-4 sm:py-3 text-center" style={{ backgroundColor: '#1a1d27', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span className="text-xl sm:text-2xl font-bold text-white">{String(countdown.hours).padStart(2, '0')}</span>
                    <p className="text-[10px] sm:text-xs text-gray-600 mt-1">Jam</p>
                  </div>
                  <div className="rounded-lg min-w-[50px] sm:min-w-[60px] px-3 py-2 sm:px-4 sm:py-3 text-center" style={{ backgroundColor: '#1a1d27', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span className="text-xl sm:text-2xl font-bold text-white">{String(countdown.minutes).padStart(2, '0')}</span>
                    <p className="text-[10px] sm:text-xs text-gray-600 mt-1">Menit</p>
                  </div>
                  <div className="rounded-lg min-w-[50px] sm:min-w-[60px] px-3 py-2 sm:px-4 sm:py-3 text-center" style={{ backgroundColor: '#1a1d27', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span className="text-xl sm:text-2xl font-bold text-emerald-400">{String(countdown.seconds).padStart(2, '0')}</span>
                    <p className="text-[10px] sm:text-xs text-gray-600 mt-1">Detik</p>
                  </div>
                </div>

                <p className="text-gray-600 text-xs mb-3">
                  {hasStream ? 'Stream akan tersedia saat match dimulai' : 'Stream belum tersedia'}
                </p>

                <Link href="/football" className="text-emerald-400 hover:text-emerald-300 text-sm font-medium flex items-center gap-1 transition-colors">
                  <MdArrowBack size={16} /> Kembali ke Sepakbola
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* MAIN CONTENT */}
        <div className="flex flex-col lg:flex-row gap-5">

          {/* Left Column */}
          <div className="w-full lg:w-3/4 space-y-4">

            {/* Breadcrumb */}
            <nav className="text-sm text-gray-500 hidden sm:block">
              <ol className="flex items-center gap-2">
                <li><Link href="/" className="hover:text-gray-300 flex items-center gap-1 transition-colors"><IoHome size={13} /> Home</Link></li>
                <li className="text-gray-700">/</li>
                <li><Link href="/football" className="hover:text-gray-300 flex items-center gap-1 transition-colors"><MdSportsSoccer size={13} /> Sepakbola</Link></li>
                <li className="text-gray-700">/</li>
                <li className="text-gray-400 truncate max-w-[200px]">{matchTitle}</li>
              </ol>
            </nav>

            {/* Match Info Card */}
            <div className="rounded-xl p-4" style={{ backgroundColor: '#1a1d27' }}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h1 className="text-base sm:text-lg font-bold text-white mb-1">{matchTitle}</h1>
                  <p className="text-gray-500 text-xs sm:text-sm flex items-center gap-2">
                    <MdSportsSoccer className="text-emerald-500 flex-shrink-0" size={14} />
                    <span className="truncate">{league.name}</span>
                  </p>
                </div>
                {isLive && (
                  <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-600 text-white flex-shrink-0">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                    </span>
                    LIVE
                  </span>
                )}
              </div>
            </div>

            {/* Share */}
            <div className="rounded-xl p-4" style={{ backgroundColor: '#1a1d27' }}>
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm">
                <MdShare size={16} className="text-gray-400" /> Bagikan
              </h3>
              <div className="flex flex-wrap gap-2">
                <a href={`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`} target="_blank"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-white" style={{ backgroundColor: '#25D366' }}>
                  <FaWhatsapp size={14} /> <span className="hidden sm:inline">WhatsApp</span>
                </a>
                <a href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`} target="_blank"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-white" style={{ backgroundColor: '#0088cc' }}>
                  <FaTelegram size={14} /> <span className="hidden sm:inline">Telegram</span>
                </a>
                <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`} target="_blank"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-white" style={{ backgroundColor: '#1DA1F2' }}>
                  <FaTwitter size={14} /> <span className="hidden sm:inline">Twitter</span>
                </a>
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-white" style={{ backgroundColor: '#1877F2' }}>
                  <FaFacebook size={14} /> <span className="hidden sm:inline">Facebook</span>
                </a>
                <button onClick={copyLink}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-gray-300" style={{ backgroundColor: '#232733' }}>
                  {copied ? <MdCheck size={14} className="text-emerald-400" /> : <MdContentCopy size={14} />}
                  <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* SEO */}
            <div className="rounded-xl p-4 hidden sm:block" style={{ backgroundColor: '#1a1d27' }}>
              <h2 className="text-base font-semibold text-white mb-2">Streaming {league.name} Gratis</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Tonton {matchTitle} secara gratis di SportMeriah. Live streaming sepakbola dengan kualitas HD, tanpa buffering.
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-1/4">
            <div className="rounded-xl p-4 lg:sticky lg:top-32" style={{ backgroundColor: '#1a1d27' }}>
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2 text-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                Sedang Live
              </h3>

              {relatedMatches.length > 0 ? (
                <div className="space-y-2">
                  {relatedMatches.map((match, index) => (
                    <Link
                      key={match.id || index}
                      href={`/football/${match.id}?stream=${match.stream?.id}&provider=${match.stream?.provider || 'sphere'}`}
                      className="block rounded-lg p-3 transition-colors"
                      style={{ backgroundColor: '#232733' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a2e3a'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#232733'}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <img src={match.homeTeam?.logo} alt="" className="w-4 h-4 object-contain" onError={(e) => e.target.src = 'https://placehold.co/16x16/232733/6b7280?text=T'} />
                        <span className="text-gray-300 text-xs truncate flex-1">{match.homeTeam?.name}</span>
                        {match.score && <span className="text-white text-xs font-bold">{match.score.home}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <img src={match.awayTeam?.logo} alt="" className="w-4 h-4 object-contain" onError={(e) => e.target.src = 'https://placehold.co/16x16/232733/6b7280?text=T'} />
                        <span className="text-gray-300 text-xs truncate flex-1">{match.awayTeam?.name}</span>
                        {match.score && <span className="text-white text-xs font-bold">{match.score.away}</span>}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-gray-600 text-[10px]">{match.league?.name}</span>
                        <span className="text-red-400 text-[10px] flex items-center gap-1">
                          <span className="w-1 h-1 bg-red-500 rounded-full animate-pulse"></span>
                          LIVE
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-xs">Tidak ada pertandingan live lainnya</p>
              )}

              <div className="mt-5 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Quick Links</h4>
                <div className="space-y-2">
                  <Link href="/football" className="block text-gray-500 hover:text-emerald-400 text-sm flex items-center gap-2 transition-colors">
                    <MdSportsSoccer size={14} /> Semua Pertandingan
                  </Link>
                  <Link href="/basketball" className="block text-gray-500 hover:text-orange-400 text-sm flex items-center gap-2 transition-colors">
                    <MdSportsBasketball size={14} /> Basketball
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Nav Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden" style={{ backgroundColor: '#0a0c14', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex justify-around items-center py-2.5 px-1">
          <Link href="/" className="flex flex-col items-center px-3 py-1 text-gray-500 hover:text-emerald-400 transition-colors">
            <IoHome size={20} />
            <span className="text-[10px] mt-1">Beranda</span>
          </Link>
          <Link href="/football" className="flex flex-col items-center px-3 py-1 text-emerald-400">
            <MdSportsSoccer size={20} />
            <span className="text-[10px] mt-1 font-medium">Sepakbola</span>
          </Link>
          <Link href="/basketball" className="flex flex-col items-center px-3 py-1 text-gray-500 hover:text-orange-400 transition-colors">
            <MdSportsBasketball size={20} />
            <span className="text-[10px] mt-1">NBA</span>
          </Link>
          <a href="https://t.me/sportmeriah" target="_blank" className="flex flex-col items-center px-3 py-1 text-gray-500 hover:text-blue-400 transition-colors">
            <FaTelegram size={20} />
            <span className="text-[10px] mt-1">Telegram</span>
          </a>
        </div>
      </nav>
      <div className="h-16 md:hidden"></div>
    </main>
  );
}
