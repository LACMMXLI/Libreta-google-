import React, { useState } from 'react';
import {
  Users,
  Tag,
  Plus,
  Trash2,
  Edit2,
  Save,
  Check,
  RotateCcw,
  Download,
  Upload,
  Server,
  FileText
} from 'lucide-react';
import { ConceptoRapido, DiaSemana, Empleado } from '../types';
import { LISTA_DIAS_SEMANA } from '../lib/dateUtils';
import { exportarDatosJSON, DEFAULT_EMPLEADOS, DEFAULT_CONCEPTOS } from '../lib/storage';

interface ConfigModalProps {
  empleados: Empleado[];
  conceptos: ConceptoRapido[];
  onGuardarEmpleados: (empleados: Empleado[]) => void;
  onGuardarConceptos: (conceptos: ConceptoRapido[]) => void;
  onRestaurarDatos: (jsonStr: string) => void;
  onVolver: () => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
  empleados,
  conceptos,
  onGuardarEmpleados,
  onGuardarConceptos,
  onRestaurarDatos,
  onVolver,
}) => {
  const [seccion, setSeccion] = useState<'empleados' | 'conceptos' | 'datos' | 'despliegue'>('empleados');

  // Local state for editing employees
  const [listaEmpleados, setListaEmpleados] = useState<Empleado[]>(empleados);
  const [nuevoNombreEmp, setNuevoNombreEmp] = useState('');
  const [nuevoDiaSemanaEmp, setNuevoDiaSemanaEmp] = useState<DiaSemana>('lunes');

  // Local state for editing quick presets
  const [listaConceptos, setListaConceptos] = useState<ConceptoRapido[]>(conceptos);
  const [nuevoConcepto, setNuevoConcepto] = useState('');
  const [nuevoImporte, setNuevoImporte] = useState('');
  const [nuevoIcono, setNuevoIcono] = useState('🍺');

  const [notificacion, setNotificacion] = useState<string | null>(null);

  const mostrarAviso = (msg: string) => {
    setNotificacion(msg);
    setTimeout(() => setNotificacion(null), 2500);
  };

  // Employee Handlers
  const handleCambiarDiaInicio = (empId: string, dia: DiaSemana) => {
    const act = listaEmpleados.map((e) =>
      e.id === empId ? { ...e, diaInicioSemana: dia } : e
    );
    setListaEmpleados(act);
    onGuardarEmpleados(act);
    mostrarAviso('Día de corte actualizado');
  };

  const handleCambiarNombreEmp = (empId: string, nombre: string) => {
    const act = listaEmpleados.map((e) =>
      e.id === empId ? { ...e, nombre } : e
    );
    setListaEmpleados(act);
    onGuardarEmpleados(act);
  };

  const handleAgregarEmpleado = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombreEmp.trim()) return;

    const colores = ['#D97706', '#E11D48', '#059669', '#0284C7', '#7C3AED', '#EA580C', '#0D9488', '#4F46E5'];
    const color = colores[listaEmpleados.length % colores.length];

    const nuevo: Empleado = {
      id: 'emp-' + Date.now(),
      nombre: nuevoNombreEmp.trim(),
      diaInicioSemana: nuevoDiaSemanaEmp,
      color,
      activo: true,
      creadoEn: new Date().toISOString(),
    };

    const act = [...listaEmpleados, nuevo];
    setListaEmpleados(act);
    onGuardarEmpleados(act);
    setNuevoNombreEmp('');
    mostrarAviso(`Empleado ${nuevo.nombre} agregado`);
  };

  const handleEliminarEmpleado = (empId: string) => {
    if (listaEmpleados.length <= 1) {
      alert('Debe existir al menos un empleado en la libreta.');
      return;
    }
    const act = listaEmpleados.filter((e) => e.id !== empId);
    setListaEmpleados(act);
    onGuardarEmpleados(act);
    mostrarAviso('Empleado eliminado');
  };

  // Concepts Handlers
  const handleAgregarConcepto = (e: React.FormEvent) => {
    e.preventDefault();
    const imp = parseFloat(nuevoImporte);
    if (!nuevoConcepto.trim() || isNaN(imp) || imp <= 0) return;

    const nuevo: ConceptoRapido = {
      id: 'c-' + Date.now(),
      concepto: nuevoConcepto.trim(),
      importe: imp,
      icono: nuevoIcono,
    };

    const act = [...listaConceptos, nuevo];
    setListaConceptos(act);
    onGuardarConceptos(act);
    setNuevoConcepto('');
    setNuevoImporte('');
    mostrarAviso('Concepto rápido agregado');
  };

  const handleActualizarConcepto = (id: string, campo: 'concepto' | 'importe', valor: any) => {
    const act = listaConceptos.map((c) => {
      if (c.id === id) {
        return {
          ...c,
          [campo]: campo === 'importe' ? (parseFloat(valor) || 0) : valor,
        };
      }
      return c;
    });
    setListaConceptos(act);
    onGuardarConceptos(act);
  };

  const handleEliminarConcepto = (id: string) => {
    if (listaConceptos.length <= 1) {
      alert('Debe existir al menos un concepto predefinido.');
      return;
    }
    const act = listaConceptos.filter((c) => c.id !== id);
    setListaConceptos(act);
    onGuardarConceptos(act);
    mostrarAviso('Concepto eliminado');
  };

  // Backup handlers
  const handleDescargarBackup = () => {
    const jsonStr = exportarDatosJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `libreta_consumos_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    mostrarAviso('Copia de seguridad descargada');
  };

  const handleCargarArchivoBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onRestaurarDatos(content);
        mostrarAviso('Datos restaurados correctamente');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 space-y-4">
      {/* Header */}
      <div className="bg-[#FAF7F2] rounded-2xl border-2 border-[#D5CCBE] p-4 flex items-center justify-between shadow-xs">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-stone-500">
            Ajustes de la Libreta
          </span>
          <h2 className="text-xl font-black text-[#241D17] uppercase tracking-tight">
            Configuración del Sistema
          </h2>
        </div>

        <button
          id="btn-volver-hoja-ajustes"
          onClick={onVolver}
          className="px-3.5 py-1.5 rounded-xl bg-[#2E2822] text-[#FAF7F2] text-xs font-bold hover:bg-[#1E1915] active:scale-95 transition"
        >
          ← Volver a la Hoja
        </button>
      </div>

      {notificacion && (
        <div className="p-2.5 bg-[#2D6A4F] text-white text-xs font-bold rounded-xl shadow-xs text-center animate-in fade-in">
          {notificacion}
        </div>
      )}

      {/* Tabs */}
      <div className="flex bg-[#EFE9DD] p-1 rounded-2xl border border-[#D5CCBE] overflow-x-auto gap-1">
        <button
          onClick={() => setSeccion('empleados')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            seccion === 'empleados'
              ? 'bg-[#2E2822] text-[#FAF7F2] shadow-xs'
              : 'text-stone-700 hover:text-stone-950'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Empleados y Semanas</span>
        </button>

        <button
          onClick={() => setSeccion('conceptos')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            seccion === 'conceptos'
              ? 'bg-[#2E2822] text-[#FAF7F2] shadow-xs'
              : 'text-stone-700 hover:text-stone-950'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>Conceptos y Precios</span>
        </button>

        <button
          onClick={() => setSeccion('datos')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            seccion === 'datos'
              ? 'bg-[#2E2822] text-[#FAF7F2] shadow-xs'
              : 'text-stone-700 hover:text-stone-950'
          }`}
        >
          <Save className="w-3.5 h-3.5" />
          <span>Copia de Seguridad</span>
        </button>

        <button
          onClick={() => setSeccion('despliegue')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            seccion === 'despliegue'
              ? 'bg-[#2E2822] text-[#FAF7F2] shadow-xs'
              : 'text-stone-700 hover:text-stone-950'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>Docker & Coolify</span>
        </button>
      </div>

      {/* SECTION: EMPLOYEES & WEEK START */}
      {seccion === 'empleados' && (
        <div className="space-y-4">
          <div className="bg-[#FAF7F2] rounded-2xl border-2 border-[#D5CCBE] p-4 sm:p-5 shadow-xs">
            <h3 className="text-sm font-black uppercase tracking-wider text-stone-700 mb-1">
              Día de Inicio de Semana por Empleado
            </h3>
            <p className="text-xs text-stone-600 mb-4">
              Cada empleado tiene su propio corte semanal (ej. Juan: lunes a domingo, María: miércoles a martes, Carlos: viernes a jueves).
            </p>

            <div className="space-y-3">
              {listaEmpleados.map((emp) => (
                <div
                  key={emp.id}
                  className="p-3 bg-white rounded-xl border border-[#D5CCBE] flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 rounded-full shrink-0"
                      style={{ backgroundColor: emp.color || '#D97706' }}
                    />
                    <input
                      type="text"
                      value={emp.nombre}
                      onChange={(e) => handleCambiarNombreEmp(emp.id, e.target.value)}
                      className="font-bold text-sm text-[#1E1915] border-b border-transparent focus:border-[#2D6A4F] outline-hidden px-1"
                    />
                  </div>

                  <div className="flex items-center gap-2 justify-between sm:justify-end">
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-stone-500 font-medium">Inicia su semana en:</span>
                      <select
                        value={emp.diaInicioSemana}
                        onChange={(e) => handleCambiarDiaInicio(emp.id, e.target.value as DiaSemana)}
                        className="bg-[#F2EDE2] font-bold text-stone-800 text-xs px-2 py-1 rounded-lg border border-[#D5CCBE] outline-hidden cursor-pointer"
                      >
                        {LISTA_DIAS_SEMANA.map((d) => (
                          <option key={d.key} value={d.key}>
                            {d.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={() => handleEliminarEmpleado(emp.id)}
                      className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                      title="Eliminar empleado"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Employee Form */}
            <form onSubmit={handleAgregarEmpleado} className="mt-4 pt-4 border-t border-[#E8E1D5] flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Nombre del nuevo empleado..."
                required
                value={nuevoNombreEmp}
                onChange={(e) => setNuevoNombreEmp(e.target.value)}
                className="flex-1 px-3 py-2 bg-white rounded-xl border border-[#D5CCBE] text-xs font-semibold"
              />

              <div className="flex items-center gap-2">
                <select
                  value={nuevoDiaSemanaEmp}
                  onChange={(e) => setNuevoDiaSemanaEmp(e.target.value as DiaSemana)}
                  className="px-3 py-2 bg-white rounded-xl border border-[#D5CCBE] text-xs font-bold"
                >
                  {LISTA_DIAS_SEMANA.map((d) => (
                    <option key={d.key} value={d.key}>
                      Inicia en {d.label}
                    </option>
                  ))}
                </select>

                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2D6A4F] hover:bg-[#23563F] text-white rounded-xl font-bold text-xs flex items-center gap-1 transition shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar Empleado</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SECTION: CONCEPTS & PRICES */}
      {seccion === 'conceptos' && (
        <div className="space-y-4">
          <div className="bg-[#FAF7F2] rounded-2xl border-2 border-[#D5CCBE] p-4 sm:p-5 shadow-xs">
            <h3 className="text-sm font-black uppercase tracking-wider text-stone-700 mb-1">
              Botones Rápidos de Registro
            </h3>
            <p className="text-xs text-stone-600 mb-4">
              Configura los productos y precios predefinidos que aparecen al tocar el botón "+" para registrar consumos en 1 segundo.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {listaConceptos.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-white rounded-xl border border-[#D5CCBE] flex items-center justify-between gap-2 shadow-2xs"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-xl shrink-0">{item.icono || '🏷️'}</span>
                    <input
                      type="text"
                      value={item.concepto}
                      onChange={(e) => handleActualizarConcepto(item.id, 'concepto', e.target.value)}
                      className="font-bold text-xs text-[#1E1915] border-b border-transparent focus:border-[#2D6A4F] outline-hidden flex-1"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative w-20">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">
                        $
                      </span>
                      <input
                        type="number"
                        step="any"
                        value={item.importe}
                        onChange={(e) => handleActualizarConcepto(item.id, 'importe', e.target.value)}
                        className="w-full pl-5 pr-2 py-1 bg-[#F2EDE2] rounded-lg text-xs font-black text-right outline-hidden"
                      />
                    </div>

                    <button
                      onClick={() => handleEliminarConcepto(item.id)}
                      className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                      title="Eliminar concepto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Concept Form */}
            <form onSubmit={handleAgregarConcepto} className="mt-4 pt-4 border-t border-[#E8E1D5] flex flex-wrap gap-2">
              <select
                value={nuevoIcono}
                onChange={(e) => setNuevoIcono(e.target.value)}
                className="px-2 py-2 bg-white rounded-xl border border-[#D5CCBE] text-base"
              >
                <option value="🍺">🍺 Cerveza</option>
                <option value="🍽️">🍽️ Comida</option>
                <option value="🥤">🥤 Refresco</option>
                <option value="☕">☕ Café</option>
                <option value="🥪">🥪 Botana</option>
                <option value="💧">💧 Agua</option>
                <option value="🌮">🌮 Tacos</option>
                <option value="🍕">🍕 Pizza</option>
                <option value="🧁">🧁 Postre</option>
                <option value="🏷️">🏷️ Otro</option>
              </select>

              <input
                type="text"
                placeholder="Nombre del concepto (ej. Almuerzo)"
                required
                value={nuevoConcepto}
                onChange={(e) => setNuevoConcepto(e.target.value)}
                className="flex-1 min-w-[150px] px-3 py-2 bg-white rounded-xl border border-[#D5CCBE] text-xs font-semibold"
              />

              <div className="relative w-24">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">
                  $
                </span>
                <input
                  type="number"
                  step="any"
                  placeholder="Precio"
                  required
                  value={nuevoImporte}
                  onChange={(e) => setNuevoImporte(e.target.value)}
                  className="w-full pl-6 pr-2 py-2 bg-white rounded-xl border border-[#D5CCBE] text-xs font-bold"
                />
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-[#2D6A4F] hover:bg-[#23563F] text-white rounded-xl font-bold text-xs flex items-center gap-1 transition shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Botón</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SECTION: BACKUP & RESTORE */}
      {seccion === 'datos' && (
        <div className="space-y-4">
          <div className="bg-[#FAF7F2] rounded-2xl border-2 border-[#D5CCBE] p-4 sm:p-5 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-stone-700 mb-1">
                Respaldo y Restauración de la Libreta
              </h3>
              <p className="text-xs text-stone-600">
                Toda la información se guarda de forma permanente y segura en tu dispositivo. Puedes exportar o importar una copia de seguridad en cualquier momento.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleDescargarBackup}
                className="p-4 bg-white rounded-2xl border border-[#D5CCBE] hover:border-[#2D6A4F] flex items-center gap-3 active:scale-98 transition text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-[#EAE3D5] text-[#4A3E34] flex items-center justify-center shrink-0">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-extrabold text-sm text-[#1E1915] block">
                    Descargar Copia de Seguridad
                  </span>
                  <span className="text-[11px] text-stone-500">
                    Exporta todos los empleados, hojas y consumos en archivo .JSON
                  </span>
                </div>
              </button>

              <label className="p-4 bg-white rounded-2xl border border-[#D5CCBE] hover:border-[#2D6A4F] flex items-center gap-3 active:scale-98 transition text-left cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-[#EAE3D5] text-[#4A3E34] flex items-center justify-center shrink-0">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-extrabold text-sm text-[#1E1915] block">
                    Restaurar desde Archivo
                  </span>
                  <span className="text-[11px] text-stone-500">
                    Importa una copia previa guardada
                  </span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleCargarArchivoBackup}
                    className="hidden"
                  />
                </div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* SECTION: DOCKER & COOLIFY DEPLOYMENT */}
      {seccion === 'despliegue' && (
        <div className="space-y-4">
          <div className="bg-[#FAF7F2] rounded-2xl border-2 border-[#D5CCBE] p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-[#2D6A4F]" />
              <h3 className="text-sm font-black uppercase tracking-wider text-stone-700">
                Preparado para Docker y Despliegue en Coolify
              </h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Esta aplicación cuenta con los archivos listos en el repositorio para desplegarse mediante Docker Compose en cualquier servidor con <strong>Coolify</strong> o cualquier VPS:
            </p>

            <div className="bg-white rounded-xl p-3.5 border border-[#D5CCBE] space-y-2 text-xs font-mono text-stone-800">
              <div className="flex items-center justify-between font-bold text-stone-500 border-b pb-1">
                <span>Archivos incluidos en el proyecto:</span>
              </div>
              <div className="space-y-1">
                <p>📄 <strong className="text-[#2D6A4F]">Dockerfile</strong>: Construcción optimizada multi-etapa.</p>
                <p>🐳 <strong className="text-[#2D6A4F]">docker-compose.yml</strong>: Contenedor de la app + PostgreSQL con volúmenes persistentes.</p>
                <p>🗄️ <strong className="text-[#2D6A4F]">database/schema.sql</strong>: Esquema relacional PostgreSQL (empleados, hojas_diarias, movimientos, conceptos_rapidos).</p>
                <p>📘 <strong className="text-[#2D6A4F]">DEPLOY_COOLIFY.md</strong>: Guía paso a paso para desplegar en 1 click en Coolify.</p>
              </div>
            </div>

            <div className="p-3 bg-stone-100 rounded-xl text-xs text-stone-700">
              <strong>Estructura Relacional Garantizada:</strong> Empleado → Hoja Diaria → Movimientos con cálculo automático de semana por corte individual.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
