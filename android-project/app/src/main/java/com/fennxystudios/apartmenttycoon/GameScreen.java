package com.fennxystudios.apartmenttycoon;

import android.graphics.Canvas;
import android.view.MotionEvent;

public class GameScreen {
    private final MainGame game;
    private float lastTouchX = 0f;
    private float lastTouchY = 0f;
    private boolean dragging = false;
    private float dragDist = 0f;

    public GameScreen(MainGame game) {
        this.game = game;
    }

    public void update(float dt) {
        game.world.update(dt);
    }

    public void render(Canvas canvas) {
        game.world.render(canvas);
        game.world.uiManager.render(canvas, game.world);
    }

    public boolean onTouch(MotionEvent event) {
        float x = event.getX();
        float y = event.getY();

        switch (event.getActionMasked()) {
            case MotionEvent.ACTION_DOWN:
                lastTouchX = x;
                lastTouchY = y;
                dragDist = 0f;
                dragging = true;
                return true;

            case MotionEvent.ACTION_MOVE:
                if (dragging) {
                    float dx = x - lastTouchX;
                    float dy = y - lastTouchY;
                    dragDist += Math.abs(dx) + Math.abs(dy);
                    if (dragDist > 12f) {
                        game.world.camera.pan(dx, dy);
                    }
                    lastTouchX = x;
                    lastTouchY = y;
                }
                return true;

            case MotionEvent.ACTION_UP:
                dragging = false;
                if (dragDist <= 14f) {
                    if (!game.world.uiManager.handleTap(x, y, game.world, game)) {
                        game.world.handleWorldTap(x, y);
                    }
                }
                return true;
        }
        return false;
    }
}
