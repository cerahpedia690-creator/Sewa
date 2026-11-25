package com.fennxystudios.apartmenttycoon;

public class BuildingManager {
    public int landPlots = 1; // 1 = 3 slots, 2 = 5 slots, 3 = 7 slots
    public int totalFloors = 2;
    public int wallLevel = 1;
    public int floorLevel = 1;
    public int securityLevel = 1;
    public int elevatorLevel = 1;
    public int lightingLevel = 1;
    public int electricalLevel = 1;
    public int plumbingLevel = 1;
    public int decorLevel = 1;

    public int getMaxSlots() {
        return 1 + landPlots * 2;
    }

    public int getNextFloorCost() {
        return 3500 + totalFloors * 1800;
    }

    public boolean buildFloor(EconomyManager eco, int day) {
        if (totalFloors >= 8) return false;
        int cost = getNextFloorCost();
        if (!eco.canAfford(cost)) return false;
        eco.recordExpense(day, "Built Floor " + (totalFloors + 1), cost);
        totalFloors++;
        return true;
    }

    public boolean expandLand(EconomyManager eco, int day) {
        if (landPlots >= 3) return false;
        int cost = landPlots == 1 ? 12000 : 28000;
        if (!eco.canAfford(cost)) return false;
        eco.recordExpense(day, "Expanded Land Plot", cost);
        landPlots++;
        return true;
    }
}
