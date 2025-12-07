import { useState, useMemo } from "react";
import { ArrowLeft, Plus, Save, Map, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { RoutePointCard } from "@/components/scheme/RoutePointCard";
import { AddPointModal } from "@/components/scheme/AddPointModal";
import { RouteSummary } from "@/components/scheme/RouteSummary";

import type { RoutePoint } from "@/types/scheme";
import { createSchemeHandlers, type Line } from "./createSchemeHandlers";
import { InitialRoutePointCard } from "@/components/scheme/InitialRoutePointCard";

import { computeANTTAlertsForRoute } from "@/lib/anttRules";

interface CreateSchemePageProps {
  onBack: () => void;
}

type Direction = "ida" | "volta";

type ModalMode = "add" | "editInitial" | "insertAfter" | null;

export function CreateSchemePage({ onBack }: CreateSchemePageProps) {
  const [lineCode, setLineCode] = useState("");
  const [selectedLine, setSelectedLine] = useState<Line | null>(null);
  const [direction, setDirection] = useState<Direction | "">("");
  const [tripTime, setTripTime] = useState<string>("");
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [insertAfterPointId, setInsertAfterPointId] = useState<string | null>(
    null
  );

  const {
    handleLineCodeChange,
    handleAddPoint,
    handleUpdatePoint,
    handleDeletePoint,
    handleSetInitialPoint,
    handleMovePointUp,
    handleMovePointDown,
    handleInsertPointAfter,
  } = createSchemeHandlers({
    routePoints,
    setRoutePoints,
    selectedLine,
    setSelectedLine,
    tripTime,
    setLineCode,
    setIsModalOpen,
  });

  // ✅ regras de exibição
  const canShowLineDetails = !!selectedLine && !!direction && !!tripTime;
  const canShowPointsSection = !!selectedLine && !!direction && !!tripTime;
  const canSaveScheme =
    !!selectedLine && !!direction && !!tripTime && routePoints.length > 0;

  // ✅ textos derivados da linha
  const lineDisplayName =
    selectedLine?.municipioOrigem && selectedLine?.municipioDestino
      ? `${selectedLine.municipioOrigem} - ${selectedLine.municipioDestino}`
      : "";

  const origemDestinoText = selectedLine
    ? `${selectedLine.ufOrigem} ${selectedLine.municipioOrigem} → ${selectedLine.ufDestino} ${selectedLine.municipioDestino}`
    : "";

  // ponto inicial REAL da rota (se já foi definido)
  const currentInitialPoint = routePoints.find((p) => p.isInitial) ?? null;

  // ✅ ponto inicial / final conforme sentido
  const initialCity =
    currentInitialPoint?.location?.city ??
    (direction === "ida"
      ? selectedLine?.municipioOrigem
      : selectedLine?.municipioDestino);

  const initialState =
    currentInitialPoint?.location?.state ??
    (direction === "ida" ? selectedLine?.ufOrigem : selectedLine?.ufDestino);

  const finalCity =
    direction === "ida"
      ? selectedLine?.municipioDestino
      : selectedLine?.municipioOrigem;
  const finalState =
    direction === "ida" ? selectedLine?.ufDestino : selectedLine?.ufOrigem;

  const anttAlertsByPointId = useMemo(
    () => computeANTTAlertsForRoute(routePoints),
    [routePoints]
  );
  const handleAddPointAsInitial = async (pointInput: any) => {
    // 1) adiciona normalmente (distância, driveTime, etc.)
    await handleAddPoint(pointInput);

    // 2) usa o id do local (que é o mesmo id do RoutePoint)
    const pointId = String(pointInput.location.id);

    // 3) aplica a regra de ponto inicial, se houver horário de viagem
    if (tripTime) {
      handleSetInitialPoint(pointId, tripTime);
    }
  };

  const handleConfirmPointFromModal = (pointInput: any) => {
    if (modalMode === "insertAfter" && insertAfterPointId) {
      // inserir entre dois pontos
      handleInsertPointAfter(insertAfterPointId, pointInput);
    } else if (modalMode === "add") {
      // fluxo atual de adicionar no final
      handleAddPoint(pointInput);
    } else if (modalMode === "editInitial") {
      // aqui entra o fluxo específico de edição do ponto inicial
      // (se você já tiver esse comportamento, reaproveita)
      // ex.: só atualiza dados e deixa horários serem recalculados depois
      handleUpdatePoint(pointInput.id, pointInput);
    }

    // em qualquer caso, fecha modal e limpa contexto
    setIsModalOpen(false);
    setModalMode(null);
    setInsertAfterPointId(null);
  };

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
                onChange={(e) => setDirection(e.target.value as Direction | "")}
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
          {canShowLineDetails && selectedLine && (
            <div className="mt-6 pt-6 border-t border-slate-200 space-y-4">
              {/* Nome da linha / Origem-Destino */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-600">Nome da Linha</Label>
                  <p className="text-slate-900 mt-1">
                    {lineDisplayName || "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-slate-600">Origem → Destino</Label>
                  <p className="text-slate-900 mt-1 transition-opacity duration-300">
                    <span
                      key={direction}
                      className="inline-block opacity-100 transition-opacity duration-300"
                    >
                      {selectedLine
                        ? `${selectedLine.ufOrigem} ${
                            selectedLine.municipioOrigem
                          } ${direction === "ida" ? "→" : "←"} ${
                            selectedLine.ufDestino
                          } ${selectedLine.municipioDestino}`
                        : "-"}
                    </span>
                  </p>
                </div>
              </div>

              {/* Empresa / Situação */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-600">Empresa</Label>
                  <p className="text-slate-900 mt-1">
                    {selectedLine.nomeEmpresa}
                  </p>
                </div>
                <div>
                  <Label className="text-slate-600">Situação</Label>
                  <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        selectedLine.situacao === "Ativa"
                          ? "bg-emerald-500"
                          : "bg-rose-500"
                      }`}
                    />
                    <span className="text-slate-900">
                      {selectedLine.situacao}
                    </span>
                  </p>
                </div>
              </div>

              {/* Ponto Inicial + Ponto Final (apenas display por enquanto) */}
              <div className="mt-4">
                <Label className="text-slate-600">Pontos principais</Label>

                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    type="button"
                    className="text-left p-4 bg-blue-50 border border-blue-200 rounded-lg hover:border-blue-300 transition flex flex-col justify-between"
                    onClick={() => {
                      setModalMode("editInitial");
                      setIsModalOpen(true);
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold uppercase text-blue-700">
                        Ponto inicial
                      </span>
                      <span className="text-xs text-blue-700 underline cursor-pointer hover:text-blue-900 transition-colors">
                        {currentInitialPoint ? "Editar" : "Definir"}
                      </span>
                    </div>

                    <p className="text-blue-900 font-medium">
                      {initialCity && initialState
                        ? initialCity
                        : "Definir ponto inicial"}
                    </p>

                    {initialCity && initialState && (
                      <p className="text-blue-700 text-sm mt-1">
                        {initialCity} / {initialState}
                      </p>
                    )}
                  </button>

                  {/* Ponto final */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col justify-between">
                    <div className="mb-1">
                      <span className="text-xs font-semibold uppercase text-slate-500">
                        Ponto final
                      </span>
                    </div>
                    <p className="text-slate-900 font-medium">
                      {finalCity && finalState ? `${finalCity}` : "Ponto final"}
                    </p>
                    {finalCity && finalState && (
                      <p className="text-slate-700 text-sm mt-1">
                        {finalCity} / {finalState}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Lista de Pontos da Rota */}
        {canShowPointsSection && (
          <Card className="p-6 bg-white shadow-sm border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-slate-900">Pontos da Rota</h2>
              <Button
                onClick={() => {
                  setModalMode("add");
                  setIsModalOpen(true);
                }}
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
                {routePoints.map((point, index) =>
                  index === 0 ? (
                    <InitialRoutePointCard
                      key={point.id}
                      point={point}
                      index={index}
                      onUpdate={handleUpdatePoint}
                      onDelete={handleDeletePoint}
                      // aqui não precisa de previousPoint, o primeiro nunca tem trecho anterior
                    />
                  ) : (
                    <RoutePointCard
                      key={point.id}
                      point={point}
                      index={index}
                      previousPoint={routePoints[index - 1]}
                      alerts={anttAlertsByPointId[point.id] ?? []}
                      onUpdate={handleUpdatePoint}
                      onDelete={handleDeletePoint}
                      onMoveUp={handleMovePointUp}
                      onMoveDown={handleMovePointDown}
                      onInsertAfter={(id) => {
                        setModalMode("insertAfter");
                        setInsertAfterPointId(id);
                        setIsModalOpen(true);
                      }}
                    />
                  )
                )}
              </div>
            )}
          </Card>
        )}

        {/* Resumo Final */}
        {routePoints.length > 0 && (
          <RouteSummary routePoints={routePoints} tripStartTime={tripTime} />
        )}

        {/* Ações Finais */}
        {canSaveScheme && (
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
              <Button
                className="bg-green-600 hover:bg-green-700"
                disabled={!canSaveScheme}
              >
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
        onClose={() => {
          // chamado pelo próprio AddPointModal.handleClose()
          setIsModalOpen(false);
          setModalMode(null);
          setInsertAfterPointId(null);
        }}
        onAdd={async (pointFromModal) => {
          if (modalMode === "insertAfter" && insertAfterPointId) {
            // inserir entre dois pontos
            handleInsertPointAfter(insertAfterPointId, pointFromModal);
          } else {
            // fluxo normal: adicionar no final
            await handleAddPoint(pointFromModal);
          }
          // NÃO fecha aqui: o próprio modal chama onClose() via handleClose()
        }}
        onSetInitial={async (pointFromModal) => {
          const locId = String(pointFromModal.location.id);

          if (!tripTime) {
            // opcional: toast avisando que precisa definir "Horário da Viagem"
            return;
          }

          // 1) verifica se o ponto já existe
          const existing = routePoints.find(
            (p) => p.location?.id === locId || p.id === locId
          );

          if (existing) {
            // já existe: só recalcula horários a partir dele
            handleSetInitialPoint(existing.id, tripTime);
          } else {
            // NÃO existe: primeiro adiciona, depois marca como inicial
            await handleAddPoint(pointFromModal);
            handleSetInitialPoint(locId, tripTime);
          }

          // não precisa mais mexer em isModalOpen/modalMode aqui,
          // o próprio modal já chama handleClose() depois de onSetInitial
        }}
        canSetInitial={modalMode === "editInitial" && !!tripTime}
        initialPoint={routePoints.find((p) => p.isInitial) ?? null}
      />
    </div>
  );
}
