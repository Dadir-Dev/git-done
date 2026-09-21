import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export default clerkMiddleware((auth, req: NextRequest) => {
  // Webhooks are authenticated by Svix signatures, not Clerk sessions.
  // Let them pass through without any auth injection or redirects.
  if (req.nextUrl.pathname.startsWith('/api/webhooks/')) {
    return NextResponse.next();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for Clerk's auto-proxy path
    '/__clerk/:path*',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};