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
    console.log("Registration request body:", req.body);
    const { email, name, password, displayName } = req.body || {};
    // require email, password and either name or displayName (frontend may send either)
    if (!email || !password || !(name ?? displayName)) {
      console.log("Missing required fields:", { email, password, name, displayName });
      return res
        .status(400)
        .json({ error: "email, password and name/displayName required" });
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



    console.log("Inserting new user with email:", email);
    const secret = process.env.JWT_SECRET || "notvisibletoyou";
    const token = jwt.sign({ user_id: user.id, email: user.email }, secret, {
      expiresIn: "10y",
    });
    const result = await db
      .insert(usersTable)
      .values({
        email: email,
        password: hashPassword,
        displayName: name ?? displayName,
        createdAt: new Date(),
      })
      .returning();

    console.log("User created successfully:", result);
    return res.status(201).json({ msg: "The user is created", result,token });
  } catch (error) {
    console.error("Error in /register endpoint:", error.message);
    console.error("Full error details:", error);
    return res
      .status(500)
      .json({ error: "Error creating user: " + error.message });
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
    const token = jwt.sign({ user_id: user.id, email: user.email }, secret, {
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

userRouter.get("/get-user", async (req, res) => {
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

userRouter.patch("/change-info", auth,async (req, res) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ error: "unauthenticated" });

    const { email, displayName, password, avatarUrl } = req.body || {};

    if (!email && !displayName && !password && !avatarUrl) {
      return res.status(400).json({ error: "no fields to update" });
    }

    // if email is being updated, ensure it's not already taken by another user
    if (email) {
      const rows = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email));
      if (rows.length > 0 && Number(rows[0].id) !== Number(userId)) {
        return res.status(400).json({ error: "email already in use" });
      }
    }

    const updates = {};
    if (displayName != null) updates.displayName = displayName;
    if (email != null) updates.email = email;
    if (avatarUrl != null) updates.avatarUrl = avatarUrl;
    if (password != null) {
      const saltRounds = 10;
      updates.password = await bcrypt.hash(password, saltRounds);
    }
    updates.updatedAt = new Date();

    const result = await db
      .update(usersTable)
      .set(updates)
      .where(eq(usersTable.id, Number(userId)))
      .returning();

    if (!result || result.length === 0) {
      return res.status(404).json({ error: "user not found" });
    }

    const updated = result[0];
    
    return res.status(200).json({ msg: "user updated", user: updated });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "internal error" });
  }
});

// testing authentication logic
userRouter.get("/protected", auth, (req, res) => {
  const data = req.user;
  res.status(200).json({ msg: "protected", data });
});

export { userRouter };
