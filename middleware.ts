import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // ⚠️ CRÍTICO: supabaseResponse deve ser criado com { request } para
  // preservar os cookies de sessão (corrige o loop de login)
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Atualiza cookies no REQUEST
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          // Recria supabaseResponse com request atualizado
          supabaseResponse = NextResponse.next({ request })
          // Atualiza cookies na RESPONSE para o browser salvar
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')

  // Se não estiver logado e não for página de auth → login
  if (!user && !isAuthPage) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Se já estiver logado e tentar acessar login → dashboard
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // CRÍTICO: retorna supabaseResponse (não um novo NextResponse.next())
  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
