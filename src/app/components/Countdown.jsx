'use client';

import { useEffect, useState } from 'react';

export default function Countdown({ kickoffTime }) {
    const [timeLeft, setTimeLeft] = useState(null);
    const [status, setStatus] = useState('loading');

    useEffect(() => {
        const calculateTime = () => {
            const now = new Date().getTime();
            const kickoff = new Date(kickoffTime).getTime();
            const difference = kickoff - now;

            if (difference > 0) {
                // Match belum mulai
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((difference % (1000 * 60)) / 1000);

                setTimeLeft({ days, hours, minutes, seconds });
                setStatus('upcoming');
            } else if (difference > -105 * 60 * 1000) {
                // Match lagi jalan (asumsi 90 menit + 15 menit injury time)
                setStatus('live');
                setTimeLeft(null);
            } else {
                // Match udah selesai
                setStatus('finished');
                setTimeLeft(null);
            }
        };

        calculateTime();
        const interval = setInterval(calculateTime, 1000);

        return () => clearInterval(interval);
    }, [kickoffTime]);

    // Format schedule
    const formatSchedule = () => {
        try {
            const date = new Date(kickoffTime);
            const timeZoneName = date.toLocaleTimeString('en-us', {
                timeZoneName: 'short'
            }).split(' ')[2];

            const options = {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            };

            return `${date.toLocaleString('id-ID', options)} (${timeZoneName})`;
        } catch {
            return 'Schedule TBD';
        }
    };

    if (status === 'loading') {
        return null;
    }

    if (status === 'live') {
        return (
            <div className="text-center">
                <div className="text-3xl font-bold text-red-500 animate-pulse">
                    🔴 LIVE NOW
                </div>
                <p className="text-gray-400 mt-2">Pertandingan sedang berlangsung!</p>
            </div>
        );
    }

    if (status === 'finished') {
        return (
            <div className="text-center">
                <div className="text-2xl font-bold text-gray-400">
                    ⏹️ MATCH FINISHED
                </div>
                <p className="text-gray-500 mt-2">Pertandingan sudah selesai</p>
            </div>
        );
    }

    return (
        <div className="text-center">
            {/* Schedule */}
            <p className="text-gray-400 text-sm mb-4">{formatSchedule()}</p>

            {/* Countdown Timer */}
            <div className="flex justify-center gap-3 sm:gap-4">
                {timeLeft?.days > 0 && (
                    <div className="bg-gray-800 border border-gray-700 px-4 py-3 rounded-lg min-w-[60px]">
                        <span className="text-2xl sm:text-3xl font-bold text-white">
                            {String(timeLeft.days).padStart(2, '0')}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">Hari</p>
                    </div>
                )}
                <div className="bg-gray-800 border border-gray-700 px-4 py-3 rounded-lg min-w-[60px]">
                    <span className="text-2xl sm:text-3xl font-bold text-white">
                        {String(timeLeft?.hours || 0).padStart(2, '0')}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">Jam</p>
                </div>
                <div className="bg-gray-800 border border-gray-700 px-4 py-3 rounded-lg min-w-[60px]">
                    <span className="text-2xl sm:text-3xl font-bold text-white">
                        {String(timeLeft?.minutes || 0).padStart(2, '0')}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">Menit</p>
                </div>
                <div className="bg-gray-800 border border-gray-700 px-4 py-3 rounded-lg min-w-[60px]">
                    <span className="text-2xl sm:text-3xl font-bold text-orange-500">
                        {String(timeLeft?.seconds || 0).padStart(2, '0')}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">Detik</p>
                </div>
            </div>
        </div>
    );
}
