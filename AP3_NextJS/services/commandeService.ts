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
                stocks: {
                    select: {
                        nom: true,
                        type: true
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

        // On retourne directement l'objet de prisma
        return newCommande;
    } catch (error) {
        console.error("Error creating booking:", error);
        throw new Error("Failed to create booking");
    }
}