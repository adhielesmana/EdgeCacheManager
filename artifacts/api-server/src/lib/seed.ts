import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { logger } from "./logger";

const SUPERADMIN_USERNAME = "adhielesmana";
const SUPERADMIN_PASSWORD_HASH =
  "$2b$12$RaqfaJ/2KDXAYx3PSr6FaO6KNlfvn4RaisuE4oFrmkwa2Tkw78HDu";

export async function seedSuperAdmin(): Promise<void> {
  try {
    const existing = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.username, SUPERADMIN_USERNAME))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(usersTable).values({
        id: "superadmin-adhielesmana",
        username: SUPERADMIN_USERNAME,
        email: "adhielesmana@nexuscdn.local",
        password: SUPERADMIN_PASSWORD_HASH,
        firstName: "Adhie",
        lastName: "Lesmana",
        role: "superadmin",
      });
      logger.info("Default superadmin account created: adhielesmana");
    }
  } catch (err) {
    logger.error({ err }, "Failed to seed superadmin account");
  }
}
