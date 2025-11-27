import { useState } from "react";
import { Search, MapPin, X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { RoutePoint } from "@/types/scheme";

interface AddPointModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (point: any) => void;
  lastPoint: RoutePoint | null;
  initialPoint: any;
}

// Mock data de locais cadastrados
const mockLocations = [
  {
    id: 1,
    name: "Terminal Rodoviário",
    city: "Uberaba",
    state: "MG",
    type: "Terminal",
    lat: -19.7479,
    lng: -47.9319,
  },
  {
    id: 2,
    name: "Posto Graal",
    city: "Cristalina",
    state: "GO",
    type: "Posto de Combustível",
    lat: -16.7681,
    lng: -47.6144,
  },
  {
    id: 3,
    name: "Terminal Tietê",
    city: "São Paulo",
    state: "SP",
    type: "Terminal",
    lat: -23.5151,
    lng: -46.6264,
  },
  {
    id: 4,
    name: "Posto Shell BR-153",
    city: "Anápolis",
    state: "GO",
    type: "Posto de Combustível",
    lat: -16.3281,
    lng: -48.9534,
  },
  {
    id: 5,
    name: "Restaurante Estrela",
    city: "Uberlândia",
    state: "MG",
    type: "Restaurante",
    lat: -18.9186,
    lng: -48.2772,
  },
  {
    id: 6,
    name: "Terminal Central",
    city: "Goiânia",
    state: "GO",
    type: "Terminal",
    lat: -16.6869,
    lng: -49.2648,
  },
  {
    id: 7,
    name: "Posto Ipiranga KM 745",
    city: "Campinas",
    state: "SP",
    type: "Posto de Combustível",
    lat: -22.9099,
    lng: -47.0626,
  },
  {
    id: 8,
    name: "Parador Via Oeste",
    city: "Ribeirão Preto",
    state: "SP",
    type: "Restaurante",
    lat: -21.1704,
    lng: -47.8103,
  },
  {
    id: 9,
    name: "Terminal Rodoviário",
    city: "Catalão",
    state: "GO",
    type: "Terminal",
    lat: -18.1658,
    lng: -47.9464,
  },
  {
    id: 10,
    name: "Posto BR Mania",
    city: "Araguari",
    state: "MG",
    type: "Posto de Combustível",
    lat: -18.6473,
    lng: -48.1867,
  },
  {
    id: 11,
    name: "Restaurante Sabor Mineiro",
    city: "Ituiutaba",
    state: "MG",
    type: "Restaurante",
    lat: -18.9688,
    lng: -49.4646,
  },
  {
    id: 12,
    name: "Garagem Central",
    city: "Brasília",
    state: "DF",
    type: "Garagem",
    lat: -15.7942,
    lng: -47.8822,
  },
];

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

export function AddPointModal({
  isOpen,
  onClose,
  onAdd,
  lastPoint,
  initialPoint,
}: AddPointModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [pointType, setPointType] = useState("PP");
  const [localTime, setLocalTime] = useState(20);
  const [avgSpeed, setAvgSpeed] = useState(80);
  const [justification, setJustification] = useState("");

  const filteredLocations = mockLocations.filter(
    (location) =>
      location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLocationSelect = (location: any) => {
    setSelectedLocation(location);
  };

  const handleAdd = () => {
    if (!selectedLocation) return;

    onAdd({
      ...selectedLocation,
      pointType,
      localTime,
      avgSpeed,
      justification,
    });

    // Reset form
    setSearchTerm("");
    setSelectedLocation(null);
    setPointType("PP");
    setLocalTime(20);
    setAvgSpeed(80);
    setJustification("");
  };

  const handleClose = () => {
    setSearchTerm("");
    setSelectedLocation(null);
    setPointType("PP");
    setLocalTime(20);
    setAvgSpeed(80);
    setJustification("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Ponto à Rota</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Busca de Local */}
          <div className="space-y-3">
            <Label>Buscar Local Cadastrado</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Digite cidade, nome do local ou estado..."
                className="pl-10"
              />
            </div>

            {/* Lista de Resultados */}
            {searchTerm && (
              <div className="border border-slate-200 rounded-lg max-h-64 overflow-y-auto">
                {filteredLocations.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {filteredLocations.map((location) => (
                      <button
                        key={location.id}
                        onClick={() => handleLocationSelect(location)}
                        className={`w-full text-left p-3 hover:bg-slate-50 transition-colors ${
                          selectedLocation?.id === location.id
                            ? "bg-blue-50"
                            : ""
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-blue-600" />
                              <span className="text-slate-900">
                                {location.name}
                              </span>
                            </div>
                            <div className="text-sm text-slate-600 mt-1">
                              {location.city} / {location.state} •{" "}
                              {location.type}
                            </div>
                          </div>
                          {selectedLocation?.id === location.id && (
                            <div className="flex items-center gap-1 text-blue-600 text-sm">
                              ✓ Selecionado
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-500">
                    <MapPin className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>Nenhum local encontrado</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Informações do Local Selecionado */}
          {selectedLocation && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-blue-900">{selectedLocation.name}</p>
                  <p className="text-blue-700 text-sm mt-1">
                    {selectedLocation.city} / {selectedLocation.state}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedLocation(null)}
                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-blue-600">Tipo:</span>
                  <span className="text-blue-900 ml-2">
                    {selectedLocation.type}
                  </span>
                </div>
                <div>
                  <span className="text-blue-600">Coordenadas:</span>
                  <span className="text-blue-900 ml-2">
                    {selectedLocation.lat.toFixed(4)},{" "}
                    {selectedLocation.lng.toFixed(4)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Configurações do Ponto */}
          {selectedLocation && (
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <h3 className="text-slate-900">Configurações do Ponto</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tipo de Ponto */}
                <div className="space-y-2">
                  <Label>Tipo de Ponto</Label>
                  <Select value={pointType} onValueChange={setPointType}>
                    <SelectTrigger>
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

                {/* Tempo no Local */}
                <div className="space-y-2">
                  <Label>Tempo no Local</Label>
                  <Select
                    value={String(localTime)}
                    onValueChange={(v: string) => setLocalTime(Number(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {localTimeOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={String(option.value)}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Velocidade Média */}
                <div className="space-y-2">
                  <Label>Velocidade Média (km/h)</Label>
                  <Input
                    type="number"
                    value={avgSpeed}
                    onChange={(e) => setAvgSpeed(Number(e.target.value))}
                    min="1"
                    max="120"
                  />
                </div>
              </div>

              {/* Justificativa */}
              <div className="space-y-2">
                <Label>Justificativa Operacional</Label>
                <Input
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="Descreva a justificativa para este ponto..."
                />
              </div>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleAdd}
              disabled={!selectedLocation}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Adicionar Ponto
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
