package com.fennxystudios.apartmenttycoon;

public class EventManager {
    public static class DramaEvent {
        public String title;
        public String dialogue;
        public String choiceALabel;
        public String choiceBLabel;
        public int moneyDeltaA;
        public int repDeltaA;
        public int moneyDeltaB;
        public int repDeltaB;
    }

    public DramaEvent activeEvent = null;

    public void maybeTrigger(TenantManager tm) {
        if (activeEvent != null || tm.tenants.isEmpty()) return;
        TenantManager.Tenant t = tm.tenants.get(0);
        DramaEvent ev = new DramaEvent();
        ev.title = "Midnight Karaoke vs. Deadline";
        ev.dialogue = t.name + " says a neighbor is singing ballads loudly! How do you resolve it?";
        ev.choiceALabel = "Install Sound Foam (-$250, +Rep)";
        ev.moneyDeltaA = -250;
        ev.repDeltaA = 6;
        ev.choiceBLabel = "Enforce Quiet Hours (+Rep)";
        ev.moneyDeltaB = 0;
        ev.repDeltaB = 3;
        activeEvent = ev;
    }

    public void resolve(boolean chooseA, GameWorld world) {
        if (activeEvent == null) return;
        int money = chooseA ? activeEvent.moneyDeltaA : activeEvent.moneyDeltaB;
        int rep = chooseA ? activeEvent.repDeltaA : activeEvent.repDeltaB;
        if (money < 0) world.economy.recordExpense(world.time.day, activeEvent.title, -money);
        else if (money > 0) world.economy.recordIncome(world.time.day, activeEvent.title, money);
        world.reputation = Math.max(0, Math.min(100, world.reputation + rep));
        world.gainXp(55);
        activeEvent = null;
    }
}
