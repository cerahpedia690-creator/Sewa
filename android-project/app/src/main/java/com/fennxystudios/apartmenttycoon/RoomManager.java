package com.fennxystudios.apartmenttycoon;

import java.util.ArrayList;
import java.util.List;

public class RoomManager {
    public enum RoomType {
        STUDIO("Studio", 1, 1200, 280, 1),
        STANDARD("Standard", 1, 2200, 420, 1),
        DELUXE("Deluxe", 2, 4600, 760, 2),
        FAMILY("Family", 2, 6500, 980, 4),
        LUXURY("Luxury", 2, 10500, 1450, 2),
        PENTHOUSE("Penthouse", 3, 19500, 2600, 3);

        public final String label;
        public final int slotSpan;
        public final int cost;
        public final int baseRent;
        public final int capacity;

        RoomType(String label, int slotSpan, int cost, int baseRent, int capacity) {
            this.label = label;
            this.slotSpan = slotSpan;
            this.cost = cost;
            this.baseRent = baseRent;
            this.capacity = capacity;
        }
    }

    public static class Room {
        public String id;
        public int floor;
        public int slotStart;
        public RoomType type;
        public String number;
        public int cleanliness = 95;
        public int condition = 95;
        public int rentPrice;
        public int comfort = 55;
        public final List<String> tenantIds = new ArrayList<>();
        public boolean lightOn = false;

        public Room(String id, int floor, int slotStart, RoomType type) {
            this.id = id;
            this.floor = floor;
            this.slotStart = slotStart;
            this.type = type;
            this.number = floor + "0" + (slotStart + 1);
            this.rentPrice = type.baseRent;
        }
    }

    public final List<Room> rooms = new ArrayList<>();

    public void initStarterRooms() {
        rooms.clear();
        rooms.add(new Room("rm_101", 1, 0, RoomType.STUDIO));
        rooms.add(new Room("rm_102", 1, 1, RoomType.STANDARD));
    }

    public Room buildRoom(int floor, int slotStart, RoomType type, BuildingManager bm, EconomyManager eco, int day) {
        if (slotStart + type.slotSpan > bm.getMaxSlots()) return null;
        if (!eco.canAfford(type.cost)) return null;
        for (Room r : rooms) {
            if (r.floor == floor && !(slotStart + type.slotSpan <= r.slotStart || slotStart >= r.slotStart + r.type.slotSpan)) {
                return null;
            }
        }
        eco.recordExpense(day, "Built " + type.label, type.cost);
        Room rm = new Room("rm_" + floor + "_" + slotStart, floor, slotStart, type);
        rooms.add(rm);
        return rm;
    }
}
