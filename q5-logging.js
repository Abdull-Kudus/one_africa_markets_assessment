// 5. Write a middleware function for an Express/Node (or any framework they know) API that
// logs every incoming request and outgoing response, but automatically redacts any field
// named accountNumber, ssn, password, or cardNumber from the log output, even if they
// appear nested inside a JSON body.


// Approach
// The middleware logs requests and responses while recursively scanning objects and arrays. Any sensitive field is automatically replaced with [REDACTED], even when nested inside another object.

const SENSITIVE_FIELDS = ["accountNumber", "ssn", "password", "cardNumber"];

function redact(data) {
  if (data === null || typeof data !== "object") {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(redact);
  }

  const result = {};

  for (const key in data) {
    if (SENSITIVE_FIELDS.includes(key)) {
      result[key] = "[REDACTED]";
    } else {
      result[key] = redact(data[key]);
    }
  }

  return result;
}

function logger(req, res, next) {
  console.log(
    "REQUEST:",
    req.method,
    req.originalUrl,
    redact(req.body)
  );

  const originalJson = res.json;

  res.json = function(body) {
    console.log(
      "RESPONSE:",
      redact(body)
    );

    return originalJson.call(this, body);
  };

  next();
}