import { CommandeWithRelations } from "@/components/commande/commandeList";
import { Booking, PrismaClient, commandes, User } from "@prisma/client";
import JSONbig from 'json-bigint';
import { object } from "zod";

const prisma = new PrismaClient();

enum statut {
    en_attente,
    validee,
    invalidee
}

enum type {
    medicament,
    materiel
}

export interface SerializedCommandes {
    id_commande: number;
    id_utilisateur: number;
    date_commande: string;
    statut: string;
}

export async function GetAllCommandes(): Promise<CommandeWithRelations[]> {
    try {
        const commandes = await prisma.commandes.findMany({
        include: {
            utilisateurs: {
                select: {
                    nom: true,
                    prenom: true,
                },
            },
            details_commande: {
                include: {
                    stocks: {
                        select: {
                            nom: true,
                        },
                    },
                },
            },
        }
        });

    // Convertir les données pour gérer les BigInt
    const SerializedCommandes: CommandeWithRelations[] = JSON.parse(JSONbig.stringify(commandes));
    console.log(SerializedCommandes);
    return SerializedCommandes;
} catch (error) {
    console.error(error);
    throw new Error("Failed to fetch Commandes");
}
}
