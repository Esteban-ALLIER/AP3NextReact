import React, { forwardRef, useImperativeHandle } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Booking, User, type, utilisateurs, stocks, Apartment, commandes } from "@prisma/client";
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
    TableCell,
} from "@/components/ui/table";
import { Button } from "../ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SerializedCommandes } from "@/services/commandeService";

export type CommandeWithRelations = {
    id_commande: number;
    date_commande: string;
    statut: string;
    nom: string;
    quantite: number;
    stocks: {
        nom: string;
        type: string;

    }
    utilisateurs: {
        nom: string;
        prenom: string;
    };

};

export type CommandeListRef = {
    refresh: () => void;
};

const CommandeList = forwardRef<CommandeListRef>((_, ref) => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    // Récupération des commandes
    const { data: commandes, isLoading, error, refetch } = useQuery<CommandeWithRelations[], Error>({
        queryKey: ["commandes"],
        queryFn: () => fetch("/api/commandes").then((res) => res.json()),
    });

    // test

    // Expose la méthode `refresh` au composant parent
    useImperativeHandle(ref, () => ({
        refresh: refetch,
    }));

    if (isLoading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error: {error.message}</p>;
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>id_commande</TableHead>
                    <TableHead>utilisateur</TableHead>
                    <TableHead>date commande</TableHead>
                    <TableHead>type</TableHead>
                    <TableHead>nom</TableHead>
                    <TableHead>quantite</TableHead>
                    <TableHead>statut</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {commandes && commandes.length > 0 ? (
                    commandes.map((commande) => (
                        <TableRow key={commande.id_commande}>
                            <TableCell>{commande.id_commande}</TableCell>
                            <TableCell>{commande.utilisateurs.nom} {commande.utilisateurs.prenom}</TableCell>
                            <TableCell>{commande.date_commande}</TableCell>
                            <TableCell>{commande.stocks.type}</TableCell>
                            <TableCell>{commande.stocks.nom}</TableCell>
                            <TableCell>{commande.quantite}</TableCell>
                            <TableCell>{commande.statut}</TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={7}>Aucune commande disponible</TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
});

CommandeList.displayName = "CommandeList";

export default CommandeList;
