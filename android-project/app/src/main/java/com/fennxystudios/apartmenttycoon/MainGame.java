package com.fennxystudios.apartmenttycoon;

import android.app.Activity;
import android.content.Context;
import android.graphics.Canvas;
import android.view.MotionEvent;
import android.view.SurfaceHolder;
import android.view.SurfaceView;

public class MainGame extends SurfaceView implements SurfaceHolder.Callback, Runnable {
    public enum ScreenType {
        MAIN_MENU,
        GAME
    }

    private final Activity activity;
    private final SurfaceHolder holder;
    private Thread gameThread;
    private volatile boolean running = false;

    public final AssetManager assetManager;
    public final SaveManager saveManager;
    public final GameWorld world;
    private MainMenuScreen mainMenuScreen;
    private GameScreen gameScreen;
    private ScreenType currentScreen = ScreenType.MAIN_MENU;

    public MainGame(Context context) {
        super(context);
        this.activity = (Activity) context;
        this.holder = getHolder();
        this.holder.addCallback(this);
        setFocusable(true);

        this.assetManager = new AssetManager(context);
        this.assetManager.preloadDefaults();
        this.saveManager = new SaveManager(context);
        this.world = new GameWorld(assetManager, saveManager);
        this.mainMenuScreen = new MainMenuScreen(this);
        this.gameScreen = new GameScreen(this);
    }

    public void switchScreen(ScreenType screen) {
        this.currentScreen = screen;
    }

    public void exitGame() {
        pause();
        activity.finish();
    }

    @Override
    public void surfaceCreated(SurfaceHolder surfaceHolder) {
        resume();
    }

    @Override
    public void surfaceChanged(SurfaceHolder surfaceHolder, int format, int width, int height) {
        world.onViewportResize(width, height);
    }

    @Override
    public void surfaceDestroyed(SurfaceHolder surfaceHolder) {
        pause();
    }

    public void resume() {
        if (running) return;
        running = true;
        gameThread = new Thread(this, "ApartmentTycoonLoop");
        gameThread.start();
    }

    public void pause() {
        running = false;
        if (currentScreen == ScreenType.GAME) {
            saveManager.autoSave(world);
        }
        if (gameThread != null) {
            try {
                gameThread.join(1000);
            } catch (InterruptedException ignored) {
            }
            gameThread = null;
        }
    }

    @Override
    public void run() {
        long lastNs = System.nanoTime();
        while (running) {
            long nowNs = System.nanoTime();
            float rawDt = (nowNs - lastNs) / 1_000_000_000f;
            lastNs = nowNs;
            float dt = Math.min(rawDt, 0.05f);

            if (currentScreen == ScreenType.MAIN_MENU) {
                mainMenuScreen.update(dt);
            } else {
                gameScreen.update(dt);
            }

            if (holder.getSurface().isValid()) {
                Canvas canvas = holder.lockCanvas();
                if (canvas != null) {
                    try {
                        synchronized (holder) {
                            if (currentScreen == ScreenType.MAIN_MENU) {
                                mainMenuScreen.render(canvas);
                            } else {
                                gameScreen.render(canvas);
                            }
                        }
                    } finally {
                        holder.unlockCanvasAndPost(canvas);
                    }
                }
            }

            try {
                Thread.sleep(16);
            } catch (InterruptedException ignored) {
            }
        }
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {
        if (currentScreen == ScreenType.MAIN_MENU) {
            return mainMenuScreen.onTouch(event);
        } else {
            return gameScreen.onTouch(event);
        }
    }
}
