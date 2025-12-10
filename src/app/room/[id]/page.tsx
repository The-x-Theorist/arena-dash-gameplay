"use client";

import GameCanvas from "../../components/GameCanvas";
import Sidebar from "../../components/Sidebar";

export default function GameScreen() {
  return (
    <div className="h-screen w-screen flex flex-col bg-[#0D0F1A] text-gray-100">
      {/* HEADER */}
      <header className="h-14 px-6 flex items-center justify-between border-b border-white/10 bg-black/30 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold tracking-wide">
            Arena Dash <span className="text-sky-400">⚡</span>
          </span>
          <span className="text-xs uppercase tracking-widest text-gray-400 border-l border-white/10 pl-3">
            Realtime Multiplayer Arena
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1 text-gray-300">
            <span className="text-gray-500 text-xs uppercase tracking-wider">
              Room
            </span>
            <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono">
              Z3K9D
            </span>
          </div>

          <div className="flex items-center gap-1 text-gray-300">
            <span className="text-gray-500 text-xs uppercase tracking-wider">
              Players
            </span>
            <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-xs">
              3 / 8
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
            <span className="px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/40 text-xs font-mono">
              32 ms
            </span>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <div className="flex flex-1 overflow-hidden">
        {/* Arena */}
        <div className="flex-1 p-4">
          <div className="w-full h-full rounded-2xl border border-white/10 bg-[#050712] overflow-hidden relative">
            {/* You can add a faint grid as a background with CSS or draw in canvas */}
            <GameCanvas />
          </div>
        </div>

        {/* Sidebar */}
        <aside className="w-80 border-l border-white/10 bg-black/30 backdrop-blur-md p-4 flex flex-col">
          <Sidebar />
        </aside>
      </div>

      {/* FOOTER */}
      <footer className="h-9 px-6 flex items-center justify-between text-[11px] text-gray-500 bg-black/40 border-t border-white/10">
        <span>Press <span className="font-mono text-gray-300">~</span> to toggle debug</span>
        <span>
          <span className="font-mono text-gray-300">WASD / Arrows</span> to move •{" "}
          <span className="font-mono text-gray-300">Esc</span> to leave room
        </span>
      </footer>
    </div>
  );
}
