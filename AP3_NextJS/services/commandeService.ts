import { CommandeWithRelations } from "@/components/commande/commandeList";
import JSONbig from 'json-bigint';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
}): Promise<any> {
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
        const commande = await prisma.commandes.findUnique({
            where: { id_commande: BigInt(id) },
        });

        if (!commande) return false;

        await prisma.commandes.delete({
            where: { id_commande: BigInt(id) },
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
    id_utilisateur: number;
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

export async function AcceptCommande(id: number): Promise<any> {
    try {
        return await prisma.$transaction(async (prisma) => {
            // 1. recupere la commande existante avec ses infos de stock
            const commande = await prisma.commandes.findUnique({
                where: { id_commande: BigInt(id) },
                include: {
                    stocks: true
                }
            });

            if (!commande) {
                throw new Error("Commande non trouvée");
            }

            // 2. verifie le stock
            if (commande.stocks.quantite_disponible < BigInt(commande.quantite)) {
                throw new Error("Stock insuffisant");
            }

            // 3. met a jour le stock
            await prisma.stocks.update({
                where: { id_stock: commande.id_stock },
                data: {
                    quantite_disponible: {
                        decrement: commande.quantite
                    }
                }
            });

            // 4. cree le mouvement de stock
            await prisma.mouvements.create({
                data: {
                    id_stock: commande.id_stock,
                    type_mouvement: 'sortie',
                    quantite: BigInt(commande.quantite),
                    id_commande: commande.id_commande
                }
            });

            // 5. met a jour la commande en gardant toutes ses valeurs et en changeant juste le statut sans ça 
            // j'ai une erreur que je ne comprends pas et que je n'arrive pas a regler 
            const commandeUpdated = await prisma.commandes.update({
                where: { id_commande: BigInt(id) },
                data: {
                    id_utilisateur: commande.id_utilisateur,
                    id_stock: commande.id_stock,
                    quantite: commande.quantite,
                    date_commande: commande.date_commande,
                    statut: 'valider'
                }
            });

            return commandeUpdated;
        });
    } catch (error) {
        throw new Error("Erreur lors de l'acceptation de la commande");
    }
}

export async function RefuseCommande(id: number): Promise<any> {
    try {
        // 1. recupere la commande existante
        const commande = await prisma.commandes.findUnique({
            where: { id_commande: BigInt(id) }
        });

        if (!commande) {
            throw new Error("Commande non trouvée");
        }

        // 2. met a jour en gardant toutes les valeurs existantes et en changeant juste le statut meme methode car meme erreur
        const commandeUpdated = await prisma.commandes.update({
            where: { id_commande: BigInt(id) },
            data: {
                id_utilisateur: commande.id_utilisateur,
                id_stock: commande.id_stock,
                quantite: commande.quantite,
                date_commande: commande.date_commande,
                statut: 'refuser'
            }
        });

        return commandeUpdated;
    } catch (error) {
        throw new Error("Erreur lors du refus de la commande");
    }
}