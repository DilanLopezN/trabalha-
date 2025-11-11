import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Se não tem token e está tentando acessar rota protegida
    if (!token) {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }

    // Rotas que requerem PRESTADOR
    if (path.startsWith("/prestador")) {
      if (token?.role !== "PRESTADOR") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // Rotas que requerem EMPREGADOR
    if (path.startsWith("/empregador")) {
      if (token?.role !== "EMPREGADOR") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/auth/signin",
    },
  }
);

// Rotas protegidas
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/prestador/:path*",
    "/empregador/:path*",
  ],
};
