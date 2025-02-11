"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Input } from '@/components/ui/input';
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { stocks } from "@prisma/client"

export const commandeFormSchema = z.object({
    date_commande: z.date({
        required_error: "La date est obligatoire.",
    }),
    id_stock: z.string().min(1, {
        message: "Veuillez sélectionner un stock.",
    }),
    quantite: z.number().positive({
        message: "Veuillez renseigner une quantité positive.",
    }),
})


enum type {
    medicament,
    materiel
}

export function CommandeForm({ onFormSubmit }: { onFormSubmit?: (data: z.infer<typeof commandeFormSchema>) => void }) {
    // recuperation via useQuery
    const {
        data: stocks = [],
        isLoading: isLoadingStocks,
        error: errorStocks,
    } = useQuery<stocks[], Error>({
        queryKey: ["stocks"],
        queryFn: () => fetch("/api/stocks").then((res) => res.json()),
    })

    const form = useForm<z.infer<typeof commandeFormSchema>>({
        resolver: zodResolver(commandeFormSchema),
        defaultValues: {
            date_commande: undefined,
            id_stock: "",
            quantite: 0,
        },
    })

    function onSubmit(data: z.infer<typeof commandeFormSchema>) {
        if (onFormSubmit) {
            const formattedData = {
                ...data,
                quantite: Number(data.quantite),
            }
            onFormSubmit(formattedData)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
                {/* Date d'entrée */}
                <FormField
                    control={form.control}
                    name="date_commande"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Date d'entrée</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-[240px] pl-3 text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                        >
                                            {field.value ? (
                                                format(field.value, "PPP")
                                            ) : (
                                                <span>Sélectionnez une date</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) => date < new Date("2000-01-01")}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {/* id_stock */}
                <FormField
                    control={form.control}
                    name="id_stock"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Stock</FormLabel>
                            <FormControl>
                                {isLoadingStocks ? (
                                    <p>Chargement des stocks...</p>
                                ) : errorStocks ? (
                                    <p>Erreur lors du chargement des stocks.</p>
                                ) : (
                                    <Select
                                        onValueChange={(value) => field.onChange(value)}
                                        defaultValue={field.value}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionnez un stock" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {stocks.map((stock) => (
                                                <SelectItem key={stock.id_stock} value={stock.id_stock.toString()}>
                                                    {stock.nom}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </FormControl>
                            <FormDescription>
                                Choisissez le stock pour cette commande.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {/* quantite */}
                <FormField
                    control={form.control}
                    name="quantite"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>quantité</FormLabel>
                            <Input
                                id="quantite"
                                type="number"
                                {...field}
                                onChange={e => field.onChange(Number(e.target.value))} 
                            />
                            <FormDescription>
                                Choisissez une quantité pour cette commande.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit">Soumettre</Button>
            </form>
        </Form>
    )
}