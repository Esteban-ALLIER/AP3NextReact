import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Pencil, Trash2 } from "lucide-react";

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
    const { user } = useAuth();
    const [userRole, setUserRole] = useState<number | null>(null);


    const { data: commandes, isLoading, error, refetch } = useQuery<CommandeWithRelations[], Error>({
        queryKey: ["commandes"],
        queryFn: () => fetch("/api/commandes").then((res) => res.json()),
    });

    const handleDelete = async (id: number) => {
        try {
            const response = await fetch(`/api/commandes/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                toast({
                    title: "Succès",
                    description: "Commande supprimée avec succès",
                });
                refetch(); 
            }
        } catch (error) {
            console.error("Erreur lors de la suppression:", error);
        }
    };

    useEffect(() => {
        const fetchUserRole = async () => {
            if (user?.email) {
                try {
                    const response = await fetch(`/api/utilisateurs?email=${user.email}`);
                    const data = await response.json();
                    setUserRole(Number(data.id_role));
                } catch (error) {
                    console.error("Erreur lors de la récupération du rôle:", error);
                }
            }
        };

        if (user) {
            fetchUserRole();
        }
    }, [user]);

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
                    <TableHead>Actions</TableHead>
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
                            <TableCell>{userRole === 2 && (<div className="flex space-x-2">
                                <Button variant="ghost" size="icon" onClick={() => {/* Edit */ }}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(commande.id_commande)}                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            )}
                                {userRole === 1 && (
                                    <div className="flex space-x-2">
                                        <Button
                                            variant="ghost"
                                            onClick={() => {/* accepter */ }}
                                            className="flex items-center space-x-2"
                                        >
                                            <span>Accepter</span>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            onClick={() => {/* refuser */ }}
                                            className="flex items-center space-x-2"
                                        >
                                            <span>Refuser</span>
                                        </Button>
                                    </div>
                                )}
                            </TableCell>
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
