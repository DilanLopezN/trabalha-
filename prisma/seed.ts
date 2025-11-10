import { prisma } from "@/lib/prisma";

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...");

  // Criar categorias
  const categories = [
    { name: "Elétrica", slug: "eletrica" },
    { name: "Hidráulica", slug: "hidraulica" },
    { name: "Limpeza", slug: "limpeza" },
    { name: "Pintura", slug: "pintura" },
    { name: "Marcenaria", slug: "marcenaria" },
    { name: "Jardinagem", slug: "jardinagem" },
    { name: "Babá", slug: "baba" },
    { name: "Cuidador", slug: "cuidador" },
    { name: "Pedreiro", slug: "pedreiro" },
    { name: "Encanador", slug: "encanador" },
    { name: "Mecânico", slug: "mecanico" },
    { name: "Costura", slug: "costura" },
    { name: "Cozinheiro", slug: "cozinheiro" },
    { name: "Faxina", slug: "faxina" },
    { name: "Motorista", slug: "motorista" },
  ];

  console.log("📝 Criando categorias...");
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }
  console.log(`✅ ${categories.length} categorias criadas/atualizadas`);

  // Criar planos de destaque
  const plans = [
    {
      code: "BRONZE" as const,
      name: "Bronze",
      price: 15.0,
      durationDays: 7,
      priority: 1,
    },
    {
      code: "PRATA" as const,
      name: "Prata",
      price: 25.0,
      durationDays: 15,
      priority: 2,
    },
    {
      code: "OURO" as const,
      name: "Ouro",
      price: 40.0,
      durationDays: 30,
      priority: 3,
    },
    {
      code: "PLATINA" as const,
      name: "Platina",
      price: 70.0,
      durationDays: 60,
      priority: 4,
    },
  ];

  console.log("💎 Criando planos de destaque...");
  for (const plan of plans) {
    await prisma.highlightPlan.upsert({
      where: { code: plan.code },
      update: {
        name: plan.name,
        price: plan.price,
        durationDays: plan.durationDays,
        priority: plan.priority,
      },
      create: plan,
    });
  }
  console.log(`✅ ${plans.length} planos criados/atualizados`);

  console.log("🎉 Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error("❌ Erro ao executar seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
