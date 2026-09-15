import React, { useState } from 'react';
import { BookOpen, Calendar, ChevronRight, AlertTriangle, Search, PlusCircle } from 'lucide-react';
import { HojaDiaria, Movimiento } from '../types';
import { formatearMoneda, formatearFechaEsp, esFechaHoy, getFechaHoyISO } from '../lib/dateUtils';

interface PastSheetsViewProps {
  hojas: HojaDiaria[];
  movimientos: Movimiento[];
  onSeleccionarHoja: (fecha: string) => void;
  onCrearHojaFecha: (fecha: string) => void;
}

export const PastSheetsView: React.FC<PastSheetsViewProps> = ({
  hojas,
  movimientos,
  onSeleccionarHoja,
  onCrearHojaFecha,
}) => {
  const [filtroTexto, setFiltroTexto] = useState('');
  const [nuevaFecha, setNuevaFecha] = useState('');
  const hoyISO = getFechaHoyISO();

  // Compute total and count per sheet
  const estadisticasPorHoja = hojas.map((hoja) => {
    const movsHoja = movimientos.filter((m) => m.hojaFecha === hoja.fecha);
    const total = movsHoja.reduce((sum, m) => sum + m.importe, 0);
    return {
      ...hoja,
      total,
      cantidadMovimientos: movsHoja.length,
      esHoy: esFechaHoy(hoja.fecha),
    };
  });

  const hojasFiltradas = estadisticasPorHoja.filter((h) => {
    if (!filtroTexto.trim()) return true;
    const term = filtroTexto.toLowerCase();
    return (
      h.fecha.includes(term) ||
      h.fechaFormateada.toLowerCase().includes(term)
    );
  });

  const handleCrearOIr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaFecha) return;
    onCrearHojaFecha(nuevaFecha);
    setNuevaFecha('');
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 space-y-4">
      {/* View Header */}
      <div className="bg-[#FAF7F2] rounded-2xl border-2 border-[#D5CCBE] p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E1D5]">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-stone-500">
              Archivo de la libreta
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-[#241D17] uppercase tracking-tight flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-[#7F5539]" />
              Hojas Diarias Guardadas
            </h2>
            <p className="text-xs text-stone-600 mt-0.5">
              Consulta exactamente cómo quedó la libreta en cada fecha. Organizada estrictamente por día.
            </p>
          </div>

          {/* Quick jump to date */}
          <form onSubmit={handleCrearOIr} className="flex items-center gap-2">
            <input
              type="date"
              value={nuevaFecha}
              onChange={(e) => setNuevaFecha(e.target.value)}
              className="px-3 py-1.5 bg-white rounded-xl border border-[#D5CCBE] text-xs font-semibold text-stone-800"
              title="Abrir fecha específica"
            />
            <button
              type="submit"
              disabled={!nuevaFecha}
              className="px-3 py-1.5 bg-[#2E2822] hover:bg-[#1E1915] disabled:opacity-50 text-[#FAF7F2] rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Abrir Hoja</span>
            </button>
          </form>
        </div>

        {/* Filter bar */}
        <div className="pt-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Buscar por fecha (ej. 15 septiembre, 2026-09)..."
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-[#D5CCBE] text-xs font-medium text-stone-800 placeholder-stone-400 outline-hidden focus:border-[#2D6A4F]"
            />
          </div>
        </div>
      </div>

      {/* Sheets List */}
      <div className="space-y-2.5">
        {hojasFiltradas.length > 0 ? (
          hojasFiltradas.map((hoja) => (
            <div
              key={hoja.fecha}
              id={`hoja-item-${hoja.fecha}`}
              onClick={() => onSeleccionarHoja(hoja.fecha)}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-xs hover:shadow-md active:scale-99 ${
                hoja.esHoy
                  ? 'bg-[#FAF7F2] border-[#2D6A4F]'
                  : 'bg-[#FAF7F2] border-[#D5CCBE] hover:border-[#8C7E72]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 font-black text-sm shadow-2xs ${
                    hoja.esHoy
                      ? 'bg-[#2D6A4F] text-white'
                      : 'bg-[#EAE3D5] text-[#4A3E34]'
                  }`}
                >
                  <Calendar className="w-5 h-5" />
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-black text-[#241D17] capitalize">
                      {formatearFechaEsp(hoja.fecha, true)}
                    </h3>

                    {hoja.esHoy && (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#2D6A4F] text-white">
                        Hoy
                      </span>
                    )}

                    {hoja.fueModificadaPosteriormente && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded-md">
                        <AlertTriangle className="w-3 h-3 text-amber-700" />
                        Modificada después
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-stone-500 font-medium mt-0.5">
                    {hoja.cantidadMovimientos === 0
                      ? 'Sin consumos registrados'
                      : `${hoja.cantidadMovimientos} consumos registrados`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                    Total
                  </span>
                  <span
                    className={`text-lg sm:text-xl font-black tabular-nums ${
                      hoja.total > 0 ? 'text-[#1E1915]' : 'text-stone-400'
                    }`}
                  >
                    {formatearMoneda(hoja.total)}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-[#F0EAE0] group-hover:bg-[#E5DEC $\d] text-stone-700">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center bg-[#FAF7F2] rounded-2xl border-2 border-dashed border-[#D5CCBE] text-stone-500 text-sm">
            No se encontraron hojas para la búsqueda "{filtroTexto}".
          </div>
        )}
      </div>
    </div>
  );
};
