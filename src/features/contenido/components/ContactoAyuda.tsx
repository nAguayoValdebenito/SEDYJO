import { Mail, Phone } from "lucide-react";
import { CORREO_CONTACTO, TELEFONO_CONTACTO, TELEFONO_CONTACTO_VISIBLE } from "@/lib/config";

/** Bloque "¿Necesitas ayuda?" con el celular y el correo de contacto del negocio. */
export function ContactoAyuda() {
  return (
    <aside
      aria-labelledby="titulo-contacto-ayuda"
      className="flex flex-col gap-3 rounded-xl bg-verde-suave p-5"
    >
      <h2 id="titulo-contacto-ayuda" className="font-titulos text-xl font-extrabold">
        ¿Necesitas ayuda?
      </h2>
      <p className="text-gris-medio">Escríbenos o llámanos y te ayudamos con tu pedido.</p>
      <ul className="flex flex-col gap-1">
        <li>
          <a
            href={`tel:${TELEFONO_CONTACTO}`}
            className="inline-flex min-h-11 items-center gap-2.5 font-bold text-azul hover:text-azul-oscuro"
          >
            <Phone size={18} aria-hidden="true" />
            {TELEFONO_CONTACTO_VISIBLE}
          </a>
        </li>
        <li>
          <a
            href={`mailto:${CORREO_CONTACTO}`}
            className="inline-flex min-h-11 items-center gap-2.5 font-bold text-azul hover:text-azul-oscuro"
          >
            <Mail size={18} aria-hidden="true" />
            {CORREO_CONTACTO}
          </a>
        </li>
      </ul>
    </aside>
  );
}
