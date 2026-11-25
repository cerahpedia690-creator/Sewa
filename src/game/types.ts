export type ScreenMode = 'MAIN_MENU' | 'PLAYING';
export type GameSpeed = 0 | 1 | 2 | 3;
export type WeatherType = 'SUNNY' | 'RAINY';
export type DayPeriod = 'Morning' | 'Afternoon' | 'Evening' | 'Night';

export type NavTab =
  | 'DASHBOARD'
  | 'BUILDING'
  | 'TENANTS'
  | 'FACILITIES'
  | 'STAFF'
  | 'FINANCE'
  | 'QUESTS'
  | 'SHOP'
  | 'SETTINGS';

export type RoomType =
  | 'STUDIO'
  | 'STANDARD'
  | 'DELUXE'
  | 'FAMILY'
  | 'LUXURY'
  | 'PENTHOUSE';

export type InteriorTheme =
  | 'COZY_CREAM'
  | 'NORDIC_SAGE'
  | 'URBAN_BRICK'
  | 'ROYAL_GOLD'
  | 'PASTEL_SKY'
  | 'MINIMALIST_SLATE';

export type FurnitureType =
  | 'BED'
  | 'SOFA'
  | 'KITCHEN'
  | 'DESK'
  | 'TV'
  | 'AC'
  | 'PLANT'
  | 'CHANDELIER';

export interface FurnitureItem {
  id: string;
  type: FurnitureType;
  level: number; // 1..3
  condition: number; // 0..100
}

export interface Room {
  id: string;
  floor: number; // 1..N (floor 0 is Ground Lobby & Street)
  slotStart: number; // 0..maxSlots-1
  slotSpan: number; // 1, 2, or 3
  number: string; // e.g. "101", "202"
  type: RoomType;
  theme: InteriorTheme;
  cleanliness: number; // 0..100
  condition: number; // 0..100
  capacity: number;
  rentPrice: number;
  deposit: number;
  comfort: number; // 0..100 computed
  furniture: FurnitureItem[];
  tenantIds: string[];
  lightOn: boolean;
}

export type TenantArchetype =
  | 'STUDENT'
  | 'OFFICE_WORKER'
  | 'ENTREPRENEUR'
  | 'YOUNG_COUPLE'
  | 'SMALL_FAMILY'
  | 'FREELANCER'
  | 'INFLUENCER';

export type PersonalityTrait =
  | 'Neat Freak'
  | 'Party Animal'
  | 'Workaholic'
  | 'Romantic'
  | 'Introvert'
  | 'Gossiper'
  | 'Ambitious';

export type PaymentStatus = 'PAID' | 'DUE' | 'LATE';

export type NPCActivity =
  | 'IDLE'
  | 'WALKING'
  | 'RIDING_ELEVATOR'
  | 'RESTING'
  | 'WORKING'
  | 'VISITING_FACILITY'
  | 'CHATTING'
  | 'OUTSIDE';

export interface TenantAppearance {
  skinColor: string;
  hairColor: string;
  hairStyle: number; // 0..4
  shirtColor: string;
  pantsColor: string;
  hasGlasses: boolean;
  accessory: number; // 0..3
}

export interface Tenant {
  id: string;
  name: string;
  age: number;
  archetype: TenantArchetype;
  occupation: string;
  income: number;
  personality: PersonalityTrait;
  habit: string;
  budget: number;
  satisfaction: number; // 0..100
  paymentStatus: PaymentStatus;
  contractDaysLeft: number;
  totalMonthsStayed: number;
  roomId: string | null;
  appearance: TenantAppearance;
  // Live AI coordinates (in world units)
  x: number; // slot units (0..maxSlots)
  y: number; // floor units (0 = street/lobby, 1 = floor 1, etc.)
  targetX: number;
  targetFloor: number;
  currentFloor: number;
  activity: NPCActivity;
  activityTimer: number;
  facing: 1 | -1;
  walkPhase: number;
  bubbleIcon: string | null; // 'heart' | 'music' | 'coin' | 'zzz' | 'alert' | 'coffee' | 'chat' | null
  bubbleTimer: number;
  waitingElevator: boolean;
  insideElevator: boolean;
}

export type RelationshipLabel =
  | 'Stranger'
  | 'Acquaintance'
  | 'Friend'
  | 'Best Friend'
  | 'Crush'
  | 'Couple'
  | 'Rival'
  | 'Feuding';

export interface Relationship {
  id: string;
  tenantA: string;
  tenantB: string;
  score: number; // -100..100
  romantic: boolean;
  label: RelationshipLabel;
  history: string[];
}

export type DramaCategory =
  | 'RANDOM'
  | 'STORY'
  | 'RELATIONSHIP'
  | 'CONFLICT'
  | 'BUSINESS'
  | 'EMERGENCY';

export interface EventConsequence {
  moneyDelta?: number;
  reputationDelta?: number;
  xpDelta?: number;
  satisfactionDelta?: number;
  relationshipDelta?: number;
  makeRomantic?: boolean;
  cleanlinessDelta?: number;
  conditionDelta?: number;
  resultText: string;
}

export interface EventChoice {
  id: string;
  label: string;
  hint: string;
  consequence: EventConsequence;
}

export interface DramaEvent {
  id: string;
  category: DramaCategory;
  title: string;
  dialogue: string;
  primaryTenantId: string;
  secondaryTenantId?: string;
  choices: EventChoice[];
  triggeredDay: number;
}

export type FacilityType =
  | 'LOBBY'
  | 'RECEPTIONIST'
  | 'ELEVATOR'
  | 'PARKING'
  | 'MINIMARKET'
  | 'LAUNDRY'
  | 'GYM'
  | 'POOL'
  | 'GARDEN'
  | 'CAFE'
  | 'PLAYROOM'
  | 'ROOFTOP'
  | 'SECURITY_ROOM';

export interface Facility {
  type: FacilityType;
  built: boolean;
  level: number; // 0..3
  floor: number; // assigned visual floor
  slot: number;
}

export type StaffRole =
  | 'RECEPTIONIST'
  | 'SECURITY'
  | 'CLEANER'
  | 'TECHNICIAN'
  | 'MANAGER'
  | 'PARKING_ATTENDANT';

export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  dailySalary: number;
  skillLevel: number; // 1..5
  productivity: number; // 0..100
  fatigue: number; // 0..100
  xp: number;
  x: number;
  currentFloor: number;
  targetX: number;
  targetFloor: number;
  facing: 1 | -1;
  walkPhase: number;
  resting: boolean;
}

export type UpgradeKey =
  | 'WALLS'
  | 'FLOORS'
  | 'SECURITY'
  | 'ELEVATOR_TECH'
  | 'LIGHTING'
  | 'ELECTRICAL'
  | 'PLUMBING'
  | 'DECOR';

export type BuildingUpgrades = Record<UpgradeKey, number>; // 1..5

export type QuestCategory = 'MAIN' | 'SIDE' | 'DAILY';

export interface Quest {
  id: string;
  category: QuestCategory;
  title: string;
  description: string;
  targetType:
    | 'RENTED_ROOMS'
    | 'TOTAL_TENANTS'
    | 'FACILITY_BUILT'
    | 'LOBBY_LEVEL'
    | 'MONEY_EARNED'
    | 'AVG_SATISFACTION'
    | 'CONFLICTS_RESOLVED'
    | 'FLOORS_BUILT'
    | 'STAFF_HIRED';
  targetValue: number;
  targetFacility?: FacilityType;
  progress: number;
  rewardMoney: number;
  rewardXp: number;
  completed: boolean;
  claimed: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  rewardXp: number;
}

export type TransactionCategory =
  | 'RENT'
  | 'PARKING'
  | 'LAUNDRY'
  | 'FACILITY'
  | 'SHOP'
  | 'VENDING'
  | 'INVESTMENT'
  | 'ELECTRICITY'
  | 'WATER'
  | 'PAYROLL'
  | 'MAINTENANCE'
  | 'RENOVATION'
  | 'FURNITURE'
  | 'TAX'
  | 'EMERGENCY'
  | 'CONSTRUCTION'
  | 'LOAN'
  | 'QUEST';

export interface Transaction {
  id: string;
  day: number;
  hour: number;
  type: 'INCOME' | 'EXPENSE';
  category: TransactionCategory;
  description: string;
  amount: number;
}

export interface Loan {
  id: string;
  name: string;
  principal: number;
  remaining: number;
  dailyInterestRate: number;
  dailyPayment: number;
}

export interface Investment {
  id: string;
  name: string;
  description: string;
  cost: number;
  dailyReturn: number;
  owned: boolean;
}

export interface FloatingText {
  id: string;
  x: number;
  floor: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
}

export interface StreetVehicle {
  id: string;
  x: number;
  speed: number;
  direction: 1 | -1;
  kind: 'CAR' | 'VAN' | 'SCOOTER';
  color: string;
}

export interface StreetWalker {
  id: string;
  x: number;
  speed: number;
  direction: 1 | -1;
  shirtColor: string;
  hairColor: string;
  walkPhase: number;
}

export interface Cloud {
  x: number;
  y: number;
  width: number;
  speed: number;
}

export interface RainDrop {
  x: number;
  y: number;
  speed: number;
  len: number;
}

export interface ElevatorState {
  currentFloor: number; // continuous float
  targetFloor: number;
  doorsOpen: number; // 0..1
  passengerIds: string[];
  queue: { tenantId: string; fromFloor: number; toFloor: number }[];
}

export interface GameSettings {
  muted: boolean;
  sfxVolume: number; // 0..1
  weatherEnabled: boolean;
  autoSaveEnabled: boolean;
  showBubbles: boolean;
  dayCycleSpeed: number; // 1 default
}

export interface GameState {
  apartmentName: string;
  money: number;
  totalEarned: number;
  level: number;
  xp: number;
  xpToNext: number;
  reputation: number; // 0..100
  day: number;
  hour: number; // 0..23
  minute: number; // 0..59
  speed: GameSpeed;
  weather: WeatherType;
  landPlots: number; // 1 = 3 slots wide, 2 = 5 slots wide, 3 = 7 slots wide
  totalFloors: number; // 2..8
  rooms: Room[];
  tenants: Tenant[];
  applicants: Tenant[];
  relationships: Relationship[];
  facilities: Record<FacilityType, Facility>;
  staff: StaffMember[];
  upgrades: BuildingUpgrades;
  quests: Quest[];
  achievements: Achievement[];
  transactions: Transaction[];
  dailyIncome: number;
  dailyExpense: number;
  monthlyIncome: number;
  monthlyExpense: number;
  loans: Loan[];
  investments: Investment[];
  activeEvent: DramaEvent | null;
  eventHistory: { day: number; title: string; outcome: string }[];
  conflictsResolved: number;
  elevator: ElevatorState;
  vendingMachines: number;
  lastSavedAt: string | null;
}

export interface SaveSlotMeta {
  slotId: string;
  label: string;
  apartmentName: string;
  day: number;
  level: number;
  money: number;
  tenantsCount: number;
  savedAt: string;
}
