import { CreateBooking, GetAllBookings } from "@/services/bookingService";
import { GetAllStocks } from "@/services/stockService";
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


