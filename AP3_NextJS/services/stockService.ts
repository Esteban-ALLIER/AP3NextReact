import JSONbig  from 'json-bigint';
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
export async function CreateStock(data: { nom: string; description: string, quantite_disponible: number, type: StockType}): Promise<stocks> {
    try {
        const newStock = await prisma.stocks.create({
            data: {
                nom : data.nom,
                description: data.description,
                quantite_disponible: data.quantite_disponible,
                type: data.type,
            },
        });
        return newStock;
    } catch (error) {
        console.error("Error creating stock:", error);
        throw new Error("Failed to create stock");
    }
}


