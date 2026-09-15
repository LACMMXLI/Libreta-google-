import React, { useState } from 'react';
import { X, Check, Trash2, AlertTriangle, Clock, History } from 'lucide-react';
import { Movimiento } from '../types';
import { esFechaPasada, formatearFechaEsp } from '../lib/dateUtils';

interface MovementEditModalProps {
  movimiento: Movimiento | null;
  onCerrar: () => void;
  onGuardar: (
    movimientoId: string,
    actualizaciones: { concepto: string; importe: number; hora?: string }
  ) => void;
  onEliminar: (movimientoId: string) => void;
}

export const MovementEditModal: React.FC<MovementEditModalProps> = ({
  movimiento,
  onCerrar,
  onGuardar,
  onEliminar,
}) => {
  if (!movimiento) return null;

  const [concepto, setConcepto] = useState(movimiento.concepto);
  const [importe, setImporte] = useState(movimiento.importe.toString());
  const [hora, setHora] = useState(movimiento.hora);
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);

  const esPasada = esFechaPasada(movimiento.hojaFecha);

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    const monto = parseFloat(importe);
    if (isNaN(monto) || monto <= 0) return;

    onGuardar(movimiento.id, {
      concepto: concepto.trim() || 'Consumo general',
      importe: monto,
      hora,
    });
    onCerrar();
  };

  const handleEliminar = () => {
    onEliminar(movimiento.id);
    onCerrar();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[#FAF7F2] rounded-3xl border-2 border-[#D5CCBE] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#2E2822] text-[#FAF7F2] p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
              Editar Consumo Registrado
            </span>
            <h2 className="text-lg font-black text-[#FAF7F2] uppercase tracking-tight">
              {movimiento.empleadoNombre}
            </h2>
          </div>

          <button
            id="btn-cerrar-edit-movimiento"
            onClick={onCerrar}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 active:scale-95 transition"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audit Warning if past sheet */}
        {esPasada && (
          <div className="bg-amber-50 border-b border-amber-200 p-3 flex items-start gap-2 text-amber-900 text-xs leading-relaxed">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Modificación en Hoja Anterior</span>
              Esta hoja pertenece al {formatearFechaEsp(movimiento.hojaFecha)}. Cualquier corrección o cancelación dejará un registro explícito de auditoría para evitar cambios silenciosos.
            </div>
          </div>
        )}

        {/* Existing Audit note if already modified */}
        {movimiento.esModificacionPosterior && movimiento.notaAuditoria && (
          <div className="bg-stone-100 border-b border-stone-200 px-4 py-2 flex items-center gap-1.5 text-[11px] text-stone-600">
            <History className="w-3.5 h-3.5 text-stone-500 shrink-0" />
            <span>{movimiento.notaAuditoria}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleGuardar} className="p-4 space-y-4">
          <div>
            <label
              htmlFor="input-edit-concepto"
              className="block text-xs font-bold uppercase text-stone-600 mb-1"
            >
              Concepto
            </label>
            <input
              id="input-edit-concepto"
              type="text"
              required
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white rounded-xl border-2 border-[#D5CCBE] focus:border-[#2D6A4F] text-sm font-bold text-[#1E1915] outline-hidden"
            />
          </div>

          <div>
            <label
              htmlFor="input-edit-importe"
              className="block text-xs font-bold uppercase text-stone-600 mb-1"
            >
              Importe ($)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-stone-400">
                $
              </span>
              <input
                id="input-edit-importe"
                type="number"
                step="any"
                min="1"
                required
                value={importe}
                onChange={(e) => setImporte(e.target.value)}
                className="w-full pl-8 pr-3.5 py-2.5 bg-white rounded-xl border-2 border-[#D5CCBE] focus:border-[#2D6A4F] text-xl font-black text-[#1E1915] outline-hidden tabular-nums"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="input-edit-hora"
              className="block text-xs font-bold uppercase text-stone-600 mb-1"
            >
              Hora del registro
            </label>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-stone-400" />
              <input
                id="input-edit-hora"
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className="px-3 py-1.5 bg-white rounded-lg border border-[#D5CCBE] text-sm font-mono text-[#1E1915]"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              id="btn-guardar-edicion"
              className="w-full py-3 rounded-xl bg-[#2D6A4F] hover:bg-[#23563F] text-white font-black text-sm flex items-center justify-center gap-2 shadow-sm active:scale-98 transition"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>GUARDAR CAMBIOS</span>
            </button>

            {!confirmandoEliminar ? (
              <button
                type="button"
                id="btn-iniciar-eliminar"
                onClick={() => setConfirmandoEliminar(true)}
                className="w-full py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Cancelar / Eliminar consumo</span>
              </button>
            ) : (
              <div className="p-3 bg-red-100/70 border border-red-300 rounded-xl space-y-2 animate-in fade-in duration-150">
                <span className="text-xs font-bold text-red-900 block text-center">
                  ¿Confirmas eliminar este consumo de {movimiento.empleadoNombre}?
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmandoEliminar(false)}
                    className="py-1.5 rounded-lg bg-white text-stone-700 font-bold text-xs hover:bg-stone-50"
                  >
                    No, mantener
                  </button>
                  <button
                    type="button"
                    id="btn-confirmar-eliminar"
                    onClick={handleEliminar}
                    className="py-1.5 rounded-lg bg-red-600 text-white font-black text-xs hover:bg-red-700"
                  >
                    Sí, eliminar
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
