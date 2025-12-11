// src/pages/Home/HomePage.tsx
import { useState, useMemo } from "react";
import { Search, Plus, Route, MapPin } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HomeSchemeCard } from "@/components/scheme/HomeSchemeCard";

import { useSchemes } from "@/hooks/useSchemes";

import type {
  SchemeListItem,
  SchemeCardSnapshot,
  FilterMode,
} from "@/types/scheme";

import {
  loadRecentSchemes,
  loadFavoriteSchemes,
  addRecentScheme,
  toggleFavoriteScheme,
} from "@/lib/schemeStorage";

import { mapListItemToCardSnapshot } from "@/lib/schemeMappers";

interface HomePageProps {
  onViewScheme: (schemeId: string) => void;
  onCreateNew: () => void;
  onCreateLocation: () => void;
}

export function HomePage({
  onViewScheme,
  onCreateNew,
  onCreateLocation,
}: HomePageProps) {
  // ✅ useSchemes retorna OperationalScheme[]
  const { data: schemes, loading, error } = useSchemes();

  // ✅ todos os hooks vem ANTES de qualquer return condicional
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");

  const normalizedSearch = searchTerm.trim();
  const showFilters = normalizedSearch.length < 3;

  // 1) Converter todos os OperationalScheme em snapshots
  const allSnapshots = useMemo<SchemeCardSnapshot[]>(() => {
    return schemes.map((item: SchemeListItem) =>
      mapListItemToCardSnapshot(item)
    );
  }, [schemes]);

  // 2) Ler recentes e favoritos do localStorage
  // (sem hook extra, para não alterar ordem de hooks)
  const recentSnapshots = loadRecentSchemes();
  const [favoriteSnapshots, setFavoriteSnapshots] = useState(
    loadFavoriteSchemes()
  );

  // 🔁 returns condicionais SÓ DEPOIS dos hooks
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-600">
        Carregando esquemas operacionais...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  // 3) Seleciona lista base conforme filtro
  let listToRender: SchemeCardSnapshot[] = [];

  if (filterMode === "all") listToRender = allSnapshots;
  if (filterMode === "recent") listToRender = recentSnapshots;
  if (filterMode === "favorites") listToRender = favoriteSnapshots;

  // 4) Filtro de busca (≥ 3 caracteres)
  let filteredSnapshots: SchemeCardSnapshot[] = listToRender;

  if (normalizedSearch.length >= 3) {
    const term = normalizedSearch.toLowerCase();

    filteredSnapshots = listToRender.filter((snap) => {
      return (
        snap.lineCode.toLowerCase().includes(term) ||
        snap.lineName.toLowerCase().includes(term) ||
        snap.origin.toLowerCase().includes(term) ||
        snap.destination.toLowerCase().includes(term) ||
        `${snap.origin} ${snap.originState}`.toLowerCase().includes(term) ||
        `${snap.destination} ${snap.destinationState}`
          .toLowerCase()
          .includes(term)
      );
    });
  }

  // 5) Clique no card: adiciona Recentes + abre esquema
  function handleOpenSnapshot(snapshot: SchemeCardSnapshot) {
    addRecentScheme(snapshot);
    onViewScheme(snapshot.schemeId);
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg">
              <Route className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-slate-900">Painel Operacional</h1>
              <p className="text-slate-600 text-sm">
                Esquemas operacionais e rotas
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Botões Ações */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Button
            onClick={onCreateNew}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4" />
            Criar/Editar esquema
          </Button>
          <Button
            onClick={onCreateLocation}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <MapPin className="w-4 h-4" />
            Cadastrar local
          </Button>
        </div>

        {/* Busca */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar esquema operacional..."
              className="pl-12 h-14 text-base border-slate-300"
            />
          </div>
        </div>

        {/* Filtros estilo WhatsApp */}
        {showFilters && (
          <div className="mb-6 flex items-center gap-2">
            {["all", "recent", "favorites"].map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setFilterMode(mode as FilterMode)}
                className={`px-4 py-2 rounded-full border text-sm transition-all ${
                  filterMode === mode
                    ? "bg-white shadow-sm border-slate-300 text-slate-900"
                    : "bg-slate-100 border-transparent text-slate-600 hover:bg-slate-200"
                }`}
              >
                {mode === "all" && "Todos"}
                {mode === "recent" && "Recentes"}
                {mode === "favorites" && "Favoritos"}
              </button>
            ))}
          </div>
        )}

        {/* Contador de resultados */}
        <p className="text-slate-600 mb-4">
          {filteredSnapshots.length} esquema
          {filteredSnapshots.length !== 1 ? "s" : ""} encontrado
          {filteredSnapshots.length !== 1 ? "s" : ""}.
        </p>

        {/* Lista de cards */}
        <div className="grid grid-cols-1 gap-4">
          {filteredSnapshots.map((snap) => (
            <HomeSchemeCard
              key={snap.schemeId}
              snapshot={snap}
              direction={snap.direction}
              onClick={() => handleOpenSnapshot(snap)}
              onToggleFavorite={() => {
                toggleFavoriteScheme(snap);
                setFavoriteSnapshots(loadFavoriteSchemes());
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
