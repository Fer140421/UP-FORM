const TRIM_ONLY_KEYS = new Set([
  'id',
  'institucionId',
  'postulanteId',
  'requisitoId',
  'puestoId',
  'carnet',
  'correo',
  'email',
  'foto',
  'archivo',
  'documentoIdentidad',
  'certificadoLenguaOriginaria',
  'fecha',
  'fechaInicio',
  'fechaFin',
  'fechaNacimiento',
  'fechaAsignacion',
  'estado',
  'genero',
  'idioma',
  'poseeLibreta',
  'disponibilidadTraslado',
  'tiempoTrabajado'
]);

const UPPERCASE_KEYS = new Set([
  'sigla',
  'expedido'
]);

const LOWERCASE_KEYS = new Set([
  'correo',
  'email'
]);

export function normalizeDataForSave<T>(value: T): T {
  return normalizeValue(value) as T;
}

export function normalizeFieldValue(value: string, key?: string): string {
  return normalizeString(value, key);
}

function normalizeValue(value: unknown, key?: string): unknown {
  if (typeof value === 'string') {
    return normalizeString(value, key);
  }

  if (Array.isArray(value)) {
    return value.map(item => normalizeValue(item, key));
  }

  if (value && typeof value === 'object') {
    if (isDateLike(value)) {
      return value;
    }

    return Object.entries(value as Record<string, unknown>).reduce<Record<string, unknown>>(
      (normalized, [entryKey, entryValue]) => {
        normalized[entryKey] = normalizeValue(entryValue, entryKey);
        return normalized;
      },
      {}
    );
  }

  return value;
}

function normalizeString(value: string, key?: string): string {
  const trimmed = value.trim();

  if (!trimmed) {
    return trimmed;
  }

  if (key && UPPERCASE_KEYS.has(key)) {
    return trimmed.toUpperCase();
  }

  if (key && LOWERCASE_KEYS.has(key)) {
    return trimmed.toLowerCase();
  }

  if (shouldTrimOnly(trimmed, key)) {
    return trimmed;
  }

  return capitalizeFirstLetter(trimmed);
}

function shouldTrimOnly(value: string, key?: string): boolean {
  return (
    !!key && TRIM_ONLY_KEYS.has(key) ||
    isUrl(value) ||
    isEmail(value) ||
    isIsoDate(value) ||
    isFileName(value)
  );
}

function capitalizeFirstLetter(value: string): string {
  const index = value.search(/\p{L}/u);

  if (index === -1) {
    return value;
  }

  return `${value.slice(0, index)}${value.charAt(index).toLocaleUpperCase()}${value.slice(index + 1)}`;
}

function isUrl(value: string): boolean {
  return /^(https?:\/\/|data:|blob:)/i.test(value);
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}(?:T[\d:.+-]+Z?)?$/.test(value);
}

function isFileName(value: string): boolean {
  return /^[^\\/]+\.[a-z0-9]{2,5}$/i.test(value);
}

function isDateLike(value: object): boolean {
  return value instanceof Date;
}
