"use client"

import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { useAuth } from "@/context/AuthContext"

const faqs = [
  {
    question: "Comment créer une commande ?",
    answer: "Pour créer une commande, connectez-vous à votre compte, accédez à la section 'Commandes' et cliquez sur le bouton 'Ajouter des Commandes'. Remplissez ensuite le formulaire avec les détails de votre commande."
  },
  {
    question: "Comment suivre l'état de ma commande ?",
    answer: "Vous pouvez suivre l'état de votre commande dans la section 'Commandes'. Le statut de chaque commande est affiché et peut être : en attente, validée ou invalidée."
  },
  {
    question: "Qui peut valider une commande ?",
    answer: "Seuls les administrateurs peuvent valider ou refuser les commandes. Une fois soumise, votre commande sera examinée par un administrateur."
  },
  {
    question: "Puis-je modifier ma commande ?",
    answer: "Oui, vous pouvez modifier ou supprimer vos commandes tant qu'elles n'ont pas été validées par un administrateur. Utilisez les boutons d'édition ou de suppression à côté de votre commande."
  }
];

export default function Page() {
  const { user, loading } = useAuth()

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
                  <BreadcrumbPage>FAQ</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Card className="border-none">
            <CardHeader>
              <CardTitle>Foire Aux Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b pb-4">
                  <h3 className="text-lg font-medium mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )}