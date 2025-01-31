import { CreateStock, GetAllStocks } from "@/services/stockService";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const stocks = await GetAllStocks();    
    return NextResponse.json(stocks, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed stocks" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const newStock = await CreateStock({
          nom: body.nom,
          description: body.description,
          quantite_disponible: body.quantite_disponible,
          type: body.type,
        });                

        return NextResponse.json(newStock, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed stock" }, { status: 500 });
    }
}
