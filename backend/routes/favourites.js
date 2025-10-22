import { Router } from "express";
import { usersTable, favoritesTable } from "../db/schema.js";
import { db } from "../db/db.js";
import { and, eq } from "drizzle-orm";
import auth from "../middleware/auth.js";

const favoritesRouter = Router();

// Get all favourite recipes for the authenticated user
favoritesRouter.get("/all", auth, async (req, res) => {
  console.log("/favourite/all endpoint hit");
  try {
    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ error: "unauthenticated" });
    const favourites = await db
      .select()
      .from(favoritesTable)
      .where(eq(favoritesTable.userId, userId));
    return res.status(200).json(favourites);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "internal error" });
  }
});

// Add a recipe to favourites
favoritesRouter.post("/add", auth, async (req, res) => {
  console.log("/favourite/add endpoint hit");
  try {
    const userId = req.user?.user_id;
    const { recipeId, title, image, cookTime, servings } = req.body || {};
    if (!userId) return res.status(401).json({ error: "unauthenticated" });
    // console.log("this line");
    if (!recipeId) return res.status(400).json({ error: "recipeId required" });
    // Prevent duplicate
    const existing = await db
      .select()
      .from(favoritesTable)
      .where(
        and(
          eq(favoritesTable.userId, userId),
          eq(favoritesTable.recipeId, recipeId)
        )
      );
    if (existing.length > 0) {
      // console.log("returning error that recipe already in favorite");
      return res.status(400).json({ error: "already in favourites" });
    }
    // console.log("before adding in db");
    const result = await db
      .insert(favoritesTable)
      .values({
        userId,
        recipeId,
        title,
        image,
        cookTime,
        servings,
        createdAt: new Date(),
      })
      .returning();
    return res
      .status(201)
      .json({ msg: "added to favourites", favourite: result[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "internal error" });
  }
});

// Remove a recipe from favourites
favoritesRouter.delete("/remove", auth, async (req, res) => {
  try {
    const userId = req.user?.user_id;
    const { recipeId } = req.body || {};
    if (!userId) return res.status(401).json({ error: "unauthenticated" });
    if (!recipeId) return res.status(400).json({ error: "recipeId required" });
    const result = await db
      .delete(favoritesTable)
      .where(
        and(
          eq(favoritesTable.userId, userId),
          eq(favoritesTable.recipeId, recipeId)
        )
      )
      .returning();
    if (!result || result.length === 0) {
      return res.status(404).json({ error: "favourite not found" });
    }
    return res.status(200).json({ msg: "removed from favourites" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "internal error" });
  }
});

// (Optional) Update a favourite (e.g., add a note or tag)
// favoritesRouter.patch('/update', auth, async (req, res) => {
//     try {
//         const userId = req.user?.user_id;
//         const { recipeId, note } = req.body || {};
//         if (!userId) return res.status(401).json({ error: "unauthenticated" });
//         if (!recipeId) return res.status(400).json({ error: "recipeId required" });
//         const result = await db
//             .update(favoritesTable)
//             .set({ note })
//             .where(eq(favoritesTable.userId, userId), eq(favoritesTable.recipeId, recipeId))
//             .returning();
//         if (!result || result.length === 0) {
//             return res.status(404).json({ error: "favourite not found" });
//         }
//         return res.status(200).json({ msg: "favourite updated", favourite: result[0] });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ error: "internal error" });
//     }
// });

export { favoritesRouter };
