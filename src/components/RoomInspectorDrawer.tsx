import { X, Wrench, Sparkles, UserPlus, UserMinus } from 'lucide-react';
import { FURNITURE_SPECS, INTERIOR_THEMES, ROOM_SPECS } from '../game/catalog';
import { GameEngine } from '../game/engine';
import { FurnitureType, InteriorTheme, RoomType } from '../game/types';
import { PortraitCanvas } from './PortraitCanvas';

interface RoomInspectorDrawerProps {
  engine: GameEngine;
  selectedRoomId: string | null;
  selectedEmptySlot: { floor: number; slot: number } | null;
  onClose: () => void;
  onSelectRoom: (roomId: string) => void;
  onNotify: (msg: string) => void;
}

export function RoomInspectorDrawer({
  engine,
  selectedRoomId,
  selectedEmptySlot,
  onClose,
  onSelectRoom,
  onNotify,
}: RoomInspectorDrawerProps) {
  const state = engine.state;
  const room = selectedRoomId ? state.rooms.find((r) => r.id === selectedRoomId) : null;

  if (!room && !selectedEmptySlot) return null;

  if (selectedEmptySlot && !room) {
    return (
      <aside className="pixel-panel pointer-events-auto fixed right-3 top-16 bottom-16 z-30 flex w-80 flex-col p-4">
        <div className="mb-3 flex items-center justify-between border-b border-stone-700 pb-2">
          <div>
            <h3 className="font-pixel text-sm text-amber-200">
              Build Room · F{selectedEmptySlot.floor}
            </h3>
            <p className="text-xs text-stone-400">Slot #{selectedEmptySlot.slot + 1}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white cursor-pointer"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="pixel-scroll flex-1 space-y-2.5 overflow-y-auto pr-1">
          {(Object.keys(ROOM_SPECS) as RoomType[]).map((rtype) => {
            const spec = ROOM_SPECS[rtype];
            const locked = state.level < spec.unlockLevel;
            const floorTooLow = Boolean(spec.minFloor && selectedEmptySlot.floor < spec.minFloor);
            const cantAfford = state.money < spec.buildCost;
            return (
              <div key={rtype} className="border border-stone-700 bg-stone-900 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-amber-100">{spec.label}</span>
                  <span className="font-mono-num text-xs text-amber-400">
                    ${spec.buildCost.toLocaleString()}
                  </span>
                </div>
                <p className="mt-1 text-xs text-stone-400">{spec.description}</p>
                <div className="mt-1.5 flex items-center gap-2 text-xs text-stone-400">
                  <span>{spec.slotSpan} slot(s)</span>
                  <span>·</span>
                  <span>Cap {spec.capacity}</span>
                  <span>·</span>
                  <span>${spec.baseRent} rent</span>
                </div>
                <button
                  disabled={locked || floorTooLow || cantAfford}
                  onClick={() => {
                    const res = engine.buildRoom(selectedEmptySlot.floor, rtype, selectedEmptySlot.slot);
                    onNotify(res.message);
                    if (res.ok && res.room) {
                      onSelectRoom(res.room.id);
                    }
                  }}
                  className="pixel-btn mt-2.5 w-full bg-amber-600 py-1.5 text-xs font-semibold text-stone-950 disabled:cursor-not-allowed disabled:bg-stone-700 disabled:text-stone-400 cursor-pointer"
                >
                  {locked
                    ? `Unlock Lv.${spec.unlockLevel}`
                    : floorTooLow
                      ? `Needs Floor ${spec.minFloor}+`
                      : `Build ${spec.label}`}
                </button>
              </div>
            );
          })}
        </div>
      </aside>
    );
  }

  if (!room) return null;
  const spec = ROOM_SPECS[room.type];
  const occupants = state.tenants.filter((t) => room.tenantIds.includes(t.id));

  return (
    <aside className="pixel-panel pointer-events-auto fixed right-3 top-16 bottom-16 z-30 flex w-88 max-w-[92vw] flex-col p-4">
      <div className="mb-3 flex items-center justify-between border-b border-stone-700 pb-2">
        <div>
          <h3 className="font-pixel text-sm text-amber-200">
            Room {room.number} · {spec.label}
          </h3>
          <p className="text-xs text-stone-400">
            Floor {room.floor} · Occupants {occupants.length}/{room.capacity} · Comfort {room.comfort}%
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-stone-400 hover:text-white cursor-pointer"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="pixel-scroll flex-1 space-y-4 overflow-y-auto pr-1 text-xs">
        {/* Room Condition & Cleanliness */}
        <div className="grid grid-cols-2 gap-2 border border-stone-700 bg-stone-900 p-2.5">
          <div>
            <div className="flex justify-between text-stone-400">
              <span>Cleanliness</span>
              <span className="font-mono-num text-stone-100">{Math.round(room.cleanliness)}%</span>
            </div>
            <div className="mt-1 h-1.5 bg-stone-800">
              <div
                className="h-full bg-sky-400"
                style={{ width: `${Math.round(room.cleanliness)}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-stone-400">
              <span>Condition</span>
              <span className="font-mono-num text-stone-100">{Math.round(room.condition)}%</span>
            </div>
            <div className="mt-1 h-1.5 bg-stone-800">
              <div
                className="h-full bg-emerald-400"
                style={{ width: `${Math.round(room.condition)}%` }}
              />
            </div>
          </div>
          <button
            onClick={() => onNotify(engine.cleanAndRepairRoom(room.id).message)}
            className="pixel-btn col-span-2 mt-1 flex items-center justify-center gap-1.5 bg-stone-800 py-1.5 text-xs font-medium text-sky-300 hover:bg-stone-700 cursor-pointer"
          >
            <Wrench className="h-3.5 w-3.5" /> Clean & Repair ($75)
          </button>
        </div>

        {/* Rent & Deposit Pricing */}
        <div className="border border-stone-700 bg-stone-900 p-2.5">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="font-semibold text-stone-200">Rent Price</span>
            <span className="font-mono-num text-amber-400">${room.rentPrice}/mo</span>
          </div>
          <input
            type="range"
            min={150}
            max={3500}
            step={20}
            value={room.rentPrice}
            onChange={(e) => engine.setRoomPricing(room.id, Number(e.target.value), room.deposit)}
            className="w-full accent-amber-500 cursor-pointer"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="font-semibold text-stone-200">Security Deposit</span>
            <span className="font-mono-num text-amber-400">${room.deposit}</span>
          </div>
          <input
            type="range"
            min={100}
            max={3500}
            step={20}
            value={room.deposit}
            onChange={(e) => engine.setRoomPricing(room.id, room.rentPrice, Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
        </div>

        {/* Tenants Inside or Lease Applicants */}
        <div>
          <h4 className="mb-1.5 font-semibold text-stone-200">Tenants</h4>
          {occupants.length > 0 && (
            <div className="space-y-2 mb-2">
              {occupants.map((t) => (
                <div key={t.id} className="flex items-center gap-2.5 border border-stone-700 bg-stone-900 p-2">
                  <PortraitCanvas tenant={t} size={40} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold text-amber-100">{t.name}</div>
                    <div className="text-stone-400">
                      {t.occupation} · Sat {t.satisfaction}%
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      engine.evictTenant(t.id, true);
                      onNotify(`${t.name} moved out.`);
                    }}
                    className="p-1.5 text-rose-400 hover:bg-stone-800 cursor-pointer"
                    title="End Lease"
                  >
                    <UserMinus className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {occupants.length < room.capacity && (
            <div className="space-y-1.5">
              <div className="text-stone-400">Available Applicants (Tap to Lease):</div>
              {state.applicants.map((app) => (
                <div key={app.id} className="flex items-center gap-2 border border-stone-700 bg-stone-900/80 p-2">
                  <PortraitCanvas tenant={app} size={36} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-stone-100">{app.name}</div>
                    <div className="font-mono-num text-stone-400">
                      {app.occupation} · Max ${app.budget}
                    </div>
                  </div>
                  <button
                    onClick={() => onNotify(engine.assignTenantToRoom(app.id, room.id).message)}
                    className="pixel-btn flex items-center gap-1 bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-stone-950 cursor-pointer"
                  >
                    <UserPlus className="h-3.5 w-3.5" /> Lease
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Interior Design Themes */}
        <div>
          <h4 className="mb-1.5 flex items-center gap-1 font-semibold text-stone-200">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Interior Design
          </h4>
          <div className="grid grid-cols-2 gap-1.5">
            {(Object.keys(INTERIOR_THEMES) as InteriorTheme[]).map((tk) => {
              const tSpec = INTERIOR_THEMES[tk];
              const active = room.theme === tk;
              const locked = state.level < tSpec.unlockLevel;
              return (
                <button
                  key={tk}
                  disabled={active || locked}
                  onClick={() => onNotify(engine.changeRoomTheme(room.id, tk).message)}
                  className={`flex items-center justify-between border px-2 py-1.5 text-left cursor-pointer ${
                    active
                      ? 'border-amber-500 bg-amber-950/50 text-amber-200'
                      : 'border-stone-700 bg-stone-900 text-stone-300 hover:bg-stone-800 disabled:opacity-50'
                  }`}
                >
                  <span className="truncate">{tSpec.label}</span>
                  <span className="font-mono-num text-[11px] text-amber-400">
                    {active ? 'On' : locked ? `Lv${tSpec.unlockLevel}` : `$${tSpec.cost}`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Furniture Shop for this room */}
        <div>
          <h4 className="mb-1.5 font-semibold text-stone-200">Furniture & Appliances</h4>
          <div className="grid grid-cols-2 gap-1.5">
            {(Object.keys(FURNITURE_SPECS) as FurnitureType[]).map((fk) => {
              const fSpec = FURNITURE_SPECS[fk];
              const existing = room.furniture.find((f) => f.type === fk);
              const locked = state.level < fSpec.unlockLevel;
              const cost = existing ? Math.round(fSpec.cost * (0.8 + existing.level * 0.5)) : fSpec.cost;
              const maxed = existing && existing.level >= 3;
              return (
                <button
                  key={fk}
                  disabled={locked || Boolean(maxed)}
                  onClick={() => onNotify(engine.buyFurniture(room.id, fk).message)}
                  className="flex flex-col border border-stone-700 bg-stone-900 p-2 text-left hover:bg-stone-800 disabled:opacity-50 cursor-pointer"
                >
                  <span className="font-medium text-stone-100">
                    {fSpec.label} {existing ? `Lv.${existing.level}` : ''}
                  </span>
                  <span className="font-mono-num text-[11px] text-amber-400">
                    {locked ? `Unlock Lv.${fSpec.unlockLevel}` : maxed ? 'Max Lv.3' : `$${cost}`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
