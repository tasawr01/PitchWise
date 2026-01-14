import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken, SESSION_INACTIVITY_TIMEOUT } from '@/lib/auth';

// Define protected routes and their required roles
const PROTECTED_ROUTES = [
    { path: '/admin', roles: ['admin'] },
    { path: '/entrepreneur', roles: ['entrepreneur'] },
    { path: '/investor', roles: ['investor'] },
    { path: '/dashboard', roles: ['entrepreneur', 'investor', 'admin'] },
];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Check if the current path is protected
    const protectedRoute = PROTECTED_ROUTES.find(route => pathname.startsWith(route.path));

    if (protectedRoute) {
        const token = request.cookies.get('token')?.value;

        // 2. No token found -> Redirect to login
        if (!token) {
            const loginUrl = new URL('/login', request.url);
            // Save the original URL to redirect back after login
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }

        // 3. Verify Token
        const payload = await verifyToken(token);

        if (!payload) {
            // Invalid token -> Redirect to login (treat as expired/invalid)
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            const response = NextResponse.redirect(loginUrl);
            // Clear invalid cookie
            response.cookies.delete('token');
            response.cookies.delete('userRole');
            return response;
        }

        // 4. Check Absolute Timeout (24h)
        // 'abs_exp' is checked here. 'exp' in the token is also checked by verifyToken.
        // If verifyToken passed, 'exp' (24h) is valid.
        const now = Math.floor(Date.now() / 1000);
        if (payload.abs_exp && now > payload.abs_exp) {
            // Absolute timeout exceeded -> Force Logout
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('error', 'session_expired');
            const response = NextResponse.redirect(loginUrl);
            response.cookies.delete('token');
            response.cookies.delete('userRole');
            return response;
        }

        // 5. Check Role Permissions
        if (!protectedRoute.roles.includes(payload.role)) {
            // Role mismatch -> Unauthorized
            // You might want to redirect to their correct dashboard or show a 403 page
            // For now, redirecting to home or their own dashboard is safer
            return NextResponse.rewrite(new URL('/unauthorized', request.url));
        }

        // 6. Sliding Window: Refresh Inactivity Timeout
        // Logic: Return the response but reset the cookie's maxAge to 30 mins
        // We use NextResponse.next() to continue the request, but we need to set a cookie on the response.
        const response = NextResponse.next();

        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: SESSION_INACTIVITY_TIMEOUT, // Reset to 30 mins
            path: '/',
        });

        return response;
    }

    // Public Route -> Continue
    return NextResponse.next();
}

// Configure paths to match
export const config = {
    matcher: [
        '/admin/:path*',
        '/entrepreneur/:path*',
        '/investor/:path*',
        '/dashboard/:path*',
    ],
};
