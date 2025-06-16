import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request });
    const isDashboardRoute = request.nextUrl.pathname.startsWith("/dashboard");

    // If it's a dashboard route, check for authentication and admin role
    if (isDashboardRoute) {
        if (!token) {
            // Redirect to sign in if not authenticated
            const signInUrl = new URL("/signin", request.url);
            signInUrl.searchParams.set("callbackUrl", request.url);
            return NextResponse.redirect(signInUrl);
        }

        // Check if user has admin role
        if (token.role !== "admin") {
            // Redirect to home if not admin
            return NextResponse.redirect(new URL("/", request.url));
        }
    }

    return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
    matcher: [
        "/dashboard/:path*", // This will match /dashboard and all its sub-routes
    ],
}; 