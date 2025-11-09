import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Rotas que exigem PRESTADOR
    if (path.startsWith("/prestador")) {
      if (token?.role !== "PRESTADOR") {
        return NextResponse.redirect(new URL("/auth/signin", req.url));
      }
    }

    // Rotas que exigem EMPREGADOR
    if (path.startsWith("/empregador")) {
      if (token?.role !== "EMPREGADOR") {
        return NextResponse.redirect(new URL("/auth/signin", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/prestador/:path*",
    "/empregador/:path*",
    "/profile/:path*",
    "/dashboard/:path*",
  ],
};
