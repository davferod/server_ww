# 🚀 Sistema de Gestión de Usuarios y Roles - Gym Tracker WW

## 📋 Descripción General

Este proyecto incluye un conjunto completo de scripts Node.js para gestionar usuarios y roles en Gym Tracker WW. El sistema utiliza GraphQL para la comunicación con el backend de NestJS.

## 🎯 Flujo de Trabajo

### Fase 1: Creación de Usuarios

**Script:** `seed-user.mjs`

Crea nuevos usuarios en el sistema con validación de datos.

#### Modos de uso:

**1. Modo interactivo (sin argumentos):**
```bash
npm run seed:user
```
Te pedirá ingresar datos en la consola.

**2. Modo CLI (línea de comandos):**
```bash
npm run seed:user -- --email user@example.com --username john --password Pass123! --role user
```

**3. Modo archivo JSON:**
```bash
npm run seed:user -- --file scripts/users-seed.example.json
```

#### Validaciones aplicadas:
- **Email:** Formato válido (ejemplo@dominio.com)
- **Contraseña:** Mínimo 6 caracteres, 1 mayúscula, 1 número
- **Username:** Mínimo 3 caracteres, solo letras, números y guiones bajos
- **Role:** user, admin, superadmin, guest

#### Nota importante:
El campo `role` en el DTO se ignora. Todos los usuarios se crean con rol `'user'` por defecto. Para asignar otros roles, sigue la Fase 2.

---

### Fase 2: Gestión de Roles

#### Paso 2a: Bootstrap del Primer Admin

Si no existen administradores en el sistema, usa el bootstrap:

```bash
npm run bootstrap:admin -- --email admin@example.com
```

Este comando:
1. Verifica que no existan admins/superadmins
2. Promueve el usuario especificado a admin
3. Devuelve un token de acceso

Ejemplo de salida:
```
✅ Bootstrap completado exitosamente!
   Usuario:  admin
   Rol:      admin

🔐 Token de admin:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Paso 2b: Actualización de Roles Adicionales

Usa el token obtenido en el bootstrap para actualizar otros roles:

```bash
npm run update:roles -- --token <TOKEN_GENERADO>
```

Esto actualizará automáticamente:
- `entrenador1@gym.com` → admin
- `superadmin@gym.com` → superadmin

**Actualizar roles individuales:**
```bash
npm run update:roles -- --token <TOKEN> --email user@example.com --role admin
```

---

### Fase 3: Pruebas de Funcionalidad

**Script:** `test-users.mjs`

Realiza pruebas de autenticación y operaciones de usuario.

#### Opciones de uso:

**1. Prueba de login individual (muestra token completo):**
```bash
npm run test:users -- --login-test email@example.com password123
```

**2. Prueba de login desde archivo:**
```bash
npm run test:users -- --login-file scripts/test-logins.example.json
```

**3. Listar todos los usuarios (requiere admin):**
```bash
npm run test:users:list
```

**4. Modo menú interactivo:**
```bash
npm run test:users
```

Ofrece un menú con 6 opciones:
- Test de login
- Test de login masivo
- Revalidar token
- Obtener usuario actual
- Actualizar roles (requiere token admin)
- Salir

---

## 👥 Usuarios de Prueba Predefinidos

Después de ejecutar `npm run seed:users`:

| Email | Username | Password | Rol |
|-------|----------|----------|-----|
| admin@example.com | admin | AdminPass123! | admin |
| entrenador1@gym.com | entrenador1 | Pass123! | admin |
| superadmin@gym.com | superadmin | Pass123! | superadmin |
| davvidrd81@gmail.com | davferod | SuperPass123! | user |
| atleta1@gym.com | atleta1 | Pass123! | user |
| atleta2@gym.com | atleta2 | Pass123! | user |
| testuser@example.com | testuser | Pass123! | user |

---

## 🔐 Seguridad

### Guardias de Autenticación

- `JwtAuthGuard`: Requiere token JWT válido
- `@CurrentUser([ValidRoles.admin, ValidRoles.superadmin])`: Requiere rol específico

### Mutations y Queries Protegidas

| Operación | Protección | Descripción |
|-----------|-----------|------------|
| `signup` | Ninguna | Crea usuario nuevo |
| `login` | Ninguna | Autentica usuario |
| `revalidate` | JWT | Valida y renueva token |
| `users` | JWT + Admin | Lista todos los usuarios |
| `user` | JWT + Admin | Obtiene usuario específico |
| `updateUserRole` | JWT + Admin | Cambia rol de usuario |
| `bootstrapAdmin` | Ninguna | Promueve primer admin (solo si no existen) |

---

## 📚 Flujo Completo de Ejemplo

### 1. Crear los usuarios de prueba:
```bash
npm run seed:users
```

### 2. Promover el primer admin:
```bash
npm run bootstrap:admin -- --email admin@example.com
```
Salida: Token JWT

### 3. Actualizar otros roles:
```bash
npm run update:roles -- --token <TOKEN_DEL_BOOTSTRAP>
```

### 4. Hacer login y verificar:
```bash
npm run test:users -- --login-test entrenador1@gym.com Pass123!
```

Deberías ver: `Role: admin`

---

## 🐛 Resolución de Problemas

### "Usuario ya existe"
**Solución:** Elimina los usuarios de la BD o crea con emails diferentes.

### "Unauthorized - User needs admin role"
**Solución:** Usa bootstrap:admin para crear el primer admin, luego actualiza otros roles.

### "Token expirado"
**Solución:** Los tokens expiran. Vuelve a hacer login con el comando test:users.

### No se actualiza el rol
**Verificación:**
1. Asegúrate de tener un token de admin/superadmin
2. Verifica que el usuario exista (prueba login)
3. Revisa la respuesta de error en la consola

---

## 📝 Archivos Relacionados

| Archivo | Propósito |
|---------|-----------|
| `server_ww/scripts/seed-user.mjs` | Crear usuarios |
| `server_ww/scripts/test-users.mjs` | Probar funcionalidad |
| `server_ww/scripts/bootstrap-admin.mjs` | Primer admin |
| `server_ww/scripts/update-roles.mjs` | Actualizar roles |
| `server_ww/scripts/users-seed.example.json` | Datos de ejemplo |
| `server_ww/scripts/test-logins.example.json` | Credenciales de prueba |
| `server_ww/ROLE-MANAGEMENT.md` | Detalles de gestión de roles |

---

## 🚀 Próximos Pasos

1. **Sprint 0:** Implementar autenticación en frontend (Angular)
   - Migrar de REST a GraphQL
   - Integrar con apollo-angular
   
2. **Sprint 1:** Perfiles de usuarios
   - CRUD de perfiles
   - Datos antropométricos

3. **Sprints Posteriores:** Funcionalidades principales
   - Boards Kanban
   - Tasks y Routines
   - Mediciones físicas

---

## 📞 Soporte

Para reportar problemas o sugerencias, revisa los logs del backend en:
- `server_ww/dist/` (build)
- Terminal donde corre `npm run start:dev`

---

**Última actualización:** 2025
**Versión del Sistema:** 0.0.1
