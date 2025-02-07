import JSONbig from 'json-bigint';
import { Stringifier } from "postcss";
import { PrismaClient, stocks, type as StockType } from "@prisma/client";

const prisma = new PrismaClient();


export interface SerializedStocks {
    id_stock: number;
    nom: string;
    description: string;
    quantite_disponible: number;
    type: StockType;
}


export async function GetAllStocks(): Promise<SerializedStocks[]> {
    try {
        const stocks = await prisma.stocks.findMany();
        const serializedStocks: SerializedStocks[] = JSON.parse(JSONbig.stringify(stocks));
        console.error("stocks", serializedStocks);
        return serializedStocks;
    } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch stocks");
    }
}
export async function CreateStock(data: { nom: string; description: string, quantite_disponible: number, type: StockType }): Promise<stocks | null> {
    try {
        // on normalise d'abord le nom (premiere lettre en majuscule et le reste en minuscule)
        const normalizedName = data.nom.charAt(0).toUpperCase() + data.nom.slice(1).toLowerCase();

        // verification du stock si il existe deja 
        const existingStock = await prisma.stocks.findFirst({
            where: {
                nom: {
                    equals: normalizedName,
                    mode: 'insensitive'
                },
                type: data.type
            }
        });

        if (existingStock) {
            throw new Error("Un stock avec ce nom et ce type existe déjà");
        }

        // on creer le stock avec le nom normaliser
        const newStock = await prisma.stocks.create({
            data: {
                nom: normalizedName, // utilisation du nom normalsier
                description: data.description,
                quantite_disponible: data.quantite_disponible,
                type: data.type,
            },
        });
        return newStock;
    } catch (error) {
        if (error instanceof Error && error.message === "Un stock avec ce nom et ce type existe déjà") {
            throw error;
        }
        console.error("Error creating stock:", error);
        throw new Error("Failed to create stock");
    }
}

export async function DeleteStock(id: number): Promise<boolean> {
    try {
        // il faut d'abord supprimer le mouvement 
        await prisma.mouvements.deleteMany({
            where: { id_stock: BigInt(id) }
        });

        // Supprimer les commandes lié à ce stock
        await prisma.commandes.deleteMany({
            where: { id_stock: BigInt(id) }
        });

        // Ensuite supprimer le stock
        await prisma.stocks.delete({
            where: { id_stock: BigInt(id) }
        });

        return true;
    } catch (error) {
        console.error("erreur durant la supression du stock:", error);
        return false;
    }
}