package com.fennxystudios.apartmenttycoon;

import java.util.HashMap;
import java.util.Map;

public class RelationshipManager {
    private final Map<String, Integer> scores = new HashMap<>();

    private String key(String a, String b) {
        return a.compareTo(b) < 0 ? a + "|" + b : b + "|" + a;
    }

    public int getScore(String a, String b) {
        Integer v = scores.get(key(a, b));
        return v == null ? 0 : v;
    }

    public void modifyScore(String a, String b, int delta) {
        String k = key(a, b);
        int next = Math.max(-100, Math.min(100, getScore(a, b) + delta));
        scores.put(k, next);
    }

    public String getLabel(String a, String b) {
        int s = getScore(a, b);
        if (s >= 65) return "Best Friend / Couple";
        if (s >= 30) return "Friend";
        if (s <= -40) return "Feuding";
        if (s <= -15) return "Rival";
        return "Neighbor";
    }
}
