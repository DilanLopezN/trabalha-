-- CreateEnum
CREATE TYPE "VagaStatus" AS ENUM ('ABERTA', 'FECHADA', 'PAUSADA');

-- CreateEnum
CREATE TYPE "SalarioTipo" AS ENUM ('FIXO', 'A_COMBINAR');

-- CreateTable
CREATE TABLE "Vaga" (
    "id" TEXT NOT NULL,
    "empregadorId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "salarioTipo" "SalarioTipo" NOT NULL,
    "salarioValor" DECIMAL(10,2),
    "categoryId" TEXT NOT NULL,
    "status" "VagaStatus" NOT NULL DEFAULT 'ABERTA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vaga_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VagaEtapa" (
    "id" TEXT NOT NULL,
    "vagaId" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VagaEtapa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VagaFavorita" (
    "id" TEXT NOT NULL,
    "vagaId" TEXT NOT NULL,
    "prestadorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VagaFavorita_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Candidatura" (
    "id" TEXT NOT NULL,
    "vagaId" TEXT NOT NULL,
    "prestadorId" TEXT NOT NULL,
    "mensagem" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Candidatura_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Vaga_empregadorId_idx" ON "Vaga"("empregadorId");

-- CreateIndex
CREATE INDEX "Vaga_categoryId_idx" ON "Vaga"("categoryId");

-- CreateIndex
CREATE INDEX "Vaga_status_idx" ON "Vaga"("status");

-- CreateIndex
CREATE INDEX "VagaEtapa_vagaId_idx" ON "VagaEtapa"("vagaId");

-- CreateIndex
CREATE INDEX "VagaFavorita_vagaId_idx" ON "VagaFavorita"("vagaId");

-- CreateIndex
CREATE INDEX "VagaFavorita_prestadorId_idx" ON "VagaFavorita"("prestadorId");

-- CreateIndex
CREATE UNIQUE INDEX "VagaFavorita_vagaId_prestadorId_key" ON "VagaFavorita"("vagaId", "prestadorId");

-- CreateIndex
CREATE INDEX "Candidatura_vagaId_idx" ON "Candidatura"("vagaId");

-- CreateIndex
CREATE INDEX "Candidatura_prestadorId_idx" ON "Candidatura"("prestadorId");

-- CreateIndex
CREATE UNIQUE INDEX "Candidatura_vagaId_prestadorId_key" ON "Candidatura"("vagaId", "prestadorId");

-- AddForeignKey
ALTER TABLE "Vaga" ADD CONSTRAINT "Vaga_empregadorId_fkey" FOREIGN KEY ("empregadorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vaga" ADD CONSTRAINT "Vaga_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VagaEtapa" ADD CONSTRAINT "VagaEtapa_vagaId_fkey" FOREIGN KEY ("vagaId") REFERENCES "Vaga"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VagaFavorita" ADD CONSTRAINT "VagaFavorita_vagaId_fkey" FOREIGN KEY ("vagaId") REFERENCES "Vaga"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VagaFavorita" ADD CONSTRAINT "VagaFavorita_prestadorId_fkey" FOREIGN KEY ("prestadorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidatura" ADD CONSTRAINT "Candidatura_vagaId_fkey" FOREIGN KEY ("vagaId") REFERENCES "Vaga"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidatura" ADD CONSTRAINT "Candidatura_prestadorId_fkey" FOREIGN KEY ("prestadorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
