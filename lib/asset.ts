import { BASE_PATH } from './base-path';

export function asset(path: string) {
  // Las data-URLs de base64 no llevan prefijo de ruta
  if (path.startsWith('data:')) return path;
  return `${BASE_PATH}${path}`;
}
