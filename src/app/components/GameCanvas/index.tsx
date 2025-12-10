"use client";

import { useEffect, useRef } from "react";
import { useGameStore } from "../../../hooks/useGameStore";

// CONFIG
const GRID_SIZE = 40;
const PLAYER_RADIUS = 12;

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
//   const players = useGameStore((s) => s.players);

//   useEffect(() => {
//     const canvas = canvasRef.current!;
//     const ctx = canvas.getContext("2d")!;
    
//     // Resize canvas to container
//     const resize = () => {
//       canvas.width = canvas.parentElement!.clientWidth;
//       canvas.height = canvas.parentElement!.clientHeight;
//     };
//     resize();
//     window.addEventListener("resize", resize);

//     const drawGrid = () => {
//       const w = canvas.width;
//       const h = canvas.height;
//       ctx.strokeStyle = "rgba(255,255,255,0.05)";
//       ctx.lineWidth = 1;

//       for (let x = 0; x < w; x += GRID_SIZE) {
//         ctx.beginPath();
//         ctx.moveTo(x, 0);
//         ctx.lineTo(x, h);
//         ctx.stroke();
//       }
//       for (let y = 0; y < h; y += GRID_SIZE) {
//         ctx.beginPath();
//         ctx.moveTo(0, y);
//         ctx.lineTo(w, y);
//         ctx.stroke();
//       }
//     };

//     // const drawPlayers = () => {
//     //   players.forEach((p) => {
//     //     // Glow
//     //     const gradient = ctx.createRadialGradient(
//     //       p.x,
//     //       p.y,
//     //       PLAYER_RADIUS * 0.2,
//     //       p.x,
//     //       p.y,
//     //       PLAYER_RADIUS * 2.4
//     //     );
//     //     gradient.addColorStop(0, "rgba(45,217,246,0.8)"); // bright
//     //     gradient.addColorStop(1, "rgba(45,217,246,0)");   // fade out

//     //     ctx.fillStyle = gradient;
//     //     ctx.beginPath();
//     //     ctx.arc(p.x, p.y, PLAYER_RADIUS * 2, 0, Math.PI * 2);
//     //     ctx.fill();

//     //     // Player body
//     //     ctx.fillStyle = "#2DD9F6";
//     //     ctx.beginPath();
//     //     ctx.arc(p.x, p.y, PLAYER_RADIUS, 0, Math.PI * 2);
//     //     ctx.fill();
//     //   });
//     // };

//     const drawWatermark = () => {
//       ctx.save();
//       ctx.globalAlpha = 0.03;
//       ctx.fillStyle = "#2DD9F6";
//       ctx.font = "bold 80px Inter";
//       ctx.textAlign = "center";
//       ctx.fillText("ARENA DASH", canvas.width / 2, canvas.height / 2);
//       ctx.restore();
//     };

//     const render = () => {
//       ctx.clearRect(0, 0, canvas.width, canvas.height);

//       drawGrid();
//       drawPlayers();
//       drawWatermark();

//       requestAnimationFrame(render);
//     };
//     render();

//     return () => {
//       window.removeEventListener("resize", resize);
//     };
//   }, [players]);

  return <canvas ref={canvasRef} className="absolute inset-0" />;
}
