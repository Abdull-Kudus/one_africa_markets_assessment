<!-- 4. Here is an API endpoint: GET /api/transactions?userId=123. A logged-in user
with ID 456 calls this URL with userId=123 and gets back that user's full transaction
history. What's wrong, and how do you fix it?"
 -->


<!-- The problem -->
GET /api/transactions?userId=123

User 456 is logged in, but the endpoint reads userId from the query string rather than from the authenticated session so 456 can simply change the query parameter to userId=123 and pull up a stranger's full transaction history. No authorization check ever confirms that the requester is the account they're asking about.

This is an example of Insecure Direct Object Reference (IDOR). For a payments platform, this is about as
serious as a bug gets, it exposes account balances and transaction detail across users. 


<!-- Approach -->
Authorization decisions should be based on the the authenticated identity
the server already trusts, never from values supplied by the caller. Any
endpoint that takes an ID as input and returns personal or financial data
needs this check, not just this one.


<!-- The fix -->
Use the authenticated user's ID from the session or token instead of trusting the query parameter.

app.get("/api/transactions", authenticate, async (req, res) => {
  const userId = req.user.id;

  const transactions =
    await getTransactions(userId);

  res.json(transactions);
});

