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

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const stock = await CreateStock(body);

    if (!stock) {
      return NextResponse.json(
        { success: false, error: "Le stock n'a pas été créé" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, stock });
  } catch (error) {
    if (error instanceof Error && error.message === "Un stock avec ce nom et ce type existe déjà") {
      return NextResponse.json(
        { success: false, error: "Un stock avec ce nom et ce type existe déjà" },
        { status: 400 }
      );
    }

    console.error('Erreur création stock:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du stock' },
      { status: 500 }
    );
  }
}