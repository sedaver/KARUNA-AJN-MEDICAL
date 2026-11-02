import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseConfig } from "@/lib/env";
export async function proxy(request: NextRequest) {
  const config = getSupabaseConfig();
  let response = NextResponse.next({ request });
  const redirectToLogin = () => {
    const redirected = NextResponse.redirect(new URL("/login", request.url));
    response.cookies
      .getAll()
      .forEach((cookie) => redirected.cookies.set(cookie));
    redirected.headers.set("Cache-Control", "private, no-store");
    return redirected;
  };
  if (!config)
    return request.nextUrl.pathname.startsWith("/dashboard")
      ? redirectToLogin()
      : response;
  const supabase = createServerClient(config.url, config.key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(values) {
        values.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        values.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });
  try {
    const { data, error } = await supabase.auth.getClaims();
    if (
      request.nextUrl.pathname.startsWith("/dashboard") &&
      (error || !data?.claims)
    )
      return redirectToLogin();
  } catch {
    if (request.nextUrl.pathname.startsWith("/dashboard"))
      return redirectToLogin();
  }
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
export const config = { matcher: ["/dashboard/:path*", "/login"] };
