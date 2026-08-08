import { BASE_PATH } from './base-path';

export function asset(path: string) {
  return `${BASE_PATH}${path}`;
}
