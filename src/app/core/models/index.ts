export interface User {
  id: string;
  username: string;
  rol: 'Administrador';
  name: string;
}

export interface Postulante {
  id: string;
  carnet: string;
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
}

export interface Certificado {
  nombre: string;
  descripcion: string;
  fecha: string;
  archivo: string;
}

export interface FormacionAcademica {
  grado: 'Bachiller' | 'Técnico Básico' | 'Técnico Medio' | 'Técnico Superior' | 'Licenciatura' | 'Diplomado' | 'Otro';
  institucion: string;
  tituloObtenido: string;
  fecha: string;
  archivo: string;
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
  nombre: string;
}

export interface RequisitoPuesto {
  id: string;
  institucionId: string;
  denominacionCargo: string;
  unidadPuesto: string;
  formacion: string;
  experienciaLaboral: string;
  experienciaEspecifica: string;
  idiomaNativo: string;
  estado: 'Activo' | 'Inactivo';
}

export interface Asignacion {
  id: string;
  postulanteId: string;
  requisitoId: string;
  fechaAsignacion: string;
}
