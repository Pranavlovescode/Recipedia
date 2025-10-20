import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { usersTable } from "../db/schema.js";
import { db } from "../db/db.js";
import { eq } from "drizzle-orm";
import auth from "../middleware/auth.js";

const userRouter = Router();

userRouter.post("/register", async (req, res) => {
  try {
    const { email, name, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "email and password required" });
    }

    const saltRounds = 10;
    const hashPassword = await bcrypt.hash(password, saltRounds);

    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));
    console.log("existing user", existingUser);
    if (existingUser.length != 0) {
      return res
        .status(400)
        .json({ msg: "User with this email already exists" });
    }

    const result = await db
      .insert(usersTable)
      .values({
        email: email,
        password: hashPassword,
        displayName: name ?? null,
        createdAt: new Date(),
      })
      .returning();

    return res.status(201).json({ msg: "The user is created", result });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "some error occurred while creating user" });
  }
});

// login endpoint
userRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "email and password required" });
    }

    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));
    if (!users || users.length === 0) {
      return res.status(401).json({ error: "invalid credentials" });
    }

    const user = users[0];
    const match = await bcrypt.compare(password, user.password || "");
    if (!match) {
      return res.status(401).json({ error: "invalid credentials" });
    }

    const secret = process.env.JWT_SECRET || "notvisibletoyou";
    const token = jwt.sign({ sub: user.id, email: user.email }, secret, {
      expiresIn: "10y",
    });

    return res.json({
      token,
      user: { id: user.id, email: user.email, displayName: user.displayName },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "internal error" });
  }
});

userRouter.get("/get-user", auth, async (req, res) => {
  try {
    const { email } = req.query;
    if (email == null)
      return res
        .status(400)
        .json({ msg: "query parameter email not specified" });
    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (existingUser.length === 0)
      return res
        .status(404)
        .json({ msg: `user with '${email}' was not found` });
    console.log("user", existingUser[0]);
    return res.status(200).json({ user: existingUser[0] });
  } catch (error) {
    console.error(err);
    return res.status(500).json({ error: "internal error" });
  }
});

// testing authentication logic
userRouter.get("/protected", auth, (req, res) => {
  const data = req.user;
  res.status(200).json({ msg: "protected", data });
});

export { userRouter };
