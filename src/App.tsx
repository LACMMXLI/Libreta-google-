import React, { useState, useEffect } from 'react';
import { NotebookHeader } from './components/NotebookHeader';
import { EmployeeCard } from './components/EmployeeCard';
import { QuickAddModal } from './components/QuickAddModal';
import { EmployeeWeekModal } from './components/EmployeeWeekModal';
import { MovementEditModal } from './components/MovementEditModal';
import { PastSheetsView } from './components/PastSheetsView';
import { ConfigModal } from './components/ConfigModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ConceptoRapido, Empleado, HojaDiaria, Movimiento } from './types';
import {
  getEmpleados,
  guardarEmpleados,
  getHojas,
  asegurarHojaExiste,
  getMovimientos,
  registrarMovimiento,
  editarMovimiento,
  cancelarMovimiento,
  getConceptosRapidos,
  guardarConceptosRapidos,
  importarDatosJSON,
} from './lib/storage';
import { getFechaHoyISO, esFechaPasada } from './lib/dateUtils';

export default function App() {
  // Navigation & Date state
  const [fechaActual, setFechaActual] = useState<string>(getFechaHoyISO());
  const [vistaActiva, setVistaActiva] = useState<'hoja' | 'hojas_anteriores' | 'ajustes'>('hoja');

  // Core Data state
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [hojas, setHojas] = useState<HojaDiaria[]>([]);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [conceptos, setConceptos] = useState<ConceptoRapido[]>([]);

  // Modals state
  const [empleadoParaRegistro, setEmpleadoParaRegistro] = useState<Empleado | null>(null);
  const [empleadoParaSemana, setEmpleadoParaSemana] = useState<Empleado | null>(null);
  const [movimientoParaEditar, setMovimientoParaEditar] = useState<Movimiento | null>(null);

  // Load initial data
  useEffect(() => {
    const emps = getEmpleados();
    const movs = getMovimientos();
    const hjs = getHojas();
    const cnc = getConceptosRapidos();

    // Ensure today's sheet exists automatically
    const hoyISO = getFechaHoyISO();
    asegurarHojaExiste(hoyISO);

    setEmpleados(emps);
    setMovimientos(movs);
    setHojas(getHojas());
    setConceptos(cnc);
    setFechaActual(hoyISO);
  }, []);

  // Make sure current sheet exists whenever fechaActual changes
  useEffect(() => {
    if (fechaActual) {
      asegurarHojaExiste(fechaActual);
      setHojas(getHojas());
    }
  }, [fechaActual]);

  // Current sheet data
  const movimientosHojaActual = movimientos.filter((m) => m.hojaFecha === fechaActual);
  const totalDelDia = movimientosHojaActual.reduce((sum, m) => sum + m.importe, 0);
  const hojaActualData = hojas.find((h) => h.fecha === fechaActual);
  const esPasada = esFechaPasada(fechaActual);

  // Handlers for registering consumption
  const handleRegistrarConsumo = (params: {
    empleadoId: string;
    empleadoNombre: string;
    concepto: string;
    importe: number;
    hojaFecha: string;
    hora?: string;
  }) => {
    registrarMovimiento(params);
    // Refresh local state immediately
    setMovimientos(getMovimientos());
    setHojas(getHojas());
  };

  // Handlers for editing movement
  const handleGuardarEdicionMovimiento = (
    movimientoId: string,
    actualizaciones: { concepto: string; importe: number; hora?: string }
  ) => {
    editarMovimiento(movimientoId, actualizaciones);
    setMovimientos(getMovimientos());
    setHojas(getHojas());
  };

  const handleEliminarMovimiento = (movimientoId: string) => {
    cancelarMovimiento(movimientoId);
    setMovimientos(getMovimientos());
    setHojas(getHojas());
  };

  // Handlers for settings updates
  const handleGuardarEmpleados = (nuevosEmpleados: Empleado[]) => {
    guardarEmpleados(nuevosEmpleados);
    setEmpleados(nuevosEmpleados);
  };

  const handleGuardarConceptos = (nuevosConceptos: ConceptoRapido[]) => {
    guardarConceptosRapidos(nuevosConceptos);
    setConceptos(nuevosConceptos);
  };

  const handleRestaurarDatos = (jsonStr: string) => {
    const ok = importarDatosJSON(jsonStr);
    if (ok) {
      setEmpleados(getEmpleados());
      setMovimientos(getMovimientos());
      setHojas(getHojas());
      setConceptos(getConceptosRapidos());
    }
  };

  // Navigation handlers
  const handleSeleccionarHoja = (fecha: string) => {
    setFechaActual(fecha);
    setVistaActiva('hoja');
  };

  const handleCrearHojaFecha = (fecha: string) => {
    asegurarHojaExiste(fecha);
    setHojas(getHojas());
    setFechaActual(fecha);
    setVistaActiva('hoja');
  };

  return (
    <div className="min-h-screen bg-[#F4F1EA] flex flex-col font-sans text-[#2D2A26]">
      {/* Sticky Notebook Header with Spine, Date, Day Switcher & Tabs */}
      <NotebookHeader
        fechaActual={fechaActual}
        vistaActiva={vistaActiva}
        onCambiarVista={setVistaActiva}
        onCambiarFecha={setFechaActual}
        totalDelDia={totalDelDia}
        totalMovimientos={movimientosHojaActual.length}
        fueModificadaPosteriormente={hojaActualData?.fueModificadaPosteriormente}
      />

      {/* Main Viewport */}
      <main className="flex-1 pb-16">
        {vistaActiva === 'hoja' && (
          <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4">
            {/* Grid of Employees - Large touch cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
              {empleados.map((emp) => {
                const movsEmp = movimientosHojaActual.filter((m) => m.empleadoId === emp.id);
                return (
                  <EmployeeCard
                    key={emp.id}
                    empleado={emp}
                    movimientos={movsEmp}
                    onAbrirRegistro={(e) => setEmpleadoParaRegistro(e)}
                    onVerSemana={(e) => setEmpleadoParaSemana(e)}
                    onEditarMovimiento={(m) => setMovimientoParaEditar(m)}
                    esHojaPasada={esPasada}
                  />
                );
              })}
            </div>

            {/* Notebook page footer margin note */}
            <div className="mt-6 pt-4 border-t border-[#D8CFBF] text-center text-[11px] text-stone-500 font-medium">
              Libreta de Consumos • Cada empleado tiene su registro diario y corte semanal independiente.
            </div>
          </div>
        )}

        {vistaActiva === 'hojas_anteriores' && (
          <PastSheetsView
            hojas={hojas}
            movimientos={movimientos}
            onSeleccionarHoja={handleSeleccionarHoja}
            onCrearHojaFecha={handleCrearHojaFecha}
          />
        )}

        {vistaActiva === 'ajustes' && (
          <ConfigModal
            empleados={empleados}
            conceptos={conceptos}
            onGuardarEmpleados={handleGuardarEmpleados}
            onGuardarConceptos={handleGuardarConceptos}
            onRestaurarDatos={handleRestaurarDatos}
            onVolver={() => setVistaActiva('hoja')}
          />
        )}
      </main>

      {/* Quick Add Modal / Single-hand Bottom Sheet */}
      <QuickAddModal
        empleado={empleadoParaRegistro}
        fechaHoja={fechaActual}
        conceptosRapidos={conceptos}
        onCerrar={() => setEmpleadoParaRegistro(null)}
        onRegistrar={handleRegistrarConsumo}
      />

      {/* Employee Week Modal (Custom cycle breakdown) */}
      <EmployeeWeekModal
        empleado={empleadoParaSemana}
        todosMovimientos={movimientos}
        fechaReferenciaInicial={fechaActual}
        onCerrar={() => setEmpleadoParaSemana(null)}
        onIrAHoja={handleSeleccionarHoja}
      />

      {/* Movement Edit & Cancel Modal */}
      <MovementEditModal
        movimiento={movimientoParaEditar}
        onCerrar={() => setMovimientoParaEditar(null)}
        onGuardar={handleGuardarEdicionMovimiento}
        onEliminar={handleEliminarMovimiento}
      />

      {/* PWA Offline Indicator */}
      <OfflineIndicator />
    </div>
  );
}
