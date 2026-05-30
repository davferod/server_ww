# Guía de Gestión de Roles de Usuarios

## Problema
Cuando se crea un usuario mediante el mutation `signup`, el rol siempre se asigna como `'user'` por defecto. No hay forma de especificar un rol diferente durante el signup porque el DTO `LoginUserInput` no acepta un parámetro de rol.

## Solución
Se han creado varios scripts para actualizar los roles de los usuarios después de su creación:

### Opción 1: Script de Actualización con GraphQL (Recomendado)
Este es el método más seguro y recomendado porque usa autenticación y autorización GraphQL.

#### Pasos:
1. **Crear un usuario administrador:**
```bash
npm run seed:user -- --email admin@example.com --username admin --password AdminPass123! --role admin
```

2. **Obtener el token del administrador:**
```bash
npm run test:users -- --login-test admin@example.com AdminPass123!
```
Copia el token que se genera.

3. **Actualizar roles:**
```bash
npm run update:roles -- --token <TOKEN_GENERADO>
```

Esto actualizará automáticamente los roles de:
- entrenador1@gym.com → admin
- superadmin@gym.com → superadmin

#### Actualizar un rol específico:
```bash
npm run update:roles -- --token <TOKEN> --email user@example.com --role admin
```

### Opción 2: Script MongoDB Local
Si tienes MongoDB corriendo localmente, puedes usar:
```bash
npm run fix:roles:file
```

Este script se conecta directamente a MongoDB y actualiza los roles sin necesidad de autenticación GraphQL.

**Requisito:** MongoDB debe estar corriendo en `mongodb://localhost:27017`

### Opción 3: CLI MongoDB (mongosh)
```bash
npm run fix:roles:simple
```

Usa `mongosh` (MongoDB Shell) directamente.

**Requisito:** `mongosh` debe estar instalado y en el PATH

## Roles Disponibles
- `user` (por defecto)
- `admin`
- `superadmin`
- `guest`

## Usuarios de Prueba Predefinidos
Después de ejecutar `npm run seed:users`, tienes:

| Email | Username | Password | Rol Actual | Rol Deseado |
|-------|----------|----------|-----------|------------|
| davvidrd81@gmail.com | davferod | SuperPass123! | user | user ✅ |
| entrenador1@gym.com | entrenador1 | Pass123! | user | admin ⚠️ |
| atleta1@gym.com | atleta1 | Pass123! | user | user ✅ |
| atleta2@gym.com | atleta2 | Pass123! | user | user ✅ |
| testuser@example.com | testuser | Pass123! | user | user ✅ |
| superadmin@gym.com | superadmin | Pass123! | user | superadmin ⚠️ |

## Verificar Roles

### Después de cambiar roles, verifica con:
```bash
npm run test:users -- --login-test entrenador1@gym.com Pass123!
```

Deberías ver `Role: admin` en la respuesta.

## Implementación Futura
Para una solución permanente, se recomienda:

1. **Opción A**: Modificar `LoginUserInput` para aceptar un parámetro `role` (requiere refactoring de seguridad)

2. **Opción B**: Crear un endpoint separado de admin que permita crear usuarios con roles específicos

3. **Opción C**: Implementar un sistema de invitaciones donde los roles se asignan con permisos especiales

## Notas de Seguridad
- Solo usuarios con rol `admin` o `superadmin` pueden cambiar roles
- La mutation `updateUserRole` requiere autenticación via JWT
- Los cambios de rol se registran en la base de datos inmediatamente
