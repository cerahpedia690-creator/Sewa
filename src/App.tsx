/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import {
  Building2,
  CloudRain,
  Coins,
  LayoutDashboard,
  Pause,
  Play,
  FastForward,
  Settings,
  ShoppingBag,
  Sparkles,
  Sun,
  Trophy,
  Users,
  Volume2,
  VolumeX,
  Wallet,
  Wrench,
  Briefcase,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react';
import { DramaEventModal } from './components/DramaEventModal';
import { MainMenuOverlay } from './components/MainMenuOverlay';
import { ManagementPanel } from './components/ManagementPanel';
import { RoomInspectorDrawer } from './components/RoomInspectorDrawer';
import { GameEngine, getDayPeriod } from './game/engine';
import { CameraState, FLOOR_H, HitRegion, renderGameWorld } from './game/pixelRenderer';
import { soundFX } from './game/sound';
import { GameSpeed, NavTab, ScreenMode } from './game/types';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const hitRegionsRef = useRef<HitRegion[]>([]);
  const cameraRef = useRef<CameraState>({ x: 0, y: 20, zoom: 1.0 });
  const dragRef = useRef<{ active: boolean; startX: number; startY: number; lastX: number; lastY: number; moved: number }>({
    active: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    moved: 0,
  });

  const [screen, setScreen] = useState<ScreenMode>('MAIN_MENU');
  const [, setTick] = useState(0);
  const [activeTab, setActiveTab] = useState<NavTab | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedEmptySlot, setSelectedEmptySlot] = useState<{ floor: number; slot: number } | null>(null);
  const [hoveredSlotKey, setHoveredSlotKey] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const screenRef = useRef(screen);
  screenRef.current = screen;
  const selectedRoomRef = useRef(selectedRoomId);
  selectedRoomRef.current = selectedRoomId;
  const hoveredSlotRef = useRef(hoveredSlotKey);
  hoveredSlotRef.current = hoveredSlotKey;

  if (!engineRef.current) {
    engineRef.current = new GameEngine(() => {
      setTick((t) => (t + 1) % 1000000);
    });
  }
  const engine = engineRef.current;

  const showToast = (msg: string) => {
    setToast(msg);
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(timer);
  }, [toast]);

  // Isolated 60fps Canvas Simulation & Render Loop
  useEffect(() => {
    let rafId = 0;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const dt = Math.min(rawDt, 0.05);

      const canvas = canvasRef.current;
      const eng = engineRef.current;
      if (canvas && eng) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        if (w > 0 && h > 0 && (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr))) {
          canvas.width = Math.floor(w * dpr);
          canvas.height = Math.floor(h * dpr);
        }

        if (screenRef.current === 'MAIN_MENU') {
          eng.tickAmbientOnly(dt);
        } else {
          eng.tick(dt, w, h);
        }

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.save();
          ctx.scale(dpr, dpr);
          hitRegionsRef.current = renderGameWorld(
            ctx,
            eng,
            w,
            h,
            cameraRef.current,
            selectedRoomRef.current,
            hoveredSlotRef.current,
            now / 1000,
            screenRef.current === 'MAIN_MENU'
          );
          ctx.restore();
        }
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (screenRef.current !== 'PLAYING') return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const eng = engineRef.current;
      if (!eng) return;

      if (e.code === 'Space') {
        e.preventDefault();
        eng.setSpeed(eng.state.speed === 0 ? 1 : 0);
      } else if (e.key === '1') {
        eng.setSpeed(1);
      } else if (e.key === '2') {
        eng.setSpeed(2);
      } else if (e.key === '3') {
        eng.setSpeed(3);
      } else if (e.key === 'Escape') {
        setActiveTab(null);
        setSelectedRoomId(null);
        setSelectedEmptySlot(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Canvas pointer & wheel interactions
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (screen !== 'PLAYING') return;
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      lastX: e.clientX,
      lastY: e.clientY,
      moved: 0,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (screen !== 'PLAYING') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    if (dragRef.current.active) {
      const dx = e.clientX - dragRef.current.lastX;
      const dy = e.clientY - dragRef.current.lastY;
      dragRef.current.moved += Math.abs(dx) + Math.abs(dy);
      dragRef.current.lastX = e.clientX;
      dragRef.current.lastY = e.clientY;
      if (dragRef.current.moved > 6) {
        cameraRef.current.x = Math.max(-900, Math.min(900, cameraRef.current.x + dx));
        cameraRef.current.y = Math.max(-450, Math.min(750, cameraRef.current.y + dy));
      }
      return;
    }

    const hit = hitRegionsRef.current.find(
      (r) => px >= r.screenX && px <= r.screenX + r.screenW && py >= r.screenY && py <= r.screenY + r.screenH
    );
    if (hit && hit.type === 'EMPTY_SLOT') {
      setHoveredSlotKey(`${hit.floor}_${hit.slot}`);
    } else if (hoveredSlotKey !== null) {
      setHoveredSlotKey(null);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (screen !== 'PLAYING') return;
    const wasClick = dragRef.current.moved <= 8;
    dragRef.current.active = false;
    if (!wasClick) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const hit = hitRegionsRef.current.find(
      (r) => px >= r.screenX && px <= r.screenX + r.screenW && py >= r.screenY && py <= r.screenY + r.screenH
    );
    if (hit) {
      soundFX.click();
      if (hit.type === 'ROOM' && hit.roomId) {
        setSelectedRoomId(hit.roomId);
        setSelectedEmptySlot(null);
      } else if (hit.type === 'EMPTY_SLOT') {
        setSelectedRoomId(null);
        setSelectedEmptySlot({ floor: hit.floor, slot: hit.slot });
      }
    } else {
      setSelectedRoomId(null);
      setSelectedEmptySlot(null);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    if (screen !== 'PLAYING') return;
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    cameraRef.current.zoom = Math.max(0.55, Math.min(2.0, Number((cameraRef.current.zoom + delta).toFixed(2))));
    setTick((t) => t + 1);
  };

  const zoomBy = (delta: number) => {
    cameraRef.current.zoom = Math.max(0.55, Math.min(2.0, Number((cameraRef.current.zoom + delta).toFixed(2))));
    soundFX.click();
    setTick((t) => t + 1);
  };

  const focusFloor = (floor: number | 'ALL') => {
    soundFX.click();
    if (floor === 'ALL') {
      cameraRef.current = { x: 0, y: 20, zoom: Math.max(0.65, 1.05 - engine.state.totalFloors * 0.05) };
    } else {
      cameraRef.current = { x: 0, y: floor * FLOOR_H * 1.15 - 30, zoom: 1.25 };
    }
    setTick((t) => t + 1);
  };

  const s = engine.state;
  const unclaimedQuests = s.quests.filter((q) => q.completed && !q.claimed).length;
  const period = getDayPeriod(s.hour);
  const clockStr = `${String(s.hour).padStart(2, '0')}:${String(s.minute).padStart(2, '0')}`;
  const xpPct = Math.min(100, Math.round((s.xp / s.xpToNext) * 100));

  const navItems: { id: NavTab; label: string; icon: typeof LayoutDashboard; badge?: number }[] = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'BUILDING', label: 'Building', icon: Building2 },
    { id: 'TENANTS', label: 'Tenants', icon: Users },
    { id: 'FACILITIES', label: 'Facilities', icon: Wrench },
    { id: 'STAFF', label: 'Staff', icon: Briefcase },
    { id: 'FINANCE', label: 'Finance', icon: Wallet },
    { id: 'QUESTS', label: 'Quests', icon: Trophy, badge: unclaimedQuests },
    { id: 'SHOP', label: 'Shop', icon: ShoppingBag },
    { id: 'SETTINGS', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-stone-950">
      {/* Isolated Full-Viewport 2D Pixel Art World Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        className="pixel-canvas block h-full w-full cursor-grab active:cursor-grabbing"
      />

      {/* MAIN MENU OVERLAY */}
      {screen === 'MAIN_MENU' && (
        <MainMenuOverlay
          engine={engine}
          onStartNew={(aptName) => {
            engine.startNewGame(aptName);
            cameraRef.current = { x: 0, y: 20, zoom: 1.0 };
            setActiveTab(null);
            setSelectedRoomId(null);
            setSelectedEmptySlot(null);
            setScreen('PLAYING');
          }}
          onContinue={() => {
            if (engine.continueLastSave()) {
              cameraRef.current = { x: 0, y: 20, zoom: 1.0 };
              setScreen('PLAYING');
            }
          }}
          onLoadSlot={(slotNum) => {
            if (engine.loadFromSlot(slotNum)) {
              cameraRef.current = { x: 0, y: 20, zoom: 1.0 };
              setScreen('PLAYING');
            }
          }}
        />
      )}

      {/* IN-GAME HUD & NAVIGATION OVERLAY (Low Occlusion) */}
      {screen === 'PLAYING' && (
        <div className="pointer-events-none fixed inset-0 z-20 flex flex-col justify-between">
          {/* Top HUD Bar */}
          <header className="pointer-events-auto flex flex-wrap items-center justify-between gap-2 border-b-2 border-stone-700 bg-stone-950/90 px-3 py-1.5 text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 font-mono-num text-sm font-bold text-amber-400">
                <Coins className="h-4 w-4 shrink-0" />
                <span>${s.money.toLocaleString()}</span>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-stone-200 font-mono-num">
                <span>Day {s.day}</span>
                <span className="text-stone-500">·</span>
                <span>{clockStr}</span>
                <span className="text-stone-500">·</span>
                <span className="text-amber-200">{period}</span>
                <span className="text-stone-500">·</span>
                <span className="flex items-center gap-1 text-sky-300">
                  {s.weather === 'RAINY' ? <CloudRain className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5 text-amber-300" />}
                  {s.weather === 'RAINY' ? 'Rain' : 'Sunny'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="font-pixel text-amber-300">Lv.{s.level}</span>
                <div className="h-2 w-16 bg-stone-800 border border-stone-700">
                  <div className="h-full bg-sky-400" style={{ width: `${xpPct}%` }} />
                </div>
              </div>

              <div className="hidden md:flex items-center gap-3 font-mono-num text-stone-300">
                <span>Tenants {s.tenants.length}</span>
                <span className="text-stone-600">·</span>
                <span>Rep {s.reputation}/100</span>
              </div>

              {/* Time Speed Controls */}
              <div className="flex items-center gap-1 border border-stone-700 bg-stone-900 p-0.5">
                {([
                  { sp: 0 as GameSpeed, label: 'Pause', icon: Pause },
                  { sp: 1 as GameSpeed, label: '1x', icon: Play },
                  { sp: 2 as GameSpeed, label: '2x', icon: FastForward },
                  { sp: 3 as GameSpeed, label: '3x', icon: FastForward },
                ]).map((item) => {
                  const Icon = item.icon;
                  const active = s.speed === item.sp;
                  return (
                    <button
                      key={item.sp}
                      onClick={() => engine.setSpeed(item.sp)}
                      className={`flex items-center gap-0.5 px-2 py-1 text-[11px] font-semibold cursor-pointer whitespace-nowrap ${
                        active ? 'bg-amber-500 text-stone-950' : 'text-stone-300 hover:bg-stone-800'
                      }`}
                      title={item.label}
                    >
                      <Icon className="h-3 w-3" />
                      <span>{item.sp === 0 ? '' : item.label}</span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => engine.updateSettings({ muted: !engine.settings.muted })}
                className="p-1.5 text-stone-300 hover:text-amber-300 cursor-pointer"
                title={engine.settings.muted ? 'Unmute' : 'Mute'}
              >
                {engine.settings.muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>

              <button
                onClick={() => engine.triggerRandomDramaEvent()}
                className="pixel-btn hidden sm:flex items-center gap-1 bg-rose-600 px-2.5 py-1 text-[11px] font-semibold text-white cursor-pointer whitespace-nowrap"
              >
                <Sparkles className="h-3 w-3" /> Event
              </button>
            </div>
          </header>

          {/* Left-Side Camera Zoom & Floor Focus Controls (Unobtrusive) */}
          <div className="pointer-events-auto fixed left-3 top-16 z-10 flex flex-col gap-1 border border-stone-700 bg-stone-950/85 p-1 text-[11px]">
            <button onClick={() => zoomBy(0.18)} className="p-1.5 text-stone-200 hover:bg-stone-800 cursor-pointer" title="Zoom In">
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => zoomBy(-0.18)} className="p-1.5 text-stone-200 hover:bg-stone-800 cursor-pointer" title="Zoom Out">
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => focusFloor('ALL')} className="p-1.5 text-amber-300 hover:bg-stone-800 cursor-pointer" title="Reset Camera">
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
            <div className="my-0.5 border-t border-stone-700" />
            {Array.from({ length: s.totalFloors }, (_, i) => s.totalFloors - i).map((f) => (
              <button
                key={f}
                onClick={() => focusFloor(f)}
                className="px-1.5 py-0.5 font-mono-num text-stone-300 hover:bg-stone-800 hover:text-amber-300 cursor-pointer"
              >
                F{f}
              </button>
            ))}
            <button
              onClick={() => focusFloor(0)}
              className="px-1.5 py-0.5 font-mono-num text-stone-300 hover:bg-stone-800 hover:text-amber-300 cursor-pointer"
            >
              G
            </button>
          </div>

          {/* Toast Feedback Banner */}
          {toast && (
            <div className="pointer-events-none fixed left-1/2 top-16 z-40 -translate-x-1/2 border-2 border-amber-500 bg-stone-950/95 px-4 py-1.5 text-xs font-semibold text-amber-200 shadow-lg">
              {toast}
            </div>
          )}

          {/* Bottom Navigation Bar */}
          <nav className="pointer-events-auto flex items-center justify-center gap-1 overflow-x-auto border-t-2 border-stone-700 bg-stone-950/95 px-2 py-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    soundFX.click();
                    setActiveTab(isActive ? null : item.id);
                  }}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-amber-500 text-stone-950'
                      : 'text-stone-300 hover:bg-stone-800 hover:text-amber-200'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                  {item.badge && item.badge > 0 ? (
                    <span className="ml-0.5 font-mono-num text-[11px] font-bold text-emerald-400">
                      ({item.badge})
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>

          {/* Left Management Panel Drawer */}
          {activeTab && (
            <ManagementPanel
              engine={engine}
              activeTab={activeTab}
              onClose={() => setActiveTab(null)}
              onNotify={showToast}
              onInspectRoom={(roomId) => {
                setSelectedEmptySlot(null);
                setSelectedRoomId(roomId);
              }}
              onReturnToMenu={() => {
                engine.autoSave();
                setActiveTab(null);
                setSelectedRoomId(null);
                setSelectedEmptySlot(null);
                setScreen('MAIN_MENU');
              }}
            />
          )}

          {/* Right Room / Build Slot Inspector Drawer */}
          {(selectedRoomId || selectedEmptySlot) && (
            <RoomInspectorDrawer
              engine={engine}
              selectedRoomId={selectedRoomId}
              selectedEmptySlot={selectedEmptySlot}
              onClose={() => {
                setSelectedRoomId(null);
                setSelectedEmptySlot(null);
              }}
              onSelectRoom={(roomId) => {
                setSelectedEmptySlot(null);
                setSelectedRoomId(roomId);
              }}
              onNotify={showToast}
            />
          )}

          {/* Dracin-Style Drama & Social Event Modal */}
          {s.activeEvent && (
            <DramaEventModal
              event={s.activeEvent}
              tenants={s.tenants}
              onChoose={(choiceId) => {
                const outcome = engine.resolveActiveEvent(choiceId);
                if (outcome) showToast(outcome);
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
