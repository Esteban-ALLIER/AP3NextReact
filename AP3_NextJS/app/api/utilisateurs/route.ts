// app/api/utilisateurs/route.ts
import { NextResponse } from 'next/server';
import { CreateUtilisateurs } from '@/services/utilisateursService';


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nom, prenom, email, password } = body;

    const utilisateur = await CreateUtilisateurs({
      nom,
      prenom,
      email,
      password
    });

    return NextResponse.json({ success: true, utilisateur });
  } catch (error) {
    console.error('Erreur création utilisateur:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création de l\'utilisateur' },
      { status: 500 }
    );
  }
}