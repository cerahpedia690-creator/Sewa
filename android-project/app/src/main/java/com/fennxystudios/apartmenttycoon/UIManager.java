package com.fennxystudios.apartmenttycoon;

import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.RectF;

public class UIManager {
    private final Paint paint = new Paint();
    private final RectF speedBtn = new RectF();
    private final RectF buildFloorBtn = new RectF();
    private final RectF buildRoomBtn = new RectF();
    private final RectF menuBtn = new RectF();

    public UIManager() {
        paint.setAntiAlias(false);
    }

    public void render(Canvas canvas, GameWorld world) {
        int w = canvas.getWidth();
        int h = canvas.getHeight();

        // Top HUD bar
        paint.setColor(Color.argb(230, 28, 25, 23));
        canvas.drawRect(0, 0, w, 58, paint);
        paint.setColor(Color.rgb(68, 64, 60));
        canvas.drawRect(0, 56, w, 58, paint);

        paint.setTextSize(20f);
        paint.setTextAlign(Paint.Align.LEFT);
        paint.setColor(Color.rgb(245, 158, 11));
        canvas.drawText("$" + world.economy.balance, 18f, 36f, paint);

        paint.setColor(Color.rgb(245, 245, 244));
        canvas.drawText(world.time.getFormattedClock(), 150f, 36f, paint);

        paint.setColor(Color.rgb(56, 189, 248));
        canvas.drawText("Lv." + world.level + "  Tenants:" + world.tenantManager.tenants.size() + "  Rep:" + world.reputation, 480f, 36f, paint);

        // Speed toggle & Menu buttons
        speedBtn.set(w - 220f, 10f, w - 115f, 48f);
        menuBtn.set(w - 105f, 10f, w - 14f, 48f);
        drawBtn(canvas, speedBtn, "Speed: " + world.time.speed.name());
        drawBtn(canvas, menuBtn, "Menu");

        // Bottom compact dock
        buildFloorBtn.set(18f, h - 56f, 210f, h - 12f);
        buildRoomBtn.set(222f, h - 56f, 420f, h - 12f);
        drawBtn(canvas, buildFloorBtn, "+Floor ($" + world.building.getNextFloorCost() + ")");
        drawBtn(canvas, buildRoomBtn, "+Studio ($1200)");
    }

    private void drawBtn(Canvas canvas, RectF r, String label) {
        paint.setColor(Color.rgb(41, 37, 36));
        canvas.drawRect(r, paint);
        paint.setStyle(Paint.Style.STROKE);
        paint.setStrokeWidth(2f);
        paint.setColor(Color.rgb(120, 113, 108));
        canvas.drawRect(r, paint);
        paint.setStyle(Paint.Style.FILL);
        paint.setColor(Color.rgb(254, 243, 199));
        paint.setTextAlign(Paint.Align.CENTER);
        paint.setTextSize(17f);
        canvas.drawText(label, r.centerX(), r.centerY() + 6f, paint);
    }

    public boolean handleTap(float x, float y, GameWorld world, MainGame game) {
        if (speedBtn.contains(x, y)) {
            TimeManager.Speed[] vals = TimeManager.Speed.values();
            world.time.speed = vals[(world.time.speed.ordinal() + 1) % vals.length];
            return true;
        }
        if (menuBtn.contains(x, y)) {
            game.saveManager.autoSave(world);
            game.switchScreen(MainGame.ScreenType.MAIN_MENU);
            return true;
        }
        if (buildFloorBtn.contains(x, y)) {
            world.building.buildFloor(world.economy, world.time.day);
            return true;
        }
        if (buildRoomBtn.contains(x, y)) {
            for (int f = 1; f <= world.building.totalFloors; f++) {
                for (int s = 0; s < world.building.getMaxSlots(); s++) {
                    RoomManager.Room built = world.roomManager.buildRoom(
                            f, s, RoomManager.RoomType.STUDIO, world.building, world.economy, world.time.day);
                    if (built != null) return true;
                }
            }
            return true;
        }
        return false;
    }
}
