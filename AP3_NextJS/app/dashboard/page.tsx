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
import { cn } from "@/lib/utils"
import { z } from "zod"
import { useToast } from '@/hooks/use-toast';
import StockList, { StockListRef } from "@/components/stocks/stocksList"
import { StockForm, stockFormSchema } from "@/components/stocks/stockForm"

export default function Page() {
  const { user, loading } = useAuth()
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const stockListRef = useRef<StockListRef>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user?.email) {
        try {
          const response = await fetch(`/api/utilisateurs?email=${user.email}`);
          const data = await response.json();
          setUserRole(Number(data.id_role));
        } catch (error) {
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


  const handleFormSubmit = async (data: z.infer<typeof stockFormSchema>) => {
    try {
      const response = await fetch('/api/stocks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        toast({
          title: "Erreur",
          description: result.error || "Erreur lors de l'ajout du stock",
          variant: "destructive",
        });
        return;
      }

      setIsDialogOpen(false);
      toast({
        title: "Succès",
        description: "Stock ajouté avec succès",
      });
      stockListRef.current?.refresh();

    } catch (error) {
      console.error("Erreur lors de l'ajout de stock:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
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
                  <h2>Stocks</h2>
                  {userRole === 1 && (
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button onClick={handleNewReservation}>
                          <Plus /> Ajouter des stocks
                        </Button>
                      </DialogTrigger>
                      <DialogContent
                        className={cn(
                          "sm:max-w-[600px] w-full max-h-[90vh]",
                          "overflow-y-auto"
                        )}
                      >
                        <DialogHeader>
                          <DialogTitle>Ajouter du stock</DialogTitle>
                        </DialogHeader>
                        <div className="grid py-4 gap-4">
                          <StockForm onFormSubmit={handleFormSubmit} />
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StockList ref={stockListRef} />
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
