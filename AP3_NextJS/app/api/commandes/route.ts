import { GetAllCommandes } from "@/services/commandeService";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const commandes = await GetAllCommandes();
        return NextResponse.json(commandes, { status: 200 });
    } catch (error) {
        console.error("Error fetching commandes:", error);
        return NextResponse.json({ error: "Failed to fetch commandes" }, { status: 500 });
    }
}
