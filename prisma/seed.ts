import { prisma } from "@/lib/prisma";
import { hashSync } from "bcryptjs";

// Tipagem parcial inspirada no Faker.js para permitir fallback simplificado
type FakerLike = {
  person: {
    fullName: () => string;
  };
  internet: {
    email: (options?: { firstName?: string; lastName?: string; provider?: string }) => string;
    url: () => string;
  };
  phone: {
    number: (mask?: string) => string;
  };
  company: {
    name: () => string;
  };
  number: {
    int: (options?: { min?: number; max?: number }) => number;
    float: (options?: { min?: number; max?: number; fractionDigits?: number }) => number;
  };
  lorem: {
    sentences: (options?: number | { min?: number; max?: number; count?: number }) => string;
    paragraphs: (
      options?: number | { min?: number; max?: number; count?: number; separator?: string }
    ) => string;
  };
  helpers: {
    arrayElement: <T>(items: T[]) => T;
    arrayElements: <T>(
      items: T[],
      options?: number | { min?: number; max?: number; count?: number }
    ) => T[];
  };
  location: {
    zipCode: () => string;
    street: () => string;
    buildingNumber: () => string;
    secondaryAddress: () => string;
    city: () => string;
    state: () => string;
    neighborhood: () => string;
  };
  datatype: {
    boolean: (options?: { probability?: number }) => boolean;
  };
  date: {
    soon: (options?: { days?: number }) => Date;
  };
  string: {
    uuid: () => string;
  };
};

async function loadFaker(): Promise<FakerLike> {
  try {
    const module = await import("@faker-js/faker/locale/pt_BR");
    console.log("✅ Biblioteca @faker-js/faker carregada com sucesso.");
    return module.faker as FakerLike;
  } catch (error) {
    console.warn(
      "⚠️ Não foi possível carregar @faker-js/faker. Usando gerador interno simplificado.",
      error instanceof Error ? error.message : error
    );
    return createFallbackFaker();
  }
}

function createFallbackFaker(): FakerLike {
  const firstNames = [
    "Ana",
    "Bruno",
    "Carlos",
    "Daniela",
    "Eduardo",
    "Fernanda",
    "Gabriel",
    "Helena",
    "Isabela",
    "João",
    "Larissa",
    "Marcos",
    "Natália",
    "Otávio",
    "Patrícia",
    "Rafael",
    "Sofia",
    "Thiago",
    "Viviane",
    "Yuri"
  ];

  const lastNames = [
    "Almeida",
    "Barbosa",
    "Cardoso",
    "Duarte",
    "Esteves",
    "Ferreira",
    "Gomes",
    "Henrique",
    "Iglesias",
    "Jardim",
    "Lopes",
    "Mendes",
    "Nascimento",
    "Oliveira",
    "Pereira",
    "Queiroz",
    "Ribeiro",
    "Silva",
    "Teixeira",
    "Vieira"
  ];

  const states = [
    {
      code: "SP",
      cities: [
        "São Paulo",
        "Campinas",
        "Santos",
        "Sorocaba",
        "Guarulhos",
        "São José dos Campos",
        "Ribeirão Preto"
      ]
    },
    {
      code: "RJ",
      cities: ["Rio de Janeiro", "Niterói", "Duque de Caxias", "Nova Iguaçu", "Petrópolis"]
    },
    {
      code: "MG",
      cities: ["Belo Horizonte", "Uberlândia", "Juiz de Fora", "Contagem", "Montes Claros"]
    },
    {
      code: "RS",
      cities: ["Porto Alegre", "Caxias do Sul", "Pelotas", "Santa Maria", "Novo Hamburgo"]
    },
    {
      code: "BA",
      cities: ["Salvador", "Feira de Santana", "Vitória da Conquista", "Itabuna", "Ilhéus"]
    },
    {
      code: "PR",
      cities: ["Curitiba", "Londrina", "Maringá", "Foz do Iguaçu", "Ponta Grossa"]
    },
    {
      code: "SC",
      cities: ["Florianópolis", "Joinville", "Blumenau", "Chapecó", "Itajaí"]
    },
    {
      code: "PE",
      cities: ["Recife", "Olinda", "Caruaru", "Petrolina", "Jaboatão dos Guararapes"]
    },
    {
      code: "GO",
      cities: ["Goiânia", "Anápolis", "Aparecida de Goiânia", "Rio Verde", "Luziânia"]
    },
    {
      code: "DF",
      cities: ["Brasília", "Taguatinga", "Ceilândia", "Gama", "Planaltina"]
    }
  ];

  const neighborhoods = [
    "Centro",
    "Jardim das Flores",
    "Vila Nova",
    "Bela Vista",
    "Boa Viagem",
    "Cidade Baixa",
    "Lapa",
    "Moema",
    "Pinheiros",
    "Ponta Verde",
    "Savassi",
    "Tamboré",
    "Vila Madalena"
  ];

  const streetNames = [
    "Rua das Acácias",
    "Rua das Flores",
    "Rua da Liberdade",
    "Rua São José",
    "Avenida Brasil",
    "Avenida Atlântica",
    "Avenida Paulista",
    "Praça da República",
    "Travessa dos Pescadores",
    "Alameda dos Lírios"
  ];

  const companyPrefixes = [
    "Serviços",
    "Grupo",
    "Companhia",
    "Cooperativa",
    "Rede",
    "Central",
    "Construtora",
    "Tec",
    "Soluções",
    "Atendimento"
  ];

  const companySuffixes = ["LTDA", "ME", "S/A", "EIRELI", "SS", "Holding", "Consultoria"];

  const loremPool = [
    "Atuamos com excelência e compromisso em todos os serviços prestados.",
    "Buscamos profissionais dedicados e responsáveis para integrar nossa equipe.",
    "A satisfação do cliente é o principal foco de nosso trabalho diário.",
    "Valorizamos a transparência, o respeito e a comunicação clara com nossos parceiros.",
    "Temos um ambiente colaborativo que incentiva o crescimento profissional.",
    "Oferecemos treinamentos constantes para aprimorar as habilidades da equipe.",
    "Prezamos por entregas de qualidade dentro dos prazos estabelecidos.",
    "Somos apaixonados por encontrar soluções criativas para desafios complexos.",
    "Nosso time está sempre atualizado com as melhores práticas de mercado.",
    "Buscamos construir relações duradouras e de confiança com nossos clientes."
  ];

  const random = {
    int(min: number, max: number) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    float(min: number, max: number, fractionDigits = 2) {
      const value = Math.random() * (max - min) + min;
      return parseFloat(value.toFixed(fractionDigits));
    }
  };

  function randomItem<T>(items: T[]): T {
    return items[random.int(0, items.length - 1)];
  }

  function randomItems<T>(
    items: T[],
    count: number
  ): T[] {
    const copy = [...items];
    const result: T[] = [];
    const max = Math.min(count, copy.length);
    for (let i = 0; i < max; i++) {
      const index = random.int(0, copy.length - 1);
      result.push(copy[index]);
      copy.splice(index, 1);
    }
    return result;
  }

  function randomName() {
    const first = randomItem(firstNames);
    const last = randomItem(lastNames);
    return `${first} ${last}`;
  }

  function randomStateCity() {
    const state = randomItem(states);
    const city = randomItem(state.cities);
    return { state: state.code, city };
  }

  function pad(value: number, size: number) {
    return value.toString().padStart(size, "0");
  }

  return {
    person: {
      fullName: randomName
    },
    internet: {
      email({ firstName, lastName, provider }: { firstName?: string; lastName?: string; provider?: string } = {}) {
        const first = (firstName ?? randomItem(firstNames)).toLowerCase().normalize("NFD").replace(/[^a-z]/g, "");
        const last = (lastName ?? randomItem(lastNames)).toLowerCase().normalize("NFD").replace(/[^a-z]/g, "");
        const domain = provider ?? "example.com";
        const suffix = pad(random.int(1, 9999), 4);
        return `${first}.${last}${suffix}@${domain}`;
      },
      url() {
        const domain = randomName()
          .toLowerCase()
          .normalize("NFD")
          .replace(/[^a-z0-9]/g, "");
        return `https://www.${domain}.com.br/${pad(random.int(1, 9999), 4)}`;
      }
    },
    phone: {
      number(mask = "+55 ## #####-####") {
        return mask.replace(/#/g, () => random.int(0, 9).toString());
      }
    },
    company: {
      name() {
        const prefix = randomItem(companyPrefixes);
        const base = randomName();
        const suffix = randomItem(companySuffixes);
        return `${prefix} ${base} ${suffix}`;
      }
    },
    number: {
      int({ min = 0, max = 9999 }: { min?: number; max?: number } = {}) {
        return random.int(min, max);
      },
      float({ min = 0, max = 1, fractionDigits = 2 }: { min?: number; max?: number; fractionDigits?: number } = {}) {
        return random.float(min, max, fractionDigits);
      }
    },
    lorem: {
      sentences(options: number | { min?: number; max?: number; count?: number } = 2) {
        let count: number;
        if (typeof options === "number") {
          count = options;
        } else if (typeof options === "object" && options.count) {
          count = options.count;
        } else {
          const min = typeof options === "object" && options.min ? options.min : 1;
          const max = typeof options === "object" && options.max ? options.max : min + 2;
          count = random.int(min, max);
        }
        return randomItems(loremPool, count).join(" ");
      },
      paragraphs(options: number | { min?: number; max?: number; count?: number; separator?: string } = 3) {
        let count: number;
        let separator = "\n\n";
        if (typeof options === "number") {
          count = options;
        } else {
          if (options.count) {
            count = options.count;
          } else {
            const min = options.min ?? 1;
            const max = options.max ?? Math.max(min, 3);
            count = random.int(min, max);
          }
          if (options.separator) {
            separator = options.separator;
          }
        }
        return Array.from({ length: count }, () => randomItems(loremPool, random.int(2, 4)).join(" "))
          .join(separator);
      }
    },
    helpers: {
      arrayElement<T>(items: T[]) {
        return randomItem(items);
      },
      arrayElements<T>(items: T[], options: number | { min?: number; max?: number; count?: number } = 1) {
        let count: number;
        if (typeof options === "number") {
          count = options;
        } else if (options.count) {
          count = options.count;
        } else {
          const min = options.min ?? 1;
          const max = options.max ?? items.length;
          count = random.int(min, Math.min(max, items.length));
        }
        return randomItems(items, count);
      }
    },
    location: {
      zipCode() {
        return `${pad(random.int(10000, 99999), 5)}-${pad(random.int(0, 999), 3)}`;
      },
      street() {
        return randomItem(streetNames);
      },
      buildingNumber() {
        return pad(random.int(1, 9999), random.int(1, 4));
      },
      secondaryAddress() {
        return `Apto ${pad(random.int(1, 999), 3)}`;
      },
      city() {
        return randomStateCity().city;
      },
      state() {
        return randomStateCity().state;
      },
      neighborhood() {
        return randomItem(neighborhoods);
      }
    },
    datatype: {
      boolean({ probability = 0.5 }: { probability?: number } = {}) {
        return Math.random() < probability;
      }
    },
    date: {
      soon({ days = 1 }: { days?: number } = {}) {
        const ms = random.float(0, days * 24 * 60 * 60 * 1000, 0);
        return new Date(Date.now() + ms);
      }
    },
    string: {
      uuid() {
        if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
          return crypto.randomUUID();
        }
        const template = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
        return template.replace(/[xy]/g, (char) => {
          const rand = Math.random() * 16;
          const value = char === "x" ? Math.floor(rand) : (Math.floor(rand) & 0x3) | 0x8;
          return value.toString(16);
        });
      }
    }
  };
}

function generateAvailability(faker: FakerLike) {
  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;
  const availability: Record<string, string[]> = {};

  for (const day of days) {
    if (faker.datatype.boolean({ probability: 0.75 })) {
      const shifts = faker.helpers.arrayElements(
        ["08:00-12:00", "09:00-13:00", "13:00-17:00", "14:00-18:00", "18:00-22:00"],
        { min: 1, max: 2 }
      );
      availability[day] = shifts;
    }
  }

  return availability;
}

function formatMonetaryValue(value: number) {
  return value.toFixed(2);
}

function generateJobTitle(categoryName: string, faker: FakerLike) {
  const action = faker.helpers.arrayElement([
    "Procura",
    "Contrata",
    "Seleciona",
    "Busca",
    "Está contratando"
  ]);
  return `${action} profissional de ${categoryName}`;
}

function generateJobStages() {
  const baseStages = [
    "Triagem de currículos",
    "Contato inicial",
    "Entrevista técnica",
    "Prova prática",
    "Visita ao local",
    "Reunião final"
  ];
  return baseStages.map((nome, index) => ({ ordem: index + 1, nome }));
}

function generateCNPJ() {
  const randomDigits = () => Math.floor(Math.random() * 10);
  const digits = Array.from({ length: 12 }, randomDigits);
  // for simplicity we won't calculate verification digits accurately, but format string realistically
  const formatted = `${digits[0]}${digits[1]}.${digits[2]}${digits[3]}${digits[4]}.${digits[5]}${digits[6]}${digits[7]}/${digits[8]}${digits[9]}${digits[10]}${digits[11]}-00`;
  return formatted;
}

function generateAddress(faker: FakerLike) {
  const street = faker.location.street();
  const number = faker.location.buildingNumber();
  const complement = faker.location.secondaryAddress();
  const neighborhood = faker.location.neighborhood();
  const city = faker.location.city();
  const state = faker.location.state();
  const cep = faker.location.zipCode();

  return {
    street,
    number,
    complement,
    neighborhood,
    city,
    state,
    cep
  };
}

function generateWhatsapp(faker: FakerLike) {
  return faker.phone.number("+55 ## 9####-####");
}

async function main() {
  const faker = await loadFaker();

  console.log("🧹 Limpando dados existentes...");
  await prisma.candidatura.deleteMany();
  await prisma.vagaFavorita.deleteMany();
  await prisma.vagaEtapa.deleteMany();
  await prisma.vaga.deleteMany();
  await prisma.employerProfile.deleteMany();
  await prisma.workerProfile.deleteMany();
  await prisma.highlight.deleteMany();
  await prisma.ad.deleteMany();
  await prisma.user.deleteMany();

  console.log("🌱 Iniciando seed do banco de dados...");

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
    { name: "Motorista", slug: "motorista" }
  ];

  console.log("📝 Criando categorias...");
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category
    });
  }
  console.log(`✅ ${categories.length} categorias criadas/atualizadas`);

  const plans = [
    {
      code: "BRONZE" as const,
      name: "Bronze",
      price: 15.0,
      durationDays: 7,
      priority: 1
    },
    {
      code: "PRATA" as const,
      name: "Prata",
      price: 25.0,
      durationDays: 15,
      priority: 2
    },
    {
      code: "OURO" as const,
      name: "Ouro",
      price: 40.0,
      durationDays: 30,
      priority: 3
    },
    {
      code: "PLATINA" as const,
      name: "Platina",
      price: 70.0,
      durationDays: 60,
      priority: 4
    }
  ];

  console.log("💎 Criando planos de destaque...");
  for (const plan of plans) {
    await prisma.highlightPlan.upsert({
      where: { code: plan.code },
      update: {
        name: plan.name,
        price: plan.price,
        durationDays: plan.durationDays,
        priority: plan.priority
      },
      create: plan
    });
  }
  console.log(`✅ ${plans.length} planos criados/atualizados`);

  const allCategories = await prisma.category.findMany();
  const highlightPlans = await prisma.highlightPlan.findMany();

  const passwordHash = hashSync("123456", 10);
  const workerUsers: { id: string }[] = [];
  const employerUsers: { id: string }[] = [];

  const WORKER_COUNT = 80;
  const EMPLOYER_COUNT = 30;

  console.log("👷‍♀️ Criando prestadores de serviço...");
  for (let index = 0; index < WORKER_COUNT; index++) {
    const name = faker.person.fullName();
    const [firstName, lastName] = name.split(" ");
    const emailBase = faker.internet.email({ firstName, lastName, provider: "trabalhai.com" }).toLowerCase();
    const uniqueEmail = emailBase.replace("@", `.${index}@`);
    const whatsapp = generateWhatsapp(faker);
    const category = faker.helpers.arrayElement(allCategories);
    const availability = generateAvailability(faker);
    const averagePrice = formatMonetaryValue(
      faker.number.float({ min: 80, max: 450, fractionDigits: 2 })
    );
    const address = generateAddress(faker);

    const worker = await prisma.user.create({
      data: {
        name,
        email: uniqueEmail,
        passwordHash,
        role: "PRESTADOR",
        whatsapp,
        ...address,
        workerProfile: {
          create: {
            categoryId: category.id,
            averagePrice,
            availability,
            description: faker.lorem.paragraphs({ min: 2, max: 4 }),
            resumeUrl: faker.internet.url()
          }
        }
      }
    });

    workerUsers.push({ id: worker.id });
  }
  console.log(`✅ ${workerUsers.length} prestadores criados`);

  console.log("🏢 Criando empregadores...");
  for (let index = 0; index < EMPLOYER_COUNT; index++) {
    const contactName = faker.person.fullName();
    const [firstName, lastName] = contactName.split(" ");
    const emailBase = faker.internet.email({ firstName, lastName, provider: "empregadores.com" }).toLowerCase();
    const uniqueEmail = emailBase.replace("@", `.${index}@`);
    const whatsapp = generateWhatsapp(faker);
    const category = faker.helpers.arrayElement(allCategories);
    const companyName = faker.company.name();
    const budget = formatMonetaryValue(
      faker.number.float({ min: 500, max: 15000, fractionDigits: 2 })
    );
    const address = generateAddress(faker);

    const employer = await prisma.user.create({
      data: {
        name: `${companyName} - ${contactName}`,
        email: uniqueEmail,
        passwordHash,
        role: "EMPREGADOR",
        whatsapp,
        cnpj: generateCNPJ(),
        ...address,
        employerProfile: {
          create: {
            advertisedService: `Contratação de profissionais de ${category.name}`,
            budget,
            categoryId: category.id,
            availability: generateAvailability(faker)
          }
        }
      }
    });

    employerUsers.push({ id: employer.id });
  }
  console.log(`✅ ${employerUsers.length} empregadores criados`);

  console.log("📣 Criando vagas de emprego...");
  const createdVagas: { id: string }[] = [];

  for (const employer of employerUsers) {
    const vagasPorEmpregador = faker.number.int({ min: 2, max: 5 });

    for (let i = 0; i < vagasPorEmpregador; i++) {
      const category = faker.helpers.arrayElement(allCategories);
      const salarioTipo = faker.helpers.arrayElement(["FIXO", "A_COMBINAR"]) as "FIXO" | "A_COMBINAR";
      const salarioValor =
        salarioTipo === "FIXO"
          ? formatMonetaryValue(
              faker.number.float({ min: 1200, max: 8000, fractionDigits: 2 })
            )
          : null;
      const isPaidAd = faker.datatype.boolean({ probability: 0.35 });
      const paidAdExpiresAt = isPaidAd ? faker.date.soon({ days: 45 }) : null;

      const vaga = await prisma.vaga.create({
        data: {
          empregadorId: employer.id,
          titulo: generateJobTitle(category.name, faker),
          descricao: faker.lorem.paragraphs({ min: 2, max: 5 }),
          salarioTipo,
          salarioValor,
          categoryId: category.id,
          status: "ABERTA",
          isPaidAd,
          paidAdExpiresAt,
          etapas: {
            create: generateJobStages()
          }
        }
      });

      createdVagas.push({ id: vaga.id });

      const candidaturasCount = Math.min(
        workerUsers.length,
        faker.number.int({ min: 3, max: 8 })
      );
      const candidatos = faker.helpers.arrayElements(workerUsers, candidaturasCount);
      for (const candidato of candidatos) {
        await prisma.candidatura.create({
          data: {
            vagaId: vaga.id,
            prestadorId: candidato.id,
            mensagem: faker.lorem.sentences({ min: 1, max: 3 }),
            status: faker.helpers.arrayElement([
              "PENDENTE",
              "EM_AVALIACAO",
              "ENTREVISTA",
              "FINALISTA"
            ])
          }
        });
      }

      const favoritosCount = Math.min(
        workerUsers.length,
        faker.number.int({ min: 2, max: 5 })
      );
      const favoritos = faker.helpers.arrayElements(workerUsers, favoritosCount);
      const favoritosCriados = new Set<string>();
      for (const favorito of favoritos) {
        if (favoritosCriados.has(favorito.id)) continue;
        favoritosCriados.add(favorito.id);
        await prisma.vagaFavorita.create({
          data: {
            vagaId: vaga.id,
            prestadorId: favorito.id
          }
        });
      }
    }
  }

  console.log(`✅ ${createdVagas.length} vagas criadas`);

  console.log("✨ Criando destaques para prestadores...");
  const destaquePrestadores = faker.helpers.arrayElements(workerUsers, {
    min: 10,
    max: Math.min(workerUsers.length, 20)
  });

  for (const prestador of destaquePrestadores) {
    const plan = faker.helpers.arrayElement(highlightPlans);
    const duration = plans.find((p) => p.code === plan.code)?.durationDays ?? 7;
    const startsAt = new Date();
    const endsAt = new Date(startsAt.getTime() + duration * 24 * 60 * 60 * 1000);

    await prisma.highlight.create({
      data: {
        userId: prestador.id,
        planId: plan.id,
        startsAt,
        endsAt,
        status: "ACTIVE"
      }
    });
  }
  console.log(`✅ ${destaquePrestadores.length} destaques criados`);

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
