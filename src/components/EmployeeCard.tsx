import React from 'react';
import { Plus, Calendar, Clock, Edit2, AlertCircle } from 'lucide-react';
import { Empleado, Movimiento } from '../types';
import { formatearMoneda } from '../lib/dateUtils';

interface EmployeeCardProps {
  empleado: Empleado;
  movimientos: Movimiento[];
  onAbrirRegistro: (empleado: Empleado) => void;
  onVerSemana: (empleado: Empleado) => void;
  onEditarMovimiento: (movimiento: Movimiento) => void;
  esHojaPasada: boolean;
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({
  empleado,
  movimientos,
  onAbrirRegistro,
  onVerSemana,
  onEditarMovimiento,
  esHojaPasada,
}) => {
  const totalDia = movimientos.reduce((sum, m) => sum + m.importe, 0);
  const tieneMovimientos = movimientos.length > 0;

  return (
    <div
      id={`empleado-card-${empleado.id}`}
      className="relative bg-[#FAF7F2] rounded-2xl border-2 border-[#D8CFBF] shadow-xs hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
    >
      {/* Top indicator bar with employee accent color */}
      <div
        className="h-1.5 w-full"
        style={{ backgroundColor: empleado.color || '#8C6D46' }}
      />

      <div className="p-3.5 sm:p-4 flex-1 flex flex-col">
        {/* Header: Employee Name & "Ver semana" button */}
        <div className="flex items-start justify-between gap-2 pb-2 border-b border-[#E8E1D5]">
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm text-white shadow-2xs shrink-0"
              style={{ backgroundColor: empleado.color || '#2E2822' }}
            >
              {empleado.nombre.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight text-[#241D17] uppercase leading-tight">
                {empleado.nombre}
              </h3>
              <span className="text-[11px] text-stone-500 font-medium">
                Semana: {empleado.diaInicioSemana.substring(0, 3)}
              </span>
            </div>
          </div>

          <button
            id={`btn-ver-semana-${empleado.id}`}
            onClick={() => onVerSemana(empleado)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg border border-[#CFC5B4] bg-[#F2EDE2] text-[#4A3E34] hover:bg-[#E6DEC $\d] active:scale-95 transition shadow-2xs"
            title="Ver acumulado de su semana"
          >
            <Calendar className="w-3 h-3 text-[#7F5539]" />
            <span>Ver semana</span>
          </button>
        </div>

        {/* Consumptions List: Lined notebook lines effect */}
        <div className="py-2.5 flex-1 min-h-[75px] space-y-1.5">
          {tieneMovimientos ? (
            <div className="space-y-1">
              {movimientos.map((m) => (
                <button
                  key={m.id}
                  id={`movimiento-${m.id}`}
                  onClick={() => onEditarMovimiento(m)}
                  className="w-full group text-left flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-[#EFE9DC] active:bg-[#E5DEC $\d] transition text-sm border border-transparent hover:border-[#D5CCBE]"
                  title="Toca para editar o cancelar"
                >
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <span className="font-extrabold text-[#1E1915] text-sm tabular-nums">
                      {formatearMoneda(m.importe)}
                    </span>
                    <span className="text-stone-800 font-medium truncate">
                      {m.concepto}
                    </span>
                    {m.esModificacionPosterior && (
                      <span title="Modificado con posterioridad" className="text-amber-600">
                        <AlertCircle className="w-3 h-3" />
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 text-stone-400 group-hover:text-stone-700">
                    <span className="text-[11px] font-mono flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {m.hora}
                    </span>
                    <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center py-4 text-center text-stone-400 font-medium text-xs sm:text-sm italic">
              Sin movimientos registrados
            </div>
          )}
        </div>

        {/* Total of the Day & Big Register Button */}
        <div className="pt-2 border-t border-[#E8E1D5] flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500">
              TOTAL DEL DÍA
            </span>
            <span
              className={`text-xl sm:text-2xl font-black tabular-nums ${
                tieneMovimientos ? 'text-[#1E1915]' : 'text-stone-400'
              }`}
            >
              {formatearMoneda(totalDia)}
            </span>
          </div>

          {/* Large "+" button: designed for quick, single-handed tap */}
          <button
            id={`btn-agregar-${empleado.id}`}
            onClick={() => onAbrirRegistro(empleado)}
            className="flex-1 sm:flex-initial min-w-[70px] sm:min-w-[80px] h-12 sm:h-13 bg-[#2D6A4F] hover:bg-[#22543E] active:scale-95 text-white rounded-xl font-black text-xl flex items-center justify-center shadow-md transition-all gap-1 cursor-pointer"
            title={`Registrar consumo para ${empleado.nombre}`}
          >
            <Plus className="w-6 h-6 stroke-[3]" />
            <span className="text-sm font-extrabold sm:hidden">Registrar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
