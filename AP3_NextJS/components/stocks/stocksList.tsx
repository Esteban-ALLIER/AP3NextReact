"use client"

import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { stocks, type as StockType } from "@prisma/client";
import {
 Table, TableBody, TableHead, TableHeader, TableRow, TableCell
} from "@/components/ui/table";
import { Button } from "../ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SerializedStocks } from "@/services/stockService";
import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import { DialogFooter, DialogHeader } from "../ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type StockWithRelations = SerializedStocks

export type StockListRef = {
 refresh: () => void;
};

const StockList = forwardRef<StockListRef>((_, ref) => {
 const queryClient = useQueryClient();
 const { toast } = useToast();
 const { user } = useAuth();
 const [editingStock, setEditingStock] = useState<StockWithRelations | null>(null);
 const [userRole, setUserRole] = useState<number | null>(null);
 const [editData, setEditData] = useState({
   quantite_disponible: 0,
   nom: '',
   description: '',
   type: 'medicament' as StockType
 });

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
         description: "Stock supprimé avec succès",
       });
       refetch();
     }
   } catch (error) {
     console.error("Erreur lors de la suppression:", error);
   }
 };

 const handleUpdate = async () => {
   if (!editingStock) return;

   try {
     const response = await fetch(`/api/stocks/[id]`, {
       method: 'PUT',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         ...editData,
         id_stock: editingStock.id_stock,
       }),
     });

     if (response.ok) {
       toast({
         title: "Succès",
         description: "Stock modifié avec succès",
       });
       setEditingStock(null);
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

 const handleEdit = async (stock: StockWithRelations) => {
   setEditingStock(stock);
   setEditData({
     quantite_disponible: stock.quantite_disponible,
     nom: stock.nom,
     description: stock.description,
     type: stock.type
   });
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

 if (isLoading) return <p>Chargement...</p>;
 if (error) return <p>Error: {error.message}</p>;

 return (
   <>
     <Table>
       <TableHeader>
         <TableRow>
           <TableHead>Nom</TableHead>
           <TableHead>Description</TableHead>
           <TableHead>Quantité disponible</TableHead>
           <TableHead>Type</TableHead>
           {userRole === 1 && <TableHead>Action</TableHead>}
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
                     <Button variant="ghost" size="icon" onClick={() => handleEdit(stock)}>
                       <Pencil className="h-4 w-4" />
                     </Button>
                     <Button variant="ghost" size="icon" onClick={() => handleDelete(stock.id_stock)}>
                       <Trash2 className="h-4 w-4" />
                     </Button>
                   </div>
                 </TableCell>
               )}
             </TableRow>
           ))
         ) : (
           <TableRow>
             <TableCell colSpan={7}>Aucun Stock disponible</TableCell>
           </TableRow>
         )}
       </TableBody>
     </Table>
     {editingStock && (
       <Dialog open={!!editingStock} onOpenChange={() => setEditingStock(null)}>
         <DialogContent>
           <DialogHeader>
             <DialogTitle>Modifier le stock</DialogTitle>
           </DialogHeader>
           <div className="space-y-4">
             <div>
               <Label>Nom</Label>
               <Input
                 type="text"
                 value={editData.nom}
                 onChange={(e) => setEditData({ ...editData, nom: e.target.value })}
               />
             </div>
             <div>
               <Label>Description</Label>
               <Input
                 type="text"
                 value={editData.description}
                 onChange={(e) => setEditData({ ...editData, description: e.target.value })}
               />
             </div>
             <div>
               <Label>Quantité disponible</Label>
               <Input
                 type="number"
                 value={editData.quantite_disponible}
                 onChange={(e) => setEditData({ ...editData, quantite_disponible: Number(e.target.value) })}
               />
             </div>
             <div>
               <Label>Type</Label>
               <Select 
                 value={editData.type}
                 onValueChange={(value) => setEditData({ ...editData, type: value as StockType })}
               >
                 <SelectTrigger>
                   <SelectValue placeholder="Sélectionner un type" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="medicament">Médicament</SelectItem>
                   <SelectItem value="materiel">Matériel</SelectItem>
                 </SelectContent>
               </Select>
             </div>
           </div>
           <DialogFooter>
             <Button onClick={handleUpdate}>Enregistrer</Button>
             <Button variant="outline" onClick={() => setEditingStock(null)}>Annuler</Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
     )}
   </>
 );
});

StockList.displayName = "StockList";

export default StockList;