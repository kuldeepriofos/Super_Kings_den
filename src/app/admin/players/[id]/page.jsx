'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import PlayerEditorForm from '../../../../components/admin/PlayerEditorForm';

export default function EditPlayerPage() {
  const params = useParams();
  const playerId = params.id;

  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadPlayer() {
      if (!playerId) return;
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/admin/players/${playerId}/`);
        const data = await res.json();

        if (!res.ok || !data.success || !data.player) {
          throw new Error(data.error || 'Player profile not found in database.');
        }

        setPlayer(data.player);
      } catch (err) {
        setError(err.message || 'Failed to load player details');
      } finally {
        setLoading(false);
      }
    }

    loadPlayer();
  }, [playerId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-20 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
        <p className="text-sm font-semibold text-slate-400">Loading player profile details...</p>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4">
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Player Not Found</h2>
            <p className="text-xs text-slate-400 mt-1">{error || 'Could not locate the requested player profile.'}</p>
          </div>
          <Link
            href="/admin/players/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-xs transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Players Roster</span>
          </Link>
        </div>
      </div>
    );
  }

  return <PlayerEditorForm initialPlayer={player} isCreating={false} />;
}
