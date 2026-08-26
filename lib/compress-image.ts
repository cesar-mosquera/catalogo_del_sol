/**
 * Comprime una imagen a base64 usando canvas.
 * Redimensiona al máximo indicado manteniendo proporción.
 * Para imágenes PNG (con transparencia), usa WebP para conservarla.
 * @param file     Archivo de imagen original
 * @param maxPx    Ancho/alto máximo en píxeles (default 900)
 * @param quality  Calidad 0-1 (default 0.78)
 * @returns        string base64 con data-URL
 */
export function compressImage(
  file: File,
  maxPx = 900,
  quality = 0.78,
  aspectRatio?: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const { width, height } = img;
        
        let sx = 0, sy = 0, sWidth = width, sHeight = height;

        if (aspectRatio) {
          const imgRatio = width / height;
          if (imgRatio > aspectRatio) {
            // Imagen más ancha de lo necesario, recortar lados
            sWidth = height * aspectRatio;
            sx = (width - sWidth) / 2;
          } else {
            // Imagen más alta de lo necesario, recortar arriba/abajo
            sHeight = width / aspectRatio;
            sy = (height - sHeight) / 2;
          }
        }

        const scale = Math.min(1, maxPx / Math.max(sWidth, sHeight));
        const dWidth = Math.round(sWidth * scale);
        const dHeight = Math.round(sHeight * scale);

        const canvas = document.createElement('canvas');
        canvas.width  = dWidth;
        canvas.height = dHeight;
        const ctx = canvas.getContext('2d')!;
        
        // Dibujar el área recortada en el canvas final
        ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, dWidth, dHeight);

        // Detectar si la imagen original es PNG (tiene transparencia)
        const isPNG = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
        
        // Usar WebP para PNG (conserva transparencia), JPEG para el resto
        if (isPNG) {
          resolve(canvas.toDataURL('image/webp', quality));
        } else {
          resolve(canvas.toDataURL('image/jpeg', quality));
        }
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
