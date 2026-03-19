import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950">
      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <div className="h-24 w-24 relative rounded-full overflow-hidden border-2 border-amber-300">
              <Image
                src="/logo1 nolden.jpeg"
                alt="Nolden Luxury Logo"
                fill
                className="object-cover"
              />
            </div>
            <p className="text-xs text-slate-400">El brillo de un legado</p>
          </div>
          <div>
            <h3 className="font-semibold text-white">Navegación</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a href="#catalogo" className="text-slate-300 hover:text-white">
                  Catálogo
                </a>
              </li>
              <li>
                <a
                  href="#materiales"
                  className="text-slate-300 hover:text-white"
                >
                  Materiales
                </a>
              </li>
              <li>
                <a
                  href="#beneficios"
                  className="text-slate-300 hover:text-white"
                >
                  Beneficios
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white">Legal</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a href="#" className="text-slate-300 hover:text-white">
                  Términos y Condiciones
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-white">
                  Política de Privacidad
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-white">
                  Envíos y Devoluciones
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white">Redes Sociales</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a href="#" className="text-slate-300 hover:text-white">
                  Instagram
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-white">
                  Facebook
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-white">
                  TikTok
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-white/10 pt-8 text-center text-xs text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} ARNOLUX. Todos los derechos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
