# Auth Backend — Contexto de módulo

## Rama activa
`feat/auth-contract-fix`

## Operaciones GraphQL expuestas

| Tipo | Nombre GQL | Input | Return | Guard | Status |
|------|-----------|-------|--------|-------|--------|
| Mutation | `login` | `LoginInput` (email, password) | `LoginResponse` | — | ✅ Funcional |
| Mutation | `signup` | `LoginUserInput` (username, email, password) | `LoginResponse` | — | ✅ Funcional |
| Query | `revalidate` | — | `LoginResponse` | JwtAuthGuard | ✅ Token rotation |
| Query | `isValidate` | `email: String!` | `Boolean` | — | ✅ Disponibilidad |
| Mutation | `bootstrapAdmin` | `email: String!` | `LoginResponse` | — | ✅ Env-restricted |

## DTOs activos

- `LoginInput` → `src/auth/dto/login.input.ts` (email, password)
- `LoginUserInput` → `src/auth/dto/login-user.input.ts` (username, email, password) — usado por signup
- `LoginResponse` → `src/auth/dto/login-response.ts` (accessToken, refreshToken, user: User)

## DTOs eliminados/obsoletos

- `SingupResponse` (singup-response.ts) — ✅ Eliminado, era duplicado de LoginResponse con typo
- `SignupInput` (signup.input.ts) — ✅ Eliminado, tenía fullName en lugar de username (dead code)

## Decisiones de arquitectura

- Campo de nombre de usuario en signup: **`username`** (alineado con User schema MongoDB)
- Refresh token endpoint separado: **NO** — token rotation via `revalidate` query con JWT activo
- Password field en User entity: ✅ Limpiado de @Field() — solo @HideField() para no exponerse en GQL
- Bootstrap admin seguridad: ✅ Restringido a `BOOTSTRAP_ADMIN_EMAIL` env var

## User entity — Campos expuestos en GraphQL

`_id, username, email, isActive, role[], lastUpdatedById, createdAt, updatedAt`

**password:** marcado con `@HideField()` — nunca retornado en queries/mutations

## Revalidate Token Flow

```
1. Cliente con JWT activo llama: query revalidate
2. Backend: JwtAuthGuard valida JWT actual
3. getJwtToken() genera nuevo accessToken con expiración fresca
4. Retorna LoginResponse con nuevo accessToken + usuario completo
5. Cliente guarda nuevo accessToken en cookie + popula AuthStore
6. Tokens viejos quedan obsoletos automáticamente
```

Esto es **token rotation** — no hay refresh token endpoint separado. Si token expira, usuario redirigido a login.

## Variables de entorno requeridas

```
JWT_SECRET=<string>                       # Firma de tokens JWT
JWT_EXPIRATION=<number ms>                 # Duración access token (ej: 900000 = 15min)
BOOTSTRAP_ADMIN_EMAIL=<email>              # Email único que puede ser promovido a admin
```

## Pendiente / TODO

- [ ] Tests de revalidate query en Playground
- [ ] Verificar expiración JWT en tokens generados
- [ ] Logging de bootstrap admin en backend

## Estado actual

**Backend auth:** ~95% funcional — login, signup, revalidate, isValidate, bootstrapAdmin completamente implementados con contrato consistente.
