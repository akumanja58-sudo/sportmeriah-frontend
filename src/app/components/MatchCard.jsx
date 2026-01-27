import Link from 'next/link';

export default function MatchCard({ match }) {
    // Parse nama match
    const matchName = match.name.replace('USA Soccer', '').replace(':', '').trim();
    const hasMatch = matchName.length > 3;

    return (
        <Link href={`/match/${match.stream_id}`}>
            <div className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition cursor-pointer border border-gray-700 hover:border-green-500">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-xl">
                        ⚽
                    </div>
                    <div className="flex-1">
                        <h3 className="text-white font-semibold">
                            {hasMatch ? matchName : `Channel ${match.num}`}
                        </h3>
                        <p className="text-gray-400 text-sm">
                            {hasMatch ? '🔴 LIVE' : '📺 Standby'}
                        </p>
                    </div>
                    <div className="text-green-500">
                        ▶
                    </div>
                </div>
            </div>
        </Link>
    );
}