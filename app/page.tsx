import { redirect } from 'next/navigation';
import { getCatalogs } from '@/lib/getCatalog';

export default function HomePage() {
  const catalogs = getCatalogs();
  // Si solo hay un catálogo, redirige directo a él
  if (catalogs.length === 1) {
    redirect(`/menu/${catalogs[0].slug}`);
  }
  // Si hay varios, muestra el selector (por si en el futuro agregas más)
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="font-serif text-4xl font-bold">Catálogos digitales</h1>
      <p className="mt-3 text-stone-600">Selecciona un catálogo.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {catalogs.map((catalog) => (
          <a
            key={catalog.slug}
            href={`/menu/${catalog.slug}`}
            className="rounded-2xl bg-white p-5 shadow ring-1 ring-orange-100 hover:ring-orange-400"
          >
            <p className="font-bold">{catalog.name}</p>
            <p className="mt-1 text-sm text-stone-600">{catalog.tagline}</p>
          </a>
        ))}
      </div>
    </main>
  );
}
