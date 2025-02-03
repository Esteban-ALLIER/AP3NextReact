import { NextRequest, NextResponse } from "next/server";
import { DeleteCommande } from "@/services/commandeService";

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = Number(params.id);

        if (!id) {
            return NextResponse.json({ error: "Commande ID est requis." }, { status: 400 });
        }

        const commandeDeleted = await DeleteCommande(id);

        if (!commandeDeleted) {
            return NextResponse.json({ error: "erreur lors de la suppression commande." },)
        }

        return NextResponse.json(
            { message: "Commande suprimer avec succes." },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error durant la supression de la commande:", error);
        return NextResponse.json(
            { error: "erreur lors de la suppression commande." },
            { status: 500 }
        );
    }
}