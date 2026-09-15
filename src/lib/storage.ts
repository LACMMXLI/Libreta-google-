import { ConceptoRapido, Empleado, HojaDiaria, Movimiento } from '../types';
import { formatearFechaEsp, getFechaHoyISO, getHoraActual, esFechaPasada } from './dateUtils';

const STORAGE_KEYS = {
  EMPLEADOS: 'libreta_empleados_v1',
  HOJAS: 'libreta_hojas_v1',
  MOVIMIENTOS: 'libreta_movimientos_v1',
  CONCEPTOS: 'libreta_conceptos_v1',
};

export const DEFAULT_EMPLEADOS: Empleado[] = [
  {
    id: 'emp-juan',
    nombre: 'Juan',
    diaInicioSemana: 'lunes',
    color: '#D97706', // amber
    activo: true,
    creadoEn: new Date().toISOString(),
  },
  {
    id: 'emp-maria',
    nombre: 'María',
    diaInicioSemana: 'miercoles',
    color: '#E11D48', // rose
    activo: true,
    creadoEn: new Date().toISOString(),
  },
  {
    id: 'emp-carlos',
    nombre: 'Carlos',
    diaInicioSemana: 'viernes',
    color: '#059669', // emerald
    activo: true,
    creadoEn: new Date().toISOString(),
  },
  {
    id: 'emp-roberto',
    nombre: 'Roberto',
    diaInicioSemana: 'lunes',
    color: '#0284C7', // sky
    activo: true,
    creadoEn: new Date().toISOString(),
  },
  {
    id: 'emp-ana',
    nombre: 'Ana',
    diaInicioSemana: 'lunes',
    color: '#7C3AED', // violet
    activo: true,
    creadoEn: new Date().toISOString(),
  },
  {
    id: 'emp-pedro',
    nombre: 'Pedro',
    diaInicioSemana: 'sabado',
    color: '#EA580C', // orange
    activo: true,
    creadoEn: new Date().toISOString(),
  },
  {
    id: 'emp-sofia',
    nombre: 'Sofía',
    diaInicioSemana: 'martes',
    color: '#0D9488', // teal
    activo: true,
    creadoEn: new Date().toISOString(),
  },
  {
    id: 'emp-luis',
    nombre: 'Luis',
    diaInicioSemana: 'jueves',
    color: '#4F46E5', // indigo
    activo: true,
    creadoEn: new Date().toISOString(),
  },
];

export const DEFAULT_CONCEPTOS: ConceptoRapido[] = [
  { id: 'c-cerveza', concepto: 'Cerveza', importe: 100, icono: '🍺' },
  { id: 'c-comida', concepto: 'Comida', importe: 80, icono: '🍽️' },
  { id: 'c-refresco', concepto: 'Refresco', importe: 40, icono: '🥤' },
  { id: 'c-cafe', concepto: 'Café', importe: 30, icono: '☕' },
  { id: 'c-botana', concepto: 'Botana', importe: 50, icono: '🥪' },
  { id: 'c-agua', concepto: 'Agua', importe: 25, icono: '💧' },
  { id: 'c-lonche', concepto: 'Lonche / Tacos', importe: 75, icono: '🌮' },
];

/**
 * Initializes and retrieves the list of employees
 */
export function getEmpleados(): Empleado[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EMPLEADOS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.EMPLEADOS, JSON.stringify(DEFAULT_EMPLEADOS));
      return DEFAULT_EMPLEADOS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading empleados from storage:', e);
    return DEFAULT_EMPLEADOS;
  }
}

export function guardarEmpleados(empleados: Empleado[]): void {
  localStorage.setItem(STORAGE_KEYS.EMPLEADOS, JSON.stringify(empleados));
}

/**
 * Initializes and retrieves quick concepts
 */
export function getConceptosRapidos(): ConceptoRapido[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONCEPTOS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CONCEPTOS, JSON.stringify(DEFAULT_CONCEPTOS));
      return DEFAULT_CONCEPTOS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading conceptos:', e);
    return DEFAULT_CONCEPTOS;
  }
}

export function guardarConceptosRapidos(conceptos: ConceptoRapido[]): void {
  localStorage.setItem(STORAGE_KEYS.CONCEPTOS, JSON.stringify(conceptos));
}

/**
 * Initializes and retrieves all daily sheets
 */
export function getHojas(): HojaDiaria[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HOJAS);
    if (!raw) {
      const hoyISO = getFechaHoyISO();
      const hojaHoy: HojaDiaria = {
        fecha: hoyISO,
        fechaFormateada: formatearFechaEsp(hoyISO),
        creadoEn: new Date().toISOString(),
      };
      const inicial = [hojaHoy];
      localStorage.setItem(STORAGE_KEYS.HOJAS, JSON.stringify(inicial));
      return inicial;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading hojas:', e);
    return [];
  }
}

export function guardarHojas(hojas: HojaDiaria[]): void {
  localStorage.setItem(STORAGE_KEYS.HOJAS, JSON.stringify(hojas));
}

/**
 * Ensures a sheet exists for a given date.
 * "Al comenzar un nuevo día, el sistema debe crear automáticamente una hoja nueva y vacía.
 * La hoja del día anterior NO se elimina ni se modifica. Queda guardada para futuras consultas."
 */
export function asegurarHojaExiste(fechaISO: string): HojaDiaria {
  const hojas = getHojas();
  let hoja = hojas.find(h => h.fecha === fechaISO);
  if (!hoja) {
    hoja = {
      fecha: fechaISO,
      fechaFormateada: formatearFechaEsp(fechaISO),
      creadoEn: new Date().toISOString(),
    };
    hojas.push(hoja);
    // Sort descending so recent sheets come first
    hojas.sort((a, b) => b.fecha.localeCompare(a.fecha));
    guardarHojas(hojas);
  }
  return hoja;
}

/**
 * Retrieves all movements
 */
export function getMovimientos(): Movimiento[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MOVIMIENTOS);
    if (!raw) {
      // Seed matching the user prompt's exact example:
      // Juan: $100 Cerveza, $80 Comida (Total $180)
      // María: $40 Refresco (Total $40)
      // Carlos: Sin movimientos (Total $0)
      const hoyISO = getFechaHoyISO();
      const hora = getHoraActual();

      const seedMovimientos: Movimiento[] = [
        {
          id: 'mov-seed-1',
          empleadoId: 'emp-juan',
          empleadoNombre: 'Juan',
          fecha: hoyISO,
          hora: '13:15',
          concepto: 'Cerveza',
          importe: 100,
          hojaFecha: hoyISO,
          registradoEn: new Date().toISOString(),
        },
        {
          id: 'mov-seed-2',
          empleadoId: 'emp-juan',
          empleadoNombre: 'Juan',
          fecha: hoyISO,
          hora: '14:20',
          concepto: 'Comida',
          importe: 80,
          hojaFecha: hoyISO,
          registradoEn: new Date().toISOString(),
        },
        {
          id: 'mov-seed-3',
          empleadoId: 'emp-maria',
          empleadoNombre: 'María',
          fecha: hoyISO,
          hora: '12:45',
          concepto: 'Refresco',
          importe: 40,
          hojaFecha: hoyISO,
          registradoEn: new Date().toISOString(),
        },
      ];

      localStorage.setItem(STORAGE_KEYS.MOVIMIENTOS, JSON.stringify(seedMovimientos));
      return seedMovimientos;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading movimientos:', e);
    return [];
  }
}

export function guardarMovimientos(movimientos: Movimiento[]): void {
  localStorage.setItem(STORAGE_KEYS.MOVIMIENTOS, JSON.stringify(movimientos));
}

/**
 * Adds a new consumption movement
 */
export function registrarMovimiento(params: {
  empleadoId: string;
  empleadoNombre: string;
  concepto: string;
  importe: number;
  hojaFecha: string; // Target sheet date
  hora?: string;
}): Movimiento {
  const hoyISO = getFechaHoyISO();
  const horaActual = params.hora || getHoraActual();
  const esPasada = params.hojaFecha < hoyISO;

  const nuevoMovimiento: Movimiento = {
    id: 'mov-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    empleadoId: params.empleadoId,
    empleadoNombre: params.empleadoNombre,
    fecha: params.hojaFecha,
    hora: horaActual,
    concepto: params.concepto.trim(),
    importe: Number(params.importe),
    hojaFecha: params.hojaFecha,
    registradoEn: new Date().toISOString(),
    esModificacionPosterior: esPasada,
    notaAuditoria: esPasada
      ? `Registrado posteriormente el ${formatearFechaEsp(hoyISO)} a las ${horaActual}`
      : undefined,
  };

  const todos = getMovimientos();
  todos.push(nuevoMovimiento);
  guardarMovimientos(todos);

  // If modifying a past sheet, mark the sheet itself with an audit flag
  if (esPasada) {
    const hojas = getHojas();
    const hoja = hojas.find(h => h.fecha === params.hojaFecha);
    if (hoja) {
      hoja.fueModificadaPosteriormente = true;
      hoja.ultimaModificacion = new Date().toISOString();
      hoja.notaAuditoria = `Modificada posteriormente el ${formatearFechaEsp(hoyISO)} a las ${horaActual}`;
      guardarHojas(hojas);
    }
  } else {
    asegurarHojaExiste(params.hojaFecha);
  }

  return nuevoMovimiento;
}

/**
 * Updates an existing movement with audit tracking
 */
export function editarMovimiento(
  movimientoId: string,
  actualizaciones: {
    concepto: string;
    importe: number;
    hora?: string;
  }
): Movimiento | null {
  const todos = getMovimientos();
  const index = todos.findIndex(m => m.id === movimientoId);
  if (index === -1) return null;

  const hoyISO = getFechaHoyISO();
  const horaActual = getHoraActual();
  const movAnterior = todos[index];
  const esPasada = movAnterior.hojaFecha < hoyISO;

  const movActualizado: Movimiento = {
    ...movAnterior,
    concepto: actualizaciones.concepto.trim(),
    importe: Number(actualizaciones.importe),
    hora: actualizaciones.hora || movAnterior.hora,
    modificadoEn: new Date().toISOString(),
    esModificacionPosterior: esPasada || movAnterior.esModificacionPosterior,
    notaAuditoria: esPasada
      ? `Modificado posteriormente el ${formatearFechaEsp(hoyISO)} a las ${horaActual} (Anterior: ${movAnterior.concepto} $${movAnterior.importe})`
      : movAnterior.notaAuditoria,
  };

  todos[index] = movActualizado;
  guardarMovimientos(todos);

  if (esPasada) {
    const hojas = getHojas();
    const hoja = hojas.find(h => h.fecha === movAnterior.hojaFecha);
    if (hoja) {
      hoja.fueModificadaPosteriormente = true;
      hoja.ultimaModificacion = new Date().toISOString();
      hoja.notaAuditoria = `Hoja con corrección posterior realizada el ${formatearFechaEsp(hoyISO)} a las ${horaActual}`;
      guardarHojas(hojas);
    }
  }

  return movActualizado;
}

/**
 * Deletes/cancels a movement with audit tracking if in a past sheet
 */
export function cancelarMovimiento(movimientoId: string): boolean {
  const todos = getMovimientos();
  const index = todos.findIndex(m => m.id === movimientoId);
  if (index === -1) return false;

  const movAEliminar = todos[index];
  const hoyISO = getFechaHoyISO();
  const horaActual = getHoraActual();
  const esPasada = movAEliminar.hojaFecha < hoyISO;

  todos.splice(index, 1);
  guardarMovimientos(todos);

  if (esPasada) {
    const hojas = getHojas();
    const hoja = hojas.find(h => h.fecha === movAEliminar.hojaFecha);
    if (hoja) {
      hoja.fueModificadaPosteriormente = true;
      hoja.ultimaModificacion = new Date().toISOString();
      hoja.notaAuditoria = `Se canceló consumo ($${movAEliminar.importe} ${movAEliminar.concepto} de ${movAEliminar.empleadoNombre}) posteriormente el ${formatearFechaEsp(hoyISO)} a las ${horaActual}`;
      guardarHojas(hojas);
    }
  }

  return true;
}

/**
 * Backup / Export all data to JSON
 */
export function exportarDatosJSON(): string {
  const data = {
    version: '1.0',
    exportadoEn: new Date().toISOString(),
    empleados: getEmpleados(),
    hojas: getHojas(),
    movimientos: getMovimientos(),
    conceptos: getConceptosRapidos(),
  };
  return JSON.stringify(data, null, 2);
}

/**
 * Restore data from JSON backup
 */
export function importarDatosJSON(jsonStr: string): boolean {
  try {
    const parsed = JSON.parse(jsonStr);
    if (parsed.empleados && Array.isArray(parsed.empleados)) {
      guardarEmpleados(parsed.empleados);
    }
    if (parsed.hojas && Array.isArray(parsed.hojas)) {
      guardarHojas(parsed.hojas);
    }
    if (parsed.movimientos && Array.isArray(parsed.movimientos)) {
      guardarMovimientos(parsed.movimientos);
    }
    if (parsed.conceptos && Array.isArray(parsed.conceptos)) {
      guardarConceptosRapidos(parsed.conceptos);
    }
    return true;
  } catch (e) {
    console.error('Error importing backup JSON:', e);
    return false;
  }
}
