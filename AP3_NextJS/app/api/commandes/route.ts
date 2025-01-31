import { CreateCommande, GetAllCommandes } from "@/services/commandeService";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    try {
        const commandes = await GetAllCommandes();
        return NextResponse.json(commandes, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const newCommande = await CreateCommande({
            startDate: new Date(body.date_commande),
            id_stock: Number(body.id_stock),
            quantite: Number(body.quantite),
            id_utilisateur: Number(body.id_utilisateur)
        });

        // Conversion pour la réponse JSON
        const serializedCommande = {
            ...newCommande,
            id_commande: Number(newCommande.id_commande),
            id_utilisateur: Number(newCommande.id_utilisateur),
            id_stock: Number(newCommande.id_stock)
        };

        return NextResponse.json(serializedCommande, { status: 201 });
    } catch (error) {
        console.error("Error creating commande:", error);
        return NextResponse.json({
            error: "Failed s",
        }, { status: 500 });
    }
}