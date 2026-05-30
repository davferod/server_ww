# 🚀 Quick Start - Gym Tracker WW User Management

## 5-Minute Setup

### 1️⃣ Crear usuarios de prueba
```bash
npm run seed:users
```
Esto crea 5 usuarios automáticamente.

### 2️⃣ Promover el primer admin
```bash
npm run bootstrap:admin -- --email admin@example.com
```
Copia el token que aparece.

### 3️⃣ Actualizar otros roles
```bash
npm run update:roles -- --token <PEGA_AQUI_EL_TOKEN>
```

### 4️⃣ Verificar usuarios
```bash
npm run test:users -- --login-test admin@example.com AdminPass123!
```

¡Listo! 🎉

---

## Usuarios Disponibles Después del Setup

```
admin@example.com / AdminPass123! → ADMIN
entrenador1@gym.com / Pass123! → ADMIN
superadmin@gym.com / Pass123! → SUPERADMIN
davferod / SuperPass123! → USER
atleta1/atleta2/testuser / Pass123! → USER
```

---

## Comandos Útiles

| Comando | Propósito |
|---------|-----------|
| `npm run seed:user` | Crear 1 usuario (interactivo) |
| `npm run seed:users` | Crear 5 usuarios de ejemplo |
| `npm run bootstrap:admin -- --email X` | Promover primer admin |
| `npm run update:roles -- --token X` | Actualizar todos los roles |
| `npm run test:users` | Menú de pruebas (6 opciones) |
| `npm run test:users -- --login-test E P` | Login y mostrar token |
| `npm run test:users:list` | Listar todos (requiere admin) |

---

## Cambiar Rol de 1 Usuario

```bash
npm run test:users -- --login-test admin@example.com AdminPass123!
# Copia el token
npm run update:roles -- --token <TOKEN> --email user@example.com --role admin
```

---

## Solucionar Errores Rápido

| Error | Solución |
|-------|----------|
| "Usuario ya existe" | Usa otro email o elimina de BD |
| "Unauthorized" | Usa `bootstrap:admin` primero |
| "Invalid role" | Usa: user, admin, superadmin, guest |
| "Conexión rechazada" | Asegúrate que backend está corriendo |

---

## API GraphQL (Para Frontend)

### Login
```graphql
mutation Login($loginInput: LoginInput!) {
  login(loginInput: $loginInput) {
    accessToken
    refreshToken
    user { _id username email role }
  }
}
```

### Signup
```graphql
mutation Signup($loginUserInput: LoginUserInput!) {
  signup(loginUserInput: $loginUserInput) {
    accessToken
    refreshToken
    user { _id username email }
  }
}
```

### Cambiar Rol (requiere admin)
```graphql
mutation UpdateUserRole($updateUserRoleInput: UpdateUserRoleInput!) {
  updateUserRole(updateUserRoleInput: $updateUserRoleInput) {
    _id username email role
  }
}
```

---

**Necesita help? Ver USER-MANAGEMENT.md para documentación completa.**
