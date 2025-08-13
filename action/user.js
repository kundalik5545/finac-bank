import prisma from "@/db/db.config";

export async function getUser() {
  try {
    const allUsers = await prisma.user.findMany();

    console.log(allUsers);

    return allUsers;
  } catch (error) {
    console.log("Error while fetching users", error);
    throw new Error("Error while fetching users", error);
  }
}

export async function createNewUser() {
  try {
    const allUsers = await prisma.user.create({
      data: {
        clerkUserId: "",
        name: "Kundalik Jadhav",
        email: "kj@fm.com",
        phone: "7030540807",
      },
    });

    console.log(allUsers);

    return allUsers;
  } catch (error) {
    console.log("Error while fetching users", error);
    throw new Error("Error while fetching users", error);
  }
}
