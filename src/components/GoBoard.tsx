import React, { useRef, useEffect, useState, useCallback } from 'react';
import { BoardSize, Color, Point, BoardState } from '../types/go';
import { GoCore } from '../engine/go-core';
import { SoundEngine } from '../engine/sound-engine';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
}

interface GoBoardProps {
  state: BoardState;
  onPlayMove: (point: Point) => void;
  disabled?: boolean;
  showCoordinates?: boolean;
  showLibertiesHelper?: boolean;
  captureTarget?: number;
}

export const GoBoard: React.FC<GoBoardProps> = ({
  state,
  onPlayMove,
  disabled = false,
  showCoordinates = true,
  showLibertiesHelper = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoverPoint, setHoverPoint] = useState<Point | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null); // For large board confirmation
  const [displaySize, setDisplaySize] = useState<number>(440);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number | null>(null);

  // Resize observer to ensure board fits perfectly on all tablets and screens
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        // Allow board to expand and fill tablet screen height
        const maxFitHeight = Math.max(300, window.innerHeight - 120);
        const available = Math.min(rect.width, maxFitHeight);
        const clamped = Math.max(280, Math.min(Math.floor(available), 720));
        setDisplaySize(clamped);
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Compute geometry
  const size = state.size;
  const padding = showCoordinates ? 24 : 16;
  const boardAreaSize = displaySize - padding * 2;
  const cellSize = boardAreaSize / (size - 1);

  // Convert board grid point (x, y) to canvas pixel coordinates
  const pointToPixel = useCallback(
    (p: Point) => ({
      px: padding + p.x * cellSize,
      py: padding + p.y * cellSize,
    }),
    [cellSize, padding]
  );

  // Convert canvas pixel coordinates to board grid point
  const pixelToPoint = useCallback(
    (px: number, py: number): Point | null => {
      const x = Math.round((px - padding) / cellSize);
      const y = Math.round((py - padding) / cellSize);
      if (x >= 0 && x < size && y >= 0 && y < size) {
        // Distance check from intersection
        const target = pointToPixel({ x, y });
        const dist = Math.hypot(px - target.px, py - target.py);
        if (dist <= cellSize * 0.48) {
          return { x, y };
        }
      }
      return null;
    },
    [cellSize, padding, pointToPixel, size]
  );

  // Spawn star/sparkle particles when stones are captured
  const spawnCaptureParticles = useCallback(
    (capturedPoints: Point[]) => {
      const colors = ['#f59e0b', '#ec4899', '#3b82f6', '#10b981', '#f43f5e', '#8b5cf6'];
      for (const p of capturedPoints) {
        const { px, py } = pointToPixel(p);
        for (let i = 0; i < 16; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 2 + Math.random() * 4;
          particlesRef.current.push({
            x: px,
            y: py,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 1.5,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: 3 + Math.random() * 4,
            alpha: 1,
            life: 1,
          });
        }
      }
    },
    [pointToPixel]
  );

  // Detect newly captured stones by comparing with last move
  const prevCapturesRef = useRef({ black: 0, white: 0 });
  useEffect(() => {
    const diffBlack = state.captures.black - prevCapturesRef.current.black;
    const diffWhite = state.captures.white - prevCapturesRef.current.white;
    if (diffBlack > 0 || diffWhite > 0) {
      if (state.lastMove) {
        // Approximate particle burst around last move area
        spawnCaptureParticles([state.lastMove]);
      }
    }
    prevCapturesRef.current = { ...state.captures };
  }, [state.captures, state.lastMove, spawnCaptureParticles]);

  // Main Canvas render loop
  const drawBoard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = displaySize * dpr;
    canvas.height = displaySize * dpr;
    ctx.scale(dpr, dpr);

    // 1. Draw Board Background (Warm Golden Wood Grain)
    const woodGradient = ctx.createLinearGradient(0, 0, displaySize, displaySize);
    woodGradient.addColorStop(0, '#f9dfa7');
    woodGradient.addColorStop(0.5, '#f4d28f');
    woodGradient.addColorStop(1, '#ecc57c');
    ctx.fillStyle = woodGradient;
    ctx.beginPath();
    ctx.roundRect(4, 4, displaySize - 8, displaySize - 8, 16);
    ctx.fill();

    // Board wood border
    ctx.strokeStyle = '#c49757';
    ctx.lineWidth = 4;
    ctx.stroke();

    // 2. Draw Grid Lines
    ctx.strokeStyle = '#623826';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < size; i++) {
      // Horizontal lines
      const pLeft = pointToPixel({ x: 0, y: i });
      const pRight = pointToPixel({ x: size - 1, y: i });
      ctx.beginPath();
      ctx.moveTo(pLeft.px, pLeft.py);
      ctx.lineTo(pRight.px, pRight.py);
      ctx.stroke();

      // Vertical lines
      const pTop = pointToPixel({ x: i, y: 0 });
      const pBottom = pointToPixel({ x: i, y: size - 1 });
      ctx.beginPath();
      ctx.moveTo(pTop.px, pTop.py);
      ctx.lineTo(pBottom.px, pBottom.py);
      ctx.stroke();
    }

    // 3. Draw Star Points (星位)
    const getStarPoints = (sz: BoardSize): Point[] => {
      if (sz === 7) return [{ x: 3, y: 3 }];
      if (sz === 9)
        return [
          { x: 2, y: 2 },
          { x: 6, y: 2 },
          { x: 4, y: 4 },
          { x: 2, y: 6 },
          { x: 6, y: 6 },
        ];
      if (sz === 13)
        return [
          { x: 3, y: 3 },
          { x: 9, y: 3 },
          { x: 6, y: 6 },
          { x: 3, y: 9 },
          { x: 9, y: 9 },
        ];
      if (sz === 19) {
        const coords = [3, 9, 15];
        const stars: Point[] = [];
        for (const sx of coords) {
          for (const sy of coords) {
            stars.push({ x: sx, y: sy });
          }
        }
        return stars;
      }
      return [];
    };

    ctx.fillStyle = '#623826';
    for (const sp of getStarPoints(size)) {
      const { px, py } = pointToPixel(sp);
      ctx.beginPath();
      ctx.arc(px, py, Math.max(3, cellSize * 0.08), 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. Draw Coordinates (A B C / 1 2 3)
    if (showCoordinates) {
      ctx.font = `bold ${Math.max(10, Math.floor(cellSize * 0.32))}px "PingFang SC", sans-serif`;
      ctx.fillStyle = '#8f5c35';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'];
      for (let i = 0; i < size; i++) {
        const topCoord = pointToPixel({ x: i, y: 0 });
        ctx.fillText(letters[i], topCoord.px, Math.max(9, padding * 0.45));

        const leftCoord = pointToPixel({ x: 0, y: i });
        ctx.fillText(String(size - i), Math.max(9, padding * 0.45), leftCoord.py);
      }
    }

    // 5. Draw Stones with 3D gradient & shadow
    const stoneRadius = cellSize * 0.44;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const stone = state.grid[y][x];
        if (!stone) continue;

        const { px, py } = pointToPixel({ x, y });

        // Soft drop shadow
        ctx.beginPath();
        ctx.arc(px + stoneRadius * 0.12, py + stoneRadius * 0.15, stoneRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.fill();

        // 3D Stone body
        ctx.beginPath();
        ctx.arc(px, py, stoneRadius, 0, Math.PI * 2);

        if (stone === 'black') {
          const grad = ctx.createRadialGradient(
            px - stoneRadius * 0.3,
            py - stoneRadius * 0.3,
            stoneRadius * 0.1,
            px,
            py,
            stoneRadius
          );
          grad.addColorStop(0, '#555555');
          grad.addColorStop(0.3, '#222222');
          grad.addColorStop(1, '#050505');
          ctx.fillStyle = grad;
        } else {
          const grad = ctx.createRadialGradient(
            px - stoneRadius * 0.3,
            py - stoneRadius * 0.3,
            stoneRadius * 0.1,
            px,
            py,
            stoneRadius
          );
          grad.addColorStop(0, '#ffffff');
          grad.addColorStop(0.8, '#f0ede6');
          grad.addColorStop(1, '#d5cfc5');
          ctx.fillStyle = grad;
        }
        ctx.fill();

        // Subtle outer border for white stone
        if (stone === 'white') {
          ctx.strokeStyle = '#b8b0a2';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    // 6. Draw Last Move Marker
    if (state.lastMove) {
      const { px, py } = pointToPixel(state.lastMove);
      ctx.beginPath();
      ctx.arc(px, py, stoneRadius * 0.35, 0, Math.PI * 2);
      ctx.strokeStyle = state.lastMove.color === 'black' ? '#ef4444' : '#dc2626';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    // 7. Draw Liberties Helper (数气小助手)
    if (showLibertiesHelper && state.lastMove) {
      const lastGroup = GoCore.findGroup(state.grid, state.lastMove);
      if (lastGroup) {
        for (const lib of lastGroup.liberties) {
          const { px, py } = pointToPixel(lib);
          ctx.beginPath();
          ctx.arc(px, py, stoneRadius * 0.25, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(34, 197, 94, 0.75)'; // green light
          ctx.fill();
        }
      }
    }

    // 8. Draw Ghost Stone on Hover or Selected Point
    const activePreview = selectedPoint || hoverPoint;
    if (activePreview && !disabled && state.grid[activePreview.y][activePreview.x] === null) {
      const isLegal = GoCore.isLegalMove(state, activePreview).legal;
      const { px, py } = pointToPixel(activePreview);

      ctx.save();
      ctx.beginPath();
      ctx.arc(px, py, stoneRadius * 0.95, 0, Math.PI * 2);

      if (isLegal) {
        ctx.fillStyle = state.turn === 'black' ? 'rgba(0, 0, 0, 0.45)' : 'rgba(255, 255, 255, 0.7)';
        ctx.fill();
        ctx.strokeStyle = state.turn === 'black' ? '#333' : '#aaa';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else {
        // Red indicator for illegal / suicide
        ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
        ctx.fill();
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.restore();
    }

    // 9. Update & Draw Celebration Particles
    if (particlesRef.current.length > 0) {
      const surviving: Particle[] = [];
      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12; // gravity
        p.alpha -= 0.025;
        p.life -= 0.025;

        if (p.alpha > 0) {
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          surviving.push(p);
        }
      }
      particlesRef.current = surviving;
    }
  }, [
    displaySize,
    cellSize,
    padding,
    pointToPixel,
    selectedPoint,
    hoverPoint,
    disabled,
    showCoordinates,
    showLibertiesHelper,
    size,
    state,
  ]);

  // Continuous animation frame loop for smooth particle explosions
  useEffect(() => {
    let active = true;
    const loop = () => {
      if (!active) return;
      drawBoard();
      animFrameRef.current = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      active = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [drawBoard]);

  // Handle Board Click / Touch
  const handleInteraction = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (disabled || state.isGameOver) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const px = clientX - rect.left;
    const py = clientY - rect.top;
    const point = pixelToPoint(px, py);

    if (!point) return;

    // Small boards (7x7 / 9x9): direct tap to play!
    if (size <= 9) {
      const check = GoCore.isLegalMove(state, point);
      if (check.legal) {
        SoundEngine.playStoneSound();
        onPlayMove(point);
        setSelectedPoint(null);
      } else {
        SoundEngine.playErrorSound();
      }
    } else {
      // Large boards (13x13 / 19x19): first tap previews, second tap confirms!
      if (selectedPoint && GoCore.pointsEqual(selectedPoint, point)) {
        // Confirmed move!
        const check = GoCore.isLegalMove(state, point);
        if (check.legal) {
          SoundEngine.playStoneSound();
          onPlayMove(point);
          setSelectedPoint(null);
        } else {
          SoundEngine.playErrorSound();
        }
      } else {
        // Select & preview
        setSelectedPoint(point);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (disabled || state.isGameOver) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const point = pixelToPoint(px, py);
    setHoverPoint(point);
  };

  return (
    <div ref={containerRef} className="flex flex-col items-center justify-center p-2 relative">
      <div className="relative wood-board-shadow rounded-2xl overflow-hidden bg-amber-100 border-4 border-amber-800/40">
        <canvas
          ref={canvasRef}
          style={{ width: displaySize, height: displaySize }}
          onClick={handleInteraction}
          onTouchStart={handleInteraction}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverPoint(null)}
          className="cursor-pointer touch-none block"
        />

        {/* Large board confirmation button overlay */}
        {size > 9 && selectedPoint && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/95 px-4 py-2 rounded-full shadow-lg border border-amber-300 animate-pop-in">
            <span className="text-sm font-bold text-amber-900">
              点选落子 ({selectedPoint.x + 1}, {selectedPoint.y + 1})
            </span>
            <button
              onClick={() => {
                SoundEngine.playStoneSound();
                onPlayMove(selectedPoint);
                setSelectedPoint(null);
              }}
              className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white font-bold text-sm rounded-full shadow"
            >
              确认落子
            </button>
            <button
              onClick={() => setSelectedPoint(null)}
              className="px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-sm rounded-full"
            >
              取消
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
