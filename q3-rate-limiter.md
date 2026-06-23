<!-- 3. Design a simple rate limiter for a payment API that allows each user a maximum of 5
transactions per minute. You don't have Redis — just a SQL database. Show the schema
and the check logic. -->


<!-- Approach -->
A payment API is a common target for retry storms and abuse, a buggy client integration, a bot testing stolen card numbers, or a user script-spamming transfers can all flood the endpoint. Without Redis, I use the SQL database itself as the source of truth log each transaction attempt with a timestamp, and before allowing a new one, count how many that user has made in the last 60 seconds. This is a sliding window approach (not a fixed per-minute bucket), so a user can't get 5 transactions at 11:00:59 and another 5 at 11:01:01 as the window always looks back exactly one minute from "now"


<!-- Schema -->
CREATE TABLE api_requests (
  id BIGSERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_user_time
ON api_requests(user_id, created_at);


<!-- Check Logic -->
SELECT COUNT(*)
FROM api_requests
WHERE user_id = :userId
AND created_at >= NOW() - INTERVAL '1 minute';

if count >= 5:
    reject request -> 429 Too Many Requests
else:
    INSERT INTO api_requests (user_id) VALUES (:userId)
    proceed with the transaction
