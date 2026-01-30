'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MdSportsSoccer, MdHome, MdRefresh, MdShare, MdPlayArrow, MdArrowBack } from 'react-icons/md';
import { FaFacebook, FaTwitter, FaWhatsapp, FaTelegram } from 'react-icons/fa';
import Hls from 'hls.js';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://sportmeriah-backend-production.up.railway.app';

export default function FootballPlayerClient({ streamId }) {
  const [stream, setStream] = useState(null);
  const [relatedStreams, setRelatedStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    fetchStreamInfo();
    fetchRelatedStreams();
  }, [streamId]);

  // Cleanup HLS on unmount
  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, []);

  const fetchStreamInfo = async () => {
    try {
      setError(null);
      const response = await fetch(`${API_URL}/api/football/stream/${streamId}`);
      const data = await response.json();

      if (data.success && data.stream) {
        setStream(data.stream);
      } else {
        setError('Stream tidak ditemukan');
      }
    } catch (err) {
      console.error('Error fetching stream:', err);
      setError('Gagal memuat stream');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedStreams = async () => {
    try {
      const response = await fetch(`${API_URL}/api/football`);
      const data = await response.json();

      if (data.success) {
        // Get other streams, excluding current
        const others = [...(data.streams.live || []), ...(data.streams.all || [])]
          .filter(s => String(s.id) !== String(streamId))
          .slice(0, 6);
        setRelatedStreams(others);
      }
    } catch (err) {
      console.error('Error fetching related:', err);
    }
  };

  const startStream = () => {
    if (!streamId) return;

    const streamUrl = `${API_URL}/api/stream/${streamId}.m3u8`;

    if (videoRef.current) {
      // Destroy existing HLS instance
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
        });

        hls.loadSource(streamUrl);
        hls.attachMedia(videoRef.current);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          videoRef.current.play()
            .then(() => setIsPlaying(true))
            .catch(err => console.error('Autoplay failed:', err));
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error('HLS Error:', data);
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.log('Network error, trying to recover...');
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log('Media error, trying to recover...');
                hls.recoverMediaError();
                break;
              default:
                console.log('Fatal error, destroying HLS...');
                hls.destroy();
                break;
            }
          }
        });

        hlsRef.current = hls;
      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari native HLS support
        videoRef.current.src = streamUrl;
        videoRef.current.addEventListener('loadedmetadata', () => {
          videoRef.current.play()
            .then(() => setIsPlaying(true))
            .catch(err => console.error('Autoplay failed:', err));
        });
      }
    }
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = stream ? `Nonton ${stream.name} live di SportMeriah!` : 'Live Football Streaming';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <MdSportsSoccer className="text-6xl text-green-500 animate-bounce mx-auto mb-4" />
          <p className="text-xl">Memuat stream...</p>
        </div>
      </div>
    );
  }

  if (error || !stream) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <MdSportsSoccer className="text-6xl text-gray-600 mx-auto mb-4" />
          <p className="text-xl mb-4">{error || 'Stream tidak ditemukan'}</p>
          <Link href="/football" className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg">
            Kembali ke Daftar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-green-100 mb-3">
            <Link href="/" className="hover:text-white flex items-center gap-1">
              <MdHome /> Home
            </Link>
            <span>/</span>
            <Link href="/football" className="hover:text-white">Football</Link>
            <span>/</span>
            <span className="text-white truncate max-w-[200px]">{stream.name}</span>
          </div>

          {/* Title */}
          <h1 className="text-xl font-bold">{stream.name}</h1>
          <p className="text-green-200 text-sm mt-1">{stream.category?.name}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-4">
        {/* Video Player */}
        <div className="bg-black rounded-lg overflow-hidden mb-4 relative aspect-video">
          <video
            ref={videoRef}
            className="w-full h-full"
            controls
            playsInline
            poster="/football-poster.jpg"
          />

          {/* Play Overlay */}
          {!isPlaying && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 cursor-pointer"
              onClick={startStream}
            >
              <div className="bg-green-600 hover:bg-green-700 rounded-full p-6 mb-4 transition-transform hover:scale-110">
                <MdPlayArrow className="text-5xl" />
              </div>
              <p className="text-xl font-bold text-center px-4">{stream.name}</p>
              <p className="text-green-400 mt-2">Klik untuk menonton</p>
            </div>
          )}
        </div>

        {/* Stream Info */}
        <div className="bg-gray-800 rounded-lg p-4 mb-4">
          <h2 className="font-semibold text-lg mb-2">{stream.name}</h2>
          <div className="flex flex-wrap gap-2">
            <span className="bg-gray-700 px-3 py-1 rounded-full text-sm">
              {stream.category?.name || 'Football'}
            </span>
            {stream.isLive && (
              <span className="bg-red-600 px-3 py-1 rounded-full text-sm animate-pulse">
                🔴 LIVE
              </span>
            )}
          </div>
        </div>

        {/* Share Buttons */}
        <div className="bg-gray-800 rounded-lg p-4 mb-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <MdShare /> Bagikan
          </h3>
          <div className="flex gap-3">
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 p-3 rounded-full transition"
            >
              <FaFacebook />
            </a>
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-sky-500 hover:bg-sky-600 p-3 rounded-full transition"
            >
              <FaTwitter />
            </a>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 hover:bg-green-700 p-3 rounded-full transition"
            >
              <FaWhatsapp />
            </a>
            <a
              href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-500 hover:bg-blue-600 p-3 rounded-full transition"
            >
              <FaTelegram />
            </a>
          </div>
        </div>

        {/* Related Streams */}
        {relatedStreams.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-4 mb-4">
            <h3 className="font-semibold mb-3">Siaran Football Lainnya</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {relatedStreams.map((s) => (
                <Link
                  key={s.id}
                  href={`/football/${s.id}`}
                  className="block bg-gray-700 hover:bg-gray-600 rounded p-3 transition"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{s.name}</div>
                      <div className="text-xs text-gray-400">{s.category?.name}</div>
                    </div>
                    {s.isLive && (
                      <span className="bg-red-600 px-2 py-0.5 rounded text-xs ml-2">LIVE</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            <Link
              href="/football"
              className="block text-center text-green-400 hover:text-green-300 mt-3 text-sm"
            >
              Lihat Semua Siaran →
            </Link>
          </div>
        )}

        {/* SEO Content */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="font-semibold mb-2">Streaming Football Gratis</h2>
          <p className="text-sm text-gray-400">
            Tonton {stream.name} secara gratis di SportMeriah. Live streaming football 
            dengan kualitas HD dari berbagai liga top dunia. Nikmati pertandingan tanpa 
            buffering dengan server yang stabil.
          </p>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700">
        <div className="flex justify-around py-3">
          <Link href="/" className="flex flex-col items-center text-gray-400 hover:text-white">
            <MdHome className="text-2xl" />
            <span className="text-xs">Home</span>
          </Link>
          <Link href="/football" className="flex flex-col items-center text-green-500">
            <MdSportsSoccer className="text-2xl" />
            <span className="text-xs">Football</span>
          </Link>
          <button onClick={() => location.reload()} className="flex flex-col items-center text-gray-400 hover:text-white">
            <MdRefresh className="text-2xl" />
            <span className="text-xs">Refresh</span>
          </button>
        </div>
      </div>
    </div>
  );
}
