import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Booking, User, Apartment, stocks } from "@prisma/client";
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
import { SerializedStocks } from "@/services/stockService";
import { useAuth } from "@/context/AuthContext";

export type StockWithRelations = SerializedStocks

export type StockListRef = {
  refresh: () => void;
};

const StockList = forwardRef<StockListRef>((_, ref) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<number | null>(null);
  // Récupération des stocks
  const { data: stocks, isLoading, error, refetch } = useQuery<StockWithRelations[], Error>({
    queryKey: ["stocks"],
    queryFn: () => fetch("/api/stocks").then((res) => res.json()),
  });

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/stocks/${id}`, {
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
    return <p>Chargement...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nom</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Quantité disponible</TableHead>
          <TableHead>Type</TableHead>
          {userRole === 1 && (
            <TableHead>Action</TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {stocks && stocks?.length > 0 ? (
          stocks.map((stock) => (
            <TableRow key={stock.id_stock}>
              <TableCell>{stock.nom}</TableCell>
              <TableCell>{stock.description}</TableCell>
              <TableCell>{stock.quantite_disponible}</TableCell>
              <TableCell>{stock.type}</TableCell>
              {userRole === 1 && (
                <TableCell>
                  <div className="flex space-x-2">
                    {/* <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(commande)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button> */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(stock.id_stock)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              )}


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

StockList.displayName = "StockList";

export default StockList;
