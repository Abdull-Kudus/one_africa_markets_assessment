// 2. You have a CSV file with 2 million transaction rows. Each row has a user ID, a timestamp,
// an amount, and a type (credit or debit). Write code that reads this file and outputs each
// user's final balance, using as little memory as possible.

// Approach
// The CSV file is processed using a stream so that rows are read one at a time instead of loading the entire file into memory. As each transaction is read, a running balance is maintained for the corresponding user.
// This approach is memory efficient because memory usage depends mainly on the number of unique users rather than the total number of transactions. Even with 2 million rows, the application only stores the current balance for each user.


const fs = require("fs");
const readline = require("readline");

async function calculateBalances(filePath) {
  const balances = new Map();

  const rl = readline.createInterface({
    input: fs.createReadStream(filePath)
  });

  let firstLine = true;

  for await (const line of rl) {
    if (firstLine) {
      firstLine = false; // skip header
      continue;
    }

    const [userId, timestamp, amount, type] = line.split(",");

    const value = Number(amount);

    const change =
      type.trim().toLowerCase() === "credit"
        ? value
        : -value;

    balances.set(
      userId,
      (balances.get(userId) || 0) + change
    );
  }

  return balances;
}