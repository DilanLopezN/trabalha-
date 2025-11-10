import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cep = searchParams.get("cep");

    if (!cep) {
      return NextResponse.json({ error: "CEP é obrigatório" }, { status: 400 });
    }

    // Remover caracteres não numéricos
    const cleanCep = cep.replace(/\D/g, "");

    // Validar formato do CEP
    if (cleanCep.length !== 8) {
      return NextResponse.json(
        { error: "CEP inválido. Deve conter 8 dígitos" },
        { status: 400 }
      );
    }

    // Buscar CEP na API ViaCEP
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);

    if (!response.ok) {
      return NextResponse.json(
        { error: "Erro ao buscar CEP" },
        { status: 500 }
      );
    }

    const data = await response.json();

    // ViaCEP retorna erro: true quando CEP não existe
    if (data.erro) {
      return NextResponse.json(
        { error: "CEP não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      cep: data.cep,
      street: data.logradouro,
      complement: data.complemento,
      neighborhood: data.bairro,
      city: data.localidade,
      state: data.uf,
    });
  } catch (error) {
    console.error("Erro ao buscar CEP:", error);
    return NextResponse.json({ error: "Erro ao buscar CEP" }, { status: 500 });
  }
}
