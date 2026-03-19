import Header from "./components/Header";
import Hero from "./components/Hero";
import Catalog from "./components/Catalog";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <Header />
      <Hero />
      <Catalog />

      <section id="materiales" className="bg-slate-900/60 py-16">
        <div className="mx-auto w-full max-w-6xl px-6">
          <h2 className="text-3xl font-semibold text-white">
            Materiales principales
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              {
                name: "Oro Laminado 18 Kilates",
                description:
                  "Revestimiento de oro puro al 18K sobre base de metal. Brilla como oro macizo, es resistente al desgaste diario y mantiene su esplendor por años. Ideal para un look premium asequible.",
              },
              {
                name: "Plata 925",
                description:
                  "Plata esterlina auténtica con pureza de 92.5%. Duradera, hipoalergénica y versátil. Se adapta a cualquier tono de piel y envejece elegantemente, ganando carácter con el tiempo.",
              },
              {
                name: "Complementos hipoalergénicos",
                description:
                  "Diseñados para pieles sensibles. Libres de níquel y metales que causen reacciones alérgicas. Garantizamos comodidad y seguridad en cada uso, sin comprometer el estilo.",
              },
            ].map((material) => (
              <article
                key={material.name}
                className="rounded-2xl border border-white/10 bg-slate-950 p-6"
              >
                <p className="text-sm text-amber-200">Calidad Nolden Luxury</p>
                <h3 className="mt-2 text-lg font-semibold text-white">
                  {material.name}
                </h3>
                <p className="mt-3 text-sm text-slate-300">
                  {material.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="beneficios" className="mx-auto w-full max-w-6xl px-6 py-16">
        <h2 className="text-3xl font-semibold text-white">
          Beneficios para tu compra
        </h2>
        <ol className="mt-8 grid gap-6 md:grid-cols-4">
          {[
            "Asesoría personalizada",
            "Pago seguro",
            "Envío a todo el país",
            "Garantía de calidad",
          ].map((step, index) => (
            <li
              key={step}
              className="rounded-xl border border-white/10 bg-slate-900/70 p-5"
            >
              <p className="text-xs font-semibold text-amber-200">
                BENEFICIO {index + 1}
              </p>
              <p className="mt-2 font-medium text-white">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      <section
        id="contacto"
        className="border-t border-white/10 bg-slate-900 py-16"
      >
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-semibold text-white">Haz tu pedido</h2>
            <p className="mt-3 text-slate-300">
              Escríbenos para enviarte catálogo actualizado, disponibilidad y
              precios mayoristas o por unidad.
            </p>
            <p className="mt-4 text-sm font-medium tracking-wide text-amber-200">
              Nolden Luxury · El brillo de un legado
            </p>
          </div>
          <form className="space-y-4 rounded-2xl border border-white/10 bg-slate-950 p-6">
            <input
              type="text"
              placeholder="Nombre"
              className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-sm outline-none ring-amber-300/40 placeholder:text-slate-500 focus:ring"
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-sm outline-none ring-amber-300/40 placeholder:text-slate-500 focus:ring"
            />
            <textarea
              placeholder="¿Qué piezas buscas? (aretes, cadenas, anillos, etc.)"
              rows={4}
              className="w-full resize-none rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-sm outline-none ring-amber-300/40 placeholder:text-slate-500 focus:ring"
            />
            <button
              type="button"
              className="w-full rounded-xl bg-amber-300 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-amber-200"
            >
              Solicitar catálogo
            </button>
          </form>
        </div>
      </section>
      <Footer />
    </main>
  );
}
