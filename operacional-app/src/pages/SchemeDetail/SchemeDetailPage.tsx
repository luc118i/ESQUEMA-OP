import { ArrowLeft, MapPin, Route as RouteIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { RouteMap } from "@/components/scheme/RouteMap";
import { DetailPointCard } from "@/components/scheme/DetailPointCard";
import { DetailSummary } from "@/components/scheme/DetailSummary";

import { useScheme } from "@/hooks/useScheme";

interface SchemeDetailPageProps {
  schemeId: string;
  onBack: () => void;
}

export function SchemeDetailPage({ schemeId, onBack }: SchemeDetailPageProps) {
  const { data: scheme, loading, error } = useScheme(schemeId);

  // ⏳ LOADING
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-600">
        Carregando informações do esquema...
      </div>
    );
  }

  // ❌ ERROR
  if (error || !scheme) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        Erro ao carregar esquema operacional
      </div>
    );
  }

  // 🔐 garante sempre arrays válidos
  const routePoints = scheme.routePoints ?? [];

  const allPoints = [
    ...(scheme.initialPoint ? [scheme.initialPoint] : []),
    ...routePoints,
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={onBack}
              className="border-slate-300 hover:bg-slate-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-slate-900">Esquema Operacional</h1>
                <Badge
                  variant="outline"
                  className={
                    scheme.direction === "Ida"
                      ? "border-green-300 text-green-700 bg-green-50"
                      : "border-purple-300 text-purple-700 bg-purple-50"
                  }
                >
                  {scheme.direction}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-6">
        {/* Informações da Linha */}
        <Card className="p-6 bg-white shadow-sm border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="text-slate-600 text-sm mb-1 block">
                Código da Linha
              </label>
              <p className="text-slate-900">{scheme.lineCode}</p>
            </div>

            <div>
              <label className="text-slate-600 text-sm mb-1 block">
                Nome da Linha
              </label>
              <p className="text-slate-900">{scheme.lineName}</p>
            </div>

            <div>
              <label className="text-slate-600 text-sm mb-1 block">
                Origem → Destino
              </label>
              <p className="text-slate-900">
                {scheme.origin} ({scheme.originState}) → {scheme.destination} (
                {scheme.destinationState})
              </p>
            </div>

            <div>
              <label className="text-slate-600 text-sm mb-1 block">
                Horário de Início
              </label>
              <p className="text-slate-900">{scheme.tripTime}</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200">
            <label className="text-slate-600 text-sm mb-2 block">
              Ponto Inicial
            </label>
            <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-blue-900">{scheme.initialPoint?.name}</p>
                <p className="text-blue-700 text-sm">
                  {scheme.initialPoint?.city} / {scheme.initialPoint?.state}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Mapa */}
        <Card className="p-6 bg-white shadow-sm border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <RouteIcon className="w-5 h-5 text-blue-600" />
            <h2 className="text-slate-900">Visualização do Trajeto</h2>
          </div>
          <RouteMap points={allPoints} />
        </Card>

        {/* Lista de Pontos */}
        <Card className="p-6 bg-white shadow-sm border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-blue-600" />
            <h2 className="text-slate-900">Pontos da Rota</h2>
          </div>

          <div className="space-y-4">
            {routePoints.length > 0 ? (
              routePoints.map((point, index) => (
                <DetailPointCard key={point.id} point={point} index={index} />
              ))
            ) : (
              <p className="text-sm text-slate-500">
                Nenhum ponto cadastrado para este esquema (ainda).
              </p>
            )}
          </div>
        </Card>

        {/* Resumo */}
        <DetailSummary scheme={{ ...scheme, routePoints }} />
      </div>
    </div>
  );
}
