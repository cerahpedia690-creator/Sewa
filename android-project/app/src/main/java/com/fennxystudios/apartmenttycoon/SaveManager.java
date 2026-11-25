package com.fennxystudios.apartmenttycoon;

import android.content.Context;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

public class SaveManager {
    private static final String AUTO_FILE = "autosave.json";
    private final Context context;

    public SaveManager(Context context) {
        this.context = context;
    }

    public boolean hasAutoSave() {
        File f = new File(context.getFilesDir(), AUTO_FILE);
        return f.exists();
    }

    public void autoSave(GameWorld world) {
        saveToFile(AUTO_FILE, world);
    }

    public boolean loadAutoSave(GameWorld world) {
        return loadFromFile(AUTO_FILE, world);
    }

    public void saveToFile(String fileName, GameWorld world) {
        try {
            JSONObject root = new JSONObject();
            root.put("balance", world.economy.balance);
            root.put("totalEarned", world.economy.totalEarned);
            root.put("level", world.level);
            root.put("xp", world.xp);
            root.put("reputation", world.reputation);
            root.put("day", world.time.day);
            root.put("hour", world.time.hour);
            root.put("totalFloors", world.building.totalFloors);
            root.put("landPlots", world.building.landPlots);

            JSONArray roomsArr = new JSONArray();
            for (RoomManager.Room r : world.roomManager.rooms) {
                JSONObject ro = new JSONObject();
                ro.put("id", r.id);
                ro.put("floor", r.floor);
                ro.put("slot", r.slotStart);
                ro.put("type", r.type.name());
                ro.put("rent", r.rentPrice);
                ro.put("cleanliness", r.cleanliness);
                roomsArr.put(ro);
            }
            root.put("rooms", roomsArr);

            try (FileOutputStream fos = context.openFileOutput(fileName, Context.MODE_PRIVATE)) {
                fos.write(root.toString().getBytes(StandardCharsets.UTF_8));
            }
        } catch (Exception ignored) {
        }
    }

    public boolean loadFromFile(String fileName, GameWorld world) {
        File f = new File(context.getFilesDir(), fileName);
        if (!f.exists()) return false;
        try (FileInputStream fis = context.openFileInput(fileName);
             BufferedReader br = new BufferedReader(new InputStreamReader(fis, StandardCharsets.UTF_8))) {
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = br.readLine()) != null) sb.append(line);
            JSONObject root = new JSONObject(sb.toString());

            world.economy.balance = root.optInt("balance", 8500);
            world.economy.totalEarned = root.optInt("totalEarned", 0);
            world.level = root.optInt("level", 1);
            world.xp = root.optInt("xp", 0);
            world.reputation = root.optInt("reputation", 38);
            world.time.day = root.optInt("day", 1);
            world.time.hour = root.optInt("hour", 8);
            world.building.totalFloors = root.optInt("totalFloors", 2);
            world.building.landPlots = root.optInt("landPlots", 1);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
