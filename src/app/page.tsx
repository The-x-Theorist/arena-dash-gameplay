"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const generateRoomId = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let roomId = "";
  for (let i = 0; i < 5; i++) {
    roomId += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return roomId;
};

export default function Home() {
  const [name, setName] = useState("");
  const router = useRouter();

  const startGame = () => {
    let roomIdToUse = roomId;
    if (!roomIdToUse) {
      roomIdToUse = generateRoomId();
    }
    router.push(`/room/${roomIdToUse}?name=${name}`);
  };

  return (
    <main className="h-screen flex flex-col items-center justify-center bg-[#0D0F1A] text-white">
      <h1 className="text-4xl font-bold mb-6">Arena Dash ⚡</h1>

      <input
        className="bg-black/40 border border-white/20 px-4 py-2 rounded mb-4"
        placeholder="Enter name..."
        onChange={(e) => setName(e.target.value)}
      />

      <form action={startGame}>
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!name}
        >
          Play
        </button>
      </form>
    </main>
  );
}
