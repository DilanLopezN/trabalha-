import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Rotas que requerem role específico
    if (path.startsWith("/prestador")) {
      if (token?.role !== "PRESTADOR") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

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
