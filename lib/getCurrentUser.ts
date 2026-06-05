import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function getCurrentUserId() {
  const cookieStore = await cookies();

  const token =
    cookieStore.get("auth_token")?.value;

  if (!token) {
    throw new Error("Unauthorized");
  }

  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET as string
  ) as {
    id: string;
  };

  return decoded.id;
}