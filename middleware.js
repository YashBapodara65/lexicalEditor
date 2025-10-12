import { NextResponse } from "next/server";
export default async function middleware(request) {
    const path = request.nextUrl.pathname
    const isPublicPath = path === '/login' || path === '/forgot-password';
    const token = request.cookies.get('token')?.value || ''
    if (isPublicPath && token) {
        return NextResponse.redirect(new URL('/', request.nextUrl))
    }
    if (!isPublicPath && !token) {
        return NextResponse.redirect(new URL('/login', request.url))
    }
}
export const config = {
    matcher: [
        '/',
        '/login',
        '/signup',  
        '/forgot-password',
        '/role-management',
        '/organization',
        '/users',
    ]
}