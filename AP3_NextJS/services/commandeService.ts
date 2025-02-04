import { CommandeWithRelations } from "@/components/commande/commandeList";
import { PrismaClient } from "@prisma/client";
import JSONbig from 'json-bigint';

const prisma = new PrismaClient();

enum statut {
    en_attente,
    valider,
    refuser
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
                stocks: {
                    select: {
                        nom: true,
                        type: true
                    },
                },
            }
        });

        // Convertir les données pour gerer les BigInt
        const SerializedCommandes: CommandeWithRelations[] = JSON.parse(JSONbig.stringify(commandes));
        return SerializedCommandes;
    } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch Commandes");
    }
}

export async function CreateCommande(data: {
    startDate: Date;
    id_stock: number;
    quantite: number;
    id_utilisateur: number
}): Promise<any> {  // On change le type de retour en any temporairement
    try {
        const newCommande = await prisma.commandes.create({
            data: {
                id_utilisateur: BigInt(data.id_utilisateur),
                date_commande: data.startDate,
                id_stock: BigInt(data.id_stock),
                quantite: data.quantite,
                statut: 'en_attente'
            },
        });

        return newCommande;
    } catch (error) {
        throw new Error("Erreur durant la creation de commande");
    }
}

export async function DeleteCommande(id: number): Promise<boolean> {
    try {
        // Vérifie si la commande existe
        const commande = await prisma.commandes.findUnique({
            where: { id_commande: id },
        });

        if (!commande) return false;

        // Supprime la commande
        await prisma.commandes.delete({
            where: { id_commande: id },
        });

        return true;
    } catch (error) {
        console.error("erreur durant la supression de la commande:", error);
        return false;
    }
}

export async function UpdateCommande(id: number, data: {
    date_commande?: Date;
    id_stock?: number;
    quantite?: number;
    id_utilisateur: number; // utilisateur qui fait la modification
}): Promise<any> {
    try {
        const updatedCommande = await prisma.commandes.update({
            where: { id_commande: BigInt(id) },
            data: {
                date_commande: data.date_commande,
                id_stock: data.id_stock ? BigInt(data.id_stock) : undefined,
                quantite: data.quantite,
                id_utilisateur: BigInt(data.id_utilisateur),
            },
        });

        return updatedCommande;
    } catch (error) {
        throw new Error("Erreur lors de la modification de la commande");
    }
}

