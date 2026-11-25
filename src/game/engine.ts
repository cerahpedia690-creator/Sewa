import {
  ARCHETYPE_SPECS,
  DRAMA_TEMPLATES,
  FACILITY_SPECS,
  FURNITURE_SPECS,
  INITIAL_ACHIEVEMENTS,
  INITIAL_INVESTMENTS,
  INITIAL_QUESTS,
  INTERIOR_THEMES,
  ROOM_SPECS,
  STAFF_SPECS,
  TENANT_FIRST_NAMES,
  TENANT_LAST_NAMES,
  UPGRADE_SPECS,
} from './catalog';
import { soundFX } from './sound';
import {
  BuildingUpgrades,
  Cloud,
  DayPeriod,
  DramaEvent,
  Facility,
  FacilityType,
  FloatingText,
  FurnitureType,
  GameSettings,
  GameSpeed,
  GameState,
  InteriorTheme,
  Loan,
  RainDrop,
  Relationship,
  RelationshipLabel,
  Room,
  RoomType,
  SaveSlotMeta,
  StaffMember,
  StaffRole,
  StreetVehicle,
  StreetWalker,
  Tenant,
  TenantArchetype,
  TransactionCategory,
  UpgradeKey,
} from './types';

const SAVE_PREFIX = 'fennxy_apt_tycoon_slot_';
const AUTOSAVE_KEY = 'fennxy_apt_tycoon_autosave';
const SETTINGS_KEY = 'fennxy_apt_tycoon_settings';

let idSeq = 1;
const uid = (prefix: string) => `${prefix}_${Date.now().toString(36)}_${(idSeq++).toString(36)}`;

const SKIN_TONES = ['#FDE2C8', '#F2C6A0', '#D99B72', '#A66E4E', '#6E4730'];
const HAIR_COLORS = ['#1C1917', '#4A2C1D', '#854D0E', '#D97706', '#334155', '#BE185D'];
const SHIRT_COLORS = ['#E11D48', '#2563EB', '#059669', '#D97706', '#7C3AED', '#0891B2', '#EA580C', '#DB2777'];
const PANTS_COLORS = ['#1E293B', '#334155', '#3F3F46', '#44403C', '#1E3A8A'];
const VEHICLE_COLORS = ['#DC2626', '#2563EB', '#EAB308', '#059669', '#F97316', '#E2E8F0'];

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export function getDayPeriod(hour: number): DayPeriod {
  if (hour >= 5 && hour < 11) return 'Morning';
  if (hour >= 11 && hour < 16) return 'Afternoon';
  if (hour >= 16 && hour < 20) return 'Evening';
  return 'Night';
}

export function getRelationLabel(score: number, romantic: boolean): RelationshipLabel {
  if (romantic && score >= 55) return 'Couple';
  if (romantic && score >= 25) return 'Crush';
  if (score >= 70) return 'Best Friend';
  if (score >= 35) return 'Friend';
  if (score >= 10) return 'Acquaintance';
  if (score <= -50) return 'Feuding';
  if (score <= -15) return 'Rival';
  return 'Stranger';
}

export function createInitialFacilities(): Record<FacilityType, Facility> {
  const result = {} as Record<FacilityType, Facility>;
  (Object.keys(FACILITY_SPECS) as FacilityType[]).forEach((key) => {
    const spec = FACILITY_SPECS[key];
    result[key] = {
      type: key,
      built: key === 'LOBBY',
      level: key === 'LOBBY' ? 1 : 0,
      floor: spec.floor,
      slot: spec.slot,
    };
  });
  return result;
}

export function computeRoomComfort(room: Room, upgrades: BuildingUpgrades): number {
  const themeBonus = INTERIOR_THEMES[room.theme]?.comfortBonus ?? 0;
  const furnScore = room.furniture.reduce((acc, f) => {
    const spec = FURNITURE_SPECS[f.type];
    const condScale = 0.4 + 0.6 * (f.condition / 100);
    return acc + (spec.comfortBonus + (f.level - 1) * 4) * condScale;
  }, 0);
  const upgBonus = (upgrades.WALLS - 1) * 3 + (upgrades.FLOORS - 1) * 3 + (upgrades.LIGHTING - 1) * 2 + (upgrades.DECOR - 1) * 2;
  const cleanPenalty = room.cleanliness < 50 ? (50 - room.cleanliness) * 0.4 : 0;
  const condPenalty = room.condition < 50 ? (50 - room.condition) * 0.4 : 0;
  return Math.round(clamp(22 + themeBonus + furnScore + upgBonus - cleanPenalty - condPenalty, 5, 100));
}

export function generateTenantCandidate(playerLevel: number, forcedArchetype?: TenantArchetype): Tenant {
  const unlocked = (Object.keys(ARCHETYPE_SPECS) as TenantArchetype[]).filter(
    (k) => ARCHETYPE_SPECS[k].unlockLevel <= playerLevel
  );
  const archetype = forcedArchetype ?? pick(unlocked);
  const spec = ARCHETYPE_SPECS[archetype];
  const age = Math.floor(spec.minAge + Math.random() * (spec.maxAge - spec.minAge + 1));
  const income = Math.round((spec.minIncome + Math.random() * (spec.maxIncome - spec.minIncome)) / 50) * 50;
  const budget = Math.round((spec.minBudget + Math.random() * (spec.maxBudget - spec.minBudget)) / 10) * 10;

  return {
    id: uid('ten'),
    name: `${pick(TENANT_FIRST_NAMES)} ${pick(TENANT_LAST_NAMES)}`,
    age,
    archetype,
    occupation: pick(spec.occupations),
    income,
    personality: pick(spec.preferredPersonalities),
    habit: pick(spec.habits),
    budget,
    satisfaction: 78,
    paymentStatus: 'PAID',
    contractDaysLeft: 30,
    totalMonthsStayed: 0,
    roomId: null,
    appearance: {
      skinColor: pick(SKIN_TONES),
      hairColor: pick(HAIR_COLORS),
      hairStyle: Math.floor(Math.random() * 5),
      shirtColor: pick(SHIRT_COLORS),
      pantsColor: pick(PANTS_COLORS),
      hasGlasses: Math.random() < 0.28,
      accessory: Math.floor(Math.random() * 4),
    },
    x: 1.5,
    y: 0,
    targetX: 1.5,
    targetFloor: 0,
    currentFloor: 0,
    activity: 'IDLE',
    activityTimer: 1.5,
    facing: 1,
    walkPhase: 0,
    bubbleIcon: null,
    bubbleTimer: 0,
    waitingElevator: false,
    insideElevator: false,
  };
}

export function createStarterState(apartmentName = 'Pixel Haven Residence'): GameState {
  const upgrades: BuildingUpgrades = {
    WALLS: 1,
    FLOORS: 1,
    SECURITY: 1,
    ELEVATOR_TECH: 1,
    LIGHTING: 1,
    ELECTRICAL: 1,
    PLUMBING: 1,
    DECOR: 1,
  };

  const starterRooms: Room[] = [
    {
      id: uid('rm'),
      floor: 1,
      slotStart: 0,
      slotSpan: 1,
      number: '101',
      type: 'STUDIO',
      theme: 'COZY_CREAM',
      cleanliness: 92,
      condition: 95,
      capacity: 1,
      rentPrice: 280,
      deposit: 280,
      comfort: 50,
      furniture: [
        { id: uid('fr'), type: 'BED', level: 1, condition: 95 },
        { id: uid('fr'), type: 'DESK', level: 1, condition: 95 },
      ],
      tenantIds: [],
      lightOn: false,
    },
    {
      id: uid('rm'),
      floor: 1,
      slotStart: 1,
      slotSpan: 1,
      number: '102',
      type: 'STANDARD',
      theme: 'NORDIC_SAGE',
      cleanliness: 94,
      condition: 96,
      capacity: 1,
      rentPrice: 420,
      deposit: 420,
      comfort: 56,
      furniture: [
        { id: uid('fr'), type: 'BED', level: 1, condition: 96 },
        { id: uid('fr'), type: 'SOFA', level: 1, condition: 96 },
      ],
      tenantIds: [],
      lightOn: false,
    },
  ];
  starterRooms.forEach((r) => {
    r.comfort = computeRoomComfort(r, upgrades);
  });

  const starterTenant = generateTenantCandidate(1, 'STUDENT');
  starterTenant.roomId = starterRooms[0].id;
  starterTenant.currentFloor = 1;
  starterTenant.targetFloor = 1;
  starterTenant.y = 1;
  starterTenant.x = 0.5;
  starterTenant.targetX = 0.5;
  starterRooms[0].tenantIds.push(starterTenant.id);

  return {
    apartmentName,
    money: 8500,
    totalEarned: 0,
    level: 1,
    xp: 0,
    xpToNext: 250,
    reputation: 38,
    day: 1,
    hour: 8,
    minute: 0,
    speed: 1,
    weather: 'SUNNY',
    landPlots: 1, // 3 slots per floor
    totalFloors: 2,
    rooms: starterRooms,
    tenants: [starterTenant],
    applicants: [
      generateTenantCandidate(1, 'OFFICE_WORKER'),
      generateTenantCandidate(1, 'FREELANCER'),
      generateTenantCandidate(1, 'STUDENT'),
    ],
    relationships: [],
    facilities: createInitialFacilities(),
    staff: [],
    upgrades,
    quests: INITIAL_QUESTS.map((q) => ({ ...q })),
    achievements: INITIAL_ACHIEVEMENTS.map((a) => ({ ...a })),
    transactions: [
      {
        id: uid('tx'),
        day: 1,
        hour: 8,
        type: 'INCOME',
        category: 'RENT',
        description: `Initial deposit from ${starterTenant.name} (Room 101)`,
        amount: 280,
      },
    ],
    dailyIncome: 280,
    dailyExpense: 0,
    monthlyIncome: 280,
    monthlyExpense: 0,
    loans: [],
    investments: INITIAL_INVESTMENTS.map((i) => ({ ...i })),
    activeEvent: null,
    eventHistory: [],
    conflictsResolved: 0,
    elevator: {
      currentFloor: 0,
      targetFloor: 0,
      doorsOpen: 0,
      passengerIds: [],
      queue: [],
    },
    vendingMachines: 1,
    lastSavedAt: null,
  };
}

export class GameEngine {
  public state: GameState;
  public settings: GameSettings;
  public floatingTexts: FloatingText[] = [];
  public streetVehicles: StreetVehicle[] = [];
  public streetWalkers: StreetWalker[] = [];
  public clouds: Cloud[] = [];
  public rainDrops: RainDrop[] = [];

  private minuteAccumulator = 0;
  private eventCooldownHours = 6;
  private onStateChange: () => void;

  constructor(onStateChange: () => void) {
    this.onStateChange = onStateChange;
    this.settings = this.loadSettings();
    soundFX.muted = this.settings.muted;
    soundFX.volume = this.settings.sfxVolume;
    this.state = createStarterState();
    this.initAmbientWorld();
    this.evaluateQuests();
  }

  public getMaxSlots(): number {
    return 1 + this.state.landPlots * 2; // 3, 5, 7 slots
  }

  private initAmbientWorld() {
    this.clouds = Array.from({ length: 7 }, (_, i) => ({
      x: i * 240 + Math.random() * 90,
      y: 28 + Math.random() * 110,
      width: 56 + Math.random() * 64,
      speed: 8 + Math.random() * 10,
    }));

    this.streetVehicles = [
      { id: uid('veh'), x: -120, speed: 68, direction: 1, kind: 'CAR', color: pick(VEHICLE_COLORS) },
      { id: uid('veh'), x: 640, speed: 52, direction: -1, kind: 'VAN', color: pick(VEHICLE_COLORS) },
      { id: uid('veh'), x: 260, speed: 92, direction: 1, kind: 'SCOOTER', color: '#F59E0B' },
    ];

    this.streetWalkers = Array.from({ length: 5 }, (_, i) => ({
      id: uid('sw'),
      x: -100 + i * 210,
      speed: 22 + Math.random() * 12,
      direction: i % 2 === 0 ? 1 : -1,
      shirtColor: pick(SHIRT_COLORS),
      hairColor: pick(HAIR_COLORS),
      walkPhase: Math.random() * 10,
    }));

    this.rainDrops = Array.from({ length: 90 }, () => ({
      x: Math.random() * 1400,
      y: Math.random() * 800,
      speed: 380 + Math.random() * 180,
      len: 8 + Math.random() * 8,
    }));
  }

  public startNewGame(apartmentName?: string) {
    this.state = createStarterState(apartmentName?.trim() || 'Pixel Haven Residence');
    this.floatingTexts = [];
    this.eventCooldownHours = 5;
    this.evaluateQuests();
    this.autoSave();
    soundFX.levelUp();
    this.onStateChange();
  }

  // Main Menu live background tick
  public tickAmbientOnly(dt: number) {
    this.updateAmbient(dt, 1400, 800);
    // Gentle clock cycle for main menu atmosphere
    this.minuteAccumulator += dt * 18;
    if (this.minuteAccumulator >= 1) {
      const mins = Math.floor(this.minuteAccumulator);
      this.minuteAccumulator -= mins;
      this.state.minute += mins;
      if (this.state.minute >= 60) {
        this.state.minute -= 60;
        this.state.hour = (this.state.hour + 1) % 24;
      }
    }
  }

  // Active gameplay tick
  public tick(rawDt: number, viewportW = 1400, viewportH = 800) {
    const dt = Math.min(rawDt, 0.05);
    this.updateAmbient(dt, viewportW, viewportH);

    // Floating texts decay even if paused
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      this.floatingTexts[i].life -= dt;
      if (this.floatingTexts[i].life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }

    if (this.state.speed === 0 || this.state.activeEvent) {
      return;
    }

    const simMultiplier = this.state.speed === 1 ? 1 : this.state.speed === 2 ? 2.4 : 4.5;
    const simDt = dt * simMultiplier;

    // 1 real second at 1x = 4 in-game minutes -> 1 day = 6 real minutes at 1x, ~80s at 3x
    this.minuteAccumulator += simDt * 4 * this.settings.dayCycleSpeed;
    let timeChanged = false;
    while (this.minuteAccumulator >= 1) {
      this.minuteAccumulator -= 1;
      this.advanceOneMinute();
      timeChanged = true;
    }

    this.updateElevator(simDt);
    this.updateTenantsAI(simDt);
    this.updateStaffAI(simDt);

    if (timeChanged) {
      this.onStateChange();
    }
  }

  private updateAmbient(dt: number, w: number, h: number) {
    for (const c of this.clouds) {
      c.x += c.speed * dt;
      if (c.x > w + 160) c.x = -c.width - 100;
    }

    for (const v of this.streetVehicles) {
      v.x += v.speed * v.direction * dt;
      if (v.direction === 1 && v.x > w + 260) {
        v.x = -240;
        v.color = pick(VEHICLE_COLORS);
      } else if (v.direction === -1 && v.x < -260) {
        v.x = w + 240;
        v.color = pick(VEHICLE_COLORS);
      }
    }

    for (const sw of this.streetWalkers) {
      sw.x += sw.speed * sw.direction * dt;
      sw.walkPhase += dt * 7;
      if (sw.direction === 1 && sw.x > w + 140) sw.x = -120;
      if (sw.direction === -1 && sw.x < -140) sw.x = w + 120;
    }

    if (this.state.weather === 'RAINY' && this.settings.weatherEnabled) {
      for (const r of this.rainDrops) {
        r.y += r.speed * dt;
        r.x -= r.speed * 0.14 * dt;
        if (r.y > h) {
          r.y = -20;
          r.x = Math.random() * (w + 200);
        }
      }
    }
  }

  private advanceOneMinute() {
    this.state.minute += 1;
    if (this.state.minute >= 60) {
      this.state.minute = 0;
      this.state.hour += 1;
      this.onHourTick();
      if (this.state.hour >= 24) {
        this.state.hour = 0;
        this.onDayTick();
      }
    }
  }

  private onHourTick() {
    // Update room lights based on hour & occupancy
    const isDark = this.state.hour >= 18 || this.state.hour < 6;
    for (const room of this.state.rooms) {
      const hasAwakeTenant = room.tenantIds.some((tid) => {
        const t = this.state.tenants.find((x) => x.id === tid);
        return t && t.currentFloor === room.floor && t.activity !== 'RESTING' && t.activity !== 'OUTSIDE';
      });
      room.lightOn = isDark && (hasAwakeTenant || Math.random() < 0.12);

      // Gradual wear & dirt
      if (room.tenantIds.length > 0) {
        const floorFactor = 1 - (this.state.upgrades.FLOORS - 1) * 0.12;
        room.cleanliness = clamp(room.cleanliness - 0.32 * floorFactor, 0, 100);
        room.condition = clamp(room.condition - 0.18, 0, 100);
      }
      room.comfort = computeRoomComfort(room, this.state.upgrades);
    }

    // Random weather shift every few hours
    if (this.settings.weatherEnabled && Math.random() < 0.08) {
      this.state.weather = this.state.weather === 'SUNNY' ? 'RAINY' : 'SUNNY';
    }

    // Vending machine & cafe hourly trickles during active hours
    if (this.state.hour >= 8 && this.state.hour <= 22 && this.state.tenants.length > 0) {
      const vendingIncome = this.state.vendingMachines * 6 * Math.max(1, Math.floor(this.state.tenants.length / 2));
      if (vendingIncome > 0 && this.state.hour % 4 === 0) {
        this.addMoney(vendingIncome, 'INCOME', 'VENDING', 'Vending machine sales');
      }
    }

    // Drama Event trigger
    this.eventCooldownHours -= 1;
    if (this.eventCooldownHours <= 0 && !this.state.activeEvent && this.state.tenants.length >= 1) {
      if (Math.random() < 0.35) {
        this.triggerRandomDramaEvent();
        this.eventCooldownHours = 9 + Math.floor(Math.random() * 8);
      } else {
        this.eventCooldownHours = 2;
      }
    }
  }

  private onDayTick() {
    this.state.day += 1;
    this.state.dailyIncome = 0;
    this.state.dailyExpense = 0;

    if (this.state.day % 30 === 1 && this.state.day > 1) {
      this.state.monthlyIncome = 0;
      this.state.monthlyExpense = 0;
    }

    // 1. Collect daily rent from tenants & update satisfaction
    for (const room of this.state.rooms) {
      if (room.tenantIds.length === 0) continue;
      for (const tid of [...room.tenantIds]) {
        const tenant = this.state.tenants.find((t) => t.id === tid);
        if (!tenant) continue;

        // Satisfaction dynamics
        let satDelta = (room.comfort - 55) * 0.08;
        if (room.cleanliness < 40) satDelta -= 3;
        if (room.condition < 40) satDelta -= 3;
        if (room.rentPrice > tenant.budget * 1.15) satDelta -= 4;
        else if (room.rentPrice <= tenant.budget * 0.9) satDelta += 2;
        if (this.state.weather === 'RAINY' && !this.state.facilities.CAFE.built && !this.state.facilities.LOBBY.built) {
          satDelta -= 1;
        }
        // Facility bonuses
        const builtFacs = Object.values(this.state.facilities).filter((f) => f.built);
        satDelta += builtFacs.length * 0.25;
        tenant.satisfaction = clamp(Math.round(tenant.satisfaction + satDelta), 5, 100);

        // Daily rent portion (rentPrice is monthly/10-day cycle? Let's make rentPrice daily rent / 5 or direct daily rent so gameplay feels snappy and rewarding!)
        const dailyRent = Math.round(room.rentPrice / 4);
        if (tenant.satisfaction < 20 && Math.random() < 0.35) {
          tenant.paymentStatus = 'LATE';
        } else {
          tenant.paymentStatus = 'PAID';
          this.addMoney(dailyRent, 'INCOME', 'RENT', `Rent from ${tenant.name} (Rm ${room.number})`);
          this.spawnFloatingText(room.slotStart + room.slotSpan * 0.5, room.floor, `+$${dailyRent}`, '#10B981');
        }

        tenant.contractDaysLeft -= 1;
        if (tenant.contractDaysLeft <= 0) {
          if (tenant.satisfaction >= 55) {
            tenant.contractDaysLeft = 30;
            tenant.totalMonthsStayed += 1;
            this.gainXp(25);
          } else {
            // Unhappy tenant moves out
            this.evictTenant(tenant.id, false);
          }
        }
      }
    }

    // 2. Facility Revenues & Upkeep
    const hasParkingAttendant = this.state.staff.some((s) => s.role === 'PARKING_ATTENDANT');
    const hasManager = this.state.staff.some((s) => s.role === 'MANAGER');
    const tenantScale = Math.max(0.6, this.state.tenants.length * 0.28);

    (Object.values(this.state.facilities) as Facility[]).forEach((fac) => {
      if (!fac.built) return;
      const spec = FACILITY_SPECS[fac.type];
      const levelMult = 1 + (fac.level - 1) * 0.45;
      if (spec.dailyRevenue > 0) {
        let rev = Math.round(spec.dailyRevenue * levelMult * tenantScale);
        if (fac.type === 'PARKING' && hasParkingAttendant) rev = Math.round(rev * 1.4);
        const txCat: TransactionCategory =
          fac.type === 'PARKING'
            ? 'PARKING'
            : fac.type === 'LAUNDRY'
              ? 'LAUNDRY'
              : fac.type === 'MINIMARKET' || fac.type === 'CAFE'
                ? 'SHOP'
                : 'FACILITY';
        this.addMoney(rev, 'INCOME', txCat, `${spec.label} daily revenue`);
      }
      if (spec.dailyUpkeep > 0) {
        this.addMoney(-spec.dailyUpkeep, 'EXPENSE', 'MAINTENANCE', `${spec.label} upkeep`);
      }
    });

    // 3. Investments
    for (const inv of this.state.investments) {
      if (inv.owned) {
        this.addMoney(inv.dailyReturn, 'INCOME', 'INVESTMENT', `Dividend: ${inv.name}`);
      }
    }

    // 4. Utilities & Taxes
    const elecDiscount = 1 - (this.state.upgrades.ELECTRICAL - 1) * 0.1 - (this.state.upgrades.LIGHTING - 1) * 0.05;
    const waterDiscount = 1 - (this.state.upgrades.PLUMBING - 1) * 0.12;
    const mgrDiscount = hasManager ? 0.85 : 1;

    const elecBill = Math.max(
      30,
      Math.round((50 + this.state.rooms.length * 22 + this.state.tenants.length * 14) * Math.max(0.4, elecDiscount) * mgrDiscount)
    );
    const waterBill = Math.max(
      20,
      Math.round((35 + this.state.rooms.length * 14 + this.state.tenants.length * 12) * Math.max(0.4, waterDiscount) * mgrDiscount)
    );
    const propTax = Math.round(45 + this.state.totalFloors * 20 + this.state.landPlots * 35);

    this.addMoney(-elecBill, 'EXPENSE', 'ELECTRICITY', 'Daily electricity bill');
    this.addMoney(-waterBill, 'EXPENSE', 'WATER', 'Daily water utility bill');
    this.addMoney(-propTax, 'EXPENSE', 'TAX', 'Daily municipal property tax');

    // 5. Staff Payroll
    if (this.state.staff.length > 0) {
      const totalPayroll = this.state.staff.reduce((s, m) => s + m.dailySalary, 0);
      this.addMoney(-totalPayroll, 'EXPENSE', 'PAYROLL', `Staff payroll (${this.state.staff.length} staff)`);
      this.state.staff.forEach((s) => {
        s.xp += 15;
        if (s.xp >= s.skillLevel * 60 && s.skillLevel < 5) {
          s.skillLevel += 1;
          s.xp = 0;
          s.productivity = Math.min(100, s.productivity + 8);
        }
      });
    }

    // 6. Bank Loan Payments
    for (let i = this.state.loans.length - 1; i >= 0; i--) {
      const loan = this.state.loans[i];
      const interest = Math.round(loan.remaining * loan.dailyInterestRate);
      const payment = Math.min(loan.remaining + interest, loan.dailyPayment);
      loan.remaining = Math.max(0, loan.remaining + interest - payment);
      this.addMoney(-payment, 'EXPENSE', 'LOAN', `Loan installment: ${loan.name}`);
      if (loan.remaining <= 0) {
        this.state.loans.splice(i, 1);
      }
    }

    // 7. Refresh tenant applicants daily
    while (this.state.applicants.length < 4) {
      this.state.applicants.push(generateTenantCandidate(this.state.level));
    }

    // 8. Reputation drift
    if (this.state.tenants.length > 0) {
      const avgSat = this.state.tenants.reduce((a, b) => a + b.satisfaction, 0) / this.state.tenants.length;
      if (avgSat >= 75) this.state.reputation = clamp(this.state.reputation + 1, 0, 100);
      else if (avgSat < 45) this.state.reputation = clamp(this.state.reputation - 1, 0, 100);
    }

    this.evaluateQuests();
    if (this.settings.autoSaveEnabled) {
      this.autoSave();
    }
  }

  private updateElevator(dt: number) {
    const el = this.state.elevator;
    const speedFloorsPerSec = 1.4 + (this.state.upgrades.ELEVATOR_TECH - 1) * 0.45 + (this.state.facilities.ELEVATOR.level || 0) * 0.3;

    if (Math.abs(el.currentFloor - el.targetFloor) > 0.03) {
      const dir = el.targetFloor > el.currentFloor ? 1 : -1;
      el.currentFloor += dir * speedFloorsPerSec * dt;
      if ((dir === 1 && el.currentFloor >= el.targetFloor) || (dir === -1 && el.currentFloor <= el.targetFloor)) {
        el.currentFloor = el.targetFloor;
      }
    } else {
      el.currentFloor = el.targetFloor;
      const curFloorInt = Math.round(el.currentFloor);

      // Drop off passengers on this floor
      for (let i = el.passengerIds.length - 1; i >= 0; i--) {
        const tid = el.passengerIds[i];
        const t = this.state.tenants.find((x) => x.id === tid);
        if (!t || t.targetFloor === curFloorInt) {
          if (t) {
            t.insideElevator = false;
            t.currentFloor = curFloorInt;
            t.y = curFloorInt;
            t.activity = 'WALKING';
          }
          el.passengerIds.splice(i, 1);
        }
      }

      // Pick up waiting passengers on this floor
      for (let i = el.queue.length - 1; i >= 0; i--) {
        const req = el.queue[i];
        if (req.fromFloor === curFloorInt && el.passengerIds.length < 4) {
          const t = this.state.tenants.find((x) => x.id === req.tenantId);
          if (t) {
            t.waitingElevator = false;
            t.insideElevator = true;
            t.activity = 'RIDING_ELEVATOR';
            el.passengerIds.push(t.id);
          }
          el.queue.splice(i, 1);
        }
      }

      // Pick next target floor
      if (el.passengerIds.length > 0) {
        const firstPax = this.state.tenants.find((x) => x.id === el.passengerIds[0]);
        if (firstPax) el.targetFloor = firstPax.targetFloor;
      } else if (el.queue.length > 0) {
        el.targetFloor = el.queue[0].fromFloor;
      }
    }

    // Sync passenger Y with elevator cab
    for (const pid of el.passengerIds) {
      const t = this.state.tenants.find((x) => x.id === pid);
      if (t) {
        t.y = el.currentFloor;
        t.x = -0.35; // Elevator shaft position on left side
      }
    }
  }

  private updateTenantsAI(dt: number) {
    const maxSlots = this.getMaxSlots();
    const hasElevator = this.state.facilities.ELEVATOR.built;
    const hour = this.state.hour;

    for (const t of this.state.tenants) {
      if (t.bubbleTimer > 0) {
        t.bubbleTimer -= dt;
        if (t.bubbleTimer <= 0) t.bubbleIcon = null;
      }

      if (t.insideElevator) continue;

      if (t.waitingElevator) {
        // Walk to shaft x = -0.35 and wait
        const dx = -0.35 - t.x;
        if (Math.abs(dx) > 0.05) {
          t.facing = dx > 0 ? 1 : -1;
          t.x += t.facing * 0.9 * dt;
          t.walkPhase += dt * 8;
        }
        continue;
      }

      // Change floor if needed
      if (t.currentFloor !== t.targetFloor) {
        if (hasElevator) {
          const alreadyQueued = this.state.elevator.queue.some((q) => q.tenantId === t.id);
          if (!alreadyQueued) {
            this.state.elevator.queue.push({
              tenantId: t.id,
              fromFloor: t.currentFloor,
              toFloor: t.targetFloor,
            });
          }
          t.waitingElevator = true;
        } else {
          // Walk stairs on left side
          const dx = -0.35 - t.x;
          if (Math.abs(dx) > 0.08) {
            t.facing = dx > 0 ? 1 : -1;
            t.x += t.facing * 0.9 * dt;
            t.walkPhase += dt * 8;
          } else {
            const dir = t.targetFloor > t.currentFloor ? 1 : -1;
            t.y += dir * 0.75 * dt;
            if ((dir === 1 && t.y >= t.targetFloor) || (dir === -1 && t.y <= t.targetFloor)) {
              t.y = t.targetFloor;
              t.currentFloor = t.targetFloor;
            }
          }
        }
        continue;
      }

      // Walk horizontally toward targetX
      const dx = t.targetX - t.x;
      if (Math.abs(dx) > 0.06) {
        t.activity = 'WALKING';
        t.facing = dx > 0 ? 1 : -1;
        t.x += t.facing * 0.85 * dt;
        t.walkPhase += dt * 8;
        continue;
      }

      // Arrived at target spot — perform activity
      t.activityTimer -= dt;
      if (t.activityTimer > 0) continue;

      // Choose next schedule goal
      const homeRoom = this.state.rooms.find((r) => r.id === t.roomId);
      const homeCenter = homeRoom ? homeRoom.slotStart + homeRoom.slotSpan * 0.5 : 1;

      if (hour >= 22 || hour < 6) {
        // Sleep in apartment
        if (homeRoom) {
          t.targetFloor = homeRoom.floor;
          t.targetX = homeCenter + (Math.random() - 0.5) * 0.3;
          t.activity = 'RESTING';
          t.bubbleIcon = 'zzz';
          t.bubbleTimer = 4;
          t.activityTimer = 5 + Math.random() * 5;
        }
      } else if (hour >= 9 && hour < 17 && (t.archetype === 'OFFICE_WORKER' || t.archetype === 'STUDENT')) {
        // Go out to work/campus or work at desk
        if (Math.random() < 0.55) {
          t.targetFloor = 0;
          t.targetX = Math.random() < 0.5 ? -0.8 : maxSlots + 0.4;
          t.activity = 'OUTSIDE';
          t.bubbleIcon = 'coffee';
          t.bubbleTimer = 3;
          t.activityTimer = 7 + Math.random() * 6;
        } else if (homeRoom) {
          t.targetFloor = homeRoom.floor;
          t.targetX = homeCenter;
          t.activity = 'WORKING';
          t.activityTimer = 5 + Math.random() * 4;
        }
      } else {
        // Visit built facility or stroll lobby/room
        const builtFacs = Object.values(this.state.facilities).filter((f) => f.built && f.type !== 'ELEVATOR');
        if (builtFacs.length > 0 && Math.random() < 0.48) {
          const fac = pick(builtFacs);
          t.targetFloor = fac.floor === 99 ? this.state.totalFloors : fac.floor;
          t.targetX = clamp(fac.slot + 0.4, 0.2, maxSlots - 0.2);
          t.activity = 'VISITING_FACILITY';
          t.bubbleIcon = fac.type === 'CAFE' ? 'coffee' : fac.type === 'GYM' ? 'music' : 'chat';
          t.bubbleTimer = 3.5;
          t.activityTimer = 4 + Math.random() * 4;
        } else if (homeRoom) {
          t.targetFloor = homeRoom.floor;
          t.targetX = clamp(homeRoom.slotStart + 0.2 + Math.random() * (homeRoom.slotSpan - 0.4), 0.2, maxSlots - 0.2);
          t.activity = 'IDLE';
          t.activityTimer = 4 + Math.random() * 4;
        }
      }
    }
  }

  private updateStaffAI(dt: number) {
    const maxSlots = this.getMaxSlots();
    for (const staff of this.state.staff) {
      if (staff.resting) {
        staff.fatigue = clamp(staff.fatigue - dt * 6, 0, 100);
        if (staff.fatigue <= 10) staff.resting = false;
        continue;
      }

      staff.fatigue = clamp(staff.fatigue + dt * 0.6, 0, 100);
      if (staff.fatigue >= 92) {
        staff.resting = true;
        staff.targetFloor = 0;
        staff.targetX = 1;
        continue;
      }

      // Move toward target
      if (staff.currentFloor !== staff.targetFloor) {
        const dx = -0.35 - staff.x;
        if (Math.abs(dx) > 0.08) {
          staff.facing = dx > 0 ? 1 : -1;
          staff.x += staff.facing * 1.1 * dt;
          staff.walkPhase += dt * 9;
        } else {
          staff.currentFloor = staff.targetFloor;
        }
        continue;
      }

      const dx = staff.targetX - staff.x;
      if (Math.abs(dx) > 0.08) {
        staff.facing = dx > 0 ? 1 : -1;
        staff.x += staff.facing * 1.1 * dt;
        staff.walkPhase += dt * 9;
        continue;
      }

      // Perform role action
      const eff = (0.7 + staff.skillLevel * 0.15) * (staff.productivity / 100);
      if (staff.role === 'CLEANER') {
        const dirtyRoom = [...this.state.rooms].sort((a, b) => a.cleanliness - b.cleanliness)[0];
        if (dirtyRoom && dirtyRoom.cleanliness < 90) {
          if (dirtyRoom.floor === staff.currentFloor && Math.abs(dirtyRoom.slotStart + 0.5 - staff.x) < 0.8) {
            dirtyRoom.cleanliness = clamp(dirtyRoom.cleanliness + 18 * eff * dt, 0, 100);
          } else {
            staff.targetFloor = dirtyRoom.floor;
            staff.targetX = dirtyRoom.slotStart + 0.5;
          }
        } else {
          staff.targetFloor = 0;
          staff.targetX = Math.random() * maxSlots;
        }
      } else if (staff.role === 'TECHNICIAN') {
        const wornRoom = [...this.state.rooms].sort((a, b) => a.condition - b.condition)[0];
        if (wornRoom && wornRoom.condition < 92) {
          if (wornRoom.floor === staff.currentFloor && Math.abs(wornRoom.slotStart + 0.5 - staff.x) < 0.8) {
            wornRoom.condition = clamp(wornRoom.condition + 15 * eff * dt, 0, 100);
            wornRoom.furniture.forEach((f) => {
              f.condition = clamp(f.condition + 12 * eff * dt, 0, 100);
            });
          } else {
            staff.targetFloor = wornRoom.floor;
            staff.targetX = wornRoom.slotStart + 0.5;
          }
        } else {
          staff.targetFloor = 0;
          staff.targetX = 0.5;
        }
      } else if (staff.role === 'SECURITY') {
        if (Math.random() < 0.02) {
          staff.targetFloor = Math.floor(Math.random() * (this.state.totalFloors + 1));
          staff.targetX = 0.3 + Math.random() * (maxSlots - 0.6);
        }
      } else {
        staff.targetFloor = 0;
        staff.targetX = 1.2;
      }
    }
  }

  // Economy & XP helpers
  public addMoney(amount: number, type: 'INCOME' | 'EXPENSE', category: TransactionCategory, description: string) {
    const absAmt = Math.abs(Math.round(amount));
    if (absAmt === 0) return;

    this.state.money += type === 'INCOME' ? absAmt : -absAmt;
    if (type === 'INCOME') {
      this.state.totalEarned += absAmt;
      this.state.dailyIncome += absAmt;
      this.state.monthlyIncome += absAmt;
    } else {
      this.state.dailyExpense += absAmt;
      this.state.monthlyExpense += absAmt;
    }

    this.state.transactions.unshift({
      id: uid('tx'),
      day: this.state.day,
      hour: this.state.hour,
      type,
      category,
      description,
      amount: absAmt,
    });
    if (this.state.transactions.length > 80) {
      this.state.transactions.length = 80;
    }
  }

  public gainXp(amount: number) {
    this.state.xp += amount;
    while (this.state.xp >= this.state.xpToNext) {
      this.state.xp -= this.state.xpToNext;
      this.state.level += 1;
      this.state.xpToNext = Math.round(this.state.xpToNext * 1.38);
      this.state.reputation = clamp(this.state.reputation + 4, 0, 100);
      soundFX.levelUp();
      this.spawnFloatingText(1.5, this.state.totalFloors, `LEVEL ${this.state.level}!`, '#F59E0B');
    }
  }

  public spawnFloatingText(x: number, floor: number, text: string, color: string) {
    this.floatingTexts.push({
      id: uid('ft'),
      x,
      floor,
      text,
      color,
      life: 1.8,
      maxLife: 1.8,
    });
  }

  // Building & Room Actions
  public canAfford(cost: number): boolean {
    return this.state.money >= cost;
  }

  public getFloorBuildCost(): number {
    return 3500 + this.state.totalFloors * 1800;
  }

  public buildNewFloor(): { ok: boolean; message: string } {
    if (this.state.totalFloors >= 8) {
      return { ok: false, message: 'Maximum 8 floors reached.' };
    }
    const cost = this.getFloorBuildCost();
    if (!this.canAfford(cost)) {
      soundFX.error();
      return { ok: false, message: `Need $${cost.toLocaleString()} to build Floor ${this.state.totalFloors + 1}.` };
    }
    this.addMoney(-cost, 'EXPENSE', 'CONSTRUCTION', `Built Floor ${this.state.totalFloors + 1}`);
    this.state.totalFloors += 1;
    this.gainXp(90);
    this.evaluateQuests();
    soundFX.build();
    this.spawnFloatingText(1.5, this.state.totalFloors, `Floor ${this.state.totalFloors} Built!`, '#F59E0B');
    this.onStateChange();
    return { ok: true, message: `Floor ${this.state.totalFloors} constructed!` };
  }

  public getLandExpansionCost(): number {
    return this.state.landPlots === 1 ? 12000 : 28000;
  }

  public buyLandExpansion(): { ok: boolean; message: string } {
    if (this.state.landPlots >= 3) {
      return { ok: false, message: 'Maximum land expansion reached.' };
    }
    const cost = this.getLandExpansionCost();
    if (!this.canAfford(cost)) {
      soundFX.error();
      return { ok: false, message: `Need $${cost.toLocaleString()} to expand land.` };
    }
    this.addMoney(-cost, 'EXPENSE', 'CONSTRUCTION', 'Expanded building land plot');
    this.state.landPlots += 1;
    this.state.reputation = clamp(this.state.reputation + 6, 0, 100);
    this.unlockAchievement('ach_expansion');
    this.gainXp(160);
    soundFX.build();
    this.onStateChange();
    return { ok: true, message: 'Land expanded! All floors now have 2 extra room slots.' };
  }

  public findAvailableSlot(floor: number, span: number): number | null {
    const maxSlots = this.getMaxSlots();
    const occupied = new Set<number>();
    for (const r of this.state.rooms) {
      if (r.floor === floor) {
        for (let s = r.slotStart; s < r.slotStart + r.slotSpan; s++) {
          occupied.add(s);
        }
      }
    }
    // Check indoor facilities occupying floor 1 slots
    for (const fac of Object.values(this.state.facilities)) {
      if (fac.built && fac.floor === floor && fac.slot >= 0) {
        occupied.add(fac.slot);
      }
    }

    for (let start = 0; start <= maxSlots - span; start++) {
      let free = true;
      for (let s = start; s < start + span; s++) {
        if (occupied.has(s)) {
          free = false;
          break;
        }
      }
      if (free) return start;
    }
    return null;
  }

  public buildRoom(floor: number, type: RoomType, preferredSlot?: number): { ok: boolean; message: string; room?: Room } {
    const spec = ROOM_SPECS[type];
    if (this.state.level < spec.unlockLevel) {
      return { ok: false, message: `Unlocks at Level ${spec.unlockLevel}.` };
    }
    if (spec.minFloor && floor < spec.minFloor) {
      return { ok: false, message: `${spec.label} must be built on Floor ${spec.minFloor} or higher.` };
    }
    if (!this.canAfford(spec.buildCost)) {
      soundFX.error();
      return { ok: false, message: `Need $${spec.buildCost.toLocaleString()}.` };
    }

    const slot = preferredSlot !== undefined ? preferredSlot : this.findAvailableSlot(floor, spec.slotSpan);
    if (slot === null) {
      return { ok: false, message: `No ${spec.slotSpan}-slot space available on Floor ${floor}.` };
    }

    // Verify preferred slot is free
    const maxSlots = this.getMaxSlots();
    if (slot < 0 || slot + spec.slotSpan > maxSlots) {
      return { ok: false, message: 'Slot out of building bounds.' };
    }
    for (const r of this.state.rooms) {
      if (r.floor === floor && !(slot + spec.slotSpan <= r.slotStart || slot >= r.slotStart + r.slotSpan)) {
        return { ok: false, message: 'Space already occupied.' };
      }
    }

    const roomNum = `${floor}0${slot + 1}`;
    const newRoom: Room = {
      id: uid('rm'),
      floor,
      slotStart: slot,
      slotSpan: spec.slotSpan,
      number: roomNum,
      type,
      theme: 'COZY_CREAM',
      cleanliness: 100,
      condition: 100,
      capacity: spec.capacity,
      rentPrice: spec.baseRent,
      deposit: spec.baseRent,
      comfort: 45,
      furniture: [{ id: uid('fr'), type: 'BED', level: 1, condition: 100 }],
      tenantIds: [],
      lightOn: false,
    };
    newRoom.comfort = computeRoomComfort(newRoom, this.state.upgrades);

    this.addMoney(-spec.buildCost, 'EXPENSE', 'CONSTRUCTION', `Built ${spec.label} (Rm ${roomNum})`);
    this.state.rooms.push(newRoom);
    if (type === 'PENTHOUSE') this.unlockAchievement('ach_penthouse');
    this.gainXp(60 + spec.slotSpan * 25);
    this.evaluateQuests();
    soundFX.build();
    this.spawnFloatingText(slot + spec.slotSpan * 0.5, floor, `Built Rm ${roomNum}`, '#F59E0B');
    this.onStateChange();
    return { ok: true, message: `Room ${roomNum} (${spec.label}) ready!`, room: newRoom };
  }

  public buyFurniture(roomId: string, type: FurnitureType): { ok: boolean; message: string } {
    const room = this.state.rooms.find((r) => r.id === roomId);
    if (!room) return { ok: false, message: 'Room not found.' };
    const spec = FURNITURE_SPECS[type];
    if (this.state.level < spec.unlockLevel) {
      return { ok: false, message: `Unlocks at Level ${spec.unlockLevel}.` };
    }

    const existing = room.furniture.find((f) => f.type === type);
    const cost = existing ? Math.round(spec.cost * (0.8 + existing.level * 0.5)) : spec.cost;
    if (!this.canAfford(cost)) {
      soundFX.error();
      return { ok: false, message: `Need $${cost.toLocaleString()}.` };
    }

    if (existing) {
      if (existing.level >= 3) return { ok: false, message: `${spec.label} is already max Level 3.` };
      existing.level += 1;
      existing.condition = 100;
    } else {
      room.furniture.push({ id: uid('fr'), type, level: 1, condition: 100 });
    }

    room.rentPrice += Math.round(spec.rentBonus * 0.7);
    room.comfort = computeRoomComfort(room, this.state.upgrades);
    this.addMoney(-cost, 'EXPENSE', 'FURNITURE', `${existing ? 'Upgraded' : 'Bought'} ${spec.label} for Rm ${room.number}`);
    this.gainXp(25);
    soundFX.build();
    this.onStateChange();
    return { ok: true, message: `${spec.label} installed in Room ${room.number}!` };
  }

  public changeRoomTheme(roomId: string, theme: InteriorTheme): { ok: boolean; message: string } {
    const room = this.state.rooms.find((r) => r.id === roomId);
    if (!room) return { ok: false, message: 'Room not found.' };
    const spec = INTERIOR_THEMES[theme];
    if (this.state.level < spec.unlockLevel) {
      return { ok: false, message: `Unlocks at Level ${spec.unlockLevel}.` };
    }
    if (room.theme === theme) return { ok: false, message: 'Already applied.' };
    if (!this.canAfford(spec.cost)) {
      soundFX.error();
      return { ok: false, message: `Need $${spec.cost}.` };
    }

    this.addMoney(-spec.cost, 'EXPENSE', 'RENOVATION', `Interior ${spec.label} in Rm ${room.number}`);
    room.theme = theme;
    room.comfort = computeRoomComfort(room, this.state.upgrades);
    this.gainXp(30);
    soundFX.build();
    this.onStateChange();
    return { ok: true, message: `Room ${room.number} restyled to ${spec.label}!` };
  }

  public cleanAndRepairRoom(roomId: string): { ok: boolean; message: string } {
    const room = this.state.rooms.find((r) => r.id === roomId);
    if (!room) return { ok: false, message: 'Room not found.' };
    const cost = 75;
    if (!this.canAfford(cost)) {
      soundFX.error();
      return { ok: false, message: `Need $${cost}.` };
    }
    this.addMoney(-cost, 'EXPENSE', 'MAINTENANCE', `Deep clean & repair Rm ${room.number}`);
    room.cleanliness = 100;
    room.condition = 100;
    room.furniture.forEach((f) => {
      f.condition = 100;
    });
    room.comfort = computeRoomComfort(room, this.state.upgrades);
    soundFX.repair();
    this.spawnFloatingText(room.slotStart + 0.5, room.floor, 'Spotless!', '#38BDF8');
    this.onStateChange();
    return { ok: true, message: `Room ${room.number} cleaned & repaired.` };
  }

  public setRoomPricing(roomId: string, rentPrice: number, deposit: number) {
    const room = this.state.rooms.find((r) => r.id === roomId);
    if (!room) return;
    room.rentPrice = clamp(Math.round(rentPrice), 100, 10000);
    room.deposit = clamp(Math.round(deposit), 0, 10000);
    soundFX.click();
    this.onStateChange();
  }

  // Tenant Leasing & Management
  public assignTenantToRoom(tenantId: string, roomId: string): { ok: boolean; message: string } {
    const room = this.state.rooms.find((r) => r.id === roomId);
    if (!room) return { ok: false, message: 'Room not found.' };
    if (room.tenantIds.length >= room.capacity) {
      return { ok: false, message: 'Room is already at full capacity.' };
    }

    const appIdx = this.state.applicants.findIndex((a) => a.id === tenantId);
    if (appIdx === -1) return { ok: false, message: 'Applicant not found.' };
    const applicant = this.state.applicants[appIdx];

    if (room.rentPrice > applicant.budget * 1.25) {
      soundFX.error();
      return {
        ok: false,
        message: `${applicant.name}'s max budget is $${applicant.budget}/mo (Room rent: $${room.rentPrice}). Lower rent or pick another unit.`,
      };
    }

    this.state.applicants.splice(appIdx, 1);
    applicant.roomId = room.id;
    applicant.currentFloor = 0;
    applicant.y = 0;
    applicant.x = 1;
    applicant.targetFloor = room.floor;
    applicant.targetX = room.slotStart + room.slotSpan * 0.5;
    applicant.contractDaysLeft = 30;
    room.tenantIds.push(applicant.id);
    this.state.tenants.push(applicant);

    // Initialize relationships with existing tenants
    for (const other of this.state.tenants) {
      if (other.id !== applicant.id) {
        this.state.relationships.push({
          id: uid('rel'),
          tenantA: applicant.id,
          tenantB: other.id,
          score: Math.floor(Math.random() * 15),
          romantic: false,
          label: 'Stranger',
          history: [`Moved into ${this.state.apartmentName} on Day ${this.state.day}`],
        });
      }
    }

    this.addMoney(room.deposit, 'INCOME', 'RENT', `Security deposit from ${applicant.name} (Rm ${room.number})`);
    this.state.applicants.push(generateTenantCandidate(this.state.level));
    this.unlockAchievement('ach_first_rent');
    this.gainXp(55);
    this.evaluateQuests();
    soundFX.coin();
    this.spawnFloatingText(room.slotStart + 0.5, room.floor, `+$${room.deposit} Lease!`, '#10B981');
    this.onStateChange();
    return { ok: true, message: `${applicant.name} moved into Room ${room.number}!` };
  }

  public evictTenant(tenantId: string, manual = true) {
    const idx = this.state.tenants.findIndex((t) => t.id === tenantId);
    if (idx === -1) return;
    const tenant = this.state.tenants[idx];
    const room = this.state.rooms.find((r) => r.id === tenant.roomId);
    if (room) {
      room.tenantIds = room.tenantIds.filter((id) => id !== tenantId);
    }
    this.state.tenants.splice(idx, 1);
    this.state.relationships = this.state.relationships.filter((r) => r.tenantA !== tenantId && r.tenantB !== tenantId);
    if (manual) {
      this.state.reputation = clamp(this.state.reputation - 2, 0, 100);
      soundFX.click();
    }
    this.evaluateQuests();
    this.onStateChange();
  }

  public refreshApplicants() {
    this.state.applicants = Array.from({ length: 4 }, () => generateTenantCandidate(this.state.level));
    soundFX.click();
    this.onStateChange();
  }

  // Facilities, Staff & Upgrades
  public buildOrUpgradeFacility(type: FacilityType): { ok: boolean; message: string } {
    const fac = this.state.facilities[type];
    const spec = FACILITY_SPECS[type];
    if (this.state.level < spec.unlockLevel) {
      return { ok: false, message: `Unlocks at Level ${spec.unlockLevel}.` };
    }
    if (fac.level >= 3) {
      return { ok: false, message: `${spec.label} is already max Level 3.` };
    }
    const cost = fac.built ? Math.round(Math.max(800, spec.cost) * (0.7 + fac.level * 0.5)) : spec.cost;
    if (!this.canAfford(cost)) {
      soundFX.error();
      return { ok: false, message: `Need $${cost.toLocaleString()}.` };
    }

    this.addMoney(-cost, 'EXPENSE', 'CONSTRUCTION', `${fac.built ? 'Upgraded' : 'Built'} ${spec.label}`);
    fac.built = true;
    fac.level += 1;
    this.state.reputation = clamp(this.state.reputation + spec.reputationBonus, 0, 100);
    this.gainXp(85);
    this.evaluateQuests();
    soundFX.build();
    this.onStateChange();
    return { ok: true, message: `${spec.label} is now Level ${fac.level}!` };
  }

  public hireStaff(role: StaffRole): { ok: boolean; message: string } {
    const spec = STAFF_SPECS[role];
    if (this.state.level < spec.unlockLevel) {
      return { ok: false, message: `Unlocks at Level ${spec.unlockLevel}.` };
    }
    if (!this.canAfford(spec.hireCost)) {
      soundFX.error();
      return { ok: false, message: `Need $${spec.hireCost} signing fee.` };
    }
    const newStaff: StaffMember = {
      id: uid('stf'),
      name: `${pick(TENANT_FIRST_NAMES)} ${pick(TENANT_LAST_NAMES)}`,
      role,
      dailySalary: spec.dailySalary,
      skillLevel: 1,
      productivity: 88,
      fatigue: 10,
      xp: 0,
      x: 1,
      currentFloor: 0,
      targetX: 1.5,
      targetFloor: 0,
      facing: 1,
      walkPhase: 0,
      resting: false,
    };
    this.addMoney(-spec.hireCost, 'EXPENSE', 'PAYROLL', `Hired ${spec.label}: ${newStaff.name}`);
    this.state.staff.push(newStaff);
    this.gainXp(40);
    this.evaluateQuests();
    soundFX.coin();
    this.onStateChange();
    return { ok: true, message: `Hired ${newStaff.name} as ${spec.label}!` };
  }

  public trainStaff(staffId: string): { ok: boolean; message: string } {
    const st = this.state.staff.find((s) => s.id === staffId);
    if (!st) return { ok: false, message: 'Staff not found.' };
    if (st.skillLevel >= 5) return { ok: false, message: 'Max skill level 5 reached.' };
    const cost = st.skillLevel * 350;
    if (!this.canAfford(cost)) {
      soundFX.error();
      return { ok: false, message: `Need $${cost} for training.` };
    }
    this.addMoney(-cost, 'EXPENSE', 'PAYROLL', `Trained ${st.name} to Lv ${st.skillLevel + 1}`);
    st.skillLevel += 1;
    st.productivity = Math.min(100, st.productivity + 8);
    soundFX.levelUp();
    this.onStateChange();
    return { ok: true, message: `${st.name} promoted to Skill Lv.${st.skillLevel}!` };
  }

  public fireStaff(staffId: string) {
    this.state.staff = this.state.staff.filter((s) => s.id !== staffId);
    soundFX.click();
    this.onStateChange();
  }

  public upgradeBuilding(key: UpgradeKey): { ok: boolean; message: string } {
    const current = this.state.upgrades[key];
    if (current >= 5) return { ok: false, message: 'Max Level 5 reached.' };
    const spec = UPGRADE_SPECS.find((u) => u.key === key)!;
    const cost = Math.round(spec.baseCost * Math.pow(1.45, current - 1));
    if (!this.canAfford(cost)) {
      soundFX.error();
      return { ok: false, message: `Need $${cost.toLocaleString()}.` };
    }
    this.addMoney(-cost, 'EXPENSE', 'RENOVATION', `Building upgrade: ${spec.label} Lv.${current + 1}`);
    this.state.upgrades[key] = current + 1;
    this.state.reputation = clamp(this.state.reputation + 3, 0, 100);
    this.state.rooms.forEach((r) => {
      r.comfort = computeRoomComfort(r, this.state.upgrades);
    });
    this.gainXp(65);
    soundFX.build();
    this.onStateChange();
    return { ok: true, message: `${spec.label} upgraded to Level ${current + 1}!` };
  }

  // Finance: Vending, Loans & Investments
  public buyVendingMachine(): { ok: boolean; message: string } {
    const cost = 950;
    if (!this.canAfford(cost)) {
      soundFX.error();
      return { ok: false, message: `Need $${cost}.` };
    }
    this.addMoney(-cost, 'EXPENSE', 'FURNITURE', 'Installed Vending Machine');
    this.state.vendingMachines += 1;
    soundFX.build();
    this.onStateChange();
    return { ok: true, message: 'Vending machine installed!' };
  }

  public takeLoan(amount: number, name: string): { ok: boolean; message: string } {
    if (this.state.loans.length >= 2) {
      return { ok: false, message: 'Maximum 2 active loans allowed.' };
    }
    const newLoan: Loan = {
      id: uid('ln'),
      name,
      principal: amount,
      remaining: amount,
      dailyInterestRate: 0.015,
      dailyPayment: Math.round(amount / 12),
    };
    this.state.loans.push(newLoan);
    this.addMoney(amount, 'INCOME', 'LOAN', `Loan disbursed: ${name}`);
    soundFX.coin();
    this.onStateChange();
    return { ok: true, message: `Received $${amount.toLocaleString()} loan.` };
  }

  public repayLoanEarly(loanId: string): { ok: boolean; message: string } {
    const idx = this.state.loans.findIndex((l) => l.id === loanId);
    if (idx === -1) return { ok: false, message: 'Loan not found.' };
    const loan = this.state.loans[idx];
    if (!this.canAfford(loan.remaining)) {
      soundFX.error();
      return { ok: false, message: `Need $${loan.remaining.toLocaleString()} to pay off.` };
    }
    this.addMoney(-loan.remaining, 'EXPENSE', 'LOAN', `Paid off loan: ${loan.name}`);
    this.state.loans.splice(idx, 1);
    soundFX.coin();
    this.onStateChange();
    return { ok: true, message: 'Loan fully repaid!' };
  }

  public buyInvestment(investmentId: string): { ok: boolean; message: string } {
    const inv = this.state.investments.find((i) => i.id === investmentId);
    if (!inv || inv.owned) return { ok: false, message: 'Unavailable.' };
    if (!this.canAfford(inv.cost)) {
      soundFX.error();
      return { ok: false, message: `Need $${inv.cost.toLocaleString()}.` };
    }
    this.addMoney(-inv.cost, 'EXPENSE', 'INVESTMENT', `Purchased investment: ${inv.name}`);
    inv.owned = true;
    this.gainXp(80);
    soundFX.coin();
    this.onStateChange();
    return { ok: true, message: `Acquired ${inv.name} (+$${inv.dailyReturn}/day)!` };
  }

  // Drama & Event Engine
  public triggerRandomDramaEvent() {
    if (this.state.tenants.length === 0 || this.state.activeEvent) return;
    const pool = DRAMA_TEMPLATES.filter((t) => !t.requiresTwoTenants || this.state.tenants.length >= 2);
    if (pool.length === 0) return;

    const tmpl = pick(pool);
    const shuffled = [...this.state.tenants].sort(() => Math.random() - 0.5);
    const primary = shuffled[0];
    const secondary = tmpl.requiresTwoTenants ? shuffled[1] : undefined;

    const event: DramaEvent = {
      id: uid('evt'),
      category: tmpl.category,
      title: tmpl.title,
      dialogue: tmpl.buildDialogue(primary.name, secondary?.name),
      primaryTenantId: primary.id,
      secondaryTenantId: secondary?.id,
      triggeredDay: this.state.day,
      choices: tmpl.choices.map((c, idx) => ({
        id: `ch_${idx}`,
        label: c.label,
        hint: c.hint,
        consequence: {
          moneyDelta: c.moneyDelta,
          reputationDelta: c.reputationDelta,
          xpDelta: c.xpDelta,
          satisfactionDelta: c.satisfactionDelta,
          relationshipDelta: c.relationshipDelta,
          makeRomantic: c.makeRomantic,
          cleanlinessDelta: c.cleanlinessDelta,
          conditionDelta: c.conditionDelta,
          resultText: c.resultText,
        },
      })),
    };

    this.state.activeEvent = event;
    soundFX.alert();
    this.onStateChange();
  }

  public resolveActiveEvent(choiceId: string): string {
    const ev = this.state.activeEvent;
    if (!ev) return '';
    const choice = ev.choices.find((c) => c.id === choiceId);
    if (!choice) return '';
    const cs = choice.consequence;

    if (cs.moneyDelta) {
      this.addMoney(
        cs.moneyDelta,
        cs.moneyDelta >= 0 ? 'INCOME' : 'EXPENSE',
        cs.moneyDelta >= 0 ? 'RENT' : 'EMERGENCY',
        `Event (${ev.title}): ${choice.label}`
      );
    }
    if (cs.reputationDelta) {
      this.state.reputation = clamp(this.state.reputation + cs.reputationDelta, 0, 100);
    }
    if (cs.xpDelta) {
      this.gainXp(cs.xpDelta);
    }

    const pTenant = this.state.tenants.find((t) => t.id === ev.primaryTenantId);
    const sTenant = ev.secondaryTenantId ? this.state.tenants.find((t) => t.id === ev.secondaryTenantId) : undefined;

    if (cs.satisfactionDelta) {
      if (pTenant) pTenant.satisfaction = clamp(pTenant.satisfaction + cs.satisfactionDelta, 5, 100);
      if (sTenant) sTenant.satisfaction = clamp(sTenant.satisfaction + cs.satisfactionDelta, 5, 100);
    }

    if (pTenant && sTenant && (cs.relationshipDelta || cs.makeRomantic)) {
      let rel = this.state.relationships.find(
        (r) =>
          (r.tenantA === pTenant.id && r.tenantB === sTenant.id) ||
          (r.tenantA === sTenant.id && r.tenantB === pTenant.id)
      );
      if (!rel) {
        rel = {
          id: uid('rel'),
          tenantA: pTenant.id,
          tenantB: sTenant.id,
          score: 0,
          romantic: false,
          label: 'Stranger',
          history: [],
        };
        this.state.relationships.push(rel);
      }
      rel.score = clamp(rel.score + (cs.relationshipDelta ?? 0), -100, 100);
      if (cs.makeRomantic) {
        rel.romantic = true;
        this.unlockAchievement('ach_romance');
      }
      rel.label = getRelationLabel(rel.score, rel.romantic);
      rel.history.unshift(`Day ${this.state.day}: ${ev.title} (${choice.label})`);
      if (rel.history.length > 6) rel.history.length = 6;
    }

    if (pTenant?.roomId && (cs.cleanlinessDelta || cs.conditionDelta)) {
      const rm = this.state.rooms.find((r) => r.id === pTenant.roomId);
      if (rm) {
        if (cs.cleanlinessDelta) rm.cleanliness = clamp(rm.cleanliness + cs.cleanlinessDelta, 0, 100);
        if (cs.conditionDelta) rm.condition = clamp(rm.condition + cs.conditionDelta, 0, 100);
        rm.comfort = computeRoomComfort(rm, this.state.upgrades);
      }
    }

    this.state.conflictsResolved += 1;
    if (this.state.conflictsResolved >= 5) {
      this.unlockAchievement('ach_peacemaker');
    }

    this.state.eventHistory.unshift({
      day: this.state.day,
      title: ev.title,
      outcome: cs.resultText,
    });
    if (this.state.eventHistory.length > 25) this.state.eventHistory.length = 25;

    this.state.activeEvent = null;
    this.evaluateQuests();
    soundFX.click();
    this.onStateChange();
    return cs.resultText;
  }

  // Quests & Achievements
  public evaluateQuests() {
    const rentedCount = this.state.rooms.filter((r) => r.tenantIds.length > 0).length;
    const avgSat =
      this.state.tenants.length > 0
        ? Math.round(this.state.tenants.reduce((a, b) => a + b.satisfaction, 0) / this.state.tenants.length)
        : 0;

    for (const q of this.state.quests) {
      if (q.claimed) continue;
      switch (q.targetType) {
        case 'RENTED_ROOMS':
          q.progress = rentedCount;
          break;
        case 'TOTAL_TENANTS':
          q.progress = this.state.tenants.length;
          break;
        case 'LOBBY_LEVEL':
          q.progress = this.state.facilities.LOBBY.level;
          break;
        case 'FACILITY_BUILT':
          q.progress = q.targetFacility && this.state.facilities[q.targetFacility].built ? 1 : 0;
          break;
        case 'MONEY_EARNED':
          q.progress = this.state.totalEarned;
          break;
        case 'AVG_SATISFACTION':
          q.progress = avgSat;
          break;
        case 'CONFLICTS_RESOLVED':
          q.progress = this.state.conflictsResolved;
          break;
        case 'FLOORS_BUILT':
          q.progress = this.state.totalFloors;
          break;
        case 'STAFF_HIRED':
          q.progress = this.state.staff.length;
          break;
      }
      if (q.progress >= q.targetValue) {
        q.completed = true;
      }
    }
  }

  public claimQuest(questId: string): { ok: boolean; message: string } {
    const q = this.state.quests.find((x) => x.id === questId);
    if (!q || !q.completed || q.claimed) return { ok: false, message: 'Quest not ready.' };
    q.claimed = true;
    this.addMoney(q.rewardMoney, 'INCOME', 'QUEST', `Quest reward: ${q.title}`);
    this.gainXp(q.rewardXp);
    soundFX.levelUp();
    this.onStateChange();
    return { ok: true, message: `Claimed +$${q.rewardMoney} & +${q.rewardXp} XP!` };
  }

  private unlockAchievement(id: string) {
    const ach = this.state.achievements.find((a) => a.id === id);
    if (ach && !ach.unlocked) {
      ach.unlocked = true;
      this.gainXp(ach.rewardXp);
    }
  }

  // Controls & Settings
  public setSpeed(speed: GameSpeed) {
    this.state.speed = speed;
    soundFX.click();
    this.onStateChange();
  }

  public updateSettings(patch: Partial<GameSettings>) {
    this.settings = { ...this.settings, ...patch };
    soundFX.muted = this.settings.muted;
    soundFX.volume = this.settings.sfxVolume;
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
    } catch {
      // ignore storage quota
    }
    this.onStateChange();
  }

  private loadSettings(): GameSettings {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) {
        return {
          muted: false,
          sfxVolume: 0.45,
          weatherEnabled: true,
          autoSaveEnabled: true,
          showBubbles: true,
          dayCycleSpeed: 1,
          ...JSON.parse(raw),
        };
      }
    } catch {
      // ignore
    }
    return {
      muted: false,
      sfxVolume: 0.45,
      weatherEnabled: true,
      autoSaveEnabled: true,
      showBubbles: true,
      dayCycleSpeed: 1,
    };
  }

  // Save System (JSON localStorage)
  public autoSave() {
    try {
      this.state.lastSavedAt = new Date().toISOString();
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(this.state));
    } catch {
      // ignore
    }
  }

  public hasAutoSave(): boolean {
    try {
      return Boolean(localStorage.getItem(AUTOSAVE_KEY));
    } catch {
      return false;
    }
  }

  public getAutoSaveMeta(): SaveSlotMeta | null {
    try {
      const raw = localStorage.getItem(AUTOSAVE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as GameState;
      return {
        slotId: 'autosave',
        label: 'Auto Save',
        apartmentName: parsed.apartmentName,
        day: parsed.day,
        level: parsed.level,
        money: parsed.money,
        tenantsCount: parsed.tenants.length,
        savedAt: parsed.lastSavedAt || new Date().toISOString(),
      };
    } catch {
      return null;
    }
  }

  public continueLastSave(): boolean {
    try {
      const raw = localStorage.getItem(AUTOSAVE_KEY);
      if (!raw) return false;
      this.state = JSON.parse(raw) as GameState;
      this.floatingTexts = [];
      this.evaluateQuests();
      soundFX.coin();
      this.onStateChange();
      return true;
    } catch {
      return false;
    }
  }

  public saveToSlot(slotNum: 1 | 2 | 3): SaveSlotMeta {
    this.state.lastSavedAt = new Date().toISOString();
    const payload = JSON.stringify(this.state);
    localStorage.setItem(`${SAVE_PREFIX}${slotNum}`, payload);
    localStorage.setItem(AUTOSAVE_KEY, payload);
    soundFX.coin();
    this.onStateChange();
    return {
      slotId: `slot_${slotNum}`,
      label: `Save Slot ${slotNum}`,
      apartmentName: this.state.apartmentName,
      day: this.state.day,
      level: this.state.level,
      money: this.state.money,
      tenantsCount: this.state.tenants.length,
      savedAt: this.state.lastSavedAt,
    };
  }

  public loadFromSlot(slotNum: 1 | 2 | 3): boolean {
    try {
      const raw = localStorage.getItem(`${SAVE_PREFIX}${slotNum}`);
      if (!raw) return false;
      this.state = JSON.parse(raw) as GameState;
      this.floatingTexts = [];
      this.evaluateQuests();
      soundFX.coin();
      this.onStateChange();
      return true;
    } catch {
      return false;
    }
  }

  public deleteSlot(slotNum: 1 | 2 | 3) {
    localStorage.removeItem(`${SAVE_PREFIX}${slotNum}`);
    soundFX.click();
    this.onStateChange();
  }

  public listSaveSlots(): (SaveSlotMeta | null)[] {
    return ([1, 2, 3] as const).map((num) => {
      try {
        const raw = localStorage.getItem(`${SAVE_PREFIX}${num}`);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as GameState;
        return {
          slotId: `slot_${num}`,
          label: `Save Slot ${num}`,
          apartmentName: parsed.apartmentName,
          day: parsed.day,
          level: parsed.level,
          money: parsed.money,
          tenantsCount: parsed.tenants.length,
          savedAt: parsed.lastSavedAt || '',
        };
      } catch {
        return null;
      }
    });
  }
}
