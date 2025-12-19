"use client";

import { useEffect, useRef } from "react";
import useGameStoreData, { GameStoreData } from "@/app/store/gameStoreData";

// CONFIG
const GRID_SIZE = 40;
const PLAYER_RADIUS = 20;

// Dragon color palettes for different players
const DRAGON_COLOR_PALETTES = [
  { // Green dragon
    body: "#427F38",
    dark: "#2A4E26",
    wing: "#386C32",
    underbelly: "#DCC79D",
    outline: "#213F1D",
  },
  { // Blue dragon
    body: "#3872B8",
    dark: "#264A7A",
    wing: "#2E5F9E",
    underbelly: "#C9D9E8",
    outline: "#1D3A5C",
  },
  { // Red dragon
    body: "#B83838",
    dark: "#7A2626",
    wing: "#9E2E2E",
    underbelly: "#E8C9C9",
    outline: "#5C1D1D",
  },
  { // Purple dragon
    body: "#8B38B8",
    dark: "#5A267A",
    wing: "#762E9E",
    underbelly: "#E0C9E8",
    outline: "#451D5C",
  },
  { // Orange dragon
    body: "#B87438",
    dark: "#7A4D26",
    wing: "#9E632E",
    underbelly: "#E8DCC9",
    outline: "#5C3A1D",
  },
  { // Cyan dragon
    body: "#38A5B8",
    dark: "#266D7A",
    wing: "#2E8C9E",
    underbelly: "#C9E5E8",
    outline: "#1D525C",
  },
  { // Pink dragon
    body: "#B8388B",
    dark: "#7A265A",
    wing: "#9E2E76",
    underbelly: "#E8C9E0",
    outline: "#5C1D45",
  },
  { // Yellow dragon
    body: "#B8A538",
    dark: "#7A6D26",
    wing: "#9E8C2E",
    underbelly: "#E8E5C9",
    outline: "#5C521D",
  },
];

// Track assigned colors to ensure uniqueness
const playerColorMap = new Map<string, number>();
let nextColorIndex = 0;

// Get color palette for a player - ensures unique colors per player
const getPlayerColors = (playerId: string) => {
  // Check if player already has a color assigned
  if (playerColorMap.has(playerId)) {
    return DRAGON_COLOR_PALETTES[playerColorMap.get(playerId)!];
  }
  
  // Find the next available color that isn't used
  const usedColors = new Set(playerColorMap.values());
  let colorIndex = nextColorIndex;
  
  // Try to find an unused color first
  for (let i = 0; i < DRAGON_COLOR_PALETTES.length; i++) {
    if (!usedColors.has(i)) {
      colorIndex = i;
      break;
    }
  }
  
  // If all colors are used, cycle through
  if (usedColors.size >= DRAGON_COLOR_PALETTES.length) {
    colorIndex = nextColorIndex % DRAGON_COLOR_PALETTES.length;
  }
  
  // Assign and remember this color for the player
  playerColorMap.set(playerId, colorIndex);
  nextColorIndex = (colorIndex + 1) % DRAGON_COLOR_PALETTES.length;
  
  return DRAGON_COLOR_PALETTES[colorIndex];
};

// Clean up colors for players that are no longer in the game
const cleanupPlayerColors = (currentPlayerIds: Set<string>) => {
  for (const playerId of playerColorMap.keys()) {
    if (!currentPlayerIds.has(playerId)) {
      playerColorMap.delete(playerId);
    }
  }
};

type DragonColors = typeof DRAGON_COLOR_PALETTES[0];

// Dragon drawing functions
const drawDragonBody = (ctx: CanvasRenderingContext2D, x: number, y: number, colors: DragonColors) => {
  const bodyWidth = PLAYER_RADIUS * 1.4;
  const bodyHeight = PLAYER_RADIUS * 1.1;

  // Main body (rounded oval)
  ctx.fillStyle = colors.body;
  ctx.beginPath();
  ctx.ellipse(x, y, bodyWidth, bodyHeight, 0, 0, Math.PI * 2);
  ctx.fill();

  // Underbelly with horizontal stripes
  ctx.fillStyle = colors.underbelly;
  const bellyY = y + PLAYER_RADIUS * 0.3;
  const bellyWidth = bodyWidth * 0.9;
  const bellyHeight = bodyHeight * 0.5;
  
  ctx.beginPath();
  ctx.ellipse(x, bellyY, bellyWidth, bellyHeight, 0, 0, Math.PI * 2);
  ctx.fill();

  // Underbelly stripes
  ctx.strokeStyle = colors.dark;
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 4; i++) {
    const stripeY = bellyY - bellyHeight * 0.3 + (i * bellyHeight * 0.2);
    ctx.beginPath();
    ctx.moveTo(x - bellyWidth * 0.8, stripeY);
    ctx.lineTo(x + bellyWidth * 0.8, stripeY);
    ctx.stroke();
  }
};

const drawDragonHead = (ctx: CanvasRenderingContext2D, x: number, y: number, colors: DragonColors) => {
  const headX = x - PLAYER_RADIUS * 0.9;
  const headY = y - PLAYER_RADIUS * 0.1;
  const headWidth = PLAYER_RADIUS * 1.0;
  const headHeight = PLAYER_RADIUS * 0.85;

  // Main head (rounded)
  ctx.fillStyle = colors.body;
  ctx.beginPath();
  ctx.ellipse(headX, headY, headWidth, headHeight, -0.1, 0, Math.PI * 2);
  ctx.fill();

  // Large rounded snout
  const snoutX = headX - headWidth * 0.6;
  const snoutY = headY;
  const snoutWidth = headWidth * 0.5;
  const snoutHeight = headHeight * 0.6;

  ctx.beginPath();
  ctx.ellipse(snoutX, snoutY, snoutWidth, snoutHeight, -0.1, 0, Math.PI * 2);
  ctx.fill();

  // Mouth opening
  ctx.fillStyle = colors.underbelly;
  ctx.beginPath();
  ctx.ellipse(snoutX - snoutWidth * 0.2, snoutY + snoutHeight * 0.2, snoutWidth * 0.3, snoutHeight * 0.25, -0.1, 0, Math.PI * 2);
  ctx.fill();

  // Chin spike
  ctx.fillStyle = colors.body;
  ctx.beginPath();
  ctx.moveTo(snoutX, snoutY + snoutHeight * 0.4);
  ctx.lineTo(snoutX - snoutWidth * 0.2, snoutY + snoutHeight * 0.7);
  ctx.lineTo(snoutX + snoutWidth * 0.2, snoutY + snoutHeight * 0.7);
  ctx.closePath();
  ctx.fill();
};

const drawDragonHorns = (ctx: CanvasRenderingContext2D, x: number, y: number, colors: DragonColors) => {
  const headX = x - PLAYER_RADIUS * 0.9;
  const headY = y - PLAYER_RADIUS * 0.1;
  const headWidth = PLAYER_RADIUS * 1.0;

  ctx.fillStyle = colors.underbelly;
  ctx.strokeStyle = colors.outline;
  ctx.lineWidth = 2;

  // Left horn (curved upward and backward)
  ctx.beginPath();
  ctx.moveTo(headX - headWidth * 0.2, headY - PLAYER_RADIUS * 0.6);
  ctx.lineTo(headX - headWidth * 0.5, headY - PLAYER_RADIUS * 1.0);
  ctx.lineTo(headX - headWidth * 0.35, headY - PLAYER_RADIUS * 0.75);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Right horn
  ctx.beginPath();
  ctx.moveTo(headX + headWidth * 0.1, headY - PLAYER_RADIUS * 0.6);
  ctx.lineTo(headX + headWidth * 0.3, headY - PLAYER_RADIUS * 1.0);
  ctx.lineTo(headX + headWidth * 0.2, headY - PLAYER_RADIUS * 0.75);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
};

const drawDragonWings = (ctx: CanvasRenderingContext2D, x: number, y: number, colors: DragonColors) => {
  const wingBaseX = x - PLAYER_RADIUS * 0.2;
  const wingBaseY = y - PLAYER_RADIUS * 0.3;

  ctx.fillStyle = colors.wing;
  ctx.strokeStyle = colors.outline;
  ctx.lineWidth = 2.5;

  // Left wing (bat-like with curved upper edge and lobed lower edge)
  ctx.beginPath();
  ctx.moveTo(wingBaseX, wingBaseY);
  ctx.lineTo(wingBaseX - PLAYER_RADIUS * 1.0, wingBaseY - PLAYER_RADIUS * 0.8);
  ctx.lineTo(wingBaseX - PLAYER_RADIUS * 2.2, wingBaseY - PLAYER_RADIUS * 0.2);
  ctx.lineTo(wingBaseX - PLAYER_RADIUS * 2.0, wingBaseY + PLAYER_RADIUS * 0.3);
  ctx.lineTo(wingBaseX - PLAYER_RADIUS * 1.3, wingBaseY + PLAYER_RADIUS * 0.6);
  ctx.lineTo(wingBaseX - PLAYER_RADIUS * 0.5, wingBaseY + PLAYER_RADIUS * 0.4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Wing vein lines (same color as body)
  ctx.strokeStyle = colors.body;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(wingBaseX, wingBaseY);
  ctx.lineTo(wingBaseX - PLAYER_RADIUS * 1.5, wingBaseY - PLAYER_RADIUS * 0.3);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(wingBaseX - PLAYER_RADIUS * 0.5, wingBaseY + PLAYER_RADIUS * 0.2);
  ctx.lineTo(wingBaseX - PLAYER_RADIUS * 1.8, wingBaseY + PLAYER_RADIUS * 0.1);
  ctx.stroke();

  // Right wing
  ctx.fillStyle = colors.wing;
  ctx.strokeStyle = colors.outline;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(wingBaseX, wingBaseY);
  ctx.lineTo(wingBaseX + PLAYER_RADIUS * 1.0, wingBaseY - PLAYER_RADIUS * 0.8);
  ctx.lineTo(wingBaseX + PLAYER_RADIUS * 2.2, wingBaseY - PLAYER_RADIUS * 0.2);
  ctx.lineTo(wingBaseX + PLAYER_RADIUS * 2.0, wingBaseY + PLAYER_RADIUS * 0.3);
  ctx.lineTo(wingBaseX + PLAYER_RADIUS * 1.3, wingBaseY + PLAYER_RADIUS * 0.6);
  ctx.lineTo(wingBaseX + PLAYER_RADIUS * 0.5, wingBaseY + PLAYER_RADIUS * 0.4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Wing vein lines
  ctx.strokeStyle = colors.body;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(wingBaseX, wingBaseY);
  ctx.lineTo(wingBaseX + PLAYER_RADIUS * 1.5, wingBaseY - PLAYER_RADIUS * 0.3);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(wingBaseX + PLAYER_RADIUS * 0.5, wingBaseY + PLAYER_RADIUS * 0.2);
  ctx.lineTo(wingBaseX + PLAYER_RADIUS * 1.8, wingBaseY + PLAYER_RADIUS * 0.1);
  ctx.stroke();
};

const drawDragonLegs = (ctx: CanvasRenderingContext2D, x: number, y: number, colors: DragonColors) => {
  const legColor = colors.body;
  const clawColor = colors.underbelly;
  const legWidth = PLAYER_RADIUS * 0.25;
  const legHeight = PLAYER_RADIUS * 0.6;

  ctx.fillStyle = legColor;
  ctx.strokeStyle = colors.outline;
  ctx.lineWidth = 2;

  // Front left leg
  const frontLeftX = x - PLAYER_RADIUS * 0.5;
  const frontLeftY = y + PLAYER_RADIUS * 0.4;
  ctx.beginPath();
  ctx.ellipse(frontLeftX, frontLeftY, legWidth, legHeight, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Front left claws
  ctx.fillStyle = clawColor;
  ctx.beginPath();
  ctx.moveTo(frontLeftX - legWidth * 0.3, frontLeftY + legHeight * 0.7);
  ctx.lineTo(frontLeftX - legWidth * 0.6, frontLeftY + legHeight * 0.9);
  ctx.lineTo(frontLeftX - legWidth * 0.1, frontLeftY + legHeight * 0.9);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(frontLeftX, frontLeftY + legHeight * 0.7);
  ctx.lineTo(frontLeftX - legWidth * 0.2, frontLeftY + legHeight * 0.9);
  ctx.lineTo(frontLeftX + legWidth * 0.2, frontLeftY + legHeight * 0.9);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(frontLeftX + legWidth * 0.3, frontLeftY + legHeight * 0.7);
  ctx.lineTo(frontLeftX + legWidth * 0.1, frontLeftY + legHeight * 0.9);
  ctx.lineTo(frontLeftX + legWidth * 0.5, frontLeftY + legHeight * 0.9);
  ctx.closePath();
  ctx.fill();

  // Front right leg
  ctx.fillStyle = legColor;
  const frontRightX = x - PLAYER_RADIUS * 0.2;
  const frontRightY = y + PLAYER_RADIUS * 0.5;
  ctx.beginPath();
  ctx.ellipse(frontRightX, frontRightY, legWidth, legHeight, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Front right claws
  ctx.fillStyle = clawColor;
  ctx.beginPath();
  ctx.moveTo(frontRightX - legWidth * 0.3, frontRightY + legHeight * 0.7);
  ctx.lineTo(frontRightX - legWidth * 0.6, frontRightY + legHeight * 0.9);
  ctx.lineTo(frontRightX - legWidth * 0.1, frontRightY + legHeight * 0.9);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(frontRightX, frontRightY + legHeight * 0.7);
  ctx.lineTo(frontRightX - legWidth * 0.2, frontRightY + legHeight * 0.9);
  ctx.lineTo(frontRightX + legWidth * 0.2, frontRightY + legHeight * 0.9);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(frontRightX + legWidth * 0.3, frontRightY + legHeight * 0.7);
  ctx.lineTo(frontRightX + legWidth * 0.1, frontRightY + legHeight * 0.9);
  ctx.lineTo(frontRightX + legWidth * 0.5, frontRightY + legHeight * 0.9);
  ctx.closePath();
  ctx.fill();

  // Back left leg
  ctx.fillStyle = legColor;
  const backLeftX = x + PLAYER_RADIUS * 0.4;
  const backLeftY = y + PLAYER_RADIUS * 0.5;
  ctx.beginPath();
  ctx.ellipse(backLeftX, backLeftY, legWidth, legHeight, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Back left claws
  ctx.fillStyle = clawColor;
  ctx.beginPath();
  ctx.moveTo(backLeftX - legWidth * 0.3, backLeftY + legHeight * 0.7);
  ctx.lineTo(backLeftX - legWidth * 0.6, backLeftY + legHeight * 0.9);
  ctx.lineTo(backLeftX - legWidth * 0.1, backLeftY + legHeight * 0.9);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(backLeftX, backLeftY + legHeight * 0.7);
  ctx.lineTo(backLeftX - legWidth * 0.2, backLeftY + legHeight * 0.9);
  ctx.lineTo(backLeftX + legWidth * 0.2, backLeftY + legHeight * 0.9);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(backLeftX + legWidth * 0.3, backLeftY + legHeight * 0.7);
  ctx.lineTo(backLeftX + legWidth * 0.1, backLeftY + legHeight * 0.9);
  ctx.lineTo(backLeftX + legWidth * 0.5, backLeftY + legHeight * 0.9);
  ctx.closePath();
  ctx.fill();

  // Back right leg
  ctx.fillStyle = legColor;
  const backRightX = x + PLAYER_RADIUS * 0.7;
  const backRightY = y + PLAYER_RADIUS * 0.4;
  ctx.beginPath();
  ctx.ellipse(backRightX, backRightY, legWidth, legHeight, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Back right claws
  ctx.fillStyle = clawColor;
  ctx.beginPath();
  ctx.moveTo(backRightX - legWidth * 0.3, backRightY + legHeight * 0.7);
  ctx.lineTo(backRightX - legWidth * 0.6, backRightY + legHeight * 0.9);
  ctx.lineTo(backRightX - legWidth * 0.1, backRightY + legHeight * 0.9);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(backRightX, backRightY + legHeight * 0.7);
  ctx.lineTo(backRightX - legWidth * 0.2, backRightY + legHeight * 0.9);
  ctx.lineTo(backRightX + legWidth * 0.2, backRightY + legHeight * 0.9);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(backRightX + legWidth * 0.3, backRightY + legHeight * 0.7);
  ctx.lineTo(backRightX + legWidth * 0.1, backRightY + legHeight * 0.9);
  ctx.lineTo(backRightX + legWidth * 0.5, backRightY + legHeight * 0.9);
  ctx.closePath();
  ctx.fill();
};

const drawDragonTail = (ctx: CanvasRenderingContext2D, x: number, y: number, colors: DragonColors) => {
  const tailStartX = x + PLAYER_RADIUS * 1.0;
  const tailStartY = y + PLAYER_RADIUS * 0.2;
  const tailMidX = x + PLAYER_RADIUS * 2.0;
  const tailMidY = y - PLAYER_RADIUS * 0.3;
  const tailEndX = x + PLAYER_RADIUS * 2.8;
  const tailEndY = y - PLAYER_RADIUS * 0.5;
  const tailWidth = PLAYER_RADIUS * 0.5;

  ctx.fillStyle = colors.body;
  ctx.strokeStyle = colors.outline;
  ctx.lineWidth = 2.5;

  // Curved tail (thick, tapering)
  ctx.beginPath();
  ctx.moveTo(tailStartX, tailStartY);
  ctx.quadraticCurveTo(tailMidX, tailMidY, tailEndX, tailEndY);
  ctx.lineTo(tailEndX + tailWidth * 0.2, tailEndY);
  ctx.quadraticCurveTo(tailMidX, tailMidY + tailWidth * 0.3, tailStartX, tailStartY + tailWidth * 0.4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Tail tip (pointed)
  ctx.beginPath();
  ctx.moveTo(tailEndX, tailEndY);
  ctx.lineTo(tailEndX + tailWidth * 0.3, tailEndY - tailWidth * 0.2);
  ctx.lineTo(tailEndX + tailWidth * 0.2, tailEndY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
};

const drawDragonSpines = (ctx: CanvasRenderingContext2D, x: number, y: number, colors: DragonColors) => {
  ctx.fillStyle = colors.body;
  ctx.strokeStyle = colors.outline;
  ctx.lineWidth = 2;

  // Spines along back and tail (triangular spikes)
  const spinePositions = [
    { x: x - PLAYER_RADIUS * 0.6, y: y - PLAYER_RADIUS * 0.5 },
    { x: x - PLAYER_RADIUS * 0.3, y: y - PLAYER_RADIUS * 0.6 },
    { x: x, y: y - PLAYER_RADIUS * 0.5 },
    { x: x + PLAYER_RADIUS * 0.3, y: y - PLAYER_RADIUS * 0.4 },
    { x: x + PLAYER_RADIUS * 0.6, y: y - PLAYER_RADIUS * 0.3 },
    { x: x + PLAYER_RADIUS * 0.9, y: y - PLAYER_RADIUS * 0.2 },
    { x: x + PLAYER_RADIUS * 1.4, y: y - PLAYER_RADIUS * 0.1 },
    { x: x + PLAYER_RADIUS * 1.9, y: y - PLAYER_RADIUS * 0.2 },
    { x: x + PLAYER_RADIUS * 2.4, y: y - PLAYER_RADIUS * 0.3 },
  ];

  spinePositions.forEach((pos, i) => {
    const height = PLAYER_RADIUS * (0.25 + i * 0.03);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.lineTo(pos.x - height * 0.4, pos.y - height);
    ctx.lineTo(pos.x + height * 0.4, pos.y - height);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });
};

const drawDragonEyes = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
  const headX = x - PLAYER_RADIUS * 0.9;
  const headY = y - PLAYER_RADIUS * 0.1;
  const eyeSize = PLAYER_RADIUS * 0.12;

  // Simple black dot eyes
  ctx.fillStyle = "#1a1a1a";
  
  // Left eye
  const leftEyeX = headX - PLAYER_RADIUS * 0.15;
  const leftEyeY = headY - PLAYER_RADIUS * 0.1;
  ctx.beginPath();
  ctx.arc(leftEyeX, leftEyeY, eyeSize, 0, Math.PI * 2);
  ctx.fill();

  // Right eye
  const rightEyeX = headX + PLAYER_RADIUS * 0.15;
  const rightEyeY = headY - PLAYER_RADIUS * 0.1;
  ctx.beginPath();
  ctx.arc(rightEyeX, rightEyeY, eyeSize, 0, Math.PI * 2);
  ctx.fill();
};

const drawDragonFire = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
  const headX = x - PLAYER_RADIUS * 0.9;
  const headY = y - PLAYER_RADIUS * 0.1;
  const snoutX = headX - PLAYER_RADIUS * 1.0;
  const fireStartX = snoutX - PLAYER_RADIUS * 0.3;
  const fireStartY = headY;

  // Outer flame (orange)
  ctx.fillStyle = "#F47C0F";
  ctx.beginPath();
  ctx.moveTo(fireStartX, fireStartY);
  ctx.lineTo(fireStartX - PLAYER_RADIUS * 0.8, fireStartY - PLAYER_RADIUS * 0.3);
  ctx.lineTo(fireStartX - PLAYER_RADIUS * 0.6, fireStartY);
  ctx.lineTo(fireStartX - PLAYER_RADIUS * 0.8, fireStartY + PLAYER_RADIUS * 0.3);
  ctx.closePath();
  ctx.fill();

  // Inner flame (yellow)
  ctx.fillStyle = "#FFE600";
  ctx.beginPath();
  ctx.moveTo(fireStartX, fireStartY);
  ctx.lineTo(fireStartX - PLAYER_RADIUS * 0.5, fireStartY - PLAYER_RADIUS * 0.15);
  ctx.lineTo(fireStartX - PLAYER_RADIUS * 0.4, fireStartY);
  ctx.lineTo(fireStartX - PLAYER_RADIUS * 0.5, fireStartY + PLAYER_RADIUS * 0.15);
  ctx.closePath();
  ctx.fill();

  // Innermost point (white)
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.arc(fireStartX - PLAYER_RADIUS * 0.3, fireStartY, PLAYER_RADIUS * 0.1, 0, Math.PI * 2);
  ctx.fill();
};

const drawDragonOutline = (ctx: CanvasRenderingContext2D, x: number, y: number, colors: DragonColors) => {
  ctx.strokeStyle = colors.outline;
  ctx.lineWidth = 2.5;

  // Body outline
  const bodyWidth = PLAYER_RADIUS * 1.4;
  const bodyHeight = PLAYER_RADIUS * 1.1;
  ctx.beginPath();
  ctx.ellipse(x, y, bodyWidth, bodyHeight, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Head outline
  const headX = x - PLAYER_RADIUS * 0.9;
  const headY = y - PLAYER_RADIUS * 0.1;
  const headWidth = PLAYER_RADIUS * 1.0;
  const headHeight = PLAYER_RADIUS * 0.85;
  ctx.beginPath();
  ctx.ellipse(headX, headY, headWidth, headHeight, -0.1, 0, Math.PI * 2);
  ctx.stroke();

  // Snout outline
  const snoutX = headX - headWidth * 0.6;
  const snoutWidth = headWidth * 0.5;
  const snoutHeight = headHeight * 0.6;
  ctx.beginPath();
  ctx.ellipse(snoutX, headY, snoutWidth, snoutHeight, -0.1, 0, Math.PI * 2);
  ctx.stroke();
};

const drawDragon = (ctx: CanvasRenderingContext2D, x: number, y: number, playerId: string) => {
  const colors = getPlayerColors(playerId);
  drawDragonWings(ctx, x, y, colors);
  drawDragonBody(ctx, x, y, colors);
  drawDragonTail(ctx, x, y, colors);
  drawDragonSpines(ctx, x, y, colors);
  drawDragonLegs(ctx, x, y, colors);
  drawDragonHead(ctx, x, y, colors);
  drawDragonHorns(ctx, x, y, colors);
  drawDragonEyes(ctx, x, y);
  drawDragonFire(ctx, x, y);
  drawDragonOutline(ctx, x, y, colors);
};


interface Player {
  id: string;
  x: number;
  y: number;
}
export default function GameCanvas(props: { players: Player[] }) {
  const { players } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);  
  // Store players in a ref so the render loop always reads the latest
  const playersRef = useRef(players);
  
  // Update the ref whenever players changes
  useEffect(() => {
    playersRef.current = players;
  }, [players]);

  // Set up canvas and render loop only once
  useEffect(() => {
    const canvas = canvasRef.current!;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d")!;
    if (!ctx) return;
    
    // Resize canvas to container
    const resize = () => {
      canvas.width = canvas.parentElement!.clientWidth;
      canvas.height = canvas.parentElement!.clientHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const drawGrid = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.lineWidth = 1;

      for (let x = 0; x < w; x += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
    };

    const drawWatermark = () => {
      ctx.save();
      ctx.globalAlpha = 0.03;
      ctx.fillStyle = "#2DD9F6";
      ctx.font = "bold 80px Inter";
      ctx.textAlign = "center";
      ctx.fillText("ARENA DASH", canvas.width / 2, canvas.height / 2);
      ctx.restore();
    };

    const drawPlayers = () => {
      // Read from ref to always get the latest players
      const currentPlayers = playersRef.current;
      
      // Clean up colors for players who left
      const currentPlayerIds = new Set(currentPlayers.map(p => p.id));
      cleanupPlayerColors(currentPlayerIds);
      
      // Draw each player
      currentPlayers.forEach((p) => {
        drawDragon(ctx, p.x, p.y, p.id);
      });
    };

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;
      
      // Clear entire canvas before drawing
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawGrid();
      drawPlayers();
      drawWatermark();

      animationFrameRef.current = requestAnimationFrame(render);
    };
    render();

    return () => {
      isRunning = false;
      window.removeEventListener("resize", resize);
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, []); // Empty dependency array - only run once


  return <canvas ref={canvasRef} className="absolute inset-0" />;
}
