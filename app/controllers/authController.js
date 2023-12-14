const jwt = require("jsonwebtoken");
const { TokenExpiredError } = require("jsonwebtoken");

function authorize(req, res, next) {
  const token = req.header("x-auth-token");
  if (!token)
    return res.status(401).json({
      message:
        "The door is closed! No token, no entry. Access denied. Tokens are not provided.",
    });

  try {
    const decoded = jwt.verify(token, "jumintenParkinson");
    req.user = decoded;
    next();
  } catch (ex) {
    if (ex instanceof TokenExpiredError) {
      res.status(401).json({ message: "The jig is up! Token has expired" });
    } else {
      res.status(400).json({ message: "Thats a bum steer! Invalid Token" });
    }
  }
}

module.exports = { authorize };
