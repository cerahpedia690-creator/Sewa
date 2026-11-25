package com.fennxystudios.apartmenttycoon;

public class CameraController {
    public float x = 0f;
    public float y = 0f;
    public float zoom = 1.0f;

    public void pan(float dx, float dy) {
        x = Math.max(-800f, Math.min(800f, x + dx));
        y = Math.max(-600f, Math.min(600f, y + dy));
    }

    public void setZoom(float z) {
        zoom = Math.max(0.6f, Math.min(2.0f, z));
    }

    public void focusFloor(int floor, float floorHeight) {
        y = floor * floorHeight * 0.6f;
    }
}
