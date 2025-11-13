"use client";

import { useEffect, useState } from "react";
import { SearchFilters, Category } from "@/interfaces";
import { Input } from "../Input";
import { Button } from "../Button";
import { Select } from "../Select";
import { BRAZIL_STATE_OPTIONS } from "@/constants/brazil-states";

interface FiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  categories: Category[];
}

const DAYS_PT = {
  mon: "Segunda",
  tue: "Terça",
  wed: "Quarta",
  thu: "Quinta",
  fri: "Sexta",
  sat: "Sábado",
  sun: "Domingo",
};

export function Filters({
  filters,
  onFiltersChange,
  categories,
}: FiltersProps) {
  const [localFilters, setLocalFilters] = useState<SearchFilters>({
    page: 1,
    pageSize: 15,
    ...filters,
  });

  useEffect(() => {
    setLocalFilters({
      page: filters.page ?? 1,
      pageSize: filters.pageSize ?? 15,
      ...filters,
    });
  }, [filters]);

  const handleChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = {
      ...localFilters,
      [key]: value,
      ...(key !== "page" ? { page: 1 } : {}),
    };
    setLocalFilters(newFilters);
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
  };

  const handleClear = () => {
    const clearedFilters: SearchFilters = {
      type: filters.type,
      page: 1,
      pageSize: 15,
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  return (
    <div className="space-y-6">
      {/* Tipo de Busca */}
      <div className="">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Buscar por
        </label>
        <div className="grid grid-cols-2 gap-2 border b-2 black">
          <button
            onClick={() => handleChange("type", "workers")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              localFilters.type === "workers"
                ? "bg-cyan-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-200"
            }`}
          >
            Prestadores
          </button>
          <button
            onClick={() => handleChange("type", "employers")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              localFilters.type === "employers"
                ? "bg-cyan-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-200"
            }`}
          >
            Empregadores
          </button>
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={localFilters.showVagas || false}
            onChange={(e) => handleChange("showVagas", e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm font-medium text-gray-700">
            Mostrar Vagas
          </span>
        </label>
      </div>

      {/* Busca por texto */}
      <div>
        <Input
          label="Buscar"
          placeholder="Nome, serviço..."
          value={localFilters.q || ""}
          onChange={(e) => handleChange("q", e.target.value)}
          fullWidth
        />
      </div>

      {/* Localização */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Select
          label="Estado"
          value={localFilters.state || ""}
          onChange={(e) =>
            handleChange(
              "state",
              e.target.value ? (e.target.value as typeof localFilters.state) : undefined
            )
          }
          fullWidth
          options={BRAZIL_STATE_OPTIONS}
        />
        <Input
          label="Cidade"
          placeholder="Ex: São Paulo"
          value={localFilters.city || ""}
          onChange={(e) => handleChange("city", e.target.value)}
          fullWidth
        />
      </div>

      {/* Categoria */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Categoria
        </label>
        <select
          value={localFilters.categoryId || ""}
          onChange={(e) =>
            handleChange("categoryId", e.target.value || undefined)
          }
          className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">Todas as categorias</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Faixa de Preço (para Prestadores) */}
      {localFilters.type === "workers" && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Faixa de Preço
          </label>
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              placeholder="Mín"
              value={localFilters.minPrice || ""}
              onChange={(e) =>
                handleChange(
                  "minPrice",
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              fullWidth
            />
            <Input
              type="number"
              placeholder="Máx"
              value={localFilters.maxPrice || ""}
              onChange={(e) =>
                handleChange(
                  "maxPrice",
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              fullWidth
            />
          </div>
        </div>
      )}

      {/* Faixa de Orçamento (para Empregadores) */}
      {localFilters.type === "employers" && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Orçamento Disponível
          </label>
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              placeholder="Mín"
              value={localFilters.minBudget || ""}
              onChange={(e) =>
                handleChange(
                  "minBudget",
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              fullWidth
            />
            <Input
              type="number"
              placeholder="Máx"
              value={localFilters.maxBudget || ""}
              onChange={(e) =>
                handleChange(
                  "maxBudget",
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              fullWidth
            />
          </div>
        </div>
      )}

      {/* Botões de Ação */}
      <Select
        label="Resultados por página"
        value={String(localFilters.pageSize ?? 15)}
        onChange={(e) =>
          handleChange("pageSize", Number.parseInt(e.target.value, 10) || 15)
        }
        options={[
          { value: "15", label: "15 resultados" },
          { value: "25", label: "25 resultados" },
        ]}
        fullWidth
      />

      <div className="space-y-2 pt-4 border-t border-gray-200">
        <Button fullWidth onClick={handleApply}>
          Aplicar Filtros
        </Button>
        <Button fullWidth variant="outline" onClick={handleClear}>
          Limpar Filtros
        </Button>
      </div>
    </div>
  );
}
