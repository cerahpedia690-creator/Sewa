package com.fennxystudios.apartmenttycoon;

import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.RectF;
import android.view.MotionEvent;

import java.util.ArrayList;
import java.util.List;

public class MainMenuScreen {
    private final MainGame game;
    private final Paint paint = new Paint();
    private final List<MenuButton> buttons = new ArrayList<>();
    private boolean showAbout = false;
    private boolean showSettings = false;
    private boolean showLoadSlots = false;

    private static class MenuButton {
        String id;
        String label;
        RectF rect = new RectF();
        boolean enabled = true;

        MenuButton(String id, String label, boolean enabled) {
            this.id = id;
            this.label = label;
            this.enabled = enabled;
        }
    }

    public MainMenuScreen(MainGame game) {
        this.game = game;
        paint.setAntiAlias(false);
        buttons.add(new MenuButton("NEW", "New Game", true));
        buttons.add(new MenuButton("CONTINUE", "Continue", game.saveManager.hasAutoSave()));
        buttons.add(new MenuButton("LOAD", "Load Game", true));
        buttons.add(new MenuButton("SETTINGS", "Settings", true));
        buttons.add(new MenuButton("ABOUT", "About Developer", true));
        buttons.add(new MenuButton("EXIT", "Exit", true));
    }

    public void update(float dt) {
        game.world.tickAmbient(dt);
        for (MenuButton b : buttons) {
            if ("CONTINUE".equals(b.id)) {
                b.enabled = game.saveManager.hasAutoSave();
            }
        }
    }

    public void render(Canvas canvas) {
        int w = canvas.getWidth();
        int h = canvas.getHeight();
        game.world.renderBackgroundOnly(canvas, w, h);

        // Logo lockup in upper calm negative space
        paint.setTextAlign(Paint.Align.CENTER);
        paint.setColor(Color.rgb(254, 243, 199));
        paint.setTextSize(Math.max(36, h * 0.075f));
        canvas.drawText("APARTMENT TYCOON", w * 0.5f, h * 0.16f, paint);

        paint.setColor(Color.rgb(245, 158, 11));
        paint.setTextSize(Math.max(20, h * 0.04f));
        canvas.drawText("PIXEL LIFE · BY FENNXY STUDIOS", w * 0.5f, h * 0.22f, paint);

        // Layout menu buttons
        float btnW = Math.min(340, w * 0.34f);
        float btnH = Math.max(48, h * 0.075f);
        float gap = 10f;
        float startY = h * 0.30f;

        for (int i = 0; i < buttons.size(); i++) {
            MenuButton b = buttons.get(i);
            float left = w * 0.5f - btnW * 0.5f;
            float top = startY + i * (btnH + gap);
            b.rect.set(left, top, left + btnW, top + btnH);

            paint.setColor(b.enabled ? Color.rgb(28, 25, 23) : Color.rgb(41, 37, 36));
            canvas.drawRect(b.rect, paint);
            paint.setStyle(Paint.Style.STROKE);
            paint.setStrokeWidth(3f);
            paint.setColor("NEW".equals(b.id) ? Color.rgb(245, 158, 11) : Color.rgb(87, 83, 78));
            canvas.drawRect(b.rect, paint);
            paint.setStyle(Paint.Style.FILL);

            paint.setColor(b.enabled ? Color.rgb(254, 243, 199) : Color.rgb(120, 113, 108));
            paint.setTextSize(btnH * 0.44f);
            canvas.drawText(b.label, b.rect.centerX(), b.rect.centerY() + btnH * 0.15f, paint);
        }

        if (showAbout) {
            renderOverlayCard(canvas, "About Developer", "FennXy Studios — Native Android Java Engine (API 26+). Tap anywhere to close.");
        } else if (showSettings) {
            renderOverlayCard(canvas, "Settings", "Audio: Active | Weather: Dynamic | Auto-Save: Daily. Tap anywhere to close.");
        } else if (showLoadSlots) {
            renderOverlayCard(canvas, "Load Game", "Tap to load Auto-Save or start a New Game.");
        }
    }

    private void renderOverlayCard(Canvas canvas, String title, String body) {
        int w = canvas.getWidth();
        int h = canvas.getHeight();
        paint.setColor(Color.argb(180, 12, 10, 9));
        canvas.drawRect(0, 0, w, h, paint);
        RectF box = new RectF(w * 0.22f, h * 0.25f, w * 0.78f, h * 0.75f);
        paint.setColor(Color.rgb(28, 25, 23));
        canvas.drawRect(box, paint);
        paint.setColor(Color.rgb(245, 158, 11));
        paint.setTextSize(28f);
        canvas.drawText(title, box.centerX(), box.top + 56f, paint);
        paint.setColor(Color.rgb(245, 245, 244));
        paint.setTextSize(20f);
        canvas.drawText(body, box.centerX(), box.centerY(), paint);
    }

    public boolean onTouch(MotionEvent event) {
        if (event.getAction() != MotionEvent.ACTION_UP) return true;
        if (showAbout || showSettings || showLoadSlots) {
            if (showLoadSlots && game.saveManager.hasAutoSave()) {
                game.saveManager.loadAutoSave(game.world);
                game.switchScreen(MainGame.ScreenType.GAME);
            }
            showAbout = false;
            showSettings = false;
            showLoadSlots = false;
            return true;
        }
        float x = event.getX();
        float y = event.getY();
        for (MenuButton b : buttons) {
            if (b.enabled && b.rect.contains(x, y)) {
                switch (b.id) {
                    case "NEW":
                        game.world.resetNewGame();
                        game.switchScreen(MainGame.ScreenType.GAME);
                        break;
                    case "CONTINUE":
                        if (game.saveManager.loadAutoSave(game.world)) {
                            game.switchScreen(MainGame.ScreenType.GAME);
                        }
                        break;
                    case "LOAD":
                        showLoadSlots = true;
                        break;
                    case "SETTINGS":
                        showSettings = true;
                        break;
                    case "ABOUT":
                        showAbout = true;
                        break;
                    case "EXIT":
                        game.exitGame();
                        break;
                }
                break;
            }
        }
        return true;
    }
}
