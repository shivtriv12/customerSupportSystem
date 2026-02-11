import { prisma } from "../lib/db.js";
export async function getAllUsers() {
    return prisma.user.findMany({ select: { id: true, name: true, email: true } });
}
