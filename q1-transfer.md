<!-- 1.Write a function transfer(fromId, toId, amount) that moves money between two
accounts in a database. It should be safe to call multiple times with the same inputs without
transferring money twice. Show the SQL or pseudocode and explain your approach -->


<!-- Approach -->
For payments products of One Africa Markets supporting payments, the riskiest failure mode isn't a slow request but the ones that are retried by a customer trying moving money after network timeout on a transfer request or user double-tapping "Send" can cause the same transfer request to fire twice if the transfer(fromId, toId, amount) isn't protected against that could end up debited twice for one intended transfer.

To make transfer(fromId, toId, amount) safe to call multiple times, I use an idempotency key attached to each transfer attempt for every tranfer to have a unique ID generated once per user action, not per retry. This lets the system return the existing transfer instead of moving money again. Then, The database enforces uniqueness on that key, so a retry is recognized and skipped instead of moving money again. A transaction with row locking prevents two simultaneous calls from both reading an incorrect balance.

I chose this approach because, cross-border transfers (e.g. a merchant payout moving from a Rwandan wallet to a Ghanaian bank-linked account) usually pass through a retry layer at the network or payment gateway level. The idempotency key is what lets that retry layer safely resend a request without ever double-moving a customer's money.


<!-- SQL Schema -->
CREATE TABLE accounts (
  id INT PRIMARY KEY,
  balance DECIMAL(12,2) NOT NULL
);

CREATE TABLE transfers (
  id UUID PRIMARY KEY,
  idempotency_key UUID UNIQUE NOT NULL,
  from_id INT NOT NULL,
  to_id INT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  status VARCHAR(20) NOT NULL, -- pending | completed | failed
  created_at TIMESTAMP DEFAULT now()
);


<!-- Pseudocode -->
function transfer(fromId, toId, amount, idempotencyKey):

  BEGIN TRANSACTION

  existing = SELECT * FROM transfers
             WHERE idempotency_key = idempotencyKey

  if existing exists:
      COMMIT
      return existing.status        // already handled — don't repeat it

  INSERT transfer record (status = 'pending')

  balance = SELECT balance
            FROM accounts
            WHERE id = fromId
            FOR UPDATE              // lock the sender's row to prevent concurrent balance modification issues.

  if balance < amount:
      mark transfer as 'failed'
      ROLLBACK
      return 'insufficient funds'

  debit sender
  credit receiver
  mark transfer as 'completed'

  COMMIT
  return 'completed'