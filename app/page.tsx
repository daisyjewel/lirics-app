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
    "00:00 Intro...\n00:05 Berjalan menyusuri malam\n00:09 Menghitung bintang yang berpesan\n00:14 Apakah kau juga merasakan hal yang sama?"
  );
  const [parsedLyrics, setParsedLyrics] = useState<LyricLine[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAudioSrc(URL.createObjectURL(file));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setBgImage(URL.createObjectURL(file));
  };

  const parseLyrics = () => {
    const lines = lyricsText.split('\n');
    const result: LyricLine[] = [];

    lines.forEach((line) => {
      const match = line.match(/(?:\[?(\d{2}):(\d{2})\]?\s*)(.*)/);
      if (match) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseInt(match[2], 10);
        result.push({ time: minutes * 60 + seconds, text: match[3] });
      }
    });

    setParsedLyrics(result);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current || parsedLyrics.length === 0) return;
    const currentTime = audioRef.current.currentTime;

    const activeIndex = parsedLyrics.findIndex((item, index) => {
      const nextTime = parsedLyrics[index + 1]?.time || Infinity;
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
              <p className="text-slate-400 text-xs italic">Apply lyrics to preview</p>
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

        <div>
          <label className="block text-xs font-medium mb-1 text-slate-300">3. Paste Lirik & Timestamp (mm:ss)</label>
          <textarea
            rows={6}
            value={lyricsText}
            onChange={(e) => setLyricsText(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={parseLyrics}
            className="mt-2 w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 font-semibold rounded-lg text-sm transition shadow-lg shadow-indigo-600/30"
          >
            Apply to Canvas
          </button>
        </div>
      </div>

    </div>
  );
}