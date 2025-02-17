"use client"

import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export default function DocumentationPage() {
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
                  <BreadcrumbPage>Guide d'utilisation</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Card className="border-none">
            <CardHeader>
              <CardTitle>
                <div className="flex justify-between items-center">
                  <h2>Guide d'utilisation de l'application</h2>
                  <a href="/GUIDE_UTILISATION_AP3.pdf" download="GUIDE_UTILISATION_AP3.pdf">
                    <Button variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Télécharger le PDF
                    </Button>
                  </a>
                </div>
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}