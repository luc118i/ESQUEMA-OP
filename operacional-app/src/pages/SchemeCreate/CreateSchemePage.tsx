import { useState } from "react";
import { ArrowLeft, Plus, Save, Map, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

import { RoutePointCard } from "@/components/scheme/RoutePointCard";
import { AddPointModal } from "@/components/scheme/AddPointModal";
import { RouteSummary } from "@/components/scheme/RouteSummary";

import type { RoutePoint } from "@/types/scheme";

interface CreateSchemePageProps {
  onBack: () => void;
}

import { createSchemeHandlers } from "./createSchemeHandlers";

type Direction = "ida" | "volta";

export function CreateSchemePage({ onBack }: CreateSchemePageProps) {
  const [lineCode, setLineCode] = useState("");
  const [selectedLine, setSelectedLine] = useState<any>(null);
  const [direction, setDirection] = useState<Direction | "">("");
  const [tripTime, setTripTime] = useState("");
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    handleLineCodeChange,
    handleAddPoint,
    handleUpdatePoint,
    handleDeletePoint,
  } = createSchemeHandlers({
    routePoints,
    setRoutePoints,
    selectedLine,
    setSelectedLine,
    tripTime,
    setLineCode,
    setIsModalOpen,
  });

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
            <h1 className="text-slate-900">Criar Esquema Operacional</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-6">
        {/* Card de Informações Iniciais */}
        <Card className="p-6 bg-white shadow-sm border-slate-200">
          <h2 className="text-slate-900 mb-4">Informações da Linha</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Código da Linha */}
            <div className="space-y-2">
              <Label htmlFor="lineCode">Código da Linha</Label>
              <Input
                id="lineCode"
                value={lineCode}
                onChange={(e) => handleLineCodeChange(e.target.value)}
                placeholder="Ex: DFG0053049"
                className="uppercase"
              />
            </div>

            {/* Sentido */}
            <div className="space-y-2">
              <Label htmlFor="direction">Sentido</Label>
              <select
                id="direction"
                className="border-input flex h-9 w-full items-center justify-between gap-2 rounded-md border bg-input-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={direction}
                onChange={(e) => setDirection(e.target.value as Direction)}
              >
                <option value="">Selecione...</option>
                <option value="ida">Ida</option>
                <option value="volta">Volta</option>
              </select>
            </div>

            {/* Horário da Viagem */}
            <div className="space-y-2">
              <Label htmlFor="tripTime">Horário da Viagem</Label>
              <Input
                id="tripTime"
                type="time"
                value={tripTime}
                onChange={(e) => setTripTime(e.target.value)}
              />
            </div>
          </div>

          {/* Informações Carregadas da Linha */}
          {selectedLine && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-600">Nome da Linha</Label>
                  <p className="text-slate-900 mt-1">{selectedLine.name}</p>
                </div>
                <div>
                  <Label className="text-slate-600">Origem → Destino</Label>
                  <p className="text-slate-900 mt-1">
                    {selectedLine.origin} → {selectedLine.destination}
                  </p>
                </div>
              </div>

              {/* Ponto Inicial */}
              <div className="mt-4">
                <Label className="text-slate-600">Ponto Inicial</Label>
                <div className="mt-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-900">
                        {selectedLine.initialPoint.name}
                      </p>
                      <p className="text-blue-700 text-sm mt-1">
                        {selectedLine.initialPoint.city} /{" "}
                        {selectedLine.initialPoint.state}
                      </p>
                    </div>
                    <div className="text-blue-600 text-sm">Ponto de origem</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Lista de Pontos da Rota */}
        {selectedLine && tripTime && (
          <Card className="p-6 bg-white shadow-sm border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-slate-900">Pontos da Rota</h2>
              <Button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Ponto
              </Button>
            </div>

            {routePoints.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Map className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Nenhum ponto adicionado ainda</p>
                <p className="text-sm mt-1">
                  Clique em &quot;Adicionar Ponto&quot; para começar a montar a
                  rota
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {routePoints.map((point, index) => (
                  <RoutePointCard
                    key={point.id}
                    point={point}
                    index={index}
                    onUpdate={handleUpdatePoint}
                    onDelete={handleDeletePoint}
                  />
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Resumo Final */}
        {routePoints.length > 0 && (
          <RouteSummary routePoints={routePoints} tripStartTime={tripTime} />
        )}

        {/* Ações Finais */}
        {selectedLine && routePoints.length > 0 && (
          <Card className="p-6 bg-white shadow-sm border-slate-200">
            <div className="flex flex-wrap gap-3 justify-end">
              <Button
                variant="outline"
                onClick={onBack}
                className="border-slate-300"
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <Map className="w-4 h-4 mr-2" />
                Visualizar no Mapa
              </Button>
              <Button className="bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />
                Salvar Esquema
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Modal de Adicionar Ponto */}
      <AddPointModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddPoint}
        lastPoint={
          routePoints.length > 0 ? routePoints[routePoints.length - 1] : null
        }
        initialPoint={selectedLine?.initialPoint}
      />
    </div>
  );
}

// Função para calcular distância entre dois pontos (Haversine)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Raio da Terra em km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // Arredondar para 1 casa decimal
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Função para adicionar minutos a um horário (formato HH:MM)
function addMinutesToTime(time: string, minutes: number): string {
  if (!time) return "";
  const [hours, mins] = time.split(":").map(Number);
  const totalMinutes = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMins = totalMinutes % 60;
  return `${String(newHours).padStart(2, "0")}:${String(newMins).padStart(
    2,
    "0"
  )}`;
}
