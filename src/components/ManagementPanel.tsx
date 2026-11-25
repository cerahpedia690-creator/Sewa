import { X, Download, Sparkles } from 'lucide-react';
import {
  FACILITY_SPECS,
  ROOM_SPECS,
  STAFF_SPECS,
  UPGRADE_SPECS,
} from '../game/catalog';
import { GameEngine } from '../game/engine';
import {
  FacilityType,
  NavTab,
  RoomType,
  StaffRole,
} from '../game/types';
import { downloadAndroidProjectZip } from '../utils/zipExport';
import { PortraitCanvas } from './PortraitCanvas';

interface ManagementPanelProps {
  engine: GameEngine;
  activeTab: NavTab;
  onClose: () => void;
  onNotify: (msg: string) => void;
  onInspectRoom: (roomId: string) => void;
  onReturnToMenu: () => void;
}

export function ManagementPanel({
  engine,
  activeTab,
  onClose,
  onNotify,
  onInspectRoom,
  onReturnToMenu,
}: ManagementPanelProps) {
  const s = engine.state;
  const rentedCount = s.rooms.filter((r) => r.tenantIds.length > 0).length;
  const avgSat =
    s.tenants.length > 0
      ? Math.round(s.tenants.reduce((a, b) => a + b.satisfaction, 0) / s.tenants.length)
      : 0;

  const titles: Record<NavTab, string> = {
    DASHBOARD: 'Property Dashboard',
    BUILDING: 'Building & Upgrades',
    TENANTS: 'Tenants & Relationships',
    FACILITIES: 'Apartment Facilities',
    STAFF: 'Staff Management',
    FINANCE: 'Economy, Loans & Investments',
    QUESTS: 'Quests & Achievements',
    SHOP: 'Property Supply Shop',
    SETTINGS: 'Game Settings & Saves',
  };

  return (
    <div className="pixel-panel pointer-events-auto fixed left-3 top-16 bottom-16 z-30 flex w-[460px] max-w-[94vw] flex-col p-4 text-stone-100">
      <div className="mb-3 flex items-center justify-between border-b border-stone-700 pb-2">
        <h2 className="font-pixel text-sm text-amber-200">{titles[activeTab]}</h2>
        <button
          onClick={onClose}
          className="p-1.5 text-stone-400 hover:text-white cursor-pointer"
          aria-label="Close panel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="pixel-scroll flex-1 space-y-4 overflow-y-auto pr-1 text-xs">
        {activeTab === 'DASHBOARD' && (
          <>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="border border-stone-700 bg-stone-900 p-3">
                <div className="text-stone-400">Cash Balance</div>
                <div className="font-mono-num mt-1 text-lg font-bold text-amber-400">
                  ${s.money.toLocaleString()}
                </div>
              </div>
              <div className="border border-stone-700 bg-stone-900 p-3">
                <div className="text-stone-400">Occupancy</div>
                <div className="font-mono-num mt-1 text-lg font-bold text-emerald-400">
                  {rentedCount}/{s.rooms.length} Rooms
                </div>
              </div>
              <div className="border border-stone-700 bg-stone-900 p-3">
                <div className="text-stone-400">Avg. Satisfaction</div>
                <div className="font-mono-num mt-1 text-lg font-bold text-sky-400">{avgSat}%</div>
              </div>
              <div className="border border-stone-700 bg-stone-900 p-3">
                <div className="text-stone-400">Property Reputation</div>
                <div className="font-mono-num mt-1 text-lg font-bold text-amber-200">{s.reputation}/100</div>
              </div>
            </div>

            <div className="border border-stone-700 bg-stone-900 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-semibold text-stone-200">Quick Actions</span>
                <button
                  onClick={() => engine.triggerRandomDramaEvent()}
                  className="pixel-btn flex items-center gap-1 bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5" /> Trigger Drama Event
                </button>
              </div>
              <p className="text-stone-400">
                Click any room or empty floor slot directly on the canvas to inspect furniture, clean rooms, adjust rent, or lease units.
              </p>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-stone-200">Recent Drama & Events</h3>
              {s.eventHistory.length === 0 ? (
                <p className="text-stone-400">No social events logged yet.</p>
              ) : (
                <div className="space-y-1.5">
                  {s.eventHistory.slice(0, 6).map((ev, idx) => (
                    <div key={idx} className="border border-stone-800 bg-stone-900/70 p-2">
                      <div className="font-semibold text-amber-200">
                        Day {ev.day} · {ev.title}
                      </div>
                      <div className="text-stone-400">{ev.outcome}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'BUILDING' && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onNotify(engine.buildNewFloor().message)}
                disabled={s.totalFloors >= 8}
                className="pixel-btn bg-amber-600 p-2.5 text-left text-stone-950 disabled:bg-stone-700 disabled:text-stone-400 cursor-pointer"
              >
                <div className="font-bold">Build Floor {s.totalFloors + 1}</div>
                <div className="font-mono-num text-[11px]">
                  {s.totalFloors >= 8 ? 'Max 8 Floors' : `$${engine.getFloorBuildCost().toLocaleString()}`}
                </div>
              </button>
              <button
                onClick={() => onNotify(engine.buyLandExpansion().message)}
                disabled={s.landPlots >= 3}
                className="pixel-btn bg-emerald-600 p-2.5 text-left text-stone-950 disabled:bg-stone-700 disabled:text-stone-400 cursor-pointer"
              >
                <div className="font-bold">Expand Land (+2 Slots)</div>
                <div className="font-mono-num text-[11px]">
                  {s.landPlots >= 3 ? 'Max Width' : `$${engine.getLandExpansionCost().toLocaleString()}`}
                </div>
              </button>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-stone-200">Quick Build Room</h3>
              <div className="grid grid-cols-2 gap-1.5">
                {(Object.keys(ROOM_SPECS) as RoomType[]).map((rt) => {
                  const spec = ROOM_SPECS[rt];
                  const locked = s.level < spec.unlockLevel;
                  return (
                    <button
                      key={rt}
                      disabled={locked}
                      onClick={() => {
                        for (let f = spec.minFloor ?? 1; f <= s.totalFloors; f++) {
                          const slot = engine.findAvailableSlot(f, spec.slotSpan);
                          if (slot !== null) {
                            const res = engine.buildRoom(f, rt, slot);
                            onNotify(res.message);
                            if (res.room) onInspectRoom(res.room.id);
                            return;
                          }
                        }
                        onNotify(`No free ${spec.slotSpan}-slot space on eligible floors. Build a new floor or expand land!`);
                      }}
                      className="border border-stone-700 bg-stone-900 p-2 text-left hover:bg-stone-800 disabled:opacity-50 cursor-pointer"
                    >
                      <div className="font-semibold text-amber-100">{spec.label}</div>
                      <div className="font-mono-num text-amber-400">
                        {locked ? `Unlock Lv.${spec.unlockLevel}` : `$${spec.buildCost.toLocaleString()} · ${spec.slotSpan} slot`}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-stone-200">Building Infrastructure Upgrades</h3>
              <div className="space-y-2">
                {UPGRADE_SPECS.map((u) => {
                  const lvl = s.upgrades[u.key];
                  const cost = Math.round(u.baseCost * Math.pow(1.45, lvl - 1));
                  return (
                    <div key={u.key} className="flex items-center justify-between gap-2 border border-stone-700 bg-stone-900 p-2.5">
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-stone-100">
                          {u.label} · Lv.{lvl}/5
                        </div>
                        <div className="text-stone-400">{u.description}</div>
                      </div>
                      <button
                        disabled={lvl >= 5}
                        onClick={() => onNotify(engine.upgradeBuilding(u.key).message)}
                        className="pixel-btn shrink-0 bg-stone-800 px-3 py-1.5 font-mono-num font-semibold text-amber-300 disabled:opacity-50 cursor-pointer"
                      >
                        {lvl >= 5 ? 'MAX' : `$${cost.toLocaleString()}`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {activeTab === 'TENANTS' && (
          <>
            <div>
              <h3 className="mb-2 font-semibold text-stone-200">
                Active Residents ({s.tenants.length})
              </h3>
              {s.tenants.length === 0 ? (
                <p className="text-stone-400">No residents yet. Click an apartment room to lease it.</p>
              ) : (
                <div className="space-y-2">
                  {s.tenants.map((t) => {
                    const rm = s.rooms.find((r) => r.id === t.roomId);
                    return (
                      <div key={t.id} className="flex items-start gap-2.5 border border-stone-700 bg-stone-900 p-2.5">
                        <PortraitCanvas tenant={t} size={46} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-amber-100">{t.name}</span>
                            <span className="font-mono-num text-emerald-400">Rm {rm?.number ?? '-'}</span>
                          </div>
                          <div className="text-stone-400">
                            Age {t.age} · {t.occupation} · {t.personality}
                          </div>
                          <div className="mt-0.5 text-stone-400">Habit: {t.habit}</div>
                          <div className="mt-1 flex items-center gap-3 font-mono-num text-stone-300">
                            <span>Sat: {t.satisfaction}%</span>
                            <span>Lease: {t.contractDaysLeft}d</span>
                            <span>{t.paymentStatus}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-stone-200">Social Relationships</h3>
              {s.relationships.length === 0 ? (
                <p className="text-stone-400">Need at least 2 tenants for social bonds to form.</p>
              ) : (
                <div className="space-y-1.5">
                  {s.relationships.map((rel) => {
                    const a = s.tenants.find((t) => t.id === rel.tenantA);
                    const b = s.tenants.find((t) => t.id === rel.tenantB);
                    if (!a || !b) return null;
                    return (
                      <div key={rel.id} className="border border-stone-700 bg-stone-900 p-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-stone-100">
                            {a.name} &amp; {b.name}
                          </span>
                          <span className="font-mono-num text-amber-400">
                            {rel.label} ({rel.score})
                          </span>
                        </div>
                        {rel.history[0] && (
                          <div className="mt-0.5 text-stone-400">{rel.history[0]}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-semibold text-stone-200">Prospective Applicants</h3>
                <button
                  onClick={() => engine.refreshApplicants()}
                  className="text-amber-400 hover:underline cursor-pointer"
                >
                  Refresh List
                </button>
              </div>
              <div className="space-y-1.5">
                {s.applicants.map((app) => (
                  <div key={app.id} className="flex items-center gap-2 border border-stone-700 bg-stone-900 p-2">
                    <PortraitCanvas tenant={app} size={36} />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-stone-100">{app.name}</div>
                      <div className="text-stone-400">
                        {app.occupation} · Budget ${app.budget} · {app.personality}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'FACILITIES' && (
          <div className="space-y-2">
            {(Object.keys(FACILITY_SPECS) as FacilityType[]).map((ft) => {
              const spec = FACILITY_SPECS[ft];
              const fac = s.facilities[ft];
              const locked = s.level < spec.unlockLevel;
              const cost = fac.built ? Math.round(Math.max(800, spec.cost) * (0.7 + fac.level * 0.5)) : spec.cost;
              return (
                <div key={ft} className="flex items-center justify-between gap-2 border border-stone-700 bg-stone-900 p-2.5">
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-amber-100">
                      {spec.label} {fac.built ? `· Lv.${fac.level}/3` : '· Not Built'}
                    </div>
                    <div className="text-stone-400">{spec.description}</div>
                    <div className="mt-1 font-mono-num text-[11px] text-emerald-400">
                      +${spec.dailyRevenue}/d rev · +{spec.satisfactionBonus} mood · +{spec.reputationBonus} rep
                    </div>
                  </div>
                  <button
                    disabled={locked || fac.level >= 3}
                    onClick={() => onNotify(engine.buildOrUpgradeFacility(ft).message)}
                    className="pixel-btn shrink-0 bg-amber-600 px-3 py-1.5 font-mono-num font-semibold text-stone-950 disabled:bg-stone-700 disabled:text-stone-400 cursor-pointer"
                  >
                    {locked ? `Lv.${spec.unlockLevel}` : fac.level >= 3 ? 'MAX' : `${fac.built ? 'Upgr' : 'Build'} $${cost}`}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'STAFF' && (
          <>
            <div>
              <h3 className="mb-2 font-semibold text-stone-200">Hire Staff</h3>
              <div className="space-y-2">
                {(Object.keys(STAFF_SPECS) as StaffRole[]).map((role) => {
                  const spec = STAFF_SPECS[role];
                  const locked = s.level < spec.unlockLevel;
                  return (
                    <div key={role} className="flex items-center justify-between gap-2 border border-stone-700 bg-stone-900 p-2.5">
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-amber-100">{spec.label}</div>
                        <div className="text-stone-400">{spec.description}</div>
                        <div className="font-mono-num text-[11px] text-stone-300">
                          Salary: ${spec.dailySalary}/day
                        </div>
                      </div>
                      <button
                        disabled={locked}
                        onClick={() => onNotify(engine.hireStaff(role).message)}
                        className="pixel-btn shrink-0 bg-emerald-600 px-3 py-1.5 font-mono-num font-semibold text-stone-950 disabled:bg-stone-700 disabled:text-stone-400 cursor-pointer"
                      >
                        {locked ? `Lv.${spec.unlockLevel}` : `Hire $${spec.hireCost}`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-stone-200">Active Employees ({s.staff.length})</h3>
              {s.staff.length === 0 ? (
                <p className="text-stone-400">No staff hired yet.</p>
              ) : (
                <div className="space-y-2">
                  {s.staff.map((st) => (
                    <div key={st.id} className="flex items-center justify-between gap-2 border border-stone-700 bg-stone-900 p-2.5">
                      <div>
                        <div className="font-semibold text-stone-100">
                          {st.name} · {STAFF_SPECS[st.role].label}
                        </div>
                        <div className="font-mono-num text-stone-400">
                          Skill Lv.{st.skillLevel} · Prod {st.productivity}% · Fatigue {Math.round(st.fatigue)}%
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          disabled={st.skillLevel >= 5}
                          onClick={() => onNotify(engine.trainStaff(st.id).message)}
                          className="pixel-btn bg-amber-600 px-2 py-1 font-semibold text-stone-950 disabled:opacity-40 cursor-pointer"
                        >
                          Train ${st.skillLevel * 350}
                        </button>
                        <button
                          onClick={() => {
                            engine.fireStaff(st.id);
                            onNotify(`Dismissed ${st.name}.`);
                          }}
                          className="pixel-btn bg-stone-800 px-2 py-1 text-rose-400 cursor-pointer"
                        >
                          Fire
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'FINANCE' && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div className="border border-stone-700 bg-stone-900 p-2.5">
                <div className="text-stone-400">Today Income / Expense</div>
                <div className="font-mono-num mt-1 text-sm">
                  <span className="text-emerald-400">+${s.dailyIncome.toLocaleString()}</span>
                  {' / '}
                  <span className="text-rose-400">-${s.dailyExpense.toLocaleString()}</span>
                </div>
              </div>
              <div className="border border-stone-700 bg-stone-900 p-2.5">
                <div className="text-stone-400">Month Income / Expense</div>
                <div className="font-mono-num mt-1 text-sm">
                  <span className="text-emerald-400">+${s.monthlyIncome.toLocaleString()}</span>
                  {' / '}
                  <span className="text-rose-400">-${s.monthlyExpense.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-stone-200">Bank Loans</h3>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <button
                  onClick={() => onNotify(engine.takeLoan(5000, 'Starter Expansion Loan').message)}
                  className="pixel-btn bg-stone-800 p-2 text-left hover:bg-stone-700 cursor-pointer"
                >
                  <div className="font-semibold text-amber-300">Borrow $5,000</div>
                  <div className="text-stone-400">1.5% daily interest</div>
                </button>
                <button
                  onClick={() => onNotify(engine.takeLoan(15000, 'Luxury Tower Credit').message)}
                  className="pixel-btn bg-stone-800 p-2 text-left hover:bg-stone-700 cursor-pointer"
                >
                  <div className="font-semibold text-amber-300">Borrow $15,000</div>
                  <div className="text-stone-400">1.5% daily interest</div>
                </button>
              </div>
              {s.loans.map((ln) => (
                <div key={ln.id} className="flex items-center justify-between border border-stone-700 bg-stone-900 p-2 mb-1.5">
                  <div>
                    <div className="font-semibold text-stone-100">{ln.name}</div>
                    <div className="font-mono-num text-rose-400">Remaining: ${ln.remaining.toLocaleString()}</div>
                  </div>
                  <button
                    onClick={() => onNotify(engine.repayLoanEarly(ln.id).message)}
                    className="pixel-btn bg-emerald-600 px-2.5 py-1 font-semibold text-stone-950 cursor-pointer"
                  >
                    Pay Off
                  </button>
                </div>
              ))}
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-stone-200">Property Investments</h3>
              <div className="space-y-2">
                {s.investments.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between gap-2 border border-stone-700 bg-stone-900 p-2.5">
                    <div>
                      <div className="font-semibold text-amber-100">{inv.name}</div>
                      <div className="text-stone-400">{inv.description}</div>
                      <div className="font-mono-num text-emerald-400">+${inv.dailyReturn}/day dividend</div>
                    </div>
                    <button
                      disabled={inv.owned}
                      onClick={() => onNotify(engine.buyInvestment(inv.id).message)}
                      className="pixel-btn shrink-0 bg-amber-600 px-3 py-1.5 font-mono-num font-semibold text-stone-950 disabled:bg-stone-700 disabled:text-emerald-400 cursor-pointer"
                    >
                      {inv.owned ? 'OWNED' : `$${inv.cost.toLocaleString()}`}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-stone-200">Transaction Ledger</h3>
              <div className="space-y-1">
                {s.transactions.slice(0, 20).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between border-b border-stone-800 py-1">
                    <div className="min-w-0 flex-1 pr-2">
                      <span className="text-stone-500">D{tx.day} · </span>
                      <span className="text-stone-300">{tx.description}</span>
                    </div>
                    <span className={`font-mono-num font-semibold ${tx.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {tx.type === 'INCOME' ? '+' : '-'}${tx.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'QUESTS' && (
          <>
            <div>
              <h3 className="mb-2 font-semibold text-stone-200">Active Missions</h3>
              <div className="space-y-2">
                {s.quests.map((q) => (
                  <div key={q.id} className="border border-stone-700 bg-stone-900 p-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-amber-100">
                        [{q.category}] {q.title}
                      </span>
                      <span className="font-mono-num text-stone-300">
                        {Math.min(q.progress, q.targetValue)}/{q.targetValue}
                      </span>
                    </div>
                    <p className="mt-1 text-stone-400">{q.description}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-mono-num text-amber-400">
                        Reward: ${q.rewardMoney} + {q.rewardXp} XP
                      </span>
                      <button
                        disabled={!q.completed || q.claimed}
                        onClick={() => onNotify(engine.claimQuest(q.id).message)}
                        className="pixel-btn bg-emerald-600 px-3 py-1 font-semibold text-stone-950 disabled:bg-stone-700 disabled:text-stone-400 cursor-pointer"
                      >
                        {q.claimed ? 'Claimed' : q.completed ? 'Claim Reward' : 'In Progress'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-stone-200">Achievements</h3>
              <div className="space-y-1.5">
                {s.achievements.map((a) => (
                  <div
                    key={a.id}
                    className={`border p-2 ${a.unlocked ? 'border-amber-500/70 bg-amber-950/30' : 'border-stone-800 bg-stone-900/60 opacity-65'}`}
                  >
                    <div className="flex justify-between font-semibold">
                      <span className={a.unlocked ? 'text-amber-300' : 'text-stone-300'}>{a.title}</span>
                      <span className="font-mono-num text-sky-400">+{a.rewardXp} XP</span>
                    </div>
                    <div className="text-stone-400">{a.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'SHOP' && (
          <div className="space-y-3">
            <div className="border border-stone-700 bg-stone-900 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-amber-100">Lobby Vending Machine</div>
                  <div className="text-stone-400">Owned: {s.vendingMachines} · Generates passive hourly snack income.</div>
                </div>
                <button
                  onClick={() => onNotify(engine.buyVendingMachine().message)}
                  className="pixel-btn bg-amber-600 px-3 py-1.5 font-mono-num font-semibold text-stone-950 cursor-pointer"
                >
                  Buy $950
                </button>
              </div>
            </div>
            <div className="border border-stone-700 bg-stone-900 p-3 text-stone-300">
              <div className="font-semibold text-amber-200 mb-1">Room Furniture & Themes</div>
              <p className="text-stone-400">
                To buy beds, sofas, smart TVs, AC units, plants, or interior themes for a specific apartment, click directly on any room in the building!
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {s.rooms.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => onInspectRoom(r.id)}
                    className="pixel-btn bg-stone-800 px-2.5 py-1 text-amber-200 hover:bg-stone-700 cursor-pointer"
                  >
                    Inspect Rm {r.number}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'SETTINGS' && (
          <div className="space-y-4">
            <div className="space-y-2.5 border border-stone-700 bg-stone-900 p-3">
              <label className="flex items-center justify-between cursor-pointer">
                <span>Mute Sound Effects</span>
                <input
                  type="checkbox"
                  checked={engine.settings.muted}
                  onChange={(e) => engine.updateSettings({ muted: e.target.checked })}
                  className="accent-amber-500 h-4 w-4"
                />
              </label>
              <div>
                <div className="flex justify-between mb-1">
                  <span>SFX Volume</span>
                  <span className="font-mono-num">{Math.round(engine.settings.sfxVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={engine.settings.sfxVolume}
                  onChange={(e) => engine.updateSettings({ sfxVolume: Number(e.target.value) })}
                  className="w-full accent-amber-500"
                />
              </div>
              <label className="flex items-center justify-between cursor-pointer">
                <span>Weather Effects (Rain &amp; Sun)</span>
                <input
                  type="checkbox"
                  checked={engine.settings.weatherEnabled}
                  onChange={(e) => engine.updateSettings({ weatherEnabled: e.target.checked })}
                  className="accent-amber-500 h-4 w-4"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span>NPC Thought Bubbles</span>
                <input
                  type="checkbox"
                  checked={engine.settings.showBubbles}
                  onChange={(e) => engine.updateSettings({ showBubbles: e.target.checked })}
                  className="accent-amber-500 h-4 w-4"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span>Daily Auto-Save</span>
                <input
                  type="checkbox"
                  checked={engine.settings.autoSaveEnabled}
                  onChange={(e) => engine.updateSettings({ autoSaveEnabled: e.target.checked })}
                  className="accent-amber-500 h-4 w-4"
                />
              </label>
            </div>

            <div className="border border-stone-700 bg-stone-900 p-3">
              <h3 className="mb-2 font-semibold text-amber-200">Manual Save Slots</h3>
              <div className="space-y-2">
                {([1, 2, 3] as const).map((slotNum) => {
                  const meta = engine.listSaveSlots()[slotNum - 1];
                  return (
                    <div key={slotNum} className="flex items-center justify-between border border-stone-800 bg-stone-950 p-2">
                      <div>
                        <div className="font-semibold text-stone-100">Slot {slotNum}</div>
                        <div className="text-stone-400 font-mono-num">
                          {meta ? `Day ${meta.day} · Lv.${meta.level} · $${meta.money.toLocaleString()}` : 'Empty'}
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => {
                            engine.saveToSlot(slotNum);
                            onNotify(`Saved to Slot ${slotNum}!`);
                          }}
                          className="pixel-btn bg-amber-600 px-2.5 py-1 font-semibold text-stone-950 cursor-pointer"
                        >
                          Save
                        </button>
                        {meta && (
                          <button
                            onClick={() => {
                              engine.loadFromSlot(slotNum);
                              onNotify(`Loaded Slot ${slotNum}!`);
                            }}
                            className="pixel-btn bg-stone-800 px-2.5 py-1 text-sky-300 cursor-pointer"
                          >
                            Load
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => downloadAndroidProjectZip()}
                className="pixel-btn flex items-center justify-center gap-2 bg-emerald-600 py-2 font-semibold text-stone-950 cursor-pointer"
              >
                <Download className="h-4 w-4" /> Export Native Android Java Source (.zip)
              </button>
              <button
                onClick={onReturnToMenu}
                className="pixel-btn bg-stone-800 py-2 font-semibold text-stone-200 hover:bg-stone-700 cursor-pointer"
              >
                Save &amp; Return to Main Menu
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
