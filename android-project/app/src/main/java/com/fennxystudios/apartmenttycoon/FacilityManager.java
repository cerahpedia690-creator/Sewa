package com.fennxystudios.apartmenttycoon;

import java.util.EnumMap;
import java.util.Map;

public class FacilityManager {
    public enum FacilityType {
        LOBBY("Lobby", 0, 0),
        RECEPTIONIST("Receptionist", 900, 40),
        ELEVATOR("Elevator", 1400, 0),
        PARKING("Parking Lot", 1800, 190),
        MINIMARKET("Minimarket", 2800, 290),
        LAUNDRY("Laundry", 1600, 160),
        GYM("Gym", 4200, 260),
        POOL("Swimming Pool", 6800, 320),
        GARDEN("Garden", 2200, 40),
        CAFE("Cafe", 3600, 340),
        PLAYROOM("Playroom", 3200, 150),
        ROOFTOP("Rooftop", 8500, 450),
        SECURITY_ROOM("Security Room", 3800, 0);

        public final String label;
        public final int cost;
        public final int dailyRevenue;

        FacilityType(String label, int cost, int dailyRevenue) {
            this.label = label;
            this.cost = cost;
            this.dailyRevenue = dailyRevenue;
        }
    }

    public final Map<FacilityType, Integer> levels = new EnumMap<>(FacilityType.class);

    public FacilityManager() {
        reset();
    }

    public void reset() {
        for (FacilityType t : FacilityType.values()) {
            levels.put(t, t == FacilityType.LOBBY ? 1 : 0);
        }
    }

    public boolean buildOrUpgrade(FacilityType type, EconomyManager eco, int day) {
        int cur = levels.get(type);
        if (cur >= 3) return false;
        int cost = cur == 0 ? type.cost : Math.max(800, type.cost) * (cur + 1);
        if (!eco.canAfford(cost)) return false;
        eco.recordExpense(day, (cur == 0 ? "Built " : "Upgraded ") + type.label, cost);
        levels.put(type, cur + 1);
        return true;
    }
}
