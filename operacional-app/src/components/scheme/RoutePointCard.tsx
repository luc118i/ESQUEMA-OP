import { useState } from "react";

import {
  Trash2,
  ChevronDown,
  ChevronUp,
  Gauge,
  Clock,
  Route,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";

import { ANTTAlert } from "@/components/scheme/ANTTAlert";

import type { RoutePoint } from "@/types/scheme";

interface RoutePointCardProps {
  point: RoutePoint;
  index: number;
  onUpdate: (id: string, updates: Partial<RoutePoint>) => void;
  onDelete: (id: string) => void;
}

const pointTypes = [
  { value: "PE", label: "PE - Ponto de Embarque" },
  { value: "PD", label: "PD - Ponto de Desembarque" },
  { value: "PP", label: "PP - Ponto de Parada" },
  { value: "PA", label: "PA - Ponto de Apoio" },
  { value: "TMJ", label: "TMJ - Troca de Motorista em Jornada" },
  { value: "PL", label: "PL - Ponto Livre" },
];

const localTimeOptions = [
  { value: 5, label: "00:05" },
  { value: 10, label: "00:10" },
  { value: 15, label: "00:15" },
  { value: 20, label: "00:20" },
  { value: 30, label: "00:30" },
  { value: 45, label: "00:45" },
  { value: 60, label: "01:00" },
  { value: 90, label: "01:30" },
  { value: 120, label: "02:00" },
];

export function RoutePointCard({
  point,
  index,
  onUpdate,
  onDelete,
}: RoutePointCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const city = point.location?.city ?? "";
  const state = point.location?.state ?? "";
  const name = point.location?.name ?? `${city}${state ? " / " + state : ""}`;

  // velocidade média calculada por trecho
  const avgSpeed =
    point.driveTimeMin > 0
      ? Number((point.distanceKm / (point.driveTimeMin / 60)).toFixed(1))
      : 0;

  const alerts = generateANTTAlerts(point, index, avgSpeed);

  return (
    <Card className="border border-slate-200 overflow-hidden">
      {/* Header do Card */}
      <div className="bg-gradient-to-r from-slate-50 to-white p-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white">
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-slate-900 truncate">
                {city} / {state}
              </h3>
              {name && (
                <p className="text-slate-600 text-xs truncate">{name}</p>
              )}
              <p className="text-slate-600 text-xs mt-1">
                {point.distanceKm.toFixed(1)} km desde o ponto anterior •{" "}
                {point.cumulativeDistanceKm.toFixed(1)} km acumulados
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-slate-600 hover:text-slate-900"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(String(point.id))}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Conteúdo do Card */}
      {isExpanded && (
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-4">
            {/* Hr. Chegada */}
            <div>
              <label className="text-slate-600 text-xs mb-1.5 block">
                Hr. Chegada
              </label>
              <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 text-sm">
                {point.arrivalTime}
              </div>
            </div>

            {/* Temp. Local (editável) */}
            <div>
              <label className="text-slate-600 text-xs mb-1.5 block">
                Temp. Local
              </label>
              <Select
                value={String(point.stopTimeMin)}
                onValueChange={(value: string) =>
                  onUpdate(String(point.id), { stopTimeMin: Number(value) })
                }
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {localTimeOptions.map((option) => (
                    <SelectItem key={option.value} value={String(option.value)}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Hr. Saída */}
            <div>
              <label className="text-slate-600 text-xs mb-1.5 block">
                Hr. Saída
              </label>
              <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 text-sm">
                {point.departureTime}
              </div>
            </div>

            {/* Temp. Desloc. */}
            <div>
              <label className="text-slate-600 text-xs mb-1.5 block">
                Temp. Desloc.
              </label>
              <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 text-sm">
                {formatMinutesToHours(point.driveTimeMin)}
              </div>
            </div>

            {/* Vel. Média (só leitura, calculada) */}
            <div>
              <label className="text-slate-600 text-xs mb-1.5 block">
                Vel. Média
              </label>
              <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 text-sm flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-slate-500" />
                <span>{avgSpeed} km/h</span>
              </div>
            </div>

            {/* Distância (só leitura) */}
            <div>
              <label className="text-slate-600 text-xs mb-1.5 block">
                Distância
              </label>
              <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 text-sm flex items-center gap-1">
                <Route className="w-3.5 h-3.5 text-slate-500" />
                <span>{point.distanceKm.toFixed(1)} km</span>
              </div>
            </div>

            {/* Tipo de Ponto (editável) */}
            <div>
              <label className="text-slate-600 text-xs mb-1.5 block">
                Tipo
              </label>
              <Select
                value={point.type}
                onValueChange={(value: RoutePoint["type"]) =>
                  onUpdate(String(point.id), { type: value })
                }
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pointTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* (Opcional) Justificativa – se você quiser manter, adicione no tipo depois */}
          {/* 
          <div className="mb-4">
            <label className="text-slate-600 text-xs mb-1.5 block">
              Justificativa Operacional
            </label>
            <Input
              value={point.justification ?? ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onUpdate(String(point.id), { justification: e.target.value } as any)
              }
              placeholder="Descreva a justificativa para este ponto..."
              className="text-sm"
            />
          </div>
          */}

          {/* Alertas ANTT */}
          {alerts.length > 0 && (
            <div className="space-y-2 mt-2">
              <label className="text-slate-600 text-xs block">
                Regras ANTT / Observações
              </label>
              <div className="space-y-2">
                {alerts.map((alert, idx) => (
                  <ANTTAlert key={idx} alert={alert} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function formatMinutesToHours(minutes: number): string {
  const m = Math.max(0, Math.round(minutes));
  const hours = Math.floor(m / 60);
  const mins = m % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins)
    .toString()
    .padStart(2, "0")}`;
}

interface ANTTAlertData {
  type: "success" | "warning" | "error";
  message: string;
}

function generateANTTAlerts(
  point: RoutePoint,
  index: number,
  avgSpeed: number
): ANTTAlertData[] {
  const alerts: ANTTAlertData[] = [];
  const accumulated = point.cumulativeDistanceKm ?? 0;

  // Regra: Primeira parada deve ser entre 262 e 330 km
  if (index === 0 && point.type === "PP") {
    if (accumulated >= 262 && accumulated <= 330) {
      alerts.push({
        type: "success",
        message: `Primeiro ponto de parada (${accumulated.toFixed(
          1
        )} / 330 km)`,
      });
    } else if (accumulated > 330) {
      alerts.push({
        type: "error",
        message: `Distância acima do permitido (${accumulated.toFixed(
          1
        )} / 330 km)`,
      });
    } else if (accumulated < 262) {
      alerts.push({
        type: "warning",
        message: `Parada antecipada (${accumulated.toFixed(1)} / 262 km)`,
      });
    }
  }

  // Regra: Primeiro ponto de apoio deve ser entre 402 e 495 km
  if (point.type === "PA") {
    if (accumulated >= 402 && accumulated <= 495) {
      alerts.push({
        type: "success",
        message: `Ponto de apoio conforme (${accumulated.toFixed(1)} / 495 km)`,
      });
    } else if (accumulated < 402) {
      alerts.push({
        type: "warning",
        message: `Ponto de apoio antecipado (${accumulated.toFixed(
          1
        )} / 402 km)`,
      });
    } else {
      alerts.push({
        type: "error",
        message: `Ponto de apoio além do limite (${accumulated.toFixed(
          1
        )} / 495 km)`,
      });
    }
  }

  // Regra: Troca de motorista
  if (point.type === "TMJ") {
    if (accumulated <= 660) {
      alerts.push({
        type: "success",
        message: `Troca de motorista em jornada (${accumulated.toFixed(
          1
        )} / 660 km)`,
      });
    } else {
      alerts.push({
        type: "error",
        message: `Troca de motorista além do limite (${accumulated.toFixed(
          1
        )} / 660 km)`,
      });
    }
  }

  // Velocidade média alta
  if (avgSpeed > 90) {
    alerts.push({
      type: "warning",
      message: `Velocidade acima da recomendada (${avgSpeed} km/h)`,
    });
  }

  // Tempo de parada muito curto
  if ((point.type === "PP" || point.type === "PA") && point.stopTimeMin < 20) {
    alerts.push({
      type: "warning",
      message: `Tempo de parada pode ser insuficiente (${formatMinutesToHours(
        point.stopTimeMin
      )})`,
    });
  }

  return alerts;
}
