import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Rutas que piden sesión. La comprobación real se repite en cada página y acción. */
const PROTECTED_PREFIXES = ["/mis-mascotas", "/nueva-contrasena"];
/** Rutas que no tienen sentido con la sesión iniciada. */
const GUEST_ONLY = ["/entrar", "/crear-cuenta"];

function matches(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

/**
 * Renueva la sesión de Supabase en cada petición (los tokens caducan) y hace
 * redirecciones optimistas. No es la única barrera: las páginas y las
 * Server Actions vuelven a verificar la sesión, y la base de datos aplica RLS.
 */
export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return NextResponse.next({ request });

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
        for (const [header, value] of Object.entries(headers)) response.headers.set(header, value);
      },
    },
  });

  // No poner código entre la creación del cliente y getClaims(): es lo que renueva la sesión.
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims?.sub);
  const { pathname, search } = request.nextUrl;

  const redirectTo = (target: URL) => {
    const redirect = NextResponse.redirect(target);
    for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie);
    return redirect;
  };

  if (!signedIn && matches(pathname, PROTECTED_PREFIXES)) {
    const target = request.nextUrl.clone();
    target.pathname = "/entrar";
    target.search = `?siguiente=${encodeURIComponent(`${pathname}${search}`)}`;
    return redirectTo(target);
  }

  if (signedIn && matches(pathname, GUEST_ONLY)) {
    const target = request.nextUrl.clone();
    target.pathname = "/mis-mascotas";
    target.search = "";
    return redirectTo(target);
  }

  return response;
}

export const config = {
  matcher: [
    // Todo menos archivos estáticos, imágenes optimizadas, íconos y el manifest.
    "/((?!_next/static|_next/image|icons/|favicon.ico|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)",
  ],
};
