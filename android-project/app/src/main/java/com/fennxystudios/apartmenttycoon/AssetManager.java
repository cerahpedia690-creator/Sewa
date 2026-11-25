package com.fennxystudios.apartmenttycoon;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Rect;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

/**
 * Local AssetManager loading PNGs from assets/ subfolders with automatic
 * pixel-art Bitmap placeholder generation so sprites are swappable without code edits.
 */
public class AssetManager {
    private final Context context;
    private final Map<String, Bitmap> textures = new HashMap<>();
    private final Paint pixelPaint = new Paint();

    public static final String[] ASSET_FOLDERS = {
            "characters", "buildings", "rooms", "furniture",
            "facilities", "ui", "icons", "backgrounds",
            "effects", "animations", "portraits"
    };

    public AssetManager(Context context) {
        this.context = context;
        pixelPaint.setAntiAlias(false);
        pixelPaint.setFilterBitmap(false);
    }

    public void preloadDefaults() {
        loadOrCreate("characters/player_idle.png", 16, 24, Color.rgb(245, 158, 11));
        loadOrCreate("characters/tenant_worker_idle.png", 16, 24, Color.rgb(37, 99, 235));
        loadOrCreate("characters/tenant_student_idle.png", 16, 24, Color.rgb(16, 185, 129));
        loadOrCreate("buildings/apartment_exterior.png", 64, 64, Color.rgb(180, 83, 9));
        loadOrCreate("rooms/room_standard.png", 64, 48, Color.rgb(245, 230, 200));
        loadOrCreate("rooms/room_deluxe.png", 96, 48, Color.rgb(216, 226, 220));
        loadOrCreate("furniture/furniture_bed.png", 24, 16, Color.rgb(146, 64, 14));
        loadOrCreate("furniture/furniture_sofa.png", 24, 16, Color.rgb(21, 128, 61));
        loadOrCreate("icons/icon_money.png", 16, 16, Color.rgb(250, 204, 21));
        loadOrCreate("icons/icon_happiness.png", 16, 16, Color.rgb(16, 185, 129));
        loadOrCreate("ui/ui_button.png", 64, 24, Color.rgb(41, 37, 36));
        loadOrCreate("backgrounds/background_city.png", 128, 64, Color.rgb(30, 41, 59));
    }

    public Bitmap loadOrCreate(String assetPath, int w, int h, int baseColor) {
        if (textures.containsKey(assetPath)) {
            return textures.get(assetPath);
        }
        Bitmap bmp = null;
        try (InputStream is = context.getAssets().open(assetPath)) {
            BitmapFactory.Options opts = new BitmapFactory.Options();
            opts.inScaled = false;
            bmp = BitmapFactory.decodeStream(is, null, opts);
        } catch (IOException ignored) {
        }

        if (bmp == null) {
            bmp = generatePixelPlaceholder(w, h, baseColor);
        }
        textures.put(assetPath, bmp);
        return bmp;
    }

    private Bitmap generatePixelPlaceholder(int w, int h, int color) {
        Bitmap bmp = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888);
        Canvas c = new Canvas(bmp);
        Paint p = new Paint();
        p.setAntiAlias(false);
        p.setColor(color);
        c.drawRect(0, 0, w, h, p);
        p.setColor(Color.argb(90, 255, 255, 255));
        c.drawRect(0, 0, w, 2, p);
        p.setColor(Color.argb(120, 0, 0, 0));
        c.drawRect(0, h - 2, w, h, p);
        return bmp;
    }

    public void drawCrisp(Canvas canvas, String key, Rect dst) {
        Bitmap bmp = textures.get(key);
        if (bmp != null) {
            canvas.drawBitmap(bmp, null, dst, pixelPaint);
        }
    }

    public void dispose() {
        for (Bitmap b : textures.values()) {
            if (b != null && !b.isRecycled()) {
                b.recycle();
            }
        }
        textures.clear();
    }
}
