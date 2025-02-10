import { DeleteStock, UpdateStock } from "@/services/stockService";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await params;
        const numericId = Number(id);

        if (!numericId) {
            return NextResponse.json({ error: "Stock ID est requis." }, { status: 400 });
        }

        const stockDeleted = await DeleteStock(numericId)

        if (!stockDeleted) {
            return NextResponse.json({ error: "erreur lors de la suppression du stock." },)
        }

        return NextResponse.json(
            { message: "Stock suprimer avec succes." },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error durant la supression du stock:", error);
        return NextResponse.json(
            { error: "erreur lors de la suppression du stock." },
            { status: 500 }
        );
    }
}

// edit
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const id = await params.id;
        const numericId = Number(id);
        const data = await req.json();

        if (!numericId) {
            return NextResponse.json({ error: "Stock ID est requis." }, { status: 400 });
        }

        try {
            const stockUpdated = await UpdateStock(numericId, {
                id_stock: data.id_stock,
                description: data.description,
                quantite_disponible: data.quantite_disponible,
                nom: data.nom,
                type: data.type
            });

            return NextResponse.json(stockUpdated, { status: 200 });
        } catch (error) {
            if (error instanceof Error) {
                return NextResponse.json({ error: error.message }, { status: 400 });
            }
            throw error;
        }
    } catch (error) {
        console.error("Erreur durant la modification du stock:", error);
        return NextResponse.json(
            { error: "Erreur lors de la modification du stock." },
            { status: 500 }
        );
    }
}