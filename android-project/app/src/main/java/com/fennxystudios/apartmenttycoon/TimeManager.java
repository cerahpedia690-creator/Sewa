package com.fennxystudios.apartmenttycoon;

public class TimeManager {
    public enum Speed {
        PAUSE(0f), NORMAL(1f), FAST(2f), ULTRA(3f);
        public final float factor;
        Speed(float f) { this.factor = f; }
    }

    public int day = 1;
    public int hour = 8;
    public int minute = 0;
    public Speed speed = Speed.NORMAL;
    private float accum = 0f;

    public boolean tick(float dt) {
        if (speed == Speed.PAUSE) return false;
        accum += dt * 4f * speed.factor;
        boolean hourChanged = false;
        while (accum >= 1f) {
            accum -= 1f;
            minute++;
            if (minute >= 60) {
                minute = 0;
                hour++;
                hourChanged = true;
                if (hour >= 24) {
                    hour = 0;
                    day++;
                }
            }
        }
        return hourChanged;
    }

    public String getPeriodLabel() {
        if (hour >= 5 && hour < 11) return "Morning";
        if (hour >= 11 && hour < 16) return "Afternoon";
        if (hour >= 16 && hour < 20) return "Evening";
        return "Night";
    }

    public String getFormattedClock() {
        return String.format("Day %d · %02d:%02d (%s)", day, hour, minute, getPeriodLabel());
    }
}
