import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Calendar, ArrowRight, ExternalLink } from 'lucide-react';
import { Empleado, Movimiento } from '../types';
import { calcularSemanaEmpleado, formatearMoneda, sumarDias, formatearFechaEsp } from '../lib/dateUtils';

interface EmployeeWeekModalProps {
  empleado: Empleado | null;
  todosMovimientos: Movimiento[];
  fechaReferenciaInicial: string; // YYYY-MM-DD
  onCerrar: () => void;
  onIrAHoja: (fecha: string) => void;
}

export const EmployeeWeekModal: React.FC<EmployeeWeekModalProps> = ({
  empleado,
  todosMovimientos,
  fechaReferenciaInicial,
  onCerrar,
  onIrAHoja,
}) => {
  const [fechaReferencia, setFechaReferencia] = useState(fechaReferenciaInicial);
  const [diaExpandido, setDiaExpandido] = useState<string | null>(null);

  if (!empleado) return null;

  const movimientosEmpleado = todosMovimientos.filter(m => m.empleadoId === empleado.id);
  const resumen = calcularSemanaEmpleado(empleado, movimientosEmpleado, fechaReferencia);

  const irSemanaAnterior = () => {
    setFechaReferencia(sumarDias(fechaReferencia, -7));
  };

  const irSemanaSiguiente = () => {
    setFechaReferencia(sumarDias(fechaReferencia, 7));
  };

  const toggleExpandirDia = (fecha: string) => {
    setDiaExpandido(prev => (prev === fecha ? null : fecha));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#FAF7F2] rounded-3xl border-2 border-[#D5CCBE] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header with Employee Name & Cycle info */}
        <div className="bg-[#2E2822] text-[#FAF7F2] p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-base text-white shadow-xs"
              style={{ backgroundColor: empleado.color || '#D97706' }}
            >
              {empleado.nombre.charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="text-[11px] uppercase font-bold tracking-wider text-stone-400">
                Resumen Semanal de Consumos
              </span>
              <h2 className="text-xl font-black text-[#FAF7F2] uppercase tracking-tight">
                {empleado.nombre}
              </h2>
            </div>
          </div>

          <button
            id="btn-cerrar-semana"
            onClick={onCerrar}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 active:scale-95 transition"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Week Navigator bar */}
        <div className="bg-[#F2EDE2] border-b border-[#E0D8C8] px-4 py-2.5 flex items-center justify-between">
          <button
            id="btn-semana-anterior"
            onClick={irSemanaAnterior}
            className="p-1.5 rounded-lg border border-[#D5CCBE] bg-white hover:bg-[#FAF7F2] text-stone-700 active:scale-95 transition flex items-center gap-1 text-xs font-bold"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Semana anterior</span>
          </button>

          <div className="text-center">
            <span className="text-[10px] font-extrabold uppercase text-stone-500 tracking-wider block">
              Período de corte ({empleado.diaInicioSemana.substring(0, 3)})
            </span>
            <span className="text-xs sm:text-sm font-black text-[#1E1915]">
              Semana: {resumen.tituloRango}
            </span>
          </div>

          <button
            id="btn-semana-siguiente"
            onClick={irSemanaSiguiente}
            className="p-1.5 rounded-lg border border-[#D5CCBE] bg-white hover:bg-[#FAF7F2] text-stone-700 active:scale-95 transition flex items-center gap-1 text-xs font-bold"
          >
            <span className="hidden sm:inline">Semana siguiente</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Days of the week breakdown - Clean notebook lined sheet */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2">
          <div className="bg-white rounded-2xl border border-[#D8CFBF] overflow-hidden divide-y divide-[#EFE9DC]">
            {resumen.dias.map((dia) => {
              const estaExpandido = diaExpandido === dia.fecha;
              const tieneMovs = dia.movimientos.length > 0;

              return (
                <div key={dia.fecha} className="group">
                  <div
                    onClick={() => toggleExpandirDia(dia.fecha)}
                    className={`p-3 flex items-center justify-between cursor-pointer transition ${
                      dia.esHoy
                        ? 'bg-amber-50/70 font-semibold'
                        : 'hover:bg-[#FAF7F2]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: tieneMovs
                            ? (empleado.color || '#2D6A4F')
                            : '#D5CCBE'
                        }}
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-stone-900 text-sm capitalize">
                            {dia.nombreDia}
                          </span>
                          <span className="text-xs text-stone-500 font-mono">
                            {dia.fecha.split('-')[2]}/{dia.fecha.split('-')[1]}
                          </span>
                          {dia.esHoy && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.2 bg-[#2D6A4F] text-white rounded">
                              Hoy
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`font-black text-sm sm:text-base tabular-nums ${
                          dia.totalDia > 0 ? 'text-[#1E1915]' : 'text-stone-400'
                        }`}
                      >
                        {formatearMoneda(dia.totalDia)}
                      </span>
                      {tieneMovs && (
                        <ChevronRight
                          className={`w-3.5 h-3.5 text-stone-400 transition-transform ${
                            estaExpandido ? 'rotate-90' : ''
                          }`}
                        />
                      )}
                    </div>
                  </div>

                  {/* Expanded detail of that day's items */}
                  {estaExpandido && tieneMovs && (
                    <div className="bg-[#FAF7F2] p-3 border-t border-[#EFE9DC] space-y-1.5 text-xs animate-in slide-in-from-top-1 duration-150">
                      <div className="flex items-center justify-between text-stone-500 font-bold mb-1">
                        <span>Detalle de consumos:</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onIrAHoja(dia.fecha);
                            onCerrar();
                          }}
                          className="text-[#2D6A4F] hover:underline flex items-center gap-1 text-[11px]"
                        >
                          <span>Ver hoja del día</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>

                      {dia.movimientos.map((m) => (
                        <div
                          key={m.id}
                          className="flex items-center justify-between py-1 px-2 rounded bg-white border border-[#E5DEC $\d]"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-stone-400 text-[10px]">
                              {m.hora}
                            </span>
                            <span className="text-stone-800 font-semibold">
                              {m.concepto}
                            </span>
                          </div>
                          <span className="font-bold text-[#1E1915]">
                            {formatearMoneda(m.importe)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer: Week Total Summary Card */}
        <div className="bg-[#FAF7F2] border-t-2 border-[#D5CCBE] p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-stone-500 block">
              TOTAL DE LA SEMANA
            </span>
            <span className="text-[11px] text-stone-500">
              Acumulado de las 7 hojas correspondientes
            </span>
          </div>

          <div className="text-right">
            <span className="text-2xl sm:text-3xl font-black text-[#2D6A4F] tabular-nums">
              {formatearMoneda(resumen.totalSemana)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
