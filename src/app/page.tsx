"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [name, setName] = useState("");
  const router = useRouter();

  const startGame = () => {
    const roomId = "quickplay";
    router.push(`/room/${roomId}?name=${name || "Guest"}`);
  };

  return (
    <main className="h-screen flex flex-col items-center justify-center bg-[#0D0F1A] text-white">
      <h1 className="text-4xl font-bold mb-6">Arena Dash ⚡</h1>

      <input
        className="bg-black/40 border border-white/20 px-4 py-2 rounded mb-4"
        placeholder="Enter name..."
        onChange={(e) => setName(e.target.value)}
      />

      <button
        onClick={startGame}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded text-lg"
      >
        Play
      </button>
    </main>
  );
}
