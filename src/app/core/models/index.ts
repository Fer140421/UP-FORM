export interface User {
  id: string;
  email: string;
  rol: 'ADMINISTRADOR';
  nombre: string;
}

export interface Postulante {
  id: string;
  activo?: boolean;
  carnet: string;
  expedido: string; // Nuevo campo
  foto: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  fechaNacimiento: string;
  genero: 'Masculino' | 'Femenino' | 'Otro';
  celular: string;
  correo?: string;
  departamento: string;
  localidad: string;
  direccion: string;
  documentoIdentidad: string;
  certificadoLenguaOriginaria: string;
  poseeLibreta?: string;
  archivo?: string; // Corresponds to military service file
  certificados: Certificado[];
  formacionesAcademicas: FormacionAcademica[];
  experienciasLaborales: ExperienciaLaboral[];
  funcionesPostular: string[];
  puestoId: string; // Linked RequisitoPuesto
  idiomasOriginarios?: IdiomaOriginario[]; // Nuevo campo
  participacionElectoral?: string[]; // Nuevo campo
  disponibilidadTraslado?: 'Si' | 'No';
}

export interface IdiomaOriginario {
  idioma: 'Quechua' | 'Aymara' | 'Guaraní' | 'Mojeño' | 'Chiquitano' | 'Otro';
  otroIdioma?: string;
  institucion: string;
  fecha: string;
}

export interface Certificado {
  nombre: string;
  descripcion: string;
  fecha: string;
  archivo: string;
  areaCapacitacion?: string; // Nuevo campo
  nombreCurso?: string;
  institucion?: string; // Nuevo campo
}

export interface FormacionAcademica {
  grado: 'Bachiller' | 'Técnico Básico' | 'Técnico Medio' | 'Técnico Superior' | 'Técnico' | 'Licenciatura' | 'Especialidad' | 'Maestría' | 'Doctorado' | 'Diplomado' | 'Otro';
  institucion: string;
  tituloObtenido: string;
  fecha: string;
  archivo: string;
  profesion?: string; // Nuevo campo
}

export interface ExperienciaLaboral {
  institucion: string;
  area: string;
  cargo: string;
  fechaInicio: string;
  fechaFin: string;
  tiempoTrabajado: string;
  archivo: string;
}

export interface Institucion {
  id: string;
  activo?: boolean;
  nombre: string;
  sigla?: string;
}

export interface RequisitoPuesto {
  id: string;
  activo?: boolean;
  institucionId: string;
  denominacionCargo: string;
  unidadPuesto: string;
  formacion: string;
  experienciaLaboral: string;
  experienciaEspecifica: string;
  idiomaNativo: boolean;
  estado: 'Activo' | 'Inactivo';
}

export interface Asignacion {
  id: string;
  activo?: boolean;
  postulanteId: string;
  requisitoId: string;
  fechaAsignacion: string;
}

export interface Profesional {
  id: string;
  activo?: boolean;
  name: string;
}
