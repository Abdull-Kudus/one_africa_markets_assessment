<!-- 6. You're told that last night's nightly reconciliation between your internal ledger and the
payment processor showed a $0.01 discrepancy across 50,000 transactions. It's small, but
it's real. Walk me through how you'd investigate it — what are the likely causes and how do
you find the source?
 -->


<!-- Approach -->
I would treat this as a reconciliation and data integrity investigation. The goal is to determine whether the discrepancy is caused by a single transaction, a subset of transactions, or a systemic calculation issue.


<!-- Solution -->
I would treat this as a reconciliation problem where I need to find out why two systems are not matching. The main goal is to figure out if the issue is coming from one transaction or from a general calculation problem across many transactions.

First, I would check the total difference between the internal system and the payment processor by subtracting one total from the other. After that, I would see if the difference is consistent or not. If it is coming from one side only or pointing in one direction, it could mean a systematic issue. If it looks random, it might be a single transaction problem.

Next, I would look at possible common causes. One likely cause is rounding or floating-point errors, especially if money is stored as decimals instead of cents. Small errors can build up when doing many calculations. Another possible cause is currency conversion differences if different rounding rules are used. Fees or taxes can also cause small differences if one system rounds per transaction while the other rounds at the end. I would also check timing issues, where a transaction might fall into different batches in each system.

To find the exact issue, I would not manually check all 50,000 rows. Instead, I would match both datasets using transaction IDs and compare each transaction one by one. Then I would sort the differences to see if one transaction is responsible or if many small differences exist.

Finally, once I find the root cause, I would either fix the specific transaction if it is isolated, or fix the system logic if it is a general issue. I would also document what caused it so it does not happen again.