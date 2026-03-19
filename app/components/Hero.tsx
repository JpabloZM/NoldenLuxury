import VisualGallery from "./VisualGallery";

export default function Hero() {
  return (
    <section className="mx-auto grid w-full max-w-6xl items-center gap-10 px-6 py-20 md:grid-cols-2 md:py-28">
      <div className="space-y-6">
        <p className="inline-flex rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1 text-xs font-semibold tracking-wide text-amber-200">
          Compra segura · Envíos · Garantía
        </p>
        <h1 className="text-4xl font-bold leading-tight text-white md:text-5xl">
          Joyería que resalta tu estilo todos los días.
        </h1>
        <p className="text-lg font-medium tracking-wide text-amber-200 md:text-xl">
          El brillo de un legado
        </p>
        <p className="max-w-xl text-slate-300">
          Descubre piezas elegantes y duraderas en oro laminado 18 kilates y
          plata 925. En ARNOLUX seleccionamos diseños modernos para elevar tus
          looks diarios y ocasiones especiales.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="#contacto"
            className="rounded-xl bg-amber-300 px-5 py-3 font-semibold text-slate-900 transition hover:bg-amber-200"
          >
            Contactar por WhatsApp
          </a>
          <a
            href="#catalogo"
            className="rounded-xl border border-white/20 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
          >
            Ver catálogo
          </a>
        </div>
      </div>
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-800 shadow-2xl shadow-black/40 overflow-hidden">
        <VisualGallery />
      </div>
    </section>
  );
}
