import { CreateCommande, GetAllCommandes } from "@/services/commandeService";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    try {
        const commandes = await GetAllCommandes();
        return NextResponse.json(commandes, { status: 200 });
    } catch (error) {
        console.error("Error fetching commandes:", error);
        return NextResponse.json({ error: "Failed to fetch commandes" }, { status: 500 });
    }
}
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const newCommande = await CreateCommande({
            startDate: body.date_commande,
            id_stock: body.id_stock,
            quantite: body.quantite,
        });

        return NextResponse.json(newCommande, { status: 201 });
    } catch (error) {
        console.error("Error creating booking:", error);
        return NextResponse.json({ error: "Failed to create commande" }, { status: 500 });
    }
}
