package com.fennxystudios.apartmenttycoon;

import java.util.ArrayList;
import java.util.List;

public class StaffManager {
    public enum Role {
        RECEPTIONIST("Receptionist", 550, 95),
        SECURITY("Security Guard", 650, 120),
        CLEANER("Cleaning Service", 450, 85),
        TECHNICIAN("Technician", 600, 110),
        MANAGER("Manager", 1400, 220),
        PARKING_ATTENDANT("Parking Attendant", 500, 80);

        public final String label;
        public final int hireCost;
        public final int dailySalary;

        Role(String label, int hireCost, int dailySalary) {
            this.label = label;
            this.hireCost = hireCost;
            this.dailySalary = dailySalary;
        }
    }

    public static class Staff {
        public String name;
        public Role role;
        public int skillLevel = 1;
        public int fatigue = 10;

        public Staff(String name, Role role) {
            this.name = name;
            this.role = role;
        }
    }

    public final List<Staff> staffList = new ArrayList<>();

    public boolean hire(Role role, String name, EconomyManager eco, int day) {
        if (!eco.canAfford(role.hireCost)) return false;
        eco.recordExpense(day, "Hired " + role.label, role.hireCost);
        staffList.add(new Staff(name, role));
        return true;
    }

    public int getTotalPayroll() {
        int total = 0;
        for (Staff s : staffList) total += s.role.dailySalary;
        return total;
    }
}
