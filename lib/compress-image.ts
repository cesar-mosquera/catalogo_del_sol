/**
 * Comprime una imagen a base64 usando canvas.
 * Redimensiona al máximo indicado manteniendo proporción.
 * @param file     Archivo de imagen original
 * @param maxPx    Ancho/alto máximo en píxeles (default 900)
 * @param quality  Calidad JPEG 0-1 (default 0.78)
 * @returns        string base64 con data-URL
 */
export function compressImage(
  file: File,
  maxPx = 900,
  quality = 0.78,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const { width, height } = img;
        const scale = Math.min(1, maxPx / Math.max(width, height));
        const w = Math.round(width  * scale);
        const h = Math.round(height * scale);

        const canvas = document.createElement('canvas');
        canvas.width  = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, w, h);

        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = ev.target!.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Devuelve el tamaño aproximado de un base64 en KB */
export function base64SizeKB(b64: string) {
  return Math.round((b64.length * 3) / 4 / 1024);
}

/** Devuelve uso total de localStorage en KB */
export function localStorageUsageKB(): number {
  let total = 0;
  for (const key of Object.keys(localStorage)) {
    total += localStorage.getItem(key)?.length ?? 0;
  }
  return Math.round((total * 2) / 1024); // UTF-16 → bytes → KB
}
