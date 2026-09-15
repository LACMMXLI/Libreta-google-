export type DiaSemana =
  | 'lunes'
  | 'martes'
  | 'miercoles'
  | 'jueves'
  | 'viernes'
  | 'sabado'
  | 'domingo';

export interface Empleado {
  id: string;
  nombre: string;
  diaInicioSemana: DiaSemana;
  color?: string;
  activo: boolean;
  creadoEn: string;
}

export interface Movimiento {
  id: string;
  empleadoId: string;
  empleadoNombre: string;
  fecha: string; // YYYY-MM-DD
  hora: string; // HH:mm
  concepto: string;
  importe: number;
  hojaFecha: string; // YYYY-MM-DD
  registradoEn: string; // ISO string
  modificadoEn?: string; // ISO string
  esModificacionPosterior?: boolean;
  notaAuditoria?: string;
}

export interface HojaDiaria {
  fecha: string; // YYYY-MM-DD
  fechaFormateada: string;
  cerrada?: boolean;
  creadoEn: string;
  ultimaModificacion?: string;
  fueModificadaPosteriormente?: boolean;
  notaAuditoria?: string;
}

export interface ConceptoRapido {
  id: string;
  concepto: string;
  importe: number;
  icono?: string;
}

export interface DetalleDiaSemanal {
  fecha: string; // YYYY-MM-DD
  nombreDia: string; // Lunes, Martes, etc.
  totalDia: number;
  movimientos: Movimiento[];
  esHoy: boolean;
  esFuturo: boolean;
}

export interface ResumenSemanaEmpleado {
  empleado: Empleado;
  fechaInicio: string; // YYYY-MM-DD
  fechaFin: string; // YYYY-MM-DD
  tituloRango: string; // "Lunes 15 de septiembre → Domingo 21 de septiembre"
  dias: DetalleDiaSemanal[];
  totalSemana: number;
}
