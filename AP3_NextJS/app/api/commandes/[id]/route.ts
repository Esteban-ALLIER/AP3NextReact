import { NextRequest, NextResponse } from "next/server";
import { AcceptCommande, DeleteCommande, RefuseCommande, UpdateCommande } from "@/services/commandeService";


type RouteContext = {
    params: Promise<{ id: string }>
};

export async function DELETE(
    req: NextRequest,
    context: RouteContext
) {
    try {
        const params = await context.params;
        const { id } = params;
        const numericId = Number(id);
        

        if (!numericId) {
            return NextResponse.json({ error: "Commande ID est requis." }, { status: 400 });
        }

        const commandeDeleted = await DeleteCommande(numericId)

        if (!commandeDeleted) {
            return NextResponse.json({ error: "erreur lors de la suppression de la commande." },)
        }

        return NextResponse.json(
            { message: "Commande suprimer avec succes." },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error durant la supression de la commande:", error);
        return NextResponse.json(
            { error: "erreur lors de la suppression de la commande." },
            { status: 500 }
        );
    }
}

// edit
export async function PUT(
    req: NextRequest,
    context: RouteContext
) {
    try {
        const params = await context.params;
        const { id } = params;
        const numericId = Number(id);
        const data = await req.json();

        if (!numericId) {
            return NextResponse.json({ error: "Commande ID est requis." }, { status: 400 });
        }

        const commandeUpdated = await UpdateCommande(numericId, {
            date_commande: new Date(data.date_commande),
            id_stock: data.id_stock,
            quantite: data.quantite,
            id_utilisateur: data.id_utilisateur
        });

        if (!commandeUpdated) {
            return NextResponse.json({ error: "Erreur lors de la modification de la commande." });
        }

        return NextResponse.json(
            { message: "Commande modifiée avec succès." },
            { status: 200 }
        );
    } catch (error) {
        console.error("Erreur durant la modification de la commande:", error);
        return NextResponse.json(
            { error: "Erreur lors de la modification de la commande." },
            { status: 500 }
        );
    }
}

// accpeter refuser admin
export async function PATCH(
    req: NextRequest,
    context: RouteContext
) {
    try {
        const params = await context.params;
        const { id } = params;
        const numericId = Number(id);
        const { action } = await req.json();

        if (!numericId) {
            return NextResponse.json({ error: "Commande ID est requis." }, { status: 400 });
        }

        if (action === 'accept') {
            try {
                const commande = await AcceptCommande(numericId);
                return NextResponse.json(
                    { message: "Commande acceptée avec succès." },
                    { status: 200 }
                );
            } catch (error: any) {
                if (error.message === "Stock insuffisant") {
                    return NextResponse.json(
                        { error: "Stock insuffisant pour cette commande." },
                        { status: 400 }
                    );
                }
                throw error;
            }
        } else if (action === 'refuse') {
            await RefuseCommande(numericId);
            return NextResponse.json(
                { message: "Commande refusée." },
                { status: 200 }
            );
        }

        return NextResponse.json(
            { error: "Action non reconnue." },
            { status: 400 }
        );
    } catch (error) {
        console.error("Erreur lors du traitement de la commande: verifier les stocks", error);
        return NextResponse.json(
            { error: "Erreur lors du traitement de la commande: verifier les stocks" },
            { status: 500 }
        );
    }
}