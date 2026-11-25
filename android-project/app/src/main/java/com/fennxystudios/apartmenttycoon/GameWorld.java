package com.fennxystudios.apartmenttycoon;

import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;

public class GameWorld {
    public final AssetManager assets;
    public final SaveManager saveManager;
    public final CameraController camera = new CameraController();
    public final TimeManager time = new TimeManager();
    public final EconomyManager economy = new EconomyManager();
    public final BuildingManager building = new BuildingManager();
    public final RoomManager roomManager = new RoomManager();
    public final TenantManager tenantManager = new TenantManager();
    public final RelationshipManager relationships = new RelationshipManager();
    public final EventManager eventManager = new EventManager();
    public final FacilityManager facilityManager = new FacilityManager();
    public final StaffManager staffManager = new StaffManager();
    public final QuestManager questManager = new QuestManager();
    public final UIManager uiManager = new UIManager();

    public int level = 1;
    public int xp = 0;
    public int xpToNext = 250;
    public int reputation = 38;
    public boolean isRaining = false;

    private final Paint paint = new Paint();
    private float cloudOffset = 0f;
    private float carX = 0f;

    public GameWorld(AssetManager assets, SaveManager saveManager) {
        this.assets = assets;
        this.saveManager = saveManager;
        paint.setAntiAlias(false);
        resetNewGame();
    }

    public void resetNewGame() {
        economy.balance = 8500;
        economy.totalEarned = 0;
        level = 1;
        xp = 0;
        reputation = 38;
        time.day = 1;
        time.hour = 8;
        time.minute = 0;
        building.landPlots = 1;
        building.totalFloors = 2;
        roomManager.initStarterRooms();
        tenantManager.tenants.clear();
        facilityManager.reset();
        staffManager.staffList.clear();
        questManager.reset();

        TenantManager.Tenant starter = tenantManager.generateTenant(TenantManager.Archetype.STUDENT);
        tenantManager.moveIn(starter, roomManager.rooms.get(0), economy, 1);
    }

    public void onViewportResize(int w, int h) {
        // Responsive landscape scaling handled dynamically in render
    }

    public void tickAmbient(float dt) {
        cloudOffset += dt * 18f;
        carX += dt * 95f;
        time.tick(dt * 4f);
    }

    public void update(float dt) {
        tickAmbient(dt);
        boolean hourChanged = time.tick(dt);
        if (hourChanged && time.hour == 0) {
            onNewDay();
        }
        int maxSlots = building.getMaxSlots();
        for (TenantManager.Tenant t : tenantManager.tenants) {
            int homeFloor = 1;
            float homeX = 0.5f;
            for (RoomManager.Room r : roomManager.rooms) {
                if (r.id.equals(t.roomId)) {
                    homeFloor = r.floor;
                    homeX = r.slotStart + 0.5f;
                    break;
                }
            }
            t.ai.update(dt, time.hour, maxSlots, homeFloor, homeX);
        }
    }

    private void onNewDay() {
        for (RoomManager.Room r : roomManager.rooms) {
            if (!r.tenantIds.isEmpty()) {
                economy.recordIncome(time.day, "Rent Rm " + r.number, r.rentPrice / 4);
            }
        }
        int payroll = staffManager.getTotalPayroll();
        if (payroll > 0) economy.recordExpense(time.day, "Staff Payroll", payroll);
        questManager.evaluate(this);
        saveManager.autoSave(this);
    }

    public void gainXp(int amount) {
        xp += amount;
        while (xp >= xpToNext) {
            xp -= xpToNext;
            level++;
            xpToNext = (int) (xpToNext * 1.35f);
        }
    }

    public void handleWorldTap(float x, float y) {
        // Room selection hook
    }

    public void renderBackgroundOnly(Canvas canvas, int w, int h) {
        boolean night = time.hour >= 19 || time.hour < 6;
        canvas.drawColor(night ? Color.rgb(15, 23, 42) : Color.rgb(56, 189, 248));

        // Pixel clouds
        paint.setColor(night ? Color.rgb(51, 65, 85) : Color.WHITE);
        for (int i = 0; i < 4; i++) {
            float cx = (cloudOffset + i * 320f) % (w + 180f) - 90f;
            canvas.drawRect(cx, 60f + i * 28f, cx + 84f, 82f + i * 28f, paint);
        }

        // Road & Street car
        paint.setColor(Color.rgb(28, 25, 23));
        canvas.drawRect(0, h * 0.84f, w, h, paint);
        float vx = carX % (w + 120f) - 60f;
        paint.setColor(Color.rgb(220, 38, 38));
        canvas.drawRect(vx, h * 0.84f - 18f, vx + 48f, h * 0.84f, paint);

        renderBuilding(canvas, w, h, night);
    }

    public void render(Canvas canvas) {
        renderBackgroundOnly(canvas, canvas.getWidth(), canvas.getHeight());
    }

    private void renderBuilding(Canvas canvas, int w, int h, boolean night) {
        int slotW = 110;
        int floorH = 74;
        int slots = building.getMaxSlots();
        float bw = slots * slotW;
        float left = w * 0.5f - bw * 0.5f + camera.x;
        float groundY = h * 0.84f + camera.y;
        float totalH = (building.totalFloors + 1) * floorH;

        paint.setColor(Color.rgb(180, 83, 9));
        canvas.drawRect(left - 8f, groundY - totalH, left + bw + 8f, groundY, paint);

        for (RoomManager.Room r : roomManager.rooms) {
            float rx = left + r.slotStart * slotW + 4f;
            float ry = groundY - (r.floor + 1) * floorH + 6f;
            float rw = r.type.slotSpan * slotW - 8f;
            float rh = floorH - 12f;
            paint.setColor(Color.rgb(245, 230, 200));
            canvas.drawRect(rx, ry, rx + rw, ry + rh, paint);
            paint.setColor(night && !r.tenantIds.isEmpty() ? Color.rgb(253, 224, 71) : Color.rgb(186, 230, 253));
            canvas.drawRect(rx + rw * 0.5f - 14f, ry + 12f, rx + rw * 0.5f + 14f, ry + 34f, paint);
        }

        for (TenantManager.Tenant t : tenantManager.tenants) {
            float tx = left + t.ai.x * slotW;
            float ty = groundY - t.ai.y * floorH - 6f;
            paint.setColor(t.shirtColor);
            canvas.drawRect(tx - 6f, ty - 22f, tx + 6f, ty, paint);
            paint.setColor(Color.rgb(253, 226, 200));
            canvas.drawRect(tx - 5f, ty - 32f, tx + 5f, ty - 22f, paint);
        }
    }
}
