import { INTERIOR_THEMES } from './catalog';
import { GameEngine } from './engine';
import { FurnitureItem, Room, StaffMember, Tenant } from './types';

export interface CameraState {
  x: number; // world px offset
  y: number; // world px offset
  zoom: number; // 0.55 .. 2.2
}

export interface HitRegion {
  type: 'ROOM' | 'EMPTY_SLOT';
  roomId?: string;
  floor: number;
  slot: number;
  screenX: number;
  screenY: number;
  screenW: number;
  screenH: number;
}

export const SLOT_W = 124;
export const FLOOR_H = 82;
export const SHAFT_W = 48;
export const STREET_Y = 0; // ground baseline in world Y (positive Y goes UP in floor logic, down in canvas)

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerpColor(hex1: string, hex2: string, t: number): string {
  const c1 = parseInt(hex1.slice(1), 16);
  const c2 = parseInt(hex2.slice(1), 16);
  const r = Math.round(lerp((c1 >> 16) & 255, (c2 >> 16) & 255, t));
  const g = Math.round(lerp((c1 >> 8) & 255, (c2 >> 8) & 255, t));
  const b = Math.round(lerp(c1 & 255, c2 & 255, t));
  return `rgb(${r},${g},${b})`;
}

function getSkyPalette(hourFloat: number, isRainy: boolean): { top: string; bottom: string; nightAlpha: number } {
  let top = '#38BDF8';
  let bottom = '#BAE6FD';
  let nightAlpha = 0;

  if (hourFloat < 5) {
    top = '#0B1026';
    bottom = '#1E293B';
    nightAlpha = 1;
  } else if (hourFloat < 7.5) {
    const t = (hourFloat - 5) / 2.5;
    top = lerpColor('#0B1026', '#60A5FA', t);
    bottom = lerpColor('#1E293B', '#FDBA74', t);
    nightAlpha = 1 - t;
  } else if (hourFloat < 16.5) {
    top = '#38BDF8';
    bottom = '#E0F2FE';
    nightAlpha = 0;
  } else if (hourFloat < 19.5) {
    const t = (hourFloat - 16.5) / 3;
    top = lerpColor('#38BDF8', '#4338CA', t);
    bottom = lerpColor('#E0F2FE', '#FB923C', t);
    nightAlpha = t * 0.65;
  } else if (hourFloat < 21.5) {
    const t = (hourFloat - 19.5) / 2;
    top = lerpColor('#4338CA', '#0B1026', t);
    bottom = lerpColor('#FB923C', '#1E293B', t);
    nightAlpha = lerp(0.65, 1, t);
  } else {
    top = '#0B1026';
    bottom = '#1E293B';
    nightAlpha = 1;
  }

  if (isRainy) {
    top = lerpColor(top, '#334155', 0.48);
    bottom = lerpColor(bottom, '#64748B', 0.45);
  }
  return { top, bottom, nightAlpha };
}

export function renderGameWorld(
  ctx: CanvasRenderingContext2D,
  engine: GameEngine,
  width: number,
  height: number,
  camera: CameraState,
  selectedRoomId: string | null,
  hoveredSlotKey: string | null,
  nowSec: number,
  isMenuMode = false
): HitRegion[] {
  const hitRegions: HitRegion[] = [];
  const state = engine.state;
  const maxSlots = engine.getMaxSlots();
  const hourFloat = state.hour + state.minute / 60;
  const isRainy = state.weather === 'RAINY' && engine.settings.weatherEnabled;
  const sky = getSkyPalette(hourFloat, isRainy);

  ctx.imageSmoothingEnabled = false;

  // 1. Sky Background
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, sky.top);
  grad.addColorStop(1, sky.bottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Stars & Moon at night
  if (sky.nightAlpha > 0.15) {
    ctx.save();
    ctx.globalAlpha = sky.nightAlpha;
    ctx.fillStyle = '#FEF9C3';
    for (let i = 0; i < 42; i++) {
      const sx = ((i * 197) % width);
      const sy = ((i * 89) % Math.max(120, Math.floor(height * 0.55)));
      const twinkle = Math.sin(nowSec * 2.5 + i) > 0.3 ? 2 : 1;
      ctx.fillRect(sx, sy, twinkle, twinkle);
    }
    // Pixel Crescent Moon
    const mx = Math.round(width * 0.84);
    const my = 68;
    ctx.fillStyle = '#FEF08A';
    ctx.fillRect(mx, my, 20, 20);
    ctx.fillStyle = sky.top;
    ctx.fillRect(mx + 6, my - 2, 16, 16);
    ctx.restore();
  } else {
    // Pixel Sun
    const sunProgress = Math.max(0, Math.min(1, (hourFloat - 6) / 13));
    const sx = Math.round(lerp(width * 0.14, width * 0.86, sunProgress));
    const sy = Math.round(145 - Math.sin(sunProgress * Math.PI) * 95);
    ctx.fillStyle = isRainy ? '#E2E8F0' : '#FDE047';
    ctx.fillRect(sx - 16, sy - 16, 32, 32);
    ctx.fillStyle = isRainy ? '#CBD5E1' : '#FEF08A';
    ctx.fillRect(sx - 20, sy - 10, 40, 20);
    ctx.fillRect(sx - 10, sy - 20, 20, 40);
  }

  // 2. Drifting Pixel Clouds
  for (const c of engine.clouds) {
    const cx = Math.round(c.x % (width + 200)) - 100;
    const cy = Math.round(c.y);
    ctx.fillStyle = isRainy ? '#94A3B8' : sky.nightAlpha > 0.5 ? '#334155' : '#FFFFFF';
    ctx.fillRect(cx, cy, Math.round(c.width), 12);
    ctx.fillRect(cx + 10, cy - 8, Math.round(c.width * 0.65), 10);
    ctx.fillRect(cx + 22, cy - 14, Math.round(c.width * 0.35), 8);
  }

  // 3. Distant City Skyline Silhouette (parallax)
  const horizonY = Math.round(height * 0.78);
  const skylineColor = sky.nightAlpha > 0.4 ? '#0F172A' : '#64748B';
  const skylineColor2 = sky.nightAlpha > 0.4 ? '#1E293B' : '#94A3B8';
  const buildings = [
    { x: 30, w: 66, h: 150 },
    { x: 105, w: 54, h: 210 },
    { x: 170, w: 80, h: 130 },
    { x: 265, w: 60, h: 250 },
    { x: 340, w: 72, h: 175 },
    { x: width - 380, w: 74, h: 195 },
    { x: width - 290, w: 58, h: 245 },
    { x: width - 215, w: 84, h: 150 },
    { x: width - 115, w: 68, h: 210 },
  ];

  for (let bi = 0; bi < buildings.length; bi++) {
    const b = buildings[bi];
    ctx.fillStyle = bi % 2 === 0 ? skylineColor : skylineColor2;
    ctx.fillRect(b.x, horizonY - b.h, b.w, b.h + 200);
    // Flickering distant windows
    for (let wy = horizonY - b.h + 14; wy < horizonY - 24; wy += 18) {
      for (let wx = b.x + 10; wx < b.x + b.w - 14; wx += 14) {
        const seed = (wx * 13 + wy * 7 + Math.floor(nowSec * 0.6)) % 11;
        if (sky.nightAlpha > 0.25 && seed < 5) {
          ctx.fillStyle = seed === 0 ? '#FDE047' : '#F59E0B';
          ctx.fillRect(wx, wy, 6, 8);
        } else {
          ctx.fillStyle = sky.nightAlpha > 0.4 ? '#0F172A' : '#475569';
          ctx.fillRect(wx, wy, 6, 8);
        }
      }
    }
  }

  // 4. Camera World Transform
  ctx.save();
  const originX = Math.round(width * 0.5 + camera.x);
  const groundScreenY = Math.round(height * 0.80 + camera.y);
  ctx.translate(originX, groundScreenY);
  ctx.scale(camera.zoom, camera.zoom);

  const buildingW = SHAFT_W + maxSlots * SLOT_W;
  const buildingLeft = -Math.round(buildingW * 0.5);
  const slotStartX = buildingLeft + SHAFT_W;

  // Street & Sidewalk Base (wide)
  ctx.fillStyle = '#44403C'; // Sidewalk
  ctx.fillRect(-1600, 0, 3200, 22);
  ctx.fillStyle = '#57534E';
  ctx.fillRect(-1600, 0, 3200, 4);
  ctx.fillStyle = '#1C1917'; // Asphalt road
  ctx.fillRect(-1600, 22, 3200, 120);
  // Dashed road markings
  ctx.fillStyle = '#FACC15';
  for (let rx = -1500; rx < 1500; rx += 54) {
    ctx.fillRect(rx, 46, 26, 4);
  }

  // Exterior Ground Facilities: Parking Lot (left) & Garden / Pool (right)
  if (state.facilities.PARKING.built) {
    const px = buildingLeft - 148;
    ctx.fillStyle = '#292524';
    ctx.fillRect(px, -6, 138, 28);
    ctx.fillStyle = '#EAB308';
    ctx.fillRect(px + 6, -4, 4, 22);
    ctx.fillRect(px + 68, -4, 4, 22);
    ctx.fillRect(px + 130, -4, 4, 22);
    drawPixelCar(ctx, px + 14, -14, 1, '#3B82F6', false);
    drawPixelCar(ctx, px + 78, -14, 1, '#10B981', false);
    // Parking Booth
    ctx.fillStyle = '#B45309';
    ctx.fillRect(px - 22, -32, 22, 32);
    ctx.fillStyle = '#38BDF8';
    ctx.fillRect(px - 18, -26, 14, 10);
  }

  if (state.facilities.GARDEN.built) {
    const gx = buildingLeft + buildingW + 12;
    ctx.fillStyle = '#15803D';
    ctx.fillRect(gx, -8, 130, 8);
    drawPixelTree(ctx, gx + 20, -8);
    drawPixelTree(ctx, gx + 96, -8);
    // Wooden bench
    ctx.fillStyle = '#92400E';
    ctx.fillRect(gx + 48, -14, 30, 6);
    ctx.fillRect(gx + 50, -8, 4, 8);
    ctx.fillRect(gx + 72, -8, 4, 8);
  }

  if (state.facilities.POOL.built) {
    const poolX = buildingLeft + buildingW + (state.facilities.GARDEN.built ? 154 : 16);
    ctx.fillStyle = '#E7E5E4';
    ctx.fillRect(poolX, -8, 126, 12);
    ctx.fillStyle = '#0284C7';
    ctx.fillRect(poolX + 6, -6, 114, 8);
    // Animated water shimmer
    ctx.fillStyle = '#7DD3FC';
    const shimmer = Math.round((nowSec * 12) % 24);
    ctx.fillRect(poolX + 12 + shimmer, -4, 16, 2);
    ctx.fillRect(poolX + 64 - shimmer * 0.5, -2, 18, 2);
  }

  // Sidewalk Trees & Streetlamps
  const lampPositions = [buildingLeft - 190, buildingLeft - 40, buildingLeft + buildingW + 30, buildingLeft + buildingW + 190];
  for (const lx of lampPositions) {
    ctx.fillStyle = '#292524';
    ctx.fillRect(lx, -56, 4, 56);
    ctx.fillRect(lx - 4, -58, 12, 4);
    ctx.fillStyle = sky.nightAlpha > 0.25 ? '#FDE047' : '#CBD5E1';
    ctx.fillRect(lx - 2, -54, 8, 6);
    if (sky.nightAlpha > 0.25) {
      ctx.save();
      ctx.globalAlpha = 0.22 * sky.nightAlpha;
      ctx.fillStyle = '#FDE047';
      ctx.beginPath();
      ctx.arc(lx + 2, -50, 32, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Building Exterior Shell
  const totalHeight = (state.totalFloors + 1) * FLOOR_H;
  const brickBase = state.upgrades.WALLS >= 4 ? '#9A3412' : state.upgrades.WALLS >= 2 ? '#B45309' : '#A16207';
  const brickTrim = state.upgrades.DECOR >= 3 ? '#F59E0B' : '#78350F';

  // Building foundation & outer brick border
  ctx.fillStyle = '#292524';
  ctx.fillRect(buildingLeft - 10, -totalHeight - 14, buildingW + 20, totalHeight + 14);
  ctx.fillStyle = brickBase;
  ctx.fillRect(buildingLeft - 6, -totalHeight - 10, buildingW + 12, totalHeight + 10);

  // Decorative cornice & roof trim
  ctx.fillStyle = brickTrim;
  ctx.fillRect(buildingLeft - 12, -totalHeight - 18, buildingW + 24, 10);

  // Rooftop Sky Lounge or Roof Details
  const roofY = -totalHeight - 18;
  if (state.facilities.ROOFTOP.built) {
    // Pergola & string lights
    ctx.fillStyle = '#57534E';
    ctx.fillRect(buildingLeft + 24, roofY - 36, 6, 36);
    ctx.fillRect(buildingLeft + buildingW - 30, roofY - 36, 6, 36);
    ctx.fillStyle = '#78350F';
    ctx.fillRect(buildingLeft + 20, roofY - 40, buildingW - 40, 5);
    // Twinkling string lights
    for (let sx = buildingLeft + 36; sx < buildingLeft + buildingW - 36; sx += 22) {
      const lit = Math.sin(nowSec * 3 + sx) > -0.3;
      ctx.fillStyle = lit ? '#FDE047' : '#F59E0B';
      ctx.fillRect(sx, roofY - 33, 5, 5);
    }
    drawPixelTree(ctx, buildingLeft + 54, roofY);
    drawPixelTree(ctx, buildingLeft + buildingW - 60, roofY);
  } else {
    // Classic roof railing + water tank / solar
    ctx.fillStyle = '#44403C';
    ctx.fillRect(buildingLeft, roofY - 12, buildingW, 3);
    for (let rx = buildingLeft; rx <= buildingLeft + buildingW; rx += 28) {
      ctx.fillRect(rx, roofY - 12, 3, 12);
    }
    ctx.fillStyle = '#64748B';
    ctx.fillRect(buildingLeft + 24, roofY - 32, 34, 32);
    ctx.fillStyle = '#334155';
    ctx.fillRect(buildingLeft + 22, roofY - 36, 38, 6);
  }

  // Solar panel investment visual
  if (state.investments.some((i) => i.id === 'inv_solar' && i.owned)) {
    ctx.fillStyle = '#1D4ED8';
    ctx.fillRect(buildingLeft + buildingW - 92, roofY - 16, 64, 12);
    ctx.fillStyle = '#93C5FD';
    ctx.fillRect(buildingLeft + buildingW - 88, roofY - 14, 24, 3);
    ctx.fillRect(buildingLeft + buildingW - 58, roofY - 14, 24, 3);
  }

  // Ground Floor (Lobby & Ground Facilities)
  const f0Top = -FLOOR_H;
  ctx.fillStyle = '#FEF3C7';
  ctx.fillRect(slotStartX, f0Top + 6, maxSlots * SLOT_W, FLOOR_H - 10);
  // Checkered marble lobby floor
  for (let tx = slotStartX; tx < slotStartX + maxSlots * SLOT_W; tx += 16) {
    ctx.fillStyle = (Math.floor(tx / 16) % 2 === 0) ? '#E7E5E4' : '#D6D3D1';
    ctx.fillRect(tx, -10, 16, 10);
  }
  // Entrance Glass Doors
  const doorX = slotStartX + Math.round(maxSlots * SLOT_W * 0.5) - 24;
  ctx.fillStyle = '#0EA5E9';
  ctx.fillRect(doorX, -48, 48, 44);
  ctx.fillStyle = '#7DD3FC';
  ctx.fillRect(doorX + 6, -42, 14, 34);
  ctx.fillRect(doorX + 28, -42, 14, 34);
  ctx.fillStyle = '#B45309';
  ctx.fillRect(doorX - 4, -52, 56, 6);

  // Receptionist Desk
  if (state.facilities.RECEPTIONIST.built) {
    ctx.fillStyle = '#78350F';
    ctx.fillRect(slotStartX + 12, -28, 54, 22);
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(slotStartX + 16, -24, 46, 4);
    // Computer monitor
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(slotStartX + 30, -40, 16, 12);
    ctx.fillStyle = '#38BDF8';
    ctx.fillRect(slotStartX + 32, -38, 12, 8);
  }

  // Coin Laundry on Ground Floor right
  if (state.facilities.LAUNDRY.built && maxSlots >= 3) {
    const lx = slotStartX + (maxSlots - 1) * SLOT_W + 10;
    for (let w = 0; w < 3; w++) {
      ctx.fillStyle = '#E2E8F0';
      ctx.fillRect(lx + w * 32, -34, 26, 28);
      ctx.fillStyle = '#0284C7';
      ctx.fillRect(lx + w * 32 + 6, -26, 14, 14);
      ctx.fillStyle = '#BAE6FD';
      const spinOffset = Math.round(Math.sin(nowSec * 6 + w) * 2);
      ctx.fillRect(lx + w * 32 + 10 + spinOffset, -22, 6, 6);
    }
  }

  // Pixel Cafe awning on Ground Floor
  if (state.facilities.CAFE.built) {
    const cx = slotStartX + 86;
    ctx.fillStyle = '#DC2626';
    ctx.fillRect(cx, f0Top + 14, 68, 10);
    ctx.fillStyle = '#FFFFFF';
    for (let s = 0; s < 68; s += 16) ctx.fillRect(cx + s, f0Top + 14, 8, 10);
    ctx.fillStyle = '#92400E';
    ctx.fillRect(cx + 10, -24, 44, 18);
  }

  // Vending machines in lobby
  for (let vm = 0; vm < Math.min(3, state.vendingMachines); vm++) {
    const vx = slotStartX + maxSlots * SLOT_W - 28 - vm * 24;
    ctx.fillStyle = '#DC2626';
    ctx.fillRect(vx, -42, 18, 36);
    ctx.fillStyle = '#BAE6FD';
    ctx.fillRect(vx + 3, -38, 12, 16);
  }

  // Elevator Shaft (Left side of building)
  ctx.fillStyle = '#1C1917';
  ctx.fillRect(buildingLeft, -totalHeight, SHAFT_W - 4, totalHeight);
  ctx.fillStyle = '#44403C';
  ctx.fillRect(buildingLeft + SHAFT_W - 6, -totalHeight, 4, totalHeight);

  // Upper Floors & Rooms
  for (let floor = 1; floor <= state.totalFloors; floor++) {
    const floorTop = -(floor + 1) * FLOOR_H;
    const floorBottom = -floor * FLOOR_H;

    // Floor slab divider
    ctx.fillStyle = '#44403C';
    ctx.fillRect(buildingLeft, floorBottom - 6, buildingW, 6);

    // Draw empty slots background + clickable regions
    for (let slot = 0; slot < maxSlots; slot++) {
      const sx = slotStartX + slot * SLOT_W;
      const roomCovering = state.rooms.find(
        (r) => r.floor === floor && slot >= r.slotStart && slot < r.slotStart + r.slotSpan
      );

      // Check indoor facility occupying floor 1
      const facGym = floor === 1 && slot === 2 && state.facilities.GYM.built;
      const facPlay = floor === 1 && slot === 0 && state.facilities.PLAYROOM.built;

      if (!roomCovering && !facGym && !facPlay) {
        const key = `${floor}_${slot}`;
        const isHov = hoveredSlotKey === key;
        ctx.fillStyle = isHov ? '#44403C' : '#292524';
        ctx.fillRect(sx + 2, floorTop + 6, SLOT_W - 4, FLOOR_H - 12);
        ctx.strokeStyle = isHov ? '#F59E0B' : '#57534E';
        ctx.lineWidth = 2;
        ctx.strokeRect(sx + 6, floorTop + 10, SLOT_W - 12, FLOOR_H - 20);

        if (!isMenuMode) {
          ctx.fillStyle = isHov ? '#FDE047' : '#A8A29E';
          ctx.font = 'bold 11px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`+ F${floor} SLOT`, sx + SLOT_W * 0.5, floorTop + FLOOR_H * 0.5 + 4);

          hitRegions.push({
            type: 'EMPTY_SLOT',
            floor,
            slot,
            screenX: originX + sx * camera.zoom,
            screenY: groundScreenY + floorTop * camera.zoom,
            screenW: SLOT_W * camera.zoom,
            screenH: FLOOR_H * camera.zoom,
          });
        }
      }
    }

    // Draw Indoor Facilities (Gym / Playroom)
    if (floor === 1 && state.facilities.PLAYROOM.built) {
      drawIndoorFacility(ctx, slotStartX, floorTop, SLOT_W, FLOOR_H, 'PLAYROOM');
    }
    if (floor === 1 && state.facilities.GYM.built) {
      drawIndoorFacility(ctx, slotStartX + 2 * SLOT_W, floorTop, SLOT_W, FLOOR_H, 'GYM');
    }

    // Draw Rooms on this floor
    const floorRooms = state.rooms.filter((r) => r.floor === floor);
    for (const room of floorRooms) {
      const rx = slotStartX + room.slotStart * SLOT_W;
      const rw = room.slotSpan * SLOT_W;
      drawRoom(ctx, room, rx, floorTop, rw, FLOOR_H, sky.nightAlpha, selectedRoomId === room.id, nowSec);

      if (!isMenuMode) {
        hitRegions.push({
          type: 'ROOM',
          roomId: room.id,
          floor,
          slot: room.slotStart,
          screenX: originX + rx * camera.zoom,
          screenY: groundScreenY + floorTop * camera.zoom,
          screenW: rw * camera.zoom,
          screenH: FLOOR_H * camera.zoom,
        });
      }
    }
  }

  // Draw Moving Elevator Cab
  const cabY = -state.elevator.currentFloor * FLOOR_H - FLOOR_H + 14;
  ctx.fillStyle = '#78716C';
  ctx.fillRect(buildingLeft + SHAFT_W * 0.5 - 2, -totalHeight, 4, cabY + totalHeight);
  ctx.fillStyle = state.facilities.ELEVATOR.built ? '#F59E0B' : '#57534E';
  ctx.fillRect(buildingLeft + 6, cabY, SHAFT_W - 14, FLOOR_H - 20);
  ctx.fillStyle = '#FEF3C7';
  ctx.fillRect(buildingLeft + 10, cabY + 6, SHAFT_W - 22, FLOOR_H - 34);

  // Draw Staff & Tenants inside building
  for (const st of state.staff) {
    const px = slotStartX + st.x * SLOT_W;
    const py = -st.currentFloor * FLOOR_H - 8;
    drawPixelStaff(ctx, st, px, py);
  }

  for (const t of state.tenants) {
    const px = t.insideElevator || t.waitingElevator ? buildingLeft + SHAFT_W * 0.5 : slotStartX + t.x * SLOT_W;
    const py = -t.y * FLOOR_H - 8;
    drawPixelTenant(ctx, t, px, py, engine.settings.showBubbles && !isMenuMode);
  }

  // Draw Street Walkers & Moving Vehicles on the road
  for (const sw of engine.streetWalkers) {
    const leg = Math.sin(sw.walkPhase) > 0 ? 2 : -2;
    ctx.fillStyle = sw.shirtColor;
    ctx.fillRect(Math.round(sw.x) - 4, -20, 8, 10);
    ctx.fillStyle = '#FDE2C8';
    ctx.fillRect(Math.round(sw.x) - 3, -27, 6, 7);
    ctx.fillStyle = sw.hairColor;
    ctx.fillRect(Math.round(sw.x) - 4, -29, 8, 3);
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(Math.round(sw.x) - 3, -10, 3, 10 + leg);
    ctx.fillRect(Math.round(sw.x) + 1, -10, 3, 10 - leg);
  }

  for (const v of engine.streetVehicles) {
    const vx = Math.round(v.x - 500);
    if (v.kind === 'SCOOTER') {
      drawPixelScooter(ctx, vx, 32, v.direction, v.color, sky.nightAlpha > 0.35);
    } else {
      drawPixelCar(ctx, vx, 30, v.direction, v.color, sky.nightAlpha > 0.35);
    }
  }

  // Floating "+$280" / "LEVEL UP" Feedback Text
  for (const ft of engine.floatingTexts) {
    const alpha = Math.max(0, Math.min(1, ft.life / ft.maxLife));
    const fx = slotStartX + ft.x * SLOT_W;
    const fy = -ft.floor * FLOOR_H - 52 - (1 - alpha) * 24;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#0C0A09';
    ctx.fillText(ft.text, fx + 1, fy + 1);
    ctx.fillStyle = ft.color;
    ctx.fillText(ft.text, fx, fy);
    ctx.restore();
  }

  ctx.restore();

  // 5. Screen-Space Pixel Rain Overlay
  if (isRainy) {
    ctx.save();
    ctx.strokeStyle = 'rgba(186, 230, 253, 0.55)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (const r of engine.rainDrops) {
      const rx = r.x % width;
      const ry = r.y % height;
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - 2, ry + r.len);
    }
    ctx.stroke();
    ctx.restore();
  }

  return hitRegions;
}

function drawRoom(
  ctx: CanvasRenderingContext2D,
  room: Room,
  rx: number,
  ry: number,
  rw: number,
  rh: number,
  nightAlpha: number,
  isSelected: boolean,
  nowSec: number
) {
  const theme = INTERIOR_THEMES[room.theme] ?? INTERIOR_THEMES.COZY_CREAM;
  const pad = 3;
  const x = rx + pad;
  const y = ry + 6;
  const w = rw - pad * 2;
  const h = rh - 12;

  // Wall & Floor
  ctx.fillStyle = theme.wallColor;
  ctx.fillRect(x, y, w, h - 10);
  ctx.fillStyle = theme.trimColor;
  ctx.fillRect(x, y, w, 5);
  ctx.fillStyle = theme.floorColor;
  ctx.fillRect(x, y + h - 10, w, 10);

  // Rear Window showing sky/night glow
  const winX = x + Math.round(w * 0.5) - 14;
  const winY = y + 12;
  ctx.fillStyle = '#44403C';
  ctx.fillRect(winX - 2, winY - 2, 32, 26);
  ctx.fillStyle = room.lightOn ? '#FEF08A' : nightAlpha > 0.4 ? '#1E293B' : '#BAE6FD';
  ctx.fillRect(winX, winY, 28, 22);
  ctx.fillStyle = '#44403C';
  ctx.fillRect(winX + 13, winY, 2, 22);
  ctx.fillRect(winX, winY + 10, 28, 2);

  // Furniture inside room
  room.furniture.forEach((item, idx) => {
    drawFurnitureSprite(ctx, item, x + 8 + idx * 28, y + h - 10, rw);
  });

  // Warm interior lighting overlay when dark
  if (nightAlpha > 0.25) {
    ctx.save();
    if (room.lightOn) {
      ctx.fillStyle = 'rgba(253, 224, 71, 0.16)';
      ctx.fillRect(x, y, w, h);
    } else {
      ctx.fillStyle = `rgba(15, 23, 42, ${0.42 * nightAlpha})`;
      ctx.fillRect(x, y, w, h);
    }
    ctx.restore();
  }

  // Dirty dust specks if cleanliness < 55
  if (room.cleanliness < 55) {
    ctx.fillStyle = '#78716C';
    ctx.fillRect(x + 16, y + h - 14, 4, 3);
    ctx.fillRect(x + w - 28, y + h - 15, 5, 3);
  }

  // Damaged icon blink if condition < 45
  if (room.condition < 45 && Math.sin(nowSec * 5) > 0) {
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(x + w - 18, y + 8, 12, 12);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + w - 13, y + 10, 2, 5);
    ctx.fillRect(x + w - 13, y + 17, 2, 2);
  }

  // Room Number Plaque
  ctx.fillStyle = 'rgba(28, 25, 23, 0.85)';
  ctx.fillRect(x + 4, y + 6, 32, 13);
  ctx.fillStyle = '#FEF3C7';
  ctx.font = 'bold 10px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(room.number, x + 7, y + 16);

  // Occupancy dot bar
  for (let c = 0; c < room.capacity; c++) {
    ctx.fillStyle = c < room.tenantIds.length ? '#10B981' : '#57534E';
    ctx.fillRect(x + 40 + c * 7, y + 10, 5, 5);
  }

  // Selection Outline
  if (isSelected) {
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 3;
    ctx.strokeRect(x - 1, y - 1, w + 2, h + 2);
  }
}

function drawFurnitureSprite(
  ctx: CanvasRenderingContext2D,
  item: FurnitureItem,
  fx: number,
  floorY: number,
  roomW: number
) {
  const x = Math.min(fx, fx + roomW - 36);
  switch (item.type) {
    case 'BED':
      ctx.fillStyle = '#78350F';
      ctx.fillRect(x, floorY - 14, 32, 14);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x + 2, floorY - 16, 10, 6);
      ctx.fillStyle = item.level >= 2 ? '#EC4899' : '#3B82F6';
      ctx.fillRect(x + 12, floorY - 15, 18, 8);
      break;
    case 'SOFA':
      ctx.fillStyle = item.level >= 2 ? '#B45309' : '#15803D';
      ctx.fillRect(x, floorY - 16, 26, 12);
      ctx.fillRect(x - 2, floorY - 12, 4, 12);
      ctx.fillRect(x + 24, floorY - 12, 4, 12);
      break;
    case 'DESK':
      ctx.fillStyle = '#92400E';
      ctx.fillRect(x, floorY - 14, 24, 4);
      ctx.fillRect(x + 2, floorY - 10, 3, 10);
      ctx.fillRect(x + 19, floorY - 10, 3, 10);
      ctx.fillStyle = '#38BDF8';
      ctx.fillRect(x + 6, floorY - 22, 12, 8);
      break;
    case 'KITCHEN':
      ctx.fillStyle = '#E2E8F0';
      ctx.fillRect(x, floorY - 18, 24, 18);
      ctx.fillStyle = '#475569';
      ctx.fillRect(x + 2, floorY - 20, 20, 3);
      break;
    case 'TV':
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(x, floorY - 28, 22, 14);
      ctx.fillStyle = '#38BDF8';
      ctx.fillRect(x + 2, floorY - 26, 18, 10);
      break;
    case 'PLANT':
      ctx.fillStyle = '#B45309';
      ctx.fillRect(x + 4, floorY - 10, 10, 10);
      ctx.fillStyle = '#16A34A';
      ctx.fillRect(x + 2, floorY - 22, 14, 12);
      break;
    case 'AC':
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(x, floorY - 52, 24, 9);
      ctx.fillStyle = '#38BDF8';
      ctx.fillRect(x + 4, floorY - 45, 16, 2);
      break;
    case 'CHANDELIER':
      ctx.fillStyle = '#FDE047';
      ctx.fillRect(x + 6, floorY - 60, 14, 8);
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(x + 11, floorY - 66, 4, 6);
      break;
  }
}

function drawIndoorFacility(
  ctx: CanvasRenderingContext2D,
  rx: number,
  ry: number,
  rw: number,
  rh: number,
  kind: 'GYM' | 'PLAYROOM'
) {
  const x = rx + 3;
  const y = ry + 6;
  const w = rw - 6;
  const h = rh - 12;

  ctx.fillStyle = kind === 'GYM' ? '#1E293B' : '#FEF9C3';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = kind === 'GYM' ? '#334155' : '#F59E0B';
  ctx.fillRect(x, y + h - 8, w, 8);

  if (kind === 'GYM') {
    // Treadmill & dumbbell rack
    ctx.fillStyle = '#64748B';
    ctx.fillRect(x + 14, y + h - 18, 28, 10);
    ctx.fillRect(x + 36, y + h - 34, 6, 18);
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(x + 64, y + h - 22, 26, 6);
    ctx.fillStyle = '#F8FAFC';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('GYM', x + 8, y + 16);
  } else {
    // Arcade cabinet & play mat
    ctx.fillStyle = '#EC4899';
    ctx.fillRect(x + 16, y + h - 34, 18, 26);
    ctx.fillStyle = '#38BDF8';
    ctx.fillRect(x + 19, y + h - 30, 12, 10);
    ctx.fillStyle = '#10B981';
    ctx.fillRect(x + 56, y + h - 14, 34, 6);
    ctx.fillStyle = '#78350F';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('PLAY', x + 8, y + 16);
  }
}

function drawPixelTenant(ctx: CanvasRenderingContext2D, t: Tenant, px: number, py: number, showBubble: boolean) {
  const x = Math.round(px);
  const y = Math.round(py);
  const legOffset = t.activity === 'WALKING' ? Math.round(Math.sin(t.walkPhase) * 2) : 0;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(x - 6, y - 1, 12, 3);

  // Legs
  ctx.fillStyle = t.appearance.pantsColor;
  ctx.fillRect(x - 4, y - 10, 3, 10 + legOffset);
  ctx.fillRect(x + 1, y - 10, 3, 10 - legOffset);

  // Torso
  ctx.fillStyle = t.appearance.shirtColor;
  ctx.fillRect(x - 5, y - 20, 10, 10);

  // Head
  ctx.fillStyle = t.appearance.skinColor;
  ctx.fillRect(x - 4, y - 28, 8, 8);

  // Hair
  ctx.fillStyle = t.appearance.hairColor;
  ctx.fillRect(x - 5, y - 31, 10, 4);
  if (t.appearance.hairStyle % 2 === 0) {
    ctx.fillRect(x - 5, y - 28, 2, 5);
    ctx.fillRect(x + 3, y - 28, 2, 5);
  }

  // Eyes / Glasses
  ctx.fillStyle = t.appearance.hasGlasses ? '#0F172A' : '#1C1917';
  const eyeX = t.facing === 1 ? x + 1 : x - 3;
  ctx.fillRect(eyeX, y - 25, 2, 2);

  // Bubble icon
  if (showBubble && t.bubbleIcon) {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x - 7, y - 46, 14, 12);
    ctx.strokeStyle = '#1C1917';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 7, y - 46, 14, 12);
    ctx.fillStyle =
      t.bubbleIcon === 'heart'
        ? '#E11D48'
        : t.bubbleIcon === 'zzz'
          ? '#6366F1'
          : t.bubbleIcon === 'coffee'
            ? '#92400E'
            : '#D97706';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    const sym =
      t.bubbleIcon === 'heart'
        ? '♥'
        : t.bubbleIcon === 'zzz'
          ? 'z'
          : t.bubbleIcon === 'music'
            ? '♪'
            : t.bubbleIcon === 'coffee'
              ? '☕'
              : '!';
    ctx.fillText(sym, x, y - 37);
  }
}

function drawPixelStaff(ctx: CanvasRenderingContext2D, st: StaffMember, px: number, py: number) {
  const x = Math.round(px);
  const y = Math.round(py);
  const legOffset = Math.round(Math.sin(st.walkPhase) * 2);

  const uniform =
    st.role === 'CLEANER'
      ? '#0EA5E9'
      : st.role === 'TECHNICIAN'
        ? '#F97316'
        : st.role === 'SECURITY'
          ? '#1E293B'
          : '#7C3AED';

  ctx.fillStyle = '#1E293B';
  ctx.fillRect(x - 4, y - 10, 3, 10 + legOffset);
  ctx.fillRect(x + 1, y - 10, 3, 10 - legOffset);
  ctx.fillStyle = uniform;
  ctx.fillRect(x - 5, y - 20, 10, 10);
  ctx.fillStyle = '#F2C6A0';
  ctx.fillRect(x - 4, y - 28, 8, 8);
  // Staff cap
  ctx.fillStyle = uniform;
  ctx.fillRect(x - 5, y - 32, 10, 4);
}

function drawPixelTree(ctx: CanvasRenderingContext2D, tx: number, ty: number) {
  ctx.fillStyle = '#78350F';
  ctx.fillRect(tx - 3, ty - 18, 6, 18);
  ctx.fillStyle = '#15803D';
  ctx.fillRect(tx - 12, ty - 38, 24, 22);
  ctx.fillStyle = '#22C55E';
  ctx.fillRect(tx - 8, ty - 42, 16, 12);
}

function drawPixelCar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  dir: 1 | -1,
  color: string,
  headlights: boolean
) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y - 14, 44, 12);
  ctx.fillRect(x + 8, y - 22, 26, 9);
  ctx.fillStyle = '#BAE6FD';
  ctx.fillRect(x + 11, y - 20, 9, 6);
  ctx.fillRect(x + 22, y - 20, 9, 6);
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(x + 6, y - 4, 8, 8);
  ctx.fillRect(x + 30, y - 4, 8, 8);
  if (headlights) {
    ctx.fillStyle = 'rgba(254, 240, 138, 0.55)';
    const hx = dir === 1 ? x + 44 : x - 26;
    ctx.fillRect(hx, y - 10, 26, 6);
  }
}

function drawPixelScooter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  dir: 1 | -1,
  color: string,
  headlights: boolean
) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y - 10, 22, 7);
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(x + 2, y - 4, 6, 6);
  ctx.fillRect(x + 14, y - 4, 6, 6);
  // Rider
  ctx.fillStyle = '#E11D48';
  ctx.fillRect(x + 7, y - 22, 8, 12);
  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(x + 7, y - 29, 8, 7);
  if (headlights) {
    ctx.fillStyle = 'rgba(254, 240, 138, 0.55)';
    ctx.fillRect(dir === 1 ? x + 22 : x - 18, y - 9, 18, 4);
  }
}

export function renderPixelPortrait(canvas: HTMLCanvasElement, tenant: Tenant) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.imageSmoothingEnabled = false;
  const w = canvas.width;
  const h = canvas.height;

  // Background portrait card
  ctx.fillStyle = '#292524';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#44403C';
  ctx.fillRect(2, 2, w - 4, h - 4);

  const u = Math.floor(w / 12);
  // Shoulders
  ctx.fillStyle = tenant.appearance.shirtColor;
  ctx.fillRect(u * 2, u * 8, u * 8, u * 4);
  // Neck & Head
  ctx.fillStyle = tenant.appearance.skinColor;
  ctx.fillRect(u * 5, u * 7, u * 2, u * 2);
  ctx.fillRect(u * 3, u * 3, u * 6, u * 5);
  // Hair
  ctx.fillStyle = tenant.appearance.hairColor;
  ctx.fillRect(u * 2, u * 2, u * 8, u * 2);
  if (tenant.appearance.hairStyle % 2 === 0) {
    ctx.fillRect(u * 2, u * 3, u, u * 4);
    ctx.fillRect(u * 9, u * 3, u, u * 4);
  }
  // Eyes
  ctx.fillStyle = '#1C1917';
  ctx.fillRect(u * 4, u * 5, u, u);
  ctx.fillRect(u * 7, u * 5, u, u);
  if (tenant.appearance.hasGlasses) {
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 2;
    ctx.strokeRect(u * 3.6, u * 4.7, u * 1.8, u * 1.5);
    ctx.strokeRect(u * 6.6, u * 4.7, u * 1.8, u * 1.5);
  }
  // Mouth based on satisfaction
  ctx.fillStyle = tenant.satisfaction >= 50 ? '#B91C1C' : '#57534E';
  ctx.fillRect(u * 5, u * 7, u * 2, Math.max(2, Math.floor(u * 0.4)));
}
