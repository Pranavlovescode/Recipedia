import jwt from "jsonwebtoken";

export default function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "missing or invalid authorization header" });
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET || "notvisibletoyou";

    const payload = jwt.verify(token, secret);
    // attach user info to request for downstream handlers
    req.user = payload;
    return next();
  } catch (err) {
    console.error("auth middleware error", err);
    return res.status(401).json({ error: "invalid or expired token" });
  }
}
