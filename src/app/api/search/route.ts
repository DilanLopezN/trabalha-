import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { BRAZIL_STATES } from "@/constants/brazil-states";
import { normalizeCityName } from "@/lib/strings";

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
    const stateParam = searchParams.get("state");
    const cityParam = searchParams.get("city");
    const pageParam = Number.parseInt(searchParams.get("page") || "1", 10);
    const pageSizeParam = Number.parseInt(
      searchParams.get("pageSize") || "15",
      10
    );

    const validState = stateParam
      ? BRAZIL_STATES.find((s) => s.value === stateParam.toUpperCase())
      : undefined;
    const state = validState?.value;
    const normalizedCity = cityParam
      ? normalizeCityName(cityParam)
      : undefined;

    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
    const pageSize =
      pageSizeParam === 25
        ? 25
        : Number.isFinite(pageSizeParam) && pageSizeParam > 0
          ? 15
          : 15;

    const now = new Date();

    if (type === "workers") {
      const workerProfileFilter: Prisma.WorkerProfileWhereInput = {};
      if (categoryId) {
        workerProfileFilter.categoryId = categoryId;
      }

      const minPriceNumber = minPrice ? Number(minPrice) : undefined;
      const maxPriceNumber = maxPrice ? Number(maxPrice) : undefined;

      if (
        (minPriceNumber !== undefined && Number.isFinite(minPriceNumber)) ||
        (maxPriceNumber !== undefined && Number.isFinite(maxPriceNumber))
      ) {
        workerProfileFilter.averagePrice = {
          ...(minPriceNumber !== undefined && Number.isFinite(minPriceNumber)
            ? { gte: new Prisma.Decimal(minPriceNumber) }
            : {}),
          ...(maxPriceNumber !== undefined && Number.isFinite(maxPriceNumber)
            ? { lte: new Prisma.Decimal(maxPriceNumber) }
            : {}),
        };
      }

      const workerWhere: Prisma.UserWhereInput = {
        role: "PRESTADOR",
        workerProfile: {
          is: workerProfileFilter,
        },
      };

      const andConditions: Prisma.UserWhereInput[] = [];

      if (state) {
        andConditions.push({
          state: { equals: state, mode: "insensitive" },
        });
      }

      if (normalizedCity) {
        const cityConditions: Prisma.UserWhereInput[] = [
          {
            city: { equals: normalizedCity, mode: "insensitive" },
          },
        ];

        if (cityParam && normalizedCity !== cityParam) {
          cityConditions.push({
            city: { equals: cityParam, mode: "insensitive" },
          });
        }

        andConditions.push({ OR: cityConditions });
      }

      if (andConditions.length > 0) {
        workerWhere.AND = andConditions;
      }

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
      const highlightWhere: Prisma.HighlightWhereInput = {
        status: "ACTIVE",
        endsAt: { gt: now },
        user: workerWhere,
      };

      const [highlightCount, totalUsers] = await Promise.all([
        prisma.highlight.count({ where: highlightWhere }),
        prisma.user.count({ where: workerWhere }),
      ]);

      const totalPages = Math.max(Math.ceil(totalUsers / pageSize), 1);
      const currentPage = totalUsers === 0 ? 1 : Math.min(page, totalPages);
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;

      const highlightStartIndex = Math.min(startIndex, highlightCount);
      const highlightEndIndex = Math.min(endIndex, highlightCount);
      const highlightTake = Math.max(highlightEndIndex - highlightStartIndex, 0);

      const highlightResults = highlightTake
        ? await prisma.highlight.findMany({
            where: highlightWhere,
            include: {
              plan: true,
              user: {
                include: {
                  workerProfile: {
                    include: {
                      category: true,
                    },
                  },
                },
              },
            },
            orderBy: [
              { plan: { priority: "desc" } },
              { endsAt: "asc" },
            ],
            skip: highlightStartIndex,
            take: highlightTake,
          })
        : [];

      const nonHighlightSkip = Math.max(startIndex - highlightCount, 0);
      const nonHighlightTake = Math.max(pageSize - highlightTake, 0);

      const nonHighlightWhere: Prisma.UserWhereInput = {
        ...workerWhere,
        highlights: {
          none: {
            status: "ACTIVE",
            endsAt: { gt: now },
          },
        },
      };

      const nonHighlightResults = nonHighlightTake
        ? await prisma.user.findMany({
            where: nonHighlightWhere,
            include: {
              workerProfile: {
                include: {
                  category: true,
                },
              },
            },
            orderBy: [{ createdAt: "desc" }],
            skip: nonHighlightSkip,
            take: nonHighlightTake,
          })
        : [];

      const mappedHighlights = highlightResults.map((highlight) => {
        const worker = highlight.user;
        return {
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
          highlightPlan: highlight.plan?.code || null,
          relevanceScore: highlight.plan?.priority || 0,
        };
      });

      const mappedNonHighlights = nonHighlightResults.map((worker) => ({
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
        highlightPlan: null,
        relevanceScore: 0,
      }));

      return NextResponse.json({
        results: [...mappedHighlights, ...mappedNonHighlights],
        total: totalUsers,
        page: currentPage,
        pageSize,
      });
    } else {
      const employerProfileFilter: Prisma.EmployerProfileWhereInput = {};
      if (categoryId) {
        employerProfileFilter.categoryId = categoryId;
      }

      const minBudgetNumber = minBudget ? Number(minBudget) : undefined;
      const maxBudgetNumber = maxBudget ? Number(maxBudget) : undefined;

      if (
        (minBudgetNumber !== undefined && Number.isFinite(minBudgetNumber)) ||
        (maxBudgetNumber !== undefined && Number.isFinite(maxBudgetNumber))
      ) {
        employerProfileFilter.budget = {
          ...(minBudgetNumber !== undefined && Number.isFinite(minBudgetNumber)
            ? { gte: new Prisma.Decimal(minBudgetNumber) }
            : {}),
          ...(maxBudgetNumber !== undefined && Number.isFinite(maxBudgetNumber)
            ? { lte: new Prisma.Decimal(maxBudgetNumber) }
            : {}),
        };
      }

      const employerWhere: Prisma.UserWhereInput = {
        role: "EMPREGADOR",
        employerProfile: {
          is: employerProfileFilter,
        },
      };

      const andConditions: Prisma.UserWhereInput[] = [];

      if (state) {
        andConditions.push({
          state: { equals: state, mode: "insensitive" },
        });
      }

      if (normalizedCity) {
        const cityConditions: Prisma.UserWhereInput[] = [
          {
            city: { equals: normalizedCity, mode: "insensitive" },
          },
        ];

        if (cityParam && normalizedCity !== cityParam) {
          cityConditions.push({
            city: { equals: cityParam, mode: "insensitive" },
          });
        }

        andConditions.push({ OR: cityConditions });
      }

      if (andConditions.length > 0) {
        employerWhere.AND = andConditions;
      }

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
      const highlightWhere: Prisma.HighlightWhereInput = {
        status: "ACTIVE",
        endsAt: { gt: now },
        user: employerWhere,
      };

      const [highlightCount, totalUsers] = await Promise.all([
        prisma.highlight.count({ where: highlightWhere }),
        prisma.user.count({ where: employerWhere }),
      ]);

      const totalPages = Math.max(Math.ceil(totalUsers / pageSize), 1);
      const currentPage = totalUsers === 0 ? 1 : Math.min(page, totalPages);
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;

      const highlightStartIndex = Math.min(startIndex, highlightCount);
      const highlightEndIndex = Math.min(endIndex, highlightCount);
      const highlightTake = Math.max(highlightEndIndex - highlightStartIndex, 0);

      const highlightResults = highlightTake
        ? await prisma.highlight.findMany({
            where: highlightWhere,
            include: {
              plan: true,
              user: {
                include: {
                  employerProfile: {
                    include: {
                      category: true,
                    },
                  },
                },
              },
            },
            orderBy: [
              { plan: { priority: "desc" } },
              { endsAt: "asc" },
            ],
            skip: highlightStartIndex,
            take: highlightTake,
          })
        : [];

      const nonHighlightSkip = Math.max(startIndex - highlightCount, 0);
      const nonHighlightTake = Math.max(pageSize - highlightTake, 0);

      const nonHighlightWhere: Prisma.UserWhereInput = {
        ...employerWhere,
        highlights: {
          none: {
            status: "ACTIVE",
            endsAt: { gt: now },
          },
        },
      };

      const nonHighlightResults = nonHighlightTake
        ? await prisma.user.findMany({
            where: nonHighlightWhere,
            include: {
              employerProfile: {
                include: {
                  category: true,
                },
              },
            },
            orderBy: [{ createdAt: "desc" }],
            skip: nonHighlightSkip,
            take: nonHighlightTake,
          })
        : [];

      const mappedHighlights = highlightResults.map((highlight) => {
        const employer = highlight.user;
        return {
          id: employer.id,
          name: employer.name || "Sem nome",
          role: employer.role,
          image: employer.image,
          whatsapp: employer.whatsapp,
          profile: {
            id: employer.employerProfile?.id || "",
            categoryId: employer.employerProfile?.categoryId || "",
            category: employer.employerProfile?.category,
            advertisedService:
              employer.employerProfile?.advertisedService || "",
            budget: Number(employer.employerProfile?.budget || 0),
            availability: employer.employerProfile?.availability || {},
          },
          city: employer.city,
          state: employer.state,
          highlightPlan: highlight.plan?.code || null,
          relevanceScore: highlight.plan?.priority || 0,
        };
      });

      const mappedNonHighlights = nonHighlightResults.map((employer) => ({
        id: employer.id,
        name: employer.name || "Sem nome",
        role: employer.role,
        image: employer.image,
        whatsapp: employer.whatsapp,
        profile: {
          id: employer.employerProfile?.id || "",
          categoryId: employer.employerProfile?.categoryId || "",
          category: employer.employerProfile?.category,
          advertisedService:
            employer.employerProfile?.advertisedService || "",
          budget: Number(employer.employerProfile?.budget || 0),
          availability: employer.employerProfile?.availability || {},
        },
        city: employer.city,
        state: employer.state,
        highlightPlan: null,
        relevanceScore: 0,
      }));

      return NextResponse.json({
        results: [...mappedHighlights, ...mappedNonHighlights],
        total: totalUsers,
        page: currentPage,
        pageSize,
      });
    }
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return NextResponse.json(
      { error: "Erro ao buscar usuários" },
      { status: 500 }
    );
  }
}
