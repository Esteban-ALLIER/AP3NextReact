import { NextResponse } from 'next/server';
import { CreateUtilisateurs } from '@/services/utilisateursService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      );
    }

    const utilisateur = await prisma.utilisateurs.findFirst({
      where: {
        email: email
      }
    });

    if (!utilisateur) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Conversion des BigInt en nombres normaux sinon role impossible a lire 
    const serializedUser = {
      ...utilisateur,
      id_utilisateur: Number(utilisateur.id_utilisateur),
      id_role: Number(utilisateur.id_role)
    };

    return NextResponse.json(serializedUser);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

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
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création de l\'utilisateur' },
      { status: 500 }
    );
  }
}