// src/components/scheme/RouteSummary.tsx
import { Clock, Route, MapPin, AlertCircle, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { RoutePoint } from "@/types/scheme";

interface RouteSummaryProps {
  routePoints: RoutePoint[];
  tripStartTime: string;
}

export function RouteSummary({
  routePoints,
  tripStartTime,
}: RouteSummaryProps) {
  // Calcular totais
  const totalStopTime = routePoints.reduce(
    (sum, point) => sum + point.localTime,
    0
  );
  const totalTravelTime = routePoints.reduce(
    (sum, point) => sum + point.travelTime,
    0
  );
  const totalTime = totalStopTime + totalTravelTime;
  const totalDistance =
    routePoints[routePoints.length - 1]?.accumulatedDistance || 0;
  const totalPoints = routePoints.length;

  // Verificar conformidade ANTT
  const anttChecks = checkANTTCompliance(routePoints);

  return (
    <Card className="p-6 bg-gradient-to-br from-slate-50 to-white border-slate-200 shadow-sm">
      <h2 className="text-slate-900 mb-4">Resumo da Viagem</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Tempo de Paradas */}
        <div className="p-4 bg-white border border-slate-200 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-slate-600 text-sm">Tempo de Paradas</p>
              <p className="text-slate-900">
                {formatMinutesToHours(totalStopTime)}
              </p>
            </div>
          </div>
        </div>

        {/* Tempo Total */}
        <div className="p-4 bg-white border border-slate-200 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-slate-600 text-sm">Tempo Total</p>
              <p className="text-slate-900">
                {formatMinutesToHours(totalTime)}
              </p>
            </div>
          </div>
        </div>

        {/* Distância Total */}
        <div className="p-4 bg-white border border-slate-200 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Route className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-slate-600 text-sm">Distância Total</p>
              <p className="text-slate-900">{totalDistance.toFixed(1)} km</p>
            </div>
          </div>
        </div>

        {/* Total de Pontos */}
        <div className="p-4 bg-white border border-slate-200 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-slate-600 text-sm">Total de Pontos</p>
              <p className="text-slate-900">{totalPoints}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Resumo ANTT */}
      <div className="border-t border-slate-200 pt-4">
        <h3 className="text-slate-900 mb-3">Conformidade ANTT</h3>
        <div className="space-y-2">
          {anttChecks.map((check, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 p-3 rounded-lg border ${
                check.compliant
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              {check.compliant ? (
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              )}
              <div className="flex-1">
                <p
                  className={`text-sm ${
                    check.compliant ? "text-green-800" : "text-red-800"
                  }`}
                >
                  {check.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Horários */}
      <div className="mt-4 pt-4 border-t border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-slate-600 text-sm">Horário de Início</p>
            <p className="text-slate-900 mt-1">{tripStartTime}</p>
          </div>
          <div>
            <p className="text-slate-600 text-sm">
              Horário Previsto de Chegada
            </p>
            <p className="text-slate-900 mt-1">
              {routePoints[routePoints.length - 1]?.arrivalTime || "--:--"}
            </p>
          </div>
          <div>
            <p className="text-slate-600 text-sm">Velocidade Média Geral</p>
            <p className="text-slate-900 mt-1">
              {totalTravelTime > 0
                ? ((totalDistance / totalTravelTime) * 60).toFixed(1)
                : "0.0"}{" "}
              km/h
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

function formatMinutesToHours(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

interface ANTTCheck {
  compliant: boolean;
  message: string;
}

function checkANTTCompliance(routePoints: RoutePoint[]): ANTTCheck[] {
  const checks: ANTTCheck[] = [];

  if (routePoints.length === 0) {
    return [{ compliant: false, message: "Nenhum ponto adicionado à rota" }];
  }

  const totalDistance =
    routePoints[routePoints.length - 1]?.accumulatedDistance || 0;

  const stopPoints = routePoints.filter((p) => p.pointType === "PP");
  if (totalDistance > 262 && stopPoints.length === 0) {
    checks.push({
      compliant: false,
      message: "Falta ponto de parada obrigatória (distância acima de 262 km)",
    });
  } else if (stopPoints.length > 0) {
    checks.push({
      compliant: true,
      message: `${stopPoints.length} ponto(s) de parada configurado(s)`,
    });
  }

  const supportPoints = routePoints.filter((p) => p.pointType === "PA");
  if (totalDistance > 402 && supportPoints.length === 0) {
    checks.push({
      compliant: false,
      message: "Falta ponto de apoio obrigatório (distância acima de 402 km)",
    });
  } else if (supportPoints.length > 0) {
    checks.push({
      compliant: true,
      message: `${supportPoints.length} ponto(s) de apoio configurado(s)`,
    });
  }

  const driverChangePoints = routePoints.filter((p) => p.pointType === "TMJ");
  if (totalDistance > 660 && driverChangePoints.length === 0) {
    checks.push({
      compliant: false,
      message:
        "Falta troca de motorista obrigatória (distância acima de 660 km)",
    });
  } else if (driverChangePoints.length > 0) {
    checks.push({
      compliant: true,
      message: `${driverChangePoints.length} ponto(s) de troca de motorista configurado(s)`,
    });
  }

  const highSpeedPoints = routePoints.filter((p) => p.avgSpeed > 90);
  if (highSpeedPoints.length > 0) {
    checks.push({
      compliant: false,
      message: `${highSpeedPoints.length} ponto(s) com velocidade acima da recomendada (>90 km/h)`,
    });
  } else {
    checks.push({
      compliant: true,
      message: "Todas as velocidades dentro do limite recomendado",
    });
  }

  const longDistancePoints = routePoints.filter((p) => p.distance > 200);
  if (longDistancePoints.length > 0) {
    checks.push({
      compliant: false,
      message: `${longDistancePoints.length} trecho(s) com distância muito longa (>200 km sem parada)`,
    });
  }

  if (checks.length === 0 || checks.every((c) => c.compliant)) {
    checks.push({
      compliant: true,
      message: "Esquema operacional em conformidade com regulamentação ANTT",
    });
  }

  return checks;
}
