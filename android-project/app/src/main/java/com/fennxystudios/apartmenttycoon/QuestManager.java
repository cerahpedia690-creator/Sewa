package com.fennxystudios.apartmenttycoon;

import java.util.ArrayList;
import java.util.List;

public class QuestManager {
    public static class Quest {
        public String title;
        public int target;
        public int progress;
        public int rewardMoney;
        public int rewardXp;
        public boolean claimed = false;

        public Quest(String title, int target, int rewardMoney, int rewardXp) {
            this.title = title;
            this.target = target;
            this.rewardMoney = rewardMoney;
            this.rewardXp = rewardXp;
        }
    }

    public final List<Quest> quests = new ArrayList<>();

    public QuestManager() {
        reset();
    }

    public void reset() {
        quests.clear();
        quests.add(new Quest("Rent 3 Apartment Rooms", 3, 1500, 120));
        quests.add(new Quest("Reach 5 Active Tenants", 5, 2500, 200));
        quests.add(new Quest("Build Coin Laundry", 1, 1200, 140));
        quests.add(new Quest("Earn $10,000 Revenue", 10000, 3000, 260));
    }

    public void evaluate(GameWorld world) {
        int rented = 0;
        for (RoomManager.Room r : world.roomManager.rooms) {
            if (!r.tenantIds.isEmpty()) rented++;
        }
        if (quests.size() >= 4) {
            quests.get(0).progress = rented;
            quests.get(1).progress = world.tenantManager.tenants.size();
            quests.get(2).progress = world.facilityManager.levels.get(FacilityManager.FacilityType.LAUNDRY) > 0 ? 1 : 0;
            quests.get(3).progress = world.economy.totalEarned;
        }
    }
}
