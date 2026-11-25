import {
  Achievement,
  DramaCategory,
  FacilityType,
  FurnitureType,
  InteriorTheme,
  Investment,
  PersonalityTrait,
  Quest,
  RoomType,
  StaffRole,
  TenantArchetype,
  UpgradeKey,
} from './types';

export interface RoomTypeSpec {
  type: RoomType;
  label: string;
  slotSpan: number;
  buildCost: number;
  baseRent: number;
  capacity: number;
  unlockLevel: number;
  description: string;
  minFloor?: number;
}

export const ROOM_SPECS: Record<RoomType, RoomTypeSpec> = {
  STUDIO: {
    type: 'STUDIO',
    label: 'Studio',
    slotSpan: 1,
    buildCost: 1200,
    baseRent: 280,
    capacity: 1,
    unlockLevel: 1,
    description: 'Compact solo apartment ideal for students and freelancers.',
  },
  STANDARD: {
    type: 'STANDARD',
    label: 'Standard Apt',
    slotSpan: 1,
    buildCost: 2200,
    baseRent: 420,
    capacity: 1,
    unlockLevel: 1,
    description: 'Balanced 1-bedroom home with cozy living essentials.',
  },
  DELUXE: {
    type: 'DELUXE',
    label: 'Deluxe Apt',
    slotSpan: 2,
    buildCost: 4600,
    baseRent: 760,
    capacity: 2,
    unlockLevel: 2,
    description: 'Spacious 2-slot residence suited for young couples.',
  },
  FAMILY: {
    type: 'FAMILY',
    label: 'Family Suite',
    slotSpan: 2,
    buildCost: 6500,
    baseRent: 980,
    capacity: 4,
    unlockLevel: 3,
    description: 'Multi-room layout designed for small families.',
  },
  LUXURY: {
    type: 'LUXURY',
    label: 'Luxury Apt',
    slotSpan: 2,
    buildCost: 10500,
    baseRent: 1450,
    capacity: 2,
    unlockLevel: 5,
    description: 'High-end residence attracting executives and influencers.',
  },
  PENTHOUSE: {
    type: 'PENTHOUSE',
    label: 'Penthouse',
    slotSpan: 3,
    buildCost: 19500,
    baseRent: 2600,
    capacity: 3,
    unlockLevel: 7,
    minFloor: 3,
    description: 'Grand 3-slot panoramic suite on upper floors.',
  },
};

export interface InteriorThemeSpec {
  id: InteriorTheme;
  label: string;
  wallColor: string;
  trimColor: string;
  floorColor: string;
  cost: number;
  comfortBonus: number;
  unlockLevel: number;
}

export const INTERIOR_THEMES: Record<InteriorTheme, InteriorThemeSpec> = {
  COZY_CREAM: {
    id: 'COZY_CREAM',
    label: 'Cozy Cream',
    wallColor: '#F5E6C8',
    trimColor: '#D6B88D',
    floorColor: '#8B5A2B',
    cost: 250,
    comfortBonus: 4,
    unlockLevel: 1,
  },
  NORDIC_SAGE: {
    id: 'NORDIC_SAGE',
    label: 'Nordic Sage',
    wallColor: '#D8E2DC',
    trimColor: '#9CAFAA',
    floorColor: '#A98467',
    cost: 420,
    comfortBonus: 7,
    unlockLevel: 1,
  },
  URBAN_BRICK: {
    id: 'URBAN_BRICK',
    label: 'Urban Brick',
    wallColor: '#C97B63',
    trimColor: '#6D4C41',
    floorColor: '#4E342E',
    cost: 550,
    comfortBonus: 9,
    unlockLevel: 2,
  },
  PASTEL_SKY: {
    id: 'PASTEL_SKY',
    label: 'Pastel Sky',
    wallColor: '#D4E9F7',
    trimColor: '#8FB8DE',
    floorColor: '#C7A27C',
    cost: 680,
    comfortBonus: 11,
    unlockLevel: 3,
  },
  MINIMALIST_SLATE: {
    id: 'MINIMALIST_SLATE',
    label: 'Minimalist Slate',
    wallColor: '#CBD5E1',
    trimColor: '#64748B',
    floorColor: '#334155',
    cost: 900,
    comfortBonus: 14,
    unlockLevel: 4,
  },
  ROYAL_GOLD: {
    id: 'ROYAL_GOLD',
    label: 'Royal Gold',
    wallColor: '#F3E1B6',
    trimColor: '#D4AF37',
    floorColor: '#5C3A21',
    cost: 1500,
    comfortBonus: 18,
    unlockLevel: 6,
  },
};

export interface FurnitureSpec {
  type: FurnitureType;
  label: string;
  cost: number;
  comfortBonus: number;
  rentBonus: number;
  unlockLevel: number;
}

export const FURNITURE_SPECS: Record<FurnitureType, FurnitureSpec> = {
  BED: {
    type: 'BED',
    label: 'Plush Bed',
    cost: 350,
    comfortBonus: 12,
    rentBonus: 35,
    unlockLevel: 1,
  },
  SOFA: {
    type: 'SOFA',
    label: 'Lounge Sofa',
    cost: 420,
    comfortBonus: 10,
    rentBonus: 40,
    unlockLevel: 1,
  },
  KITCHEN: {
    type: 'KITCHEN',
    label: 'Kitchenette',
    cost: 650,
    comfortBonus: 12,
    rentBonus: 65,
    unlockLevel: 1,
  },
  DESK: {
    type: 'DESK',
    label: 'Work Desk',
    cost: 380,
    comfortBonus: 8,
    rentBonus: 35,
    unlockLevel: 1,
  },
  TV: {
    type: 'TV',
    label: 'Smart TV',
    cost: 520,
    comfortBonus: 10,
    rentBonus: 55,
    unlockLevel: 2,
  },
  AC: {
    type: 'AC',
    label: 'Climate AC',
    cost: 700,
    comfortBonus: 14,
    rentBonus: 75,
    unlockLevel: 3,
  },
  PLANT: {
    type: 'PLANT',
    label: 'Indoor Plant',
    cost: 180,
    comfortBonus: 6,
    rentBonus: 20,
    unlockLevel: 1,
  },
  CHANDELIER: {
    type: 'CHANDELIER',
    label: 'Crystal Lamp',
    cost: 1100,
    comfortBonus: 16,
    rentBonus: 120,
    unlockLevel: 5,
  },
};

export interface FacilitySpec {
  type: FacilityType;
  label: string;
  cost: number;
  dailyRevenue: number;
  dailyUpkeep: number;
  satisfactionBonus: number;
  reputationBonus: number;
  unlockLevel: number;
  floor: number; // 0 = street/ground, >0 = indoor, 99 = rooftop
  slot: number;
  description: string;
}

export const FACILITY_SPECS: Record<FacilityType, FacilitySpec> = {
  LOBBY: {
    type: 'LOBBY',
    label: 'Main Lobby',
    cost: 0,
    dailyRevenue: 0,
    dailyUpkeep: 25,
    satisfactionBonus: 4,
    reputationBonus: 5,
    unlockLevel: 1,
    floor: 0,
    slot: 1,
    description: 'Welcoming entrance hall. Upgrading increases prestige.',
  },
  RECEPTIONIST: {
    type: 'RECEPTIONIST',
    label: 'Reception Desk',
    cost: 900,
    dailyRevenue: 40,
    dailyUpkeep: 20,
    satisfactionBonus: 5,
    reputationBonus: 6,
    unlockLevel: 1,
    floor: 0,
    slot: 1,
    description: 'Handles tenant check-ins and boosts building prestige.',
  },
  ELEVATOR: {
    type: 'ELEVATOR',
    label: 'Passenger Elevator',
    cost: 1400,
    dailyRevenue: 0,
    dailyUpkeep: 35,
    satisfactionBonus: 7,
    reputationBonus: 6,
    unlockLevel: 1,
    floor: 0,
    slot: 0,
    description: 'Moves tenants quickly between floors. Upgrades boost speed.',
  },
  PARKING: {
    type: 'PARKING',
    label: 'Parking Lot',
    cost: 1800,
    dailyRevenue: 190,
    dailyUpkeep: 30,
    satisfactionBonus: 4,
    reputationBonus: 4,
    unlockLevel: 1,
    floor: 0,
    slot: -1,
    description: 'Generates daily parking fees from commuters and visitors.',
  },
  LAUNDRY: {
    type: 'LAUNDRY',
    label: 'Coin Laundry',
    cost: 1600,
    dailyRevenue: 160,
    dailyUpkeep: 45,
    satisfactionBonus: 6,
    reputationBonus: 4,
    unlockLevel: 1,
    floor: 0,
    slot: 2,
    description: 'Coin-operated washers earning steady resident income.',
  },
  MINIMARKET: {
    type: 'MINIMARKET',
    label: 'Minimarket',
    cost: 2800,
    dailyRevenue: 290,
    dailyUpkeep: 60,
    satisfactionBonus: 7,
    reputationBonus: 5,
    unlockLevel: 2,
    floor: 0,
    slot: 0,
    description: '24-hour convenience shop serving tenants and neighbors.',
  },
  GARDEN: {
    type: 'GARDEN',
    label: 'Courtyard Garden',
    cost: 2200,
    dailyRevenue: 40,
    dailyUpkeep: 35,
    satisfactionBonus: 9,
    reputationBonus: 8,
    unlockLevel: 2,
    floor: 0,
    slot: 3,
    description: 'Lush trees and benches boosting tenant relaxation.',
  },
  CAFE: {
    type: 'CAFE',
    label: 'Pixel Cafe',
    cost: 3600,
    dailyRevenue: 340,
    dailyUpkeep: 80,
    satisfactionBonus: 8,
    reputationBonus: 8,
    unlockLevel: 3,
    floor: 0,
    slot: 2,
    description: 'Warm espresso lounge that sparks social encounters.',
  },
  GYM: {
    type: 'GYM',
    label: 'Fitness Gym',
    cost: 4200,
    dailyRevenue: 260,
    dailyUpkeep: 90,
    satisfactionBonus: 9,
    reputationBonus: 7,
    unlockLevel: 3,
    floor: 1,
    slot: 2,
    description: 'Modern treadmills and weights for active residents.',
  },
  PLAYROOM: {
    type: 'PLAYROOM',
    label: 'Playroom & Lounge',
    cost: 3200,
    dailyRevenue: 150,
    dailyUpkeep: 55,
    satisfactionBonus: 8,
    reputationBonus: 6,
    unlockLevel: 4,
    floor: 1,
    slot: 0,
    description: 'Arcade & kids corner loved by families and students.',
  },
  SECURITY_ROOM: {
    type: 'SECURITY_ROOM',
    label: 'Security Room',
    cost: 3800,
    dailyRevenue: 0,
    dailyUpkeep: 70,
    satisfactionBonus: 6,
    reputationBonus: 10,
    unlockLevel: 4,
    floor: 0,
    slot: 0,
    description: 'CCTV monitoring lowers crime and emergency incidents.',
  },
  POOL: {
    type: 'POOL',
    label: 'Swimming Pool',
    cost: 6800,
    dailyRevenue: 320,
    dailyUpkeep: 140,
    satisfactionBonus: 13,
    reputationBonus: 12,
    unlockLevel: 5,
    floor: 0,
    slot: 4,
    description: 'Sparkling pool patio prized by luxury tenants.',
  },
  ROOFTOP: {
    type: 'ROOFTOP',
    label: 'Rooftop Sky Lounge',
    cost: 8500,
    dailyRevenue: 450,
    dailyUpkeep: 150,
    satisfactionBonus: 15,
    reputationBonus: 16,
    unlockLevel: 6,
    floor: 99,
    slot: 1,
    description: 'String-lit rooftop garden and bar with panoramic city views.',
  },
};

export interface StaffSpec {
  role: StaffRole;
  label: string;
  hireCost: number;
  dailySalary: number;
  description: string;
  unlockLevel: number;
}

export const STAFF_SPECS: Record<StaffRole, StaffSpec> = {
  CLEANER: {
    role: 'CLEANER',
    label: 'Cleaning Service',
    hireCost: 450,
    dailySalary: 85,
    description: 'Walks floor-to-floor keeping rooms spotless automatically.',
    unlockLevel: 1,
  },
  TECHNICIAN: {
    role: 'TECHNICIAN',
    label: 'Technician',
    hireCost: 600,
    dailySalary: 110,
    description: 'Repairs furniture wear, wiring, and plumbing issues fast.',
    unlockLevel: 1,
  },
  RECEPTIONIST: {
    role: 'RECEPTIONIST',
    label: 'Receptionist',
    hireCost: 550,
    dailySalary: 95,
    description: 'Boosts tenant inquiries, satisfaction, and lease renewals.',
    unlockLevel: 1,
  },
  SECURITY: {
    role: 'SECURITY',
    label: 'Security Guard',
    hireCost: 650,
    dailySalary: 120,
    description: 'Patrols hallways, deters noise conflicts and emergencies.',
    unlockLevel: 2,
  },
  PARKING_ATTENDANT: {
    role: 'PARKING_ATTENDANT',
    label: 'Parking Attendant',
    hireCost: 500,
    dailySalary: 80,
    description: 'Increases daily parking lot revenue by 40%.',
    unlockLevel: 2,
  },
  MANAGER: {
    role: 'MANAGER',
    label: 'Property Manager',
    hireCost: 1400,
    dailySalary: 220,
    description: 'Optimizes utility bills (-15%) and boosts staff productivity.',
    unlockLevel: 4,
  },
};

export interface UpgradeSpec {
  key: UpgradeKey;
  label: string;
  baseCost: number;
  description: string;
}

export const UPGRADE_SPECS: UpgradeSpec[] = [
  { key: 'WALLS', label: 'Thermal Brick Walls', baseCost: 1100, description: 'Soundproofing reduces noise complaints and boosts comfort.' },
  { key: 'FLOORS', label: 'Hardwood & Marble Floors', baseCost: 1000, description: 'Slows room dirtiness and increases rent value.' },
  { key: 'SECURITY', label: 'Smart Keycard Security', baseCost: 1300, description: 'Raises safety reputation and prevents late-night trouble.' },
  { key: 'ELEVATOR_TECH', label: 'High-Speed Elevator Motor', baseCost: 1400, description: 'Moves residents faster between upper floors.' },
  { key: 'LIGHTING', label: 'Warm LED Lighting', baseCost: 850, description: 'Cuts electricity bills and enhances cozy ambiance.' },
  { key: 'ELECTRICAL', label: 'Smart Power Grid', baseCost: 1500, description: 'Reduces daily electricity expenses by 10% per level.' },
  { key: 'PLUMBING', label: 'Eco Water Piping', baseCost: 1450, description: 'Reduces water bills and prevents pipe burst emergencies.' },
  { key: 'DECOR', label: 'Art & Lobby Decor', baseCost: 950, description: 'Beautifies exterior & hallways, lifting property reputation.' },
];

export interface ArchetypeSpec {
  archetype: TenantArchetype;
  label: string;
  occupations: string[];
  minAge: number;
  maxAge: number;
  minBudget: number;
  maxBudget: number;
  minIncome: number;
  maxIncome: number;
  habits: string[];
  preferredPersonalities: PersonalityTrait[];
  unlockLevel: number;
}

export const ARCHETYPE_SPECS: Record<TenantArchetype, ArchetypeSpec> = {
  STUDENT: {
    archetype: 'STUDENT',
    label: 'University Student',
    occupations: ['Design Student', 'CS Undergraduate', 'Medical Intern'],
    minAge: 19,
    maxAge: 23,
    minBudget: 260,
    maxBudget: 440,
    minIncome: 650,
    maxIncome: 1100,
    habits: ['Studies past midnight with lo-fi beats', 'Craves midnight instant noodles'],
    preferredPersonalities: ['Introvert', 'Party Animal', 'Ambitious'],
    unlockLevel: 1,
  },
  OFFICE_WORKER: {
    archetype: 'OFFICE_WORKER',
    label: 'Office Worker',
    occupations: ['Financial Analyst', 'Marketing Lead', 'HR Specialist'],
    minAge: 24,
    maxAge: 34,
    minBudget: 400,
    maxBudget: 720,
    minIncome: 1500,
    maxIncome: 2600,
    habits: ['Drinks two iced lattes every morning', 'Leaves early at 8 AM sharp'],
    preferredPersonalities: ['Workaholic', 'Neat Freak', 'Romantic'],
    unlockLevel: 1,
  },
  FREELANCER: {
    archetype: 'FREELANCER',
    label: 'Creative Freelancer',
    occupations: ['Pixel Illustrator', 'Indie Developer', 'Video Editor'],
    minAge: 22,
    maxAge: 32,
    minBudget: 350,
    maxBudget: 680,
    minIncome: 1200,
    maxIncome: 2400,
    habits: ['Works from the cafe with headphones', 'Keeps indoor plants everywhere'],
    preferredPersonalities: ['Introvert', 'Romantic', 'Neat Freak'],
    unlockLevel: 1,
  },
  YOUNG_COUPLE: {
    archetype: 'YOUNG_COUPLE',
    label: 'Young Couple',
    occupations: ['Architect & Chef', 'Nurse & Teacher', 'UI Designer & Musician'],
    minAge: 25,
    maxAge: 33,
    minBudget: 680,
    maxBudget: 1150,
    minIncome: 2800,
    maxIncome: 4400,
    habits: ['Cooks dinner together every evening', 'Hosts weekend board-game nights'],
    preferredPersonalities: ['Romantic', 'Neat Freak', 'Gossiper'],
    unlockLevel: 2,
  },
  SMALL_FAMILY: {
    archetype: 'SMALL_FAMILY',
    label: 'Small Family',
    occupations: ['Civil Engineer & Pharmacist', 'Store Owner & Teacher'],
    minAge: 30,
    maxAge: 42,
    minBudget: 850,
    maxBudget: 1450,
    minIncome: 3400,
    maxIncome: 5500,
    habits: ['Uses the garden & playroom daily', 'Values quiet nights after 9 PM'],
    preferredPersonalities: ['Neat Freak', 'Workaholic', 'Ambitious'],
    unlockLevel: 3,
  },
  ENTREPRENEUR: {
    archetype: 'ENTREPRENEUR',
    label: 'Tech Entrepreneur',
    occupations: ['Startup Founder', 'Venture Partner', 'E-Commerce Director'],
    minAge: 27,
    maxAge: 40,
    minBudget: 1200,
    maxBudget: 2400,
    minIncome: 5500,
    maxIncome: 11000,
    habits: ['Takes pitch calls on the rooftop', 'Orders late-night espresso deliveries'],
    preferredPersonalities: ['Ambitious', 'Workaholic', 'Gossiper'],
    unlockLevel: 4,
  },
  INFLUENCER: {
    archetype: 'INFLUENCER',
    label: 'Lifestyle Influencer',
    occupations: ['Travel Vlogger', 'Fashion Creator', 'Food Streamer'],
    minAge: 21,
    maxAge: 29,
    minBudget: 1100,
    maxBudget: 2800,
    minIncome: 4500,
    maxIncome: 9500,
    habits: ['Films sunset aesthetic reels in the lobby', 'Receives dozens of PR packages'],
    preferredPersonalities: ['Party Animal', 'Gossiper', 'Romantic'],
    unlockLevel: 5,
  },
};

export const TENANT_FIRST_NAMES = [
  'Lin', 'Mei', 'Chen', 'Sora', 'Hana', 'Riku', 'Kai', 'Nadia', 'Bima', 'Tari',
  'Yuna', 'Arif', 'Elena', 'Lucas', 'Chloe', 'Darius', 'Zhen', 'Alya', 'Reno', 'Vina',
  'Milo', 'Sienna', 'Kaito', 'Freya', 'Rafi', 'Jia', 'Toby', 'Nora',
];

export const TENANT_LAST_NAMES = [
  'Wei', 'Tan', 'Pratama', 'Sato', 'Lim', 'Kusuma', 'Zhang', 'Wijaya', 'Park', 'Chen',
  'Santoso', 'Kwon', 'Hartono', 'Wu', 'Nugroho', 'Huang', 'Lestari', 'Hsu',
];

export const INITIAL_INVESTMENTS: Investment[] = [
  {
    id: 'inv_solar',
    name: 'Rooftop Solar Array',
    description: 'Clean panels that generate passive energy credits each day.',
    cost: 4500,
    dailyReturn: 240,
    owned: false,
  },
  {
    id: 'inv_boba',
    name: 'Street Corner Boba Kiosk',
    description: 'Co-own the popular milk tea stall outside your apartment.',
    cost: 8000,
    dailyReturn: 460,
    owned: false,
  },
  {
    id: 'inv_transit',
    name: 'District Metro Ad Board',
    description: 'High-visibility billboard lease along the city boulevard.',
    cost: 15000,
    dailyReturn: 920,
    owned: false,
  },
  {
    id: 'inv_tower',
    name: 'Skyline REIT Shares',
    description: 'Blue-chip urban real estate dividend portfolio.',
    cost: 28000,
    dailyReturn: 1850,
    owned: false,
  },
];

export const INITIAL_QUESTS: Quest[] = [
  {
    id: 'q_main_1',
    category: 'MAIN',
    title: 'First Keys Handed Over',
    description: 'Rent out 3 apartment rooms to start building steady cashflow.',
    targetType: 'RENTED_ROOMS',
    targetValue: 3,
    progress: 0,
    rewardMoney: 1500,
    rewardXp: 120,
    completed: false,
    claimed: false,
  },
  {
    id: 'q_main_2',
    category: 'MAIN',
    title: 'Growing Community',
    description: 'Reach 5 active tenants living in your apartment complex.',
    targetType: 'TOTAL_TENANTS',
    targetValue: 5,
    progress: 0,
    rewardMoney: 2500,
    rewardXp: 200,
    completed: false,
    claimed: false,
  },
  {
    id: 'q_main_3',
    category: 'MAIN',
    title: 'Warm Welcome',
    description: 'Upgrade your Main Lobby to Level 2.',
    targetType: 'LOBBY_LEVEL',
    targetValue: 2,
    progress: 1,
    rewardMoney: 2000,
    rewardXp: 180,
    completed: false,
    claimed: false,
  },
  {
    id: 'q_side_1',
    category: 'SIDE',
    title: 'Spin Cycle Profits',
    description: 'Build the Coin Laundry facility.',
    targetType: 'FACILITY_BUILT',
    targetValue: 1,
    targetFacility: 'LAUNDRY',
    progress: 0,
    rewardMoney: 1200,
    rewardXp: 140,
    completed: false,
    claimed: false,
  },
  {
    id: 'q_side_2',
    category: 'SIDE',
    title: 'Trusted Mediator',
    description: 'Resolve 3 tenant drama or conflict events.',
    targetType: 'CONFLICTS_RESOLVED',
    targetValue: 3,
    progress: 0,
    rewardMoney: 2200,
    rewardXp: 240,
    completed: false,
    claimed: false,
  },
  {
    id: 'q_daily_1',
    category: 'DAILY',
    title: 'Revenue Milestone',
    description: 'Earn $10,000 in cumulative property income.',
    targetType: 'MONEY_EARNED',
    targetValue: 10000,
    progress: 0,
    rewardMoney: 3000,
    rewardXp: 260,
    completed: false,
    claimed: false,
  },
  {
    id: 'q_daily_2',
    category: 'DAILY',
    title: 'Five-Star Hospitality',
    description: 'Maintain an average tenant satisfaction of 75% or higher.',
    targetType: 'AVG_SATISFACTION',
    targetValue: 75,
    progress: 0,
    rewardMoney: 1400,
    rewardXp: 150,
    completed: false,
    claimed: false,
  },
  {
    id: 'q_main_4',
    category: 'MAIN',
    title: 'Reaching Higher',
    description: 'Construct at least 4 building floors.',
    targetType: 'FLOORS_BUILT',
    targetValue: 4,
    progress: 2,
    rewardMoney: 4000,
    rewardXp: 350,
    completed: false,
    claimed: false,
  },
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'ach_first_rent', title: 'Landlord Debut', description: 'Sign your very first tenant lease.', unlocked: false, rewardXp: 80 },
  { id: 'ach_peacemaker', title: 'Drama Whisperer', description: 'Resolve 5 apartment drama events.', unlocked: false, rewardXp: 180 },
  { id: 'ach_romance', title: 'Matchmaker of Pixel Street', description: 'Spark a romance between two tenants.', unlocked: false, rewardXp: 220 },
  { id: 'ach_expansion', title: 'Real Estate Mogul', description: 'Expand your apartment land plot.', unlocked: false, rewardXp: 250 },
  { id: 'ach_penthouse', title: 'Crown Jewel', description: 'Build a luxury Penthouse suite.', unlocked: false, rewardXp: 350 },
];

export interface DramaTemplate {
  id: string;
  category: DramaCategory;
  title: string;
  requiresTwoTenants: boolean;
  buildDialogue: (aName: string, bName?: string) => string;
  choices: {
    label: string;
    hint: string;
    moneyDelta?: number;
    reputationDelta?: number;
    xpDelta?: number;
    satisfactionDelta?: number;
    relationshipDelta?: number;
    makeRomantic?: boolean;
    cleanlinessDelta?: number;
    conditionDelta?: number;
    resultText: string;
  }[];
}

export const DRAMA_TEMPLATES: DramaTemplate[] = [
  {
    id: 'dr_karaoke',
    category: 'CONFLICT',
    title: 'Midnight Karaoke vs. Deadline',
    requiresTwoTenants: true,
    buildDialogue: (a, b) =>
      `${b} knocks angrily at your office door: "${a} is belting emotional ballads at full volume while I have an early presentation tomorrow!"`,
    choices: [
      {
        label: 'Enforce Quiet Hours',
        hint: '+Rep, cools down complaint, slight tension',
        reputationDelta: 4,
        satisfactionDelta: 4,
        relationshipDelta: -10,
        xpDelta: 45,
        resultText: 'You politely paused the karaoke. Peace returned to the hallway.',
      },
      {
        label: 'Sponsor Soundproofing Foam',
        hint: '-$280, +Satisfaction for both, +Relationship',
        moneyDelta: -280,
        reputationDelta: 6,
        satisfactionDelta: 10,
        relationshipDelta: 18,
        xpDelta: 65,
        resultText: 'Both neighbors thanked you and ended up sharing midnight snacks!',
      },
      {
        label: 'Ignore the Dispute',
        hint: 'Free, but risks bad mood & rivalry',
        reputationDelta: -4,
        satisfactionDelta: -8,
        relationshipDelta: -25,
        xpDelta: 15,
        resultText: 'The argument echoed down the stairwell until 2 AM.',
      },
    ],
  },
  {
    id: 'dr_umbrella',
    category: 'RELATIONSHIP',
    title: 'Shared Umbrella in the Rain',
    requiresTwoTenants: true,
    buildDialogue: (a, b) =>
      `A sudden downpour catches ${a} and ${b} under the lobby awning with only one umbrella. They glance nervously at each other.`,
    choices: [
      {
        label: 'Offer a Cozy Lobby Tea Voucher',
        hint: '-$90, sparks romance & friendship!',
        moneyDelta: -90,
        reputationDelta: 5,
        satisfactionDelta: 9,
        relationshipDelta: 28,
        makeRomantic: true,
        xpDelta: 70,
        resultText: 'Over warm jasmine tea, sparks flew between them!',
      },
      {
        label: 'Lend Building Spare Umbrellas',
        hint: '+Rep, friendly neighbor moment',
        reputationDelta: 3,
        satisfactionDelta: 5,
        relationshipDelta: 12,
        xpDelta: 40,
        resultText: 'They walked out laughing together under matching umbrellas.',
      },
    ],
  },
  {
    id: 'dr_party',
    category: 'RANDOM',
    title: 'Surprise Birthday Bash',
    requiresTwoTenants: true,
    buildDialogue: (a, b) =>
      `${a} invited friends over for ${b}'s surprise party! Confetti and hotpot aromas are filling the corridor.`,
    choices: [
      {
        label: 'Join & Bring Celebration Cake',
        hint: '-$180, huge satisfaction & bond boost, messy hallway',
        moneyDelta: -180,
        reputationDelta: 7,
        satisfactionDelta: 12,
        relationshipDelta: 22,
        cleanlinessDelta: -14,
        xpDelta: 65,
        resultText: 'Everyone cheered! The building felt like a warm family.',
      },
      {
        label: 'Set a 10 PM Curfew',
        hint: 'Balanced order & cleanliness',
        reputationDelta: 2,
        satisfactionDelta: 2,
        relationshipDelta: 6,
        cleanlinessDelta: -5,
        xpDelta: 40,
        resultText: 'The party stayed lively yet respectful of neighbors.',
      },
    ],
  },
  {
    id: 'dr_watch',
    category: 'STORY',
    title: 'Lost Heirloom in the Laundry',
    requiresTwoTenants: false,
    buildDialogue: (a) =>
      `${a} is frantic: "I left my grandmother's vintage wristwatch in my coat pocket before tossing it into the wash! Can you check the security logs?"`,
    choices: [
      {
        label: 'Lead a Full Search & Check Logs',
        hint: '+Rep, +XP, deeply grateful tenant',
        reputationDelta: 8,
        satisfactionDelta: 15,
        xpDelta: 85,
        resultText: 'You found the watch tucked behind dryer #2! Tears of relief.',
      },
      {
        label: 'Offer Replacement Voucher',
        hint: '-$220, modest comfort',
        moneyDelta: -220,
        reputationDelta: 2,
        satisfactionDelta: 4,
        xpDelta: 35,
        resultText: 'Your tenant appreciated the kind gesture even though the watch remained missing.',
      },
    ],
  },
  {
    id: 'dr_promotion',
    category: 'BUSINESS',
    title: 'Big Promotion & Lease Upgrade',
    requiresTwoTenants: false,
    buildDialogue: (a) =>
      `${a} rushes into the lobby waving an offer letter! "I just got promoted! Should I renew my lease long-term or look for a bigger place?"`,
    choices: [
      {
        label: 'Offer VIP Loyalty Bonus',
        hint: '+$450 signing bonus, +Rep, boosts mood',
        moneyDelta: 450,
        reputationDelta: 5,
        satisfactionDelta: 12,
        xpDelta: 75,
        resultText: 'They gladly signed an extended lease and celebrated with neighbors!',
      },
      {
        label: 'Congratulate & Keep Standard Terms',
        hint: '+$200 gift, steady relationship',
        moneyDelta: 200,
        reputationDelta: 2,
        satisfactionDelta: 6,
        xpDelta: 45,
        resultText: 'They thanked you for being a supportive landlord.',
      },
    ],
  },
  {
    id: 'dr_pipe',
    category: 'EMERGENCY',
    title: 'Sudden Riser Pipe Leak',
    requiresTwoTenants: false,
    buildDialogue: (a) =>
      `${a} calls urgently: "Water is dripping from the ceiling corner! If it spreads, my wooden desk will be soaked!"`,
    choices: [
      {
        label: 'Call Emergency Express Plumber',
        hint: '-$420, saves room condition & reputation',
        moneyDelta: -420,
        reputationDelta: 5,
        satisfactionDelta: 8,
        conditionDelta: 5,
        xpDelta: 70,
        resultText: 'The crew sealed the valve in 20 minutes. Crisis averted!',
      },
      {
        label: 'Patch Temporarily Yourself',
        hint: '-$120, lowers room condition slightly',
        moneyDelta: -120,
        reputationDelta: -2,
        satisfactionDelta: -4,
        conditionDelta: -12,
        xpDelta: 35,
        resultText: 'The bucket stopped the flooding for now, though stains remain.',
      },
    ],
  },
  {
    id: 'dr_livestream',
    category: 'BUSINESS',
    title: 'Viral Apartment Tour Video',
    requiresTwoTenants: false,
    buildDialogue: (a) =>
      `${a} asks: "My followers love the cozy brick aesthetic here! Can I film a 60-second apartment tour in the lobby and courtyard?"`,
    choices: [
      {
        label: 'Approve & Stage Fresh Flowers',
        hint: '-$150, big reputation boost & rental buzz',
        moneyDelta: -150,
        reputationDelta: 10,
        satisfactionDelta: 7,
        xpDelta: 80,
        resultText: 'The clip hit 120k views! Inquiries for your apartments surged.',
      },
      {
        label: 'Decline for Resident Privacy',
        hint: '+Satisfaction for introverted residents',
        reputationDelta: 2,
        satisfactionDelta: 5,
        xpDelta: 40,
        resultText: 'Residents appreciated you protecting their quiet home life.',
      },
    ],
  },
  {
    id: 'dr_facility_feud',
    category: 'CONFLICT',
    title: 'Treadmill Territory Dispute',
    requiresTwoTenants: true,
    buildDialogue: (a, b) =>
      `${a} and ${b} are arguing over gym equipment! "You've been scrolling on your phone on the only treadmill for 40 minutes!"`,
    choices: [
      {
        label: 'Introduce 20-Minute Rotation Rule',
        hint: 'Fair resolution, +Rep & +XP',
        reputationDelta: 4,
        satisfactionDelta: 6,
        relationshipDelta: 8,
        xpDelta: 55,
        resultText: 'Both agreed to the timer board and wrapped up with a fist bump.',
      },
      {
        label: 'Order Smoothies to Cool Tempers',
        hint: '-$140, +Bond & +Satisfaction',
        moneyDelta: -140,
        reputationDelta: 5,
        satisfactionDelta: 11,
        relationshipDelta: 20,
        xpDelta: 65,
        resultText: 'A cold mango smoothie turned rivals into workout buddies!',
      },
    ],
  },
];
