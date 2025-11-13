import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "workers"; // workers ou employers
    const categoryId = searchParams.get("categoryId");
    const q = searchParams.get("q");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const minBudget = searchParams.get("minBudget");
    const maxBudget = searchParams.get("maxBudget");
    const state = searchParams.get("state");
    const city = searchParams.get("city");

    if (type === "workers") {
      const workerProfileFilter: Record<string, any> = {};
      if (categoryId) {
        workerProfileFilter.categoryId = categoryId;
      }

      const workerWhere: Record<string, any> = {
        role: "PRESTADOR",
        workerProfile: {
          is: workerProfileFilter,
        },
        ...(state && {
          state: { equals: state, mode: "insensitive" as const },
        }),
        ...(city && {
          city: { equals: city, mode: "insensitive" as const },
        }),
      };

      if (q) {
        workerWhere.OR = [
          { name: { contains: q, mode: "insensitive" } },
          {
            workerProfile: {
              is: {
                ...workerProfileFilter,
                description: { contains: q, mode: "insensitive" },
              },
            },
          },
        ];
      }

      const workers = await prisma.user.findMany({
        where: workerWhere,
        include: {
          workerProfile: {
            include: {
              category: true,
            },
          },
          highlights: {
            where: {
              status: "ACTIVE",
              endsAt: {
                gt: new Date(),
              },
            },
            include: {
              plan: true,
            },
            orderBy: {
              plan: {
                priority: "desc",
              },
            },
            take: 1,
          },
        },
        take: 50,
      });

      // Filtrar por preço
      let filteredWorkers = workers;
      if (minPrice || maxPrice) {
        filteredWorkers = workers.filter((w) => {
          const price = Number(w.workerProfile?.averagePrice || 0);
          const min = minPrice ? Number(minPrice) : 0;
          const max = maxPrice ? Number(maxPrice) : Infinity;
          return price >= min && price <= max;
        });
      }

      // Formatar resultado
      const results = filteredWorkers.map((worker) => ({
        id: worker.id,
        name: worker.name || "Sem nome",
        role: worker.role,
        image: worker.image,
        whatsapp: worker.whatsapp,
        profile: {
          id: worker.workerProfile?.id || "",
          categoryId: worker.workerProfile?.categoryId || "",
          category: worker.workerProfile?.category,
          averagePrice: Number(worker.workerProfile?.averagePrice || 0),
          description: worker.workerProfile?.description || "",
          availability: worker.workerProfile?.availability || {},
          resumeUrl: worker.workerProfile?.resumeUrl,
        },
        city: worker.city,
        state: worker.state,
        highlightPlan: worker.highlights[0]?.plan?.code || null,
        relevanceScore: worker.highlights[0]
          ? worker.highlights[0].plan.priority
          : 0,
      }));

      // Ordenar por relevância (destaques primeiro)
      results.sort((a, b) => b.relevanceScore - a.relevanceScore);

      return NextResponse.json({ results });
    } else {
      const employerProfileFilter: Record<string, any> = {};
      if (categoryId) {
        employerProfileFilter.categoryId = categoryId;
      }

      const employerWhere: Record<string, any> = {
        role: "EMPREGADOR",
        employerProfile: {
          is: employerProfileFilter,
        },
        ...(state && {
          state: { equals: state, mode: "insensitive" as const },
        }),
        ...(city && {
          city: { equals: city, mode: "insensitive" as const },
        }),
      };

      if (q) {
        employerWhere.OR = [
          { name: { contains: q, mode: "insensitive" } },
          {
            employerProfile: {
              is: {
                ...employerProfileFilter,
                advertisedService: { contains: q, mode: "insensitive" },
              },
            },
          },
        ];
      }

      const employers = await prisma.user.findMany({
        where: employerWhere,
        include: {
          employerProfile: {
            include: {
              category: true,
            },
          },
          highlights: {
            where: {
              status: "ACTIVE",
              endsAt: {
                gt: new Date(),
              },
            },
            include: {
              plan: true,
            },
            orderBy: {
              plan: {
                priority: "desc",
              },
            },
            take: 1,
          },
        },
        take: 50,
      });

      // Filtrar por orçamento
      let filteredEmployers = employers;
      if (minBudget || maxBudget) {
        filteredEmployers = employers.filter((e) => {
          const budget = Number(e.employerProfile?.budget || 0);
          const min = minBudget ? Number(minBudget) : 0;
          const max = maxBudget ? Number(maxBudget) : Infinity;
          return budget >= min && budget <= max;
        });
      }

      // Formatar resultado
      const results = filteredEmployers.map((employer) => ({
        id: employer.id,
        name: employer.name || "Sem nome",
        role: employer.role,
        image: employer.image,
        whatsapp: employer.whatsapp,
        profile: {
          id: employer.employerProfile?.id || "",
          categoryId: employer.employerProfile?.categoryId || "",
          category: employer.employerProfile?.category,
          advertisedService: employer.employerProfile?.advertisedService || "",
          budget: Number(employer.employerProfile?.budget || 0),
          availability: employer.employerProfile?.availability || {},
        },
        city: employer.city,
        state: employer.state,
        highlightPlan: employer.highlights[0]?.plan?.code || null,
        relevanceScore: employer.highlights[0]
          ? employer.highlights[0].plan.priority
          : 0,
      }));

      // Ordenar por relevância (destaques primeiro)
      results.sort((a, b) => b.relevanceScore - a.relevanceScore);

      return NextResponse.json({ results });
    }
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return NextResponse.json(
      { error: "Erro ao buscar usuários" },
      { status: 500 }
    );
  }
}
