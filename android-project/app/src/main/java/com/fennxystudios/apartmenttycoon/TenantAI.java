package com.fennxystudios.apartmenttycoon;

import java.util.Random;

public class TenantAI {
    public float x = 1.0f;
    public float y = 0.0f;
    public int currentFloor = 0;
    public int targetFloor = 0;
    public float targetX = 1.0f;
    public float walkPhase = 0f;
    public int facing = 1;
    private float waitTimer = 2.0f;
    private final Random rng = new Random();

    public void update(float dt, int hour, int maxSlots, int homeFloor, float homeX) {
        if (currentFloor != targetFloor) {
            float dir = targetFloor > currentFloor ? 1f : -1f;
            y += dir * 0.85f * dt;
            if ((dir > 0 && y >= targetFloor) || (dir < 0 && y <= targetFloor)) {
                y = targetFloor;
                currentFloor = targetFloor;
            }
            return;
        }

        float dx = targetX - x;
        if (Math.abs(dx) > 0.06f) {
            facing = dx > 0 ? 1 : -1;
            x += facing * 0.85f * dt;
            walkPhase += dt * 8f;
            return;
        }

        waitTimer -= dt;
        if (waitTimer <= 0f) {
            waitTimer = 3.5f + rng.nextFloat() * 4.5f;
            if (hour >= 22 || hour < 6) {
                targetFloor = homeFloor;
                targetX = homeX;
            } else if (rng.nextFloat() < 0.4f) {
                targetFloor = 0;
                targetX = 0.4f + rng.nextFloat() * Math.max(1f, maxSlots - 0.8f);
            } else {
                targetFloor = homeFloor;
                targetX = Math.max(0.2f, Math.min(maxSlots - 0.2f, homeX + (rng.nextFloat() - 0.5f) * 0.4f));
            }
        }
    }
}
