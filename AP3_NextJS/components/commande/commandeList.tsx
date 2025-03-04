import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Pencil, Trash2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export type CommandeWithRelations = {
    id_commande: number;
    date_commande: string;
    statut: string;
    nom: string;
    quantite: number;
    stocks: {
        nom: string;
        type: string;
        id_stock: number;
    }
    utilisateurs: {
        nom: string;
        prenom: string;
        id_utilisateur: number;
    };
};

export type CommandeListRef = {
    refresh: () => void;
};

const CommandeList = forwardRef<CommandeListRef>((_, ref) => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const { user } = useAuth();
    const [hideValidated, setHideValidated] = useState(false);
    const [userRole, setUserRole] = useState<number | null>(null);
    const [editingCommande, setEditingCommande] = useState<CommandeWithRelations | null>(null);
    const [editData, setEditData] = useState({
        quantite: 0,
        date_commande: '',
        id_stock: 0
    });

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

    const handleAccept = async (commande: CommandeWithRelations) => {
        try {
            const response = await fetch(`/api/commandes/${commande.id_commande}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action: 'accept' }),
            });

            const data = await response.json();

            if (response.ok) {
                toast({
                    title: "Succès",
                    description: "Commande acceptée avec succès",
                });
                refetch();
            } else {
                toast({
                    title: "Erreur",
                    description: data.error || "Erreur lors de l'acceptation de la commande",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Erreur lors de l'acceptation:", error);
            toast({
                title: "Erreur",
                description: "Erreur lors de l'acceptation de la commande",
                variant: "destructive",
            });
        }
    };

    const handleRefuse = async (commande: CommandeWithRelations) => {
        try {
            const response = await fetch(`/api/commandes/${commande.id_commande}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action: 'refuse' }),
            });

            if (response.ok) {
                toast({
                    title: "Succès",
                    description: "Commande refusée",
                });
                refetch();
            }
        } catch (error) {
            console.error("Erreur lors du refus:", error);
            toast({
                title: "Erreur",
                description: "Erreur lors du refus de la commande",
                variant: "destructive",
            });
        }
    };

    const handleEdit = async (commande: CommandeWithRelations) => {
        setEditingCommande(commande);
        setEditData({
            quantite: commande.quantite,
            date_commande: new Date(commande.date_commande).toISOString().slice(0, 16),
            id_stock: commande.stocks.id_stock
        });
    };

    const handleUpdate = async () => {
        if (!editingCommande) return;

        try {
            const userResponse = await fetch(`/api/utilisateurs?email=${user?.email}`);
            const userData = await userResponse.json();

            const response = await fetch(`/api/commandes/${editingCommande.id_commande}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...editData,
                    id_utilisateur: userData.id_utilisateur
                }),
            });

            if (response.ok) {
                toast({
                    title: "Succès",
                    description: "Commande modifiée avec succès",
                });
                setEditingCommande(null);
                refetch();
            }
        } catch (error) {
            console.error("Erreur lors de la modification:", error);
            toast({
                title: "Erreur",
                description: "Erreur lors de la modification",
                variant: "destructive",
            });
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
        return <p>Chargement...</p>;
    }

    if (error) {
        return <p>Error: {error.message}</p>;
    }

    return (
        <>
            <div className="flex gap-2 mb-4">
                <Button
                    variant="outline"
                    onClick={() => setHideValidated(!hideValidated)}
                >
                    {hideValidated ? "Afficher toutes les commandes" : "Masquer les commandes validées/refusées"}
                </Button>
            </div>
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
                        commandes
                            .filter(commande => {
                                if (hideValidated) {
                                    return commande.statut === 'en_attente';
                                }
                                return true;
                            })
                            .map((commande) => (
                                <TableRow key={commande.id_commande}>
                                    <TableCell>{commande.id_commande}</TableCell>
                                    <TableCell>{commande.utilisateurs.nom} {commande.utilisateurs.prenom}</TableCell>
                                    <TableCell>{new Date(commande.date_commande).toLocaleString()}</TableCell>
                                    <TableCell>{commande.stocks.type}</TableCell>
                                    <TableCell>{commande.stocks.nom}</TableCell>
                                    <TableCell>{commande.quantite}</TableCell>
                                    <TableCell className={
                                        String(commande.statut) === "valider"? "text-green-500":
                                        String(commande.statut) === "refuser"? "text-red-500" : 
                                        String(commande.statut) === "en_attente"? "text-orange-500" : ""
                                    }>{commande.statut}</TableCell>
                                    <TableCell>{userRole === 2 && commande.statut === 'en_attente' && (
                                        <div className="flex space-x-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(commande)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(commande.id_commande)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                        {userRole === 1 && commande.statut === 'en_attente' && (
                                            <div className="flex space-x-2">
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => handleAccept(commande)}
                                                    className="flex items-center text-green-600 space-x-2"
                                                >
                                                    <span>Valider</span>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => handleRefuse(commande)}
                                                    className="flex items-center text-red-600 space-x-2"
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
                            <TableCell colSpan={8}>Aucune commande disponible</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {editingCommande && (
                <Dialog open={!!editingCommande} onOpenChange={() => setEditingCommande(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Modifier la commande</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label>Quantité</Label>
                                <Input
                                    type="number"
                                    value={editData.quantite}
                                    onChange={(e) => setEditData({ ...editData, quantite: parseInt(e.target.value) })}
                                />
                            </div>
                            <div>
                                <Label>Date de commande</Label>
                                <Input
                                    type="datetime-local"
                                    value={editData.date_commande}
                                    onChange={(e) => setEditData({ ...editData, date_commande: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleUpdate}>Enregistrer</Button>
                            <Button variant="outline" onClick={() => setEditingCommande(null)}>Annuler</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
});

CommandeList.displayName = "CommandeList";

export default CommandeList;