// src/pages/Home/HomePage.tsx
import { useState } from "react";
import { Search, Plus, Route } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SchemeCard } from "@/components/scheme/SchemeCard";

import { useSchemes } from "@/hooks/useSchemes";
import type { OperationalScheme } from "@/types/scheme";

interface HomePageProps {
  onViewScheme: (schemeId: string) => void;
  onCreateNew: () => void;
}

export function HomePage({ onViewScheme, onCreateNew }: HomePageProps) {
  const { data: schemes, loading, error } = useSchemes();
  const [searchTerm, setSearchTerm] = useState("");

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

  // Agora filtrando direto em OperationalScheme
  const filteredSchemes = schemes.filter((scheme: OperationalScheme) => {
    const term = searchTerm.toLowerCase();

    return (
      scheme.lineCode.toLowerCase().includes(term) ||
      scheme.lineName.toLowerCase().includes(term) ||
      scheme.origin.toLowerCase().includes(term) ||
      scheme.destination.toLowerCase().includes(term)
    );
  });

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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Criar novo */}
        <div className="mb-8">
          <Button
            onClick={onCreateNew}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 h-14 px-8"
          >
            <Plus className="w-5 h-5 mr-2" />
            Criar novo esquema operacional
          </Button>
        </div>

        {/* Busca */}
        <div className="mb-6">
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

        {/* Resultados */}
        <p className="text-slate-600 mb-4">
          {filteredSchemes.length} esquema
          {filteredSchemes.length !== 1 ? "s" : ""} encontrado
          {filteredSchemes.length !== 1 ? "s" : ""}.
        </p>

        <div className="grid grid-cols-1 gap-4">
          {filteredSchemes.map((scheme) => (
            <SchemeCard
              key={scheme.id}
              scheme={scheme}
              onClick={() => onViewScheme(scheme.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
