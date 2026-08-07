import Link from 'next/link';
import { getCatalogs } from '@/lib/getCatalog';

export default function HomePage() {
  return <main className="mx-auto max-w-3xl p-8"><h1 className="font-serif text-4xl font-bold">Catálogos digitales</h1><p className="mt-3 text-stone-600">Selecciona un catálogo.</p><div className="mt-8 grid gap-4 sm:grid-cols-2">{getCatalogs().map((catalog) => <Link className="rounded-2xl bg-white p-5 shadow ring-1 ring-orange-100 hover:ring-orange-400" href={`/menu/${catalog.slug}`} key={catalog.slug}><p className="font-bold">{catalog.name}</p><p className="mt-1 text-sm text-stone-600">{catalog.tagline}</p></Link>)}</div></main>;
}
