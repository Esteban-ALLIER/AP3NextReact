"use client"

import { useRef, useState, useEffect } from "react"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { SidebarInset, SidebarProvider, SidebarTrigger, } from "@/components/ui/sidebar"
import { useAuth } from "@/context/AuthContext"
import { Plus } from "lucide-react"
import { CommandeForm, commandeFormSchema } from "@/components/commande/commandeForm"
import { cn } from "@/lib/utils"
import { z } from "zod"
import { useToast } from '@/hooks/use-toast';
import CommandeList, { CommandeListRef } from "@/components/commande/commandeList"

export default function Page() {
  const { user, loading } = useAuth()
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const CommandeListRef = useRef<CommandeListRef>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user?.email) {
        try {
          const encodedEmail = encodeURIComponent(user.email);
          const response = await fetch(`/api/utilisateurs?email=${encodedEmail}`);

          if (!response.ok) {
            throw new Error('Erreur role');
          }
          const data = await response.json();
          console.log("Données reçues:", data);
          setUserRole(Number(data.id_role));
          setUserId(Number(data.id_utilisateur));
        } catch (error) {
          console.error("Erreur role", error);
        }
      }
    };

    if (user) {
      fetchUserRole();
    }
  }, [user]);

  const handleNewReservation = () => {
    setIsDialogOpen(true)
  }

  const handleFormSubmit = async (data: z.infer<typeof commandeFormSchema>) => {
    try {
      if (!userId) {
        toast({
          title: 'Erreur',
          description: 'Utilisateur non identifié',
          variant: 'destructive',
        });
        return;
      }

      const response = await fetch('/api/commandes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date_commande: data.date_commande,
          id_stock: Number(data.id_stock), // Conversion explicite en nombre
          quantite: data.quantite,
          id_utilisateur: userId
        }),
      });

      if (!response.ok) {  // Ajout de la vérification de la réponse
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur serveur');
      }

      const result = await response.json();

      setIsDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Commande ajoutée avec succès',
        variant: 'default',
      });
      CommandeListRef.current?.refresh();

    } catch (error) {
      toast({
        title: 'Erreur',
        variant: 'destructive',
      });
    }
  };

  if (loading) return <p>Chargement...</p>

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Card className="border-none">
            <CardHeader>
              <CardTitle>
                <div className="flex justify-between">
                  <h2>Commandes</h2>
                  {userRole === 2 && (
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button onClick={handleNewReservation}>
                          <Plus /> Ajouter des Commandes
                        </Button>
                      </DialogTrigger>
                      <DialogContent
                        className={cn(
                          "sm:max-w-[600px] w-full max-h-[90vh]",
                          "overflow-y-auto"
                        )}
                      >
                        <DialogHeader>
                          <DialogTitle>Ajouter du Commande</DialogTitle>
                        </DialogHeader>
                        <div className="grid py-4 gap-4">
                          <CommandeForm onFormSubmit={handleFormSubmit} />
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CommandeList ref={CommandeListRef} />
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}