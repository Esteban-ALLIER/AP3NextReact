import { DeleteStock } from "@/services/stockService";
import { NextRequest, NextResponse } from "next/server";

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