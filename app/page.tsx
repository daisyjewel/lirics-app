"use client";

import React, { useState, useRef } from 'react';

interface LyricLine {
  time: number;
  text: string;
}

export default function ShortsLyricsCreator() {
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [lyricsText, setLyricsText] = useState<string>(
    "Intro...\nBerjalan menyusuri malam\nMenghitung bintang yang berpesan\nApakah kau juga merasakan hal yang sama?"
  );
  const [parsedLyrics, setParsedLyrics] = useState<LyricLine[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);

  // State khusus Tap-to-Sync
  const [isSyncMode, setIsSyncMode] = useState(false);
  const [syncIndex, setSyncIndex] = useState(0);
  const [tempLines, setTempLines] = useState<LyricLine[]>([]);

  const audioRef = useRef<HTMLAudioElement>(null);

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAudioSrc(URL.createObjectURL(file));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setBgImage(URL.createObjectURL(file));
  };

  // Format detik ke [mm:ss.xx]
  const formatTimestamp = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(2).padStart(5, '0');
    return `${String(mins).padStart(2, '0')}:${secs}`;
  };

  // Parse manual jika user mengetik timestamp sendiri (contoh: 00:05 atau 00:05.20)
  const parseLyrics = () => {
    const lines = lyricsText.split('\n');
    const result: LyricLine[] = [];

    lines.forEach((line) => {
      const match = line.match(/(?:\[?(\d{2}):(\d{2}(?:\.\d+)?)\]?\s*)(.*)/);
      if (match) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseFloat(match[2]);
        result.push({ time: minutes * 60 + seconds, text: match[3] });
      }
    });

    setParsedLyrics(result);
    setCurrentLineIndex(0);
  };

  // 1. Mulai mode Tap-to-Sync dari teks lirik biasa
  const startTapSync = () => {
    const cleanLines = lyricsText
      .split('\n')
      .map((line) => line.replace(/^\[?\d{2}:\d{2}(?:\.\d+)?\]?\s*/, '').trim())
      .filter((line) => line.length > 0)
      .map((text) => ({ time: -1, text }));

    if (cleanLines.length === 0) return;

    setTempLines(cleanLines);
    setSyncIndex(0);
    setIsSyncMode(true);

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  };

  // 2. Rekam waktu saat tombol TAP ditekan di HP
  const handleTap = () => {
    if (!audioRef.current || syncIndex >= tempLines.length) return;

    const currentTime = Number(audioRef.current.currentTime.toFixed(2));
    const updated = tempLines.map((item, idx) =>
      idx === syncIndex ? { ...item, time: currentTime } : item
    );

    setTempLines(updated);
    const nextIndex = syncIndex + 1;
    setSyncIndex(nextIndex);

    // Update otomatis ke textarea & canvas preview jika sudah selesai semua baris
    const validSynced = updated.filter((item) => item.time >= 0);
    setParsedLyrics(validSynced);

    if (nextIndex >= tempLines.length) {
      const formattedText = updated
        .map((item) => `${formatTimestamp(item.time)} ${item.text}`)
        .join('\n');
      setLyricsText(formattedText);
      setIsSyncMode(false);
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current || parsedLyrics.length === 0) return;
    const currentTime = audioRef.current.currentTime;

    const activeIndex = parsedLyrics.findIndex((item, index) => {
      const nextTime = parsedLyrics[index + 1]?.time ?? Infinity;
      return currentTime >= item.time && currentTime < nextTime;
    });

    if (activeIndex !== -1 && activeIndex !== currentLineIndex) {
      setCurrentLineIndex(activeIndex);
    }
  };

  return (
    <div className="flex flex-col xl:flex-row items-center justify-center min-h-screen bg-slate-950 text-white p-4 gap-8 font-sans">
      
      {/* 📱 9:16 CANVAS PREVIEW (Format Vertikal Khusus Shorts) */}
      <div className="relative w-[340px] h-[600px] sm:w-[360px] sm:h-[640px] rounded-3xl overflow-hidden border-2 border-slate-700 shadow-2xl flex flex-col justify-between p-6 shrink-0">
        
        {/* Background Artwork + Blur Effect */}
        {bgImage ? (
          <div 
            className="absolute inset-0 bg-cover bg-center filter blur-2xl opacity-50 scale-125 transition-all duration-700"
            style={{ backgroundImage: `url(${bgImage})` }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 to-slate-950" />
        )}
        
        {/* Dark Overlay gradient for contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/80" />

        {/* TOP: Header Visual */}
        <div className="relative z-10 text-center pt-4">
          <p className="text-[10px] tracking-widest uppercase text-slate-300/70 font-semibold">Playing From Playlist</p>
          <p className="text-xs font-bold text-white drop-shadow">Aesthetic Vibes</p>
        </div>

        {/* CENTER: Artwork & Synced Lyrics */}
        <div className="relative z-10 flex flex-col items-center text-center my-auto w-full">
          {bgImage && (
            <img 
              src={bgImage} 
              alt="Cover Art" 
              className="w-48 h-48 object-cover rounded-2xl shadow-2xl mb-8 border border-white/20 scale-100 hover:scale-105 transition duration-300"
            />
          )}

          {/* Dynamic Lyrics (Spotlight Highlight) */}
          <div className="space-y-4 w-full h-36 flex flex-col justify-center items-center overflow-hidden">
            {parsedLyrics.length > 0 ? (
              parsedLyrics.map((line, index) => {
                const isActive = index === currentLineIndex;
                return (
                  <p
                    key={index}
                    className={`transition-all duration-300 px-2 ${
                      isActive
                        ? 'text-green-400 font-extrabold text-xl scale-110 drop-shadow-[0_0_15px_rgba(74,222,128,0.8)]'
                        : 'text-slate-300/40 text-sm blur-[0.4px]'
                    }`}
                  >
                    {line.text}
                  </p>
                );
              })
            ) : (
              <p className="text-slate-400 text-xs italic">Tap-to-Sync atau Apply lirik untuk preview</p>
            )}
          </div>
        </div>

        {/* BOTTOM: Audio Player Control */}
        <div className="relative z-10 w-full pb-2">
          {audioSrc && (
            <audio
              ref={audioRef}
              src={audioSrc}
              controls
              onTimeUpdate={handleTimeUpdate}
              className="w-full accent-green-400 h-8 opacity-80 hover:opacity-100 transition"
            />
          )}
        </div>
      </div>

      {/* ⚙️ PANEL CONTROL (Input Media & Text) */}
      <div className="w-full max-w-md bg-slate-900 p-5 rounded-2xl space-y-4 border border-slate-800 shadow-xl">
        <h2 className="text-lg font-bold text-slate-100 border-b border-slate-800 pb-2">Shorts Creator Settings</h2>
        
        <div>
          <label className="block text-xs font-medium mb-1 text-slate-300">1. Upload Audio (.mp3)</label>
          <input 
            type="file" 
            accept="audio/*" 
            onChange={handleAudioUpload}
            className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-indigo-600 file:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1 text-slate-300">2. Upload Background / Artwork</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageUpload}
            className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-indigo-600 file:text-white"
          />
        </div>

        {!isSyncMode ? (
          <div>
            <label className="block text-xs font-medium mb-1 text-slate-300">
              3. Paste Lirik (Bisa tanpa waktu, lalu klik Tap-to-Sync)
            </label>
            <textarea
              rows={6}
              value={lyricsText}
              onChange={(e) => setLyricsText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
            />
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                onClick={startTapSync}
                disabled={!audioSrc}
                className="py-2.5 bg-pink-600 hover:bg-pink-500 disabled:opacity-40 font-semibold rounded-lg text-sm transition shadow-lg shadow-pink-600/30"
              >
                Tap-to-Sync
              </button>
              <button
                onClick={parseLyrics}
                className="py-2.5 bg-indigo-600 hover:bg-indigo-500 font-semibold rounded-lg text-sm transition shadow-lg shadow-indigo-600/30"
              >
                Apply Manual
              </button>
            </div>
          </div>
        ) : (
          /* MODE TAP-TO-SYNC KHUSUS JEMPOL DI HP */
          <div className="space-y-3 bg-slate-950 p-3 rounded-xl border border-pink-500/40">
            <div className="flex justify-between items-center text-xs text-pink-300 font-medium">
              <span>Ketuk tombol saat lirik masuk:</span>
              <span>{syncIndex + 1} / {tempLines.length}</span>
            </div>

            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
              {tempLines.map((line, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded text-xs flex justify-between items-center ${
                    idx === syncIndex
                      ? 'bg-pink-600/30 border border-pink-500 text-white font-bold'
                      : idx < syncIndex
                      ? 'text-slate-500'
                      : 'text-slate-300'
                  }`}
                >
                  <span className="truncate pr-2">{line.text}</span>
                  <span className="font-mono text-[11px] shrink-0">
                    {line.time >= 0 ? formatTimestamp(line.time) : '--:--'}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={handleTap}
              className="w-full py-5 bg-pink-600 active:scale-95 hover:bg-pink-500 text-white font-extrabold text-base rounded-xl shadow-lg shadow-pink-600/40 transition"
            >
              TAP LIRIK SEKARANG
            </button>

            <button
              onClick={() => setIsSyncMode(false)}
              className="w-full py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Batal / Kembali
            </button>
          </div>
        )}
      </div>

    </div>
  );
}