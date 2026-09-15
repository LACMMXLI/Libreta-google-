import React from 'react';
import { BookOpen, Calendar, Settings, ChevronLeft, ChevronRight, RotateCcw, AlertTriangle } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { formatearFechaEsp, formatearFechaHeader, esFechaHoy, sumarDias, getFechaHoyISO } from '../lib/dateUtils';

interface NotebookHeaderProps {
  fechaActual: string; // YYYY-MM-DD
  vistaActiva: 'hoja' | 'hojas_anteriores' | 'ajustes';
  onCambiarVista: (vista: 'hoja' | 'hojas_anteriores' | 'ajustes') => void;
  onCambiarFecha: (fecha: string) => void;
  totalDelDia: number;
  fueModificadaPosteriormente?: boolean;
  totalMovimientos: number;
}

export const NotebookHeader: React.FC<NotebookHeaderProps> = ({
  fechaActual,
  vistaActiva,
  onCambiarVista,
  onCambiarFecha,
  totalDelDia,
  fueModificadaPosteriormente,
  totalMovimientos,
}) => {
  const esHoy = esFechaHoy(fechaActual);
  const fechaHoyISO = getFechaHoyISO();

  const handleIrAyer = () => {
    onCambiarFecha(sumarDias(fechaActual, -1));
  };

  const handleIrManana = () => {
    onCambiarFecha(sumarDias(fechaActual, 1));
  };

  const handleIrAHoy = () => {
    onCambiarFecha(fechaHoyISO);
    onCambiarVista('hoja');
  };

  return (
    <header className="sticky top-0 z-30 bg-[#FAF7F2] border-b border-[#E3DC CE] shadow-xs">
      {/* Top simulated spiral binder edge */}
      <div className="h-3 bg-[#E8E1D5] flex items-center justify-around px-4 border-b border-[#D8CFBF] overflow-hidden">
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center">
            <span className="w-2.5 h-1.5 bg-[#4A3E34] rounded-full opacity-60 shadow-xs" />
          </div>
        ))}
      </div>

      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-2.5">
        {/* Navigation bar: Brand & Action Tabs */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#2E2822] text-[#FAF7F2] flex items-center justify-center font-bold text-sm shadow-xs">
              📖
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-[#2E2822] leading-tight">
                LIBRETA DE CONSUMOS
              </h1>
              <p className="text-[11px] text-stone-500 font-medium">
                Registro diario por empleado
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <PWAInstallButton />

            {/* View tabs */}
            <div className="flex bg-[#EFE9DD] p-0.5 rounded-xl border border-[#D5CCBE]">
              <button
                id="tab-hoja-btn"
                onClick={() => onCambiarVista('hoja')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  vistaActiva === 'hoja'
                    ? 'bg-[#2E2822] text-[#FAF7F2] shadow-xs'
                    : 'text-stone-700 hover:text-stone-950'
                }`}
                title="Ver Hoja"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Hoja</span>
              </button>

              <button
                id="tab-hojas-anteriores-btn"
                onClick={() => onCambiarVista('hojas_anteriores')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  vistaActiva === 'hojas_anteriores'
                    ? 'bg-[#2E2822] text-[#FAF7F2] shadow-xs'
                    : 'text-stone-700 hover:text-stone-950'
                }`}
                title="Ver Hojas Anteriores"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Hojas</span>
              </button>

              <button
                id="tab-ajustes-btn"
                onClick={() => onCambiarVista('ajustes')}
                className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  vistaActiva === 'ajustes'
                    ? 'bg-[#2E2822] text-[#FAF7F2] shadow-xs'
                    : 'text-stone-700 hover:text-stone-950'
                }`}
                title="Configuración"
              >
                <Settings className="w-3.5 h-3.5" />
                <span className="sr-only">Ajustes</span>
              </button>
            </div>
          </div>
        </div>

        {/* Big Date Header: Represents the physical daily sheet header */}
        {vistaActiva === 'hoja' && (
          <div className="mt-1 pt-2 border-t border-[#E8E1D5] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <button
                id="btn-dia-anterior"
                onClick={handleIrAyer}
                className="p-1.5 rounded-lg border border-[#D5CCBE] bg-[#F7F2E8] hover:bg-[#EBE2D2] text-stone-700 active:scale-95 transition"
                title="Día anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      esHoy
                        ? 'bg-[#2D6A4F] text-white'
                        : 'bg-[#7F5539] text-white'
                    }`}
                  >
                    {esHoy ? 'HOJA DE HOY' : 'HOJA ARCHIVADA'}
                  </span>

                  {fueModificadaPosteriormente && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded-md">
                      <AlertTriangle className="w-3 h-3 text-amber-700" />
                      Modificada con posterioridad
                    </span>
                  )}
                </div>

                <h2 className="text-lg sm:text-2xl font-black tracking-tight text-[#241D17] leading-tight">
                  {formatearFechaHeader(fechaActual)}
                </h2>
                <p className="text-xs text-stone-600 capitalize">
                  {formatearFechaEsp(fechaActual, true)}
                </p>
              </div>

              <button
                id="btn-dia-siguiente"
                onClick={handleIrManana}
                className="p-1.5 rounded-lg border border-[#D5CCBE] bg-[#F7F2E8] hover:bg-[#EBE2D2] text-stone-700 active:scale-95 transition"
                title="Día siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {!esHoy && (
                <button
                  id="btn-volver-hoy"
                  onClick={handleIrAHoy}
                  className="ml-1 inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-[#2D6A4F] text-white shadow-xs hover:bg-[#245740] active:scale-95 transition"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Volver a Hoy</span>
                </button>
              )}
            </div>

            {/* Day Total summary sticker on sheet corner */}
            <div className="flex items-baseline gap-2 bg-[#F2EDE2] border border-[#D8CFBF] px-3 py-1.5 rounded-xl shadow-2xs">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                Total Día:
              </span>
              <span className="text-lg sm:text-xl font-black text-[#1E1915]">
                ${totalDelDia.toLocaleString('es-MX')}
              </span>
              <span className="text-[10px] text-stone-500 font-medium">
                ({totalMovimientos} consumos)
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
