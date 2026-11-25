import { useState } from 'react';
import { Download, Play, FolderOpen, Settings, Info, LogOut, Trash2, X } from 'lucide-react';
import { GameEngine } from '../game/engine';
import { downloadAndroidProjectZip } from '../utils/zipExport';

interface MainMenuOverlayProps {
  engine: GameEngine;
  onStartNew: (apartmentName: string) => void;
  onContinue: () => void;
  onLoadSlot: (slotNum: 1 | 2 | 3) => void;
}

type ModalKind = null | 'NEW_GAME' | 'LOAD' | 'SETTINGS' | 'ABOUT' | 'EXITED';

export function MainMenuOverlay({
  engine,
  onStartNew,
  onContinue,
  onLoadSlot,
}: MainMenuOverlayProps) {
  const [modal, setModal] = useState<ModalKind>(null);
  const [aptName, setAptName] = useState('Pixel Haven Residence');
  const [, setRefreshTick] = useState(0);

  const hasAuto = engine.hasAutoSave();
  const autoMeta = engine.getAutoSaveMeta();
  const slots = engine.listSaveSlots();

  if (modal === 'EXITED') {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-stone-950/90 p-6">
        <div className="pixel-panel max-w-md p-6 text-center">
          <h2 className="font-pixel text-lg text-amber-300">Session Closed</h2>
          <p className="mt-2 text-sm text-stone-300">
            Thank you for playing Apartment Tycoon: Pixel Life by FennXy Studios. Your auto-save is safely stored locally.
          </p>
          <button
            onClick={() => setModal(null)}
            className="pixel-btn mt-5 bg-amber-500 px-5 py-2 text-sm font-bold text-stone-950 cursor-pointer"
          >
            Return to Title Screen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-30 flex flex-col justify-between p-6 pointer-events-none">
      {/* Upper calm negative-space bespoke SVG & Pixel Title Lockup */}
      <div className="flex flex-col items-center pt-4 pointer-events-auto">
        <div className="flex items-center gap-3">
          <svg
            width="44"
            height="44"
            viewBox="0 0 16 16"
            className="shrink-0 drop-shadow-[0_3px_0_#0c0a09]"
            aria-hidden="true"
          >
            <rect x="2" y="2" width="12" height="13" fill="#b45309" />
            <rect x="1" y="1" width="14" height="2" fill="#f59e0b" />
            <rect x="4" y="4" width="3" height="3" fill="#fef08a" />
            <rect x="9" y="4" width="3" height="3" fill="#fef08a" />
            <rect x="4" y="8" width="3" height="3" fill="#bae6fd" />
            <rect x="9" y="8" width="3" height="3" fill="#fef08a" />
            <rect x="6" y="12" width="4" height="3" fill="#78350f" />
          </svg>
          <div className="text-center">
            <h1 className="font-pixel text-3xl sm:text-4xl tracking-tight text-amber-100 drop-shadow-[0_3px_0_#0c0a09]">
              APARTMENT TYCOON
            </h1>
            <div className="font-pixel text-sm sm:text-base tracking-widest text-amber-400 drop-shadow-[0_2px_0_#0c0a09]">
              PIXEL LIFE · FENNXY STUDIOS
            </div>
          </div>
        </div>
      </div>

      {/* Center Menu Buttons */}
      <div className="mx-auto flex w-full max-w-xs flex-col gap-2.5 pointer-events-auto">
        <button
          onClick={() => setModal('NEW_GAME')}
          className="pixel-btn flex items-center justify-center gap-2 bg-amber-500 px-5 py-2.5 text-sm font-bold text-stone-950 hover:bg-amber-400 cursor-pointer whitespace-nowrap"
        >
          <Play className="h-4 w-4" /> New Game
        </button>

        <button
          disabled={!hasAuto}
          onClick={onContinue}
          className="pixel-btn flex items-center justify-center gap-2 bg-stone-900/95 px-5 py-2.5 text-sm font-semibold text-amber-100 hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer whitespace-nowrap"
        >
          <span>Continue</span>
          {autoMeta && (
            <span className="font-mono-num text-xs text-amber-400">
              (Day {autoMeta.day} · Lv.{autoMeta.level})
            </span>
          )}
        </button>

        <button
          onClick={() => setModal('LOAD')}
          className="pixel-btn flex items-center justify-center gap-2 bg-stone-900/95 px-5 py-2 text-sm font-semibold text-stone-200 hover:bg-stone-800 cursor-pointer whitespace-nowrap"
        >
          <FolderOpen className="h-4 w-4" /> Load Game
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setModal('SETTINGS')}
            className="pixel-btn flex items-center justify-center gap-1.5 bg-stone-900/95 px-3 py-2 text-xs font-semibold text-stone-200 hover:bg-stone-800 cursor-pointer whitespace-nowrap"
          >
            <Settings className="h-3.5 w-3.5" /> Settings
          </button>
          <button
            onClick={() => setModal('ABOUT')}
            className="pixel-btn flex items-center justify-center gap-1.5 bg-stone-900/95 px-3 py-2 text-xs font-semibold text-stone-200 hover:bg-stone-800 cursor-pointer whitespace-nowrap"
          >
            <Info className="h-3.5 w-3.5" /> About Developer
          </button>
        </div>

        <button
          onClick={() => setModal('EXITED')}
          className="pixel-btn flex items-center justify-center gap-1.5 bg-stone-950/90 px-4 py-2 text-xs font-medium text-stone-400 hover:text-rose-300 cursor-pointer whitespace-nowrap"
        >
          <LogOut className="h-3.5 w-3.5" /> Exit
        </button>
      </div>

      {/* Flat bottom control hint line */}
      <div className="text-center text-xs text-stone-300/90 drop-shadow-[0_1px_0_#0c0a09]">
        Drag Pan · Scroll Zoom · Click Room Inspect · 1–3 Speed · Space Pause
      </div>

      {/* Sub-modals */}
      {modal === 'NEW_GAME' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 pointer-events-auto">
          <div className="pixel-panel w-full max-w-md p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-pixel text-base text-amber-200">Start New Property</h2>
              <button onClick={() => setModal(null)} className="text-stone-400 hover:text-white cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>
            <label className="block text-xs text-stone-400 mb-1.5">Apartment Complex Name</label>
            <input
              type="text"
              value={aptName}
              maxLength={32}
              onChange={(e) => setAptName(e.target.value)}
              className="w-full border border-stone-600 bg-stone-950 px-3 py-2 text-sm text-stone-100 focus:border-amber-500 focus:outline-none"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setModal(null)}
                className="pixel-btn bg-stone-800 px-4 py-2 text-xs font-semibold text-stone-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setModal(null);
                  onStartNew(aptName);
                }}
                className="pixel-btn bg-amber-500 px-5 py-2 text-xs font-bold text-stone-950 cursor-pointer"
              >
                Start Building
              </button>
            </div>
          </div>
        </div>
      )}

      {modal === 'LOAD' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 pointer-events-auto">
          <div className="pixel-panel w-full max-w-md p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-pixel text-base text-amber-200">Load Saved Game</h2>
              <button onClick={() => setModal(null)} className="text-stone-400 hover:text-white cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2.5">
              {slots.map((meta, idx) => {
                const slotNum = (idx + 1) as 1 | 2 | 3;
                return (
                  <div key={slotNum} className="flex items-center justify-between border border-stone-700 bg-stone-900 p-3">
                    <div>
                      <div className="text-sm font-semibold text-amber-100">
                        {meta ? meta.apartmentName : `Empty Slot ${slotNum}`}
                      </div>
                      <div className="font-mono-num text-xs text-stone-400">
                        {meta
                          ? `Day ${meta.day} · Lv.${meta.level} · $${meta.money.toLocaleString()} · ${meta.tenantsCount} tenants`
                          : 'No saved data'}
                      </div>
                    </div>
                    {meta && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setModal(null);
                            onLoadSlot(slotNum);
                          }}
                          className="pixel-btn bg-amber-500 px-3 py-1.5 text-xs font-bold text-stone-950 cursor-pointer"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => {
                            engine.deleteSlot(slotNum);
                            setRefreshTick((n) => n + 1);
                          }}
                          className="p-1.5 text-rose-400 hover:bg-stone-800 cursor-pointer"
                          title="Delete Save"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {modal === 'SETTINGS' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 pointer-events-auto">
          <div className="pixel-panel w-full max-w-md p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-pixel text-base text-amber-200">Settings</h2>
              <button onClick={() => setModal(null)} className="text-stone-400 hover:text-white cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <label className="flex items-center justify-between cursor-pointer">
                <span>Mute Sound Effects</span>
                <input
                  type="checkbox"
                  checked={engine.settings.muted}
                  onChange={(e) => {
                    engine.updateSettings({ muted: e.target.checked });
                    setRefreshTick((n) => n + 1);
                  }}
                  className="h-4 w-4 accent-amber-500"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span>Weather Effects (Rain &amp; Sun)</span>
                <input
                  type="checkbox"
                  checked={engine.settings.weatherEnabled}
                  onChange={(e) => {
                    engine.updateSettings({ weatherEnabled: e.target.checked });
                    setRefreshTick((n) => n + 1);
                  }}
                  className="h-4 w-4 accent-amber-500"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span>Daily Auto-Save</span>
                <input
                  type="checkbox"
                  checked={engine.settings.autoSaveEnabled}
                  onChange={(e) => {
                    engine.updateSettings({ autoSaveEnabled: e.target.checked });
                    setRefreshTick((n) => n + 1);
                  }}
                  className="h-4 w-4 accent-amber-500"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {modal === 'ABOUT' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 pointer-events-auto">
          <div className="pixel-panel w-full max-w-lg overflow-hidden">
            <div className="relative h-44 w-full bg-stone-900">
              <img
                src="/src/assets/images/apartment_tycoon_keyart_1795580662845.jpg"
                alt="Apartment Tycoon: Pixel Life key art by FennXy Studios"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/30 to-transparent" />
              <button
                onClick={() => setModal(null)}
                className="absolute right-3 top-3 bg-stone-950/80 p-1.5 text-stone-200 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="absolute bottom-3 left-4">
                <div className="font-pixel text-base text-amber-300">FennXy Studios</div>
                <div className="text-xs text-stone-300">Apartment Tycoon: Pixel Life</div>
              </div>
            </div>
            <div className="p-5 text-sm space-y-3 text-stone-300">
              <p>
                Built by <strong className="text-amber-200">FennXy Studios</strong>. Manage your own 2D Pixel Art urban apartment complex—construct rooms, decorate interiors, guide dynamic tenants, resolve dramatic C-drama social stories, and grow your property empire.
              </p>
              <p className="text-xs text-stone-400">
                Includes the complete Native Android Java source project (Android 8.0 API 26+, SurfaceView &amp; Canvas, AIDE &amp; Android Studio ready, local JSON save &amp; local assets folder structure).
              </p>
              <button
                onClick={() => downloadAndroidProjectZip()}
                className="pixel-btn flex w-full items-center justify-center gap-2 bg-emerald-600 py-2.5 text-xs font-bold text-stone-950 cursor-pointer"
              >
                <Download className="h-4 w-4" /> Download Native Android Java Project (.zip)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
