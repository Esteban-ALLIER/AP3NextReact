import { PrismaClient, utilisateurs } from "@prisma/client";

const prisma = new PrismaClient();

export async function GetAllUtilisateurs(): Promise<utilisateurs[]> {
    try {
        const utilisateurs = await prisma.utilisateurs.findMany();
        return utilisateurs;
    } catch (error) {
        throw new Error("Failed to fetch utilisateurs");
    }
}

export async function GetUtilisateursById(id: string) {
  try {
    const utilisateurs = await prisma.utilisateurs.findUnique({
      where: {
        id_utilisateur: Number(id),
      },
    });
    if (!utilisateurs) {
      throw new Error(`utilisateurs with ID ${id} not found`);
    }
    return utilisateurs;
  } catch (error) {
    throw new Error("Failed to fetch user by ID");
  }
}

export async function CreateUtilisateurs(data: { prenom: any; password: any; nom: string; email: string }): Promise<utilisateurs> {
    try {
      const utilisateurs = await prisma.utilisateurs.create({
        data: {
          nom: data.nom,
          prenom: data.prenom,
          email: data.email,
          password: data.password,
          id_role: 2,

        },
      });
      return utilisateurs;
    } catch (error) {
      console.error("Error creating user:", error);
      throw new Error("Failed to create user");
    }
}
