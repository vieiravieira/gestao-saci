import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest, NextFetchEvent } from 'next/server'

type CookieToSet = {
  name: string
  value: string
  options?: Record<string, any>
}

export async function middleware(request: NextRequest, _event: NextFetchEvent) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll(): { name: string; value: string }[] {
          return request.cookies.getAll()
        },

        setAll(cookiesToSet: CookieToSet[]) {
          // Atualiza cookies no REQUEST
          cookiesToSet.forEach(({ name, value }: CookieToSet) => {
            request.cookies.set(name, value)
          })

          // Recria response com request atualizado
          supabaseResponse = NextResponse.next({
            request,
          })

          // Atualiza cookies na RESPONSE (browser)
          cookiesToSet.forEach(({ name, value, options }: CookieToSet) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')

  // Não logado → manda pro login
  if (!user && !isAuthPage) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Já logado → bloqueia voltar pro login
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
