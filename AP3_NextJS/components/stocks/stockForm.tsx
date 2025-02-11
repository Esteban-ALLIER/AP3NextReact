"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Input } from '@/components/ui/input';
import { Button } from "@/components/ui/button"
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage,} from "@/components/ui/form"
import { type as StockType } from "@prisma/client"; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query"
import { utilisateurs, stocks } from "@prisma/client"

enum TypeStock {
    medicament = "medicament",
    materiel = "materiel"
}

// schema calidation du formulaire
export const stockFormSchema = z.object({
    nom: z.string().min(1, {
        message: "Veuillez renseigner le nom.",
    }),
    description: z.string().min(1, {
        message: "Veuillez renseigner une description.",
    }),
    quantite_disponible: z.number().positive({
        message: "Veuillez renseigner une quantité positive.",
    }),
    type: z.nativeEnum(StockType),
})

export function StockForm({ onFormSubmit }: { onFormSubmit?: (data: z.infer<typeof stockFormSchema>) => void }) {
    
    // recuperation via useQuery
    const {
        data: stocks = [],
        isLoading: isLoadingStocks,
        error: errorStocks,
    } = useQuery<stocks[], Error>({
        queryKey: ["stocks"],
        queryFn: () => fetch("/api/stocks").then((res) => res.json()),
    })

    const form = useForm<z.infer<typeof stockFormSchema>>({
        resolver: zodResolver(stockFormSchema),
        defaultValues: {
            nom: "",
            description: "",
            quantite_disponible: 0,
            type: TypeStock.medicament, 
        },
    })

    function onSubmit(data: z.infer<typeof stockFormSchema>) {
        if (onFormSubmit) {
            const formattedData = {
                ...data,
                quantite_disponible: Number(data.quantite_disponible),
            }
            onFormSubmit(formattedData)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
                {/* Champ Nom */}
                <FormField
                    control={form.control}
                    name="nom"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nom du médicament ou du matériel</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Champ Description */}
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Champ Quantité Disponible */}
                <FormField
                    control={form.control}
                    name="quantite_disponible"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Quantité</FormLabel>
                            <Input
                                id="quantite_disponible"
                                type="number"
                                {...field}
                                onChange={e => field.onChange(Number(e.target.value))} 
                            />
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Champ Type */}
                <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Type</FormLabel>
                            <FormControl>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionnez un type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={StockType.medicament}>Médicament</SelectItem>
                                        <SelectItem value={StockType.materiel}>Matériel</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit">Soumettre</Button>
            </form>
        </Form>
    )
}