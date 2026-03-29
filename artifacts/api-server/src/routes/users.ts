import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { UpdateUserBody } from "@workspace/api-zod";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/users", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (req.user.role !== "superadmin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const users = await db.select().from(usersTable);
  res.json(users.map(u => ({
    id: u.id,
    username: u.username,
    firstName: u.firstName,
    lastName: u.lastName,
    profileImage: u.profileImage,
    role: u.role,
    createdAt: u.createdAt,
  })));
});

router.patch("/users/:userId", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (req.user.role !== "superadmin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const parsed = UpdateUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error });
    return;
  }

  const { userId } = req.params;
  const [updated] = await db
    .update(usersTable)
    .set({ role: parsed.data.role })
    .where(eq(usersTable.id, userId))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({
    id: updated.id,
    username: updated.username,
    firstName: updated.firstName,
    lastName: updated.lastName,
    profileImage: updated.profileImage,
    role: updated.role,
    createdAt: updated.createdAt,
  });
});

export default router;
