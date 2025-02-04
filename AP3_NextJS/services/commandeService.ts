import { CommandeWithRelations } from "@/components/commande/commandeList";
import JSONbig from 'json-bigint';
import { PrismaClient, statut } from "@prisma/client";  


const prisma = new PrismaClient();

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

export async function AcceptCommande(id: number): Promise<any> {
    try {
        // On utilise une transaction pour s'assurer que toutes les opérations sont réussies
        return await prisma.$transaction(async (prisma) => {
            // 1. Récupérer la commande avec les infos de stock
            const commande = await prisma.commandes.findUnique({
                where: { id_commande: BigInt(id) },
                include: {
                    stocks: true
                }
            });

            if (!commande) {
                throw new Error("Commande non trouvée");
            }

            // 2. Vérifier le stock disponible
            if (commande.stocks.quantite_disponible < BigInt(commande.quantite)) {
                throw new Error("Stock insuffisant");
            }

            // 3. Mettre à jour le stock
            await prisma.stocks.update({
                where: { id_stock: commande.id_stock },
                data: {
                    quantite_disponible: {
                        decrement: commande.quantite
                    }
                }
            });

            // 4. Créer le mouvement de stock
            await prisma.mouvements.create({
                data: {
                    id_stock: commande.id_stock,
                    type_mouvement: 'sortie',
                    quantite: BigInt(commande.quantite),
                    id_commande: commande.id_commande
                }
            });

            // 5. Mettre à jour le statut de la commande
            const commandeUpdated = await prisma.commandes.update({
                where: { id_commande: BigInt(id) },
                data: {
                    statut: statut.valider
                }
            });

            return commandeUpdated;
        });
    } catch (error) {
        console.error('Erreur lors de l\'acceptation de la commande:', error);
        throw error;
    }
}

export async function RefuseCommande(id: number): Promise<any> {
    try {
        const commandeUpdated = await prisma.commandes.update({
            where: { id_commande: BigInt(id) },
            data: {
                statut: statut.refuser
            }
        });
        
        return commandeUpdated;
    } catch (error) {
        console.error('Erreur lors du refus de la commande:', error);
        throw error;
    }
}