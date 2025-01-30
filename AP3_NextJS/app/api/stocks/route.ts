import { CreateStock, GetAllStocks } from "@/services/stockService";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const stocks = await GetAllStocks();
    console.error("Error fetching stocks first:", stocks);
    
    return NextResponse.json(stocks, { status: 200 });
  } catch (error) {
    console.error("Error fetching stocks:", error);
    return NextResponse.json({ error: "Failed to fetch stocks" }, { status: 500 });
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
        console.error("Error creating stock:", error);
        return NextResponse.json({ error: "Failed to create stock" }, { status: 500 });
    }
}
