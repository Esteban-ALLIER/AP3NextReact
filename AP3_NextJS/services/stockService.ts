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
export async function CreateStock(data: { nom: string; description: string, quantite_disponible: number, type: StockType }): Promise<SerializedStocks> {
    try {
        const normalizedName = data.nom.charAt(0).toUpperCase() + data.nom.slice(1).toLowerCase();

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

        const newStock = await prisma.stocks.create({
            data: {
                nom: normalizedName,
                description: data.description,
                quantite_disponible: BigInt(data.quantite_disponible),
                type: data.type,
            },
        });

        // Sérialisation du stock
        return {
            id_stock: Number(newStock.id_stock),
            nom: newStock.nom,
            description: newStock.description,
            quantite_disponible: Number(newStock.quantite_disponible),
            type: newStock.type
        };
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

export async function UpdateStock(id: number, data: {
    id_stock?: number;
    nom: string;
    description?: string;
    quantite_disponible?: number;
    type: StockType;

}): Promise<any> {
    try {

        const normalizedName = data.nom.charAt(0).toUpperCase() + data.nom.slice(1).toLowerCase();

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

        const UpdatedStock = await prisma.stocks.update({
            where: { id_stock: BigInt(id) },
            data: {
                quantite_disponible: data.quantite_disponible ? BigInt(data.quantite_disponible) : undefined,
                nom: data.nom,
                description: data.description,
                type: data.type  // Ajout du type ici
            },
        });

        return UpdatedStock;
    } catch (error) {
        throw new Error("Erreur lors de la modification du stock");
    }
}