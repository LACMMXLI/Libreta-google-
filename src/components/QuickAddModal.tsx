import React, { useState } from 'react';
import { X, Check, DollarSign, Clock, AlertTriangle, ChevronRight } from 'lucide-react';
import { ConceptoRapido, Empleado } from '../types';
import { esFechaPasada, formatearMoneda, getHoraActual } from '../lib/dateUtils';

interface QuickAddModalProps {
  empleado: Empleado | null;
  fechaHoja: string; // YYYY-MM-DD
  conceptosRapidos: ConceptoRapido[];
  onCerrar: () => void;
  onRegistrar: (params: {
    empleadoId: string;
    empleadoNombre: string;
    concepto: string;
    importe: number;
    hojaFecha: string;
    hora?: string;
  }) => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  empleado,
  fechaHoja,
  conceptosRapidos,
  onCerrar,
  onRegistrar,
}) => {
  const [modoManual, setModoManual] = useState(false);
  const [importeManual, setImporteManual] = useState('');
  const [conceptoManual, setConceptoManual] = useState('');
  const [horaPersonalizada, setHoraPersonalizada] = useState(getHoraActual());

  if (!empleado) return null;

  const esPasada = esFechaPasada(fechaHoja);

  const handleSeleccionarRapido = (concepto: ConceptoRapido) => {
    onRegistrar({
      empleadoId: empleado.id,
      empleadoNombre: empleado.nombre,
      concepto: concepto.concepto,
      importe: concepto.importe,
      hojaFecha: fechaHoja,
      hora: getHoraActual(),
    });
    onCerrar();
  };

  const handleRegistrarManual = (e: React.FormEvent) => {
    e.preventDefault();
    const monto = parseFloat(importeManual);
    if (isNaN(monto) || monto <= 0) return;

    onRegistrar({
      empleadoId: empleado.id,
      empleadoNombre: empleado.nombre,
      concepto: conceptoManual.trim() || 'Consumo general',
      importe: monto,
      hojaFecha: fechaHoja,
      hora: horaPersonalizada || getHoraActual(),
    });
    onCerrar();
  };

  const agregarMontoRapido = (delta: number) => {
    const actual = parseFloat(importeManual) || 0;
    setImporteManual((actual + delta).toString());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#FAF7F2] rounded-t-3xl sm:rounded-3xl border-2 border-[#D5CCBE] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header with Employee Identity */}
        <div className="bg-[#2E2822] text-[#FAF7F2] px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-xs"
              style={{ backgroundColor: empleado.color || '#D97706' }}
            >
              {empleado.nombre.charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">
                Nuevo Consumo
              </span>
              <h2 className="text-lg font-black text-[#FAF7F2] uppercase tracking-tight">
                {empleado.nombre}
              </h2>
            </div>
          </div>

          <button
            id="btn-cerrar-quick-add"
            onClick={onCerrar}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 active:scale-95 transition"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning if past date */}
        {esPasada && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2 text-amber-900 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              Registrando en hoja anterior. Quedará registrada la hora actual con sello de auditoría.
            </span>
          </div>
        )}

        {/* Body content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {!modoManual ? (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-black uppercase tracking-wider text-stone-500">
                  Toque para registrar en 1 segundo:
                </span>
                <button
                  id="btn-activar-manual"
                  onClick={() => setModoManual(true)}
                  className="text-xs font-bold text-[#2D6A4F] hover:underline flex items-center gap-0.5"
                >
                  <span>Otra cantidad</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Grid of Large Preset Buttons */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                {conceptosRapidos.map((item) => (
                  <button
                    key={item.id}
                    id={`btn-rapido-${item.id}`}
                    onClick={() => handleSeleccionarRapido(item)}
                    className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white border-2 border-[#D5CCBE] hover:border-[#2D6A4F] hover:bg-[#F2EDE2] active:scale-95 transition shadow-xs text-center group cursor-pointer"
                  >
                    <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">
                      {item.icono || '🏷️'}
                    </span>
                    <span className="font-bold text-stone-800 text-sm uppercase tracking-tight">
                      {item.concepto}
                    </span>
                    <span className="mt-1 font-black text-lg text-[#2D6A4F] tabular-nums">
                      {formatearMoneda(item.importe)}
                    </span>
                  </button>
                ))}

                {/* Big Button for Manual Amount */}
                <button
                  id="btn-abrir-manual-grande"
                  onClick={() => setModoManual(true)}
                  className="col-span-2 flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-[#EFE9DD] border-2 border-dashed border-[#C5BAA8] hover:bg-[#E5DEC $\d] active:scale-98 transition font-black text-sm text-stone-700 cursor-pointer"
                >
                  <DollarSign className="w-5 h-5 text-[#7F5539]" />
                  <span>OTRA CANTIDAD / CONCEPTO MANUAL</span>
                </button>
              </div>
            </div>
          ) : (
            /* Manual Entry Form */
            <form onSubmit={handleRegistrarManual} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#E8E1D5]">
                <span className="text-xs font-black uppercase tracking-wider text-stone-600">
                  Captura de Importe Manual
                </span>
                <button
                  type="button"
                  onClick={() => setModoManual(false)}
                  className="text-xs font-bold text-stone-500 hover:text-stone-800"
                >
                  ← Volver a botones rápidos
                </button>
              </div>

              {/* Amount Input with big display */}
              <div>
                <label
                  htmlFor="input-importe-manual"
                  className="block text-xs font-bold uppercase text-stone-600 mb-1"
                >
                  Importe ($)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-stone-400">
                    $
                  </span>
                  <input
                    id="input-importe-manual"
                    type="number"
                    step="any"
                    min="1"
                    required
                    autoFocus
                    placeholder="0"
                    value={importeManual}
                    onChange={(e) => setImporteManual(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl border-2 border-[#D5CCBE] focus:border-[#2D6A4F] text-2xl font-black text-[#1E1915] outline-hidden tabular-nums"
                  />
                </div>

                {/* Quick Add Amount chips */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {[20, 50, 100, 200, 500].map((add) => (
                    <button
                      key={add}
                      type="button"
                      onClick={() => agregarMontoRapido(add)}
                      className="px-2.5 py-1 text-xs font-extrabold rounded-lg bg-[#EAE3D5] text-stone-700 hover:bg-[#DCD4C4] active:scale-95 transition"
                    >
                      +{add}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setImporteManual('')}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg text-stone-500 hover:text-red-700"
                  >
                    Borrar
                  </button>
                </div>
              </div>

              {/* Concept Input */}
              <div>
                <label
                  htmlFor="input-concepto-manual"
                  className="block text-xs font-bold uppercase text-stone-600 mb-1"
                >
                  Concepto (Opcional)
                </label>
                <input
                  id="input-concepto-manual"
                  type="text"
                  placeholder="Ej. Tacos, Almuerzo, Préstamo..."
                  value={conceptoManual}
                  onChange={(e) => setConceptoManual(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white rounded-xl border-2 border-[#D5CCBE] focus:border-[#2D6A4F] text-sm font-semibold text-[#1E1915] outline-hidden"
                />
              </div>

              {/* Time Input */}
              <div>
                <label
                  htmlFor="input-hora-manual"
                  className="block text-xs font-bold uppercase text-stone-600 mb-1"
                >
                  Hora del consumo
                </label>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-stone-400" />
                  <input
                    id="input-hora-manual"
                    type="time"
                    value={horaPersonalizada}
                    onChange={(e) => setHoraPersonalizada(e.target.value)}
                    className="px-3 py-1.5 bg-white rounded-lg border border-[#D5CCBE] text-sm font-mono text-[#1E1915]"
                  />
                  <button
                    type="button"
                    onClick={() => setHoraPersonalizada(getHoraActual())}
                    className="text-xs font-bold text-stone-500 hover:underline"
                  >
                    Hora actual
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                id="btn-guardar-manual"
                disabled={!importeManual || parseFloat(importeManual) <= 0}
                className="w-full py-3.5 rounded-2xl bg-[#2D6A4F] hover:bg-[#23563F] disabled:opacity-50 text-white font-black text-base flex items-center justify-center gap-2 shadow-md active:scale-98 transition cursor-pointer"
              >
                <Check className="w-5 h-5 stroke-[3]" />
                <span>REGISTRAR CONSUMO</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
