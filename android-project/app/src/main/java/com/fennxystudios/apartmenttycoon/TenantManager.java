package com.fennxystudios.apartmenttycoon;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

public class TenantManager {
    public enum Archetype {
        STUDENT("University Student", 360),
        OFFICE_WORKER("Office Worker", 580),
        FREELANCER("Creative Freelancer", 520),
        YOUNG_COUPLE("Young Couple", 920),
        SMALL_FAMILY("Small Family", 1180),
        ENTREPRENEUR("Tech Entrepreneur", 1900),
        INFLUENCER("Lifestyle Influencer", 2100);

        public final String label;
        public final int maxBudget;

        Archetype(String label, int maxBudget) {
            this.label = label;
            this.maxBudget = maxBudget;
        }
    }

    public static class Tenant {
        public String id;
        public String name;
        public int age;
        public Archetype archetype;
        public int budget;
        public int satisfaction = 78;
        public int contractDaysLeft = 30;
        public String roomId;
        public int shirtColor;
        public final TenantAI ai = new TenantAI();
    }

    private final Random rng = new Random();
    public final List<Tenant> tenants = new ArrayList<>();
    private static final String[] FIRST = {"Lin", "Mei", "Sora", "Kai", "Nadia", "Bima", "Yuna", "Elena"};
    private static final String[] LAST = {"Wei", "Tan", "Pratama", "Sato", "Lim", "Zhang", "Wijaya", "Park"};

    public Tenant generateTenant(Archetype arch) {
        Tenant t = new Tenant();
        t.id = "ten_" + System.nanoTime();
        t.name = FIRST[rng.nextInt(FIRST.length)] + " " + LAST[rng.nextInt(LAST.length)];
        t.age = 20 + rng.nextInt(18);
        t.archetype = arch;
        t.budget = arch.maxBudget;
        t.shirtColor = 0xFF000000 | rng.nextInt(0xFFFFFF);
        return t;
    }

    public boolean moveIn(Tenant t, RoomManager.Room room, EconomyManager eco, int day) {
        if (room.tenantIds.size() >= room.type.capacity) return false;
        if (room.rentPrice > t.budget * 1.2f) return false;
        t.roomId = room.id;
        t.ai.currentFloor = room.floor;
        t.ai.targetFloor = room.floor;
        t.ai.x = room.slotStart + 0.5f;
        t.ai.targetX = t.ai.x;
        room.tenantIds.add(t.id);
        tenants.add(t);
        eco.recordIncome(day, "Deposit from " + t.name, room.rentPrice);
        return true;
    }
}
