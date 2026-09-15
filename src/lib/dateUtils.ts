import { DiaSemana, DetalleDiaSemanal, Empleado, Movimiento, ResumenSemanaEmpleado } from '../types';

export const DIAS_SEMANA_MAP: Record<DiaSemana, { nombre: string; jsIndex: number }> = {
  domingo: { nombre: 'Domingo', jsIndex: 0 },
  lunes: { nombre: 'Lunes', jsIndex: 1 },
  martes: { nombre: 'Martes', jsIndex: 2 },
  miercoles: { nombre: 'Miércoles', jsIndex: 3 },
  jueves: { nombre: 'Jueves', jsIndex: 4 },
  viernes: { nombre: 'Viernes', jsIndex: 5 },
  sabado: { nombre: 'Sábado', jsIndex: 6 },
};

export const LISTA_DIAS_SEMANA: { key: DiaSemana; label: string }[] = [
  { key: 'lunes', label: 'Lunes' },
  { key: 'martes', label: 'Martes' },
  { key: 'miercoles', label: 'Miércoles' },
  { key: 'jueves', label: 'Jueves' },
  { key: 'viernes', label: 'Viernes' },
  { key: 'sabado', label: 'Sábado' },
  { key: 'domingo', label: 'Domingo' },
];

export const MESES_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

/**
 * Returns today's date formatted as YYYY-MM-DD
 */
export function getFechaHoyISO(): string {
  const hoy = new Date();
  const year = hoy.getFullYear();
  const month = String(hoy.getMonth() + 1).padStart(2, '0');
  const day = String(hoy.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns current time formatted as HH:mm
 */
export function getHoraActual(): string {
  const ahora = new Date();
  const hours = String(ahora.getHours()).padStart(2, '0');
  const minutes = String(ahora.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Parses YYYY-MM-DD into a local Date object safely without timezone shift
 */
export function parseFechaISO(fechaISO: string): Date {
  const parts = fechaISO.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  return new Date(year, month, day, 12, 0, 0);
}

/**
 * Formats a Date or YYYY-MM-DD into Spanish display:
 * e.g. "Lunes 15 de septiembre"
 */
export function formatearFechaEsp(fechaISO: string, incluirDiaSemana = true): string {
  try {
    const d = parseFechaISO(fechaISO);
    const diaIndex = d.getDay();
    const diaMes = d.getDate();
    const mes = MESES_ES[d.getMonth()];
    
    const nombresDias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const nombreDia = nombresDias[diaIndex];

    if (incluirDiaSemana) {
      return `${nombreDia} ${diaMes} de ${mes}`;
    }
    return `${diaMes} de ${mes}`;
  } catch {
    return fechaISO;
  }
}

/**
 * Formats date into uppercase header: e.g. "15 DE SEPTIEMBRE"
 */
export function formatearFechaHeader(fechaISO: string): string {
  try {
    const d = parseFechaISO(fechaISO);
    const diaMes = d.getDate();
    const mes = MESES_ES[d.getMonth()].toUpperCase();
    return `${diaMes} DE ${mes}`;
  } catch {
    return fechaISO.toUpperCase();
  }
}

/**
 * Returns the name of the day of the week for a given YYYY-MM-DD
 */
export function getNombreDiaSemana(fechaISO: string): string {
  const d = parseFechaISO(fechaISO);
  const nombresDias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return nombresDias[d.getDay()];
}

/**
 * Adds or subtracts days from a YYYY-MM-DD string and returns a new YYYY-MM-DD
 */
export function sumarDias(fechaISO: string, dias: number): string {
  const d = parseFechaISO(fechaISO);
  d.setDate(d.getDate() + dias);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Checks if a given date is strictly in the past compared to today
 */
export function esFechaPasada(fechaISO: string): boolean {
  const hoyISO = getFechaHoyISO();
  return fechaISO < hoyISO;
}

/**
 * Checks if a given date is today
 */
export function esFechaHoy(fechaISO: string): boolean {
  return fechaISO === getFechaHoyISO();
}

/**
 * Calculates the 7-day period for an employee based on their custom week start day.
 * Given a reference date (e.g. today or any selected date), it identifies the start date
 * of that employee's current cycle, and generates the 7 consecutive days.
 */
export function calcularSemanaEmpleado(
  empleado: Empleado,
  movimientosEmpleado: Movimiento[],
  fechaReferenciaISO: string = getFechaHoyISO()
): ResumenSemanaEmpleado {
  const targetDayJsIndex = DIAS_SEMANA_MAP[empleado.diaInicioSemana]?.jsIndex ?? 1;
  const refDate = parseFechaISO(fechaReferenciaISO);
  const currentJsDay = refDate.getDay();

  // Calculate difference in days to the most recent start day (on or before refDate)
  let diff = currentJsDay - targetDayJsIndex;
  if (diff < 0) {
    diff += 7;
  }

  const fechaInicioISO = sumarDias(fechaReferenciaISO, -diff);
  const fechaFinISO = sumarDias(fechaInicioISO, 6);

  const hoyISO = getFechaHoyISO();
  const dias: DetalleDiaSemanal[] = [];
  let totalSemana = 0;

  for (let i = 0; i < 7; i++) {
    const diaFechaISO = sumarDias(fechaInicioISO, i);
    const movsDelDia = movimientosEmpleado.filter(m => m.fecha === diaFechaISO);
    const totalDia = movsDelDia.reduce((sum, m) => sum + m.importe, 0);
    totalSemana += totalDia;

    dias.push({
      fecha: diaFechaISO,
      nombreDia: getNombreDiaSemana(diaFechaISO),
      totalDia,
      movimientos: movsDelDia,
      esHoy: diaFechaISO === hoyISO,
      esFuturo: diaFechaISO > hoyISO,
    });
  }

  const nombreDiaInicio = getNombreDiaSemana(fechaInicioISO).toLowerCase();
  const dInicio = parseFechaISO(fechaInicioISO).getDate();
  const nombreDiaFin = getNombreDiaSemana(fechaFinISO).toLowerCase();
  const dFin = parseFechaISO(fechaFinISO).getDate();

  const tituloRango = `${nombreDiaInicio} ${dInicio} → ${nombreDiaFin} ${dFin}`;

  return {
    empleado,
    fechaInicio: fechaInicioISO,
    fechaFin: fechaFinISO,
    tituloRango,
    dias,
    totalSemana,
  };
}

/**
 * Formats a currency amount into standard localized format: e.g. $180
 */
export function formatearMoneda(monto: number): string {
  return `$${monto.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}
