package com.fennxystudios.apartmenttycoon;

import java.util.ArrayList;
import java.util.List;

public class EconomyManager {
    public static class Transaction {
        public final int day;
        public final String type;
        public final String description;
        public final int amount;

        public Transaction(int day, String type, String description, int amount) {
            this.day = day;
            this.type = type;
            this.description = description;
            this.amount = amount;
        }
    }

    public int balance = 8500;
    public int totalEarned = 0;
    public int dailyIncome = 0;
    public int dailyExpense = 0;
    public int loanBalance = 0;
    public final List<Transaction> ledger = new ArrayList<>();

    public boolean canAfford(int cost) {
        return balance >= cost;
    }

    public void recordIncome(int day, String desc, int amount) {
        balance += amount;
        totalEarned += amount;
        dailyIncome += amount;
        addLedger(day, "INCOME", desc, amount);
    }

    public void recordExpense(int day, String desc, int amount) {
        balance -= amount;
        dailyExpense += amount;
        addLedger(day, "EXPENSE", desc, amount);
    }

    public void takeLoan(int day, int amount) {
        loanBalance += amount;
        recordIncome(day, "Bank Loan", amount);
    }

    private void addLedger(int day, String type, String desc, int amount) {
        ledger.add(0, new Transaction(day, type, desc, amount));
        if (ledger.size() > 60) {
            ledger.remove(ledger.size() - 1);
        }
    }
}
