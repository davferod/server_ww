#!/usr/bin/env node

/**
 * Script para consultar usuarios y hacer pruebas de funcionalidad
 * 
 * Uso:
 * 1. Listar todos los usuarios:
 *    node scripts/test-users.mjs --list-users
 * 
 * 2. Probar login:
 *    node scripts/test-users.mjs --login-test email@example.com password123
 * 
 * 3. Probar login con todos los usuarios de un archivo:
 *    node scripts/test-users.mjs --login-file users.json
 * 
 * 4. Revalidar token:
 *    node scripts/test-users.mjs --revalidate-token accessToken
 * 
 * 5. Obtener usuario actual (requiere token):
 *    node scripts/test-users.mjs --current-user accessToken
 */

import readline from 'readline';

const GRAPHQL_ENDPOINT = process.env.GRAPHQL_ENDPOINT || 'http://localhost:3000/graphql';

// Queries GraphQL
const QUERIES = {
  LIST_USERS: `
    query {
      users(roles: []) {
        _id
        username
        email
        role
        isActive
        createdAt
      }
    }
  `,
  
  FIND_USER: `
    query FindUser($findUserInput: FindUserInput!) {
      user(findUserInput: $findUserInput) {
        _id
        username
        email
        role
        isActive
        createdAt
      }
    }
  `,
  
  LOGIN: `
    mutation Login($loginInput: LoginInput!) {
      login(loginInput: $loginInput) {
        accessToken
        refreshToken
        user {
          _id
          username
          email
          role
        }
      }
    }
  `,
  
  REVALIDATE_TOKEN: `
    query {
      revalidate {
        accessToken
        refreshToken
        user {
          _id
          username
          email
          role
        }
      }
    }
  `,
  
  UPDATE_USER_ROLE: `
    mutation UpdateUserRole($updateUserRoleInput: UpdateUserRoleInput!) {
      updateUserRole(updateUserRoleInput: $updateUserRoleInput) {
        _id
        username
        email
        role
      }
    }
  `,
};

// Utilidades
function log(type, message) {
  const icons = {
    info: 'ℹ️ ',
    success: '✅ ',
    error: '❌ ',
    warning: '⚠️ ',
    query: '📋 ',
    response: '📥 ',
  };
  console.log(`${icons[type] || '• '} ${message}`);
}

async function graphqlRequest(query, variables = {}, token = null) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    log('error', `Error de conexión: ${error.message}`);
    return null;
  }
}

// Operaciones
async function listUsers(token = null) {
  log('info', 'Listando todos los usuarios (requiere ser admin)...\n');
  
  // Si no hay token, mostrar instrucciones
  if (!token) {
    log('warning', 'Se requiere autenticación como ADMIN para listar usuarios.');
    log('info', 'Usa: npm run test:users -- --current-user <token>');
    log('info', 'Donde <token> es de un usuario con rol admin o superadmin');
    return;
  }
  
  const response = await graphqlRequest(QUERIES.LIST_USERS, {}, token);

  if (!response) return;

  if (response.errors) {
    log('error', `Error: ${response.errors[0].message}`);
    return;
  }

  const users = response.data?.users || [];

  if (users.length === 0) {
    log('warning', 'No se encontraron usuarios');
    return;
  }

  console.log('\n' + '═'.repeat(70));
  console.log(`📊 Total de usuarios: ${users.length}`);
  console.log('═'.repeat(70) + '\n');

  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.username}`);
    console.log(`   📧 Email:    ${user.email}`);
    console.log(`   🆔 ID:       ${user._id}`);
    console.log(`   🔐 Role:     ${user.role}`);
    console.log(`   ✓ Activo:    ${user.isActive ? 'Sí' : 'No'}`);
    console.log(`   📅 Creado:   ${new Date(user.createdAt).toLocaleString()}`);
    console.log('');
  });

  console.log('═'.repeat(70) + '\n');
}

async function testLogin(email, password, showFullToken = false) {
  log('info', `Probando login para: ${email}`);
  
  const response = await graphqlRequest(QUERIES.LOGIN, {
    loginInput: { email, password }
  });

  if (!response) return null;

  if (response.errors) {
    log('error', `Error: ${response.errors[0].message}`);
    return null;
  }

  const result = response.data?.login;

  if (result) {
    log('success', 'Login exitoso');
    console.log(`   Usuario:  ${result.user.username}`);
    console.log(`   Email:    ${result.user.email}`);
    console.log(`   Role:     ${result.user.role}`);
    
    if (showFullToken) {
      console.log(`\n🔐 Token completo (cópialo para usar en otros comandos):`);
      console.log(`\n${result.accessToken}\n`);
    } else {
      console.log(`   Token:    ${result.accessToken.substring(0, 20)}...`);
    }
    console.log('');
    return result.accessToken;
  }

  return null;
}

async function testLoginFromFile(filePath) {
  log('info', `Probando login desde archivo: ${filePath}\n`);

  let users = [];
  try {
    const fs = await import('fs');
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    users = Array.isArray(data) ? data : data.users || [];
  } catch (error) {
    log('error', `Error leyendo archivo: ${error.message}`);
    return;
  }

  if (users.length === 0) {
    log('warning', 'No se encontraron usuarios en el archivo');
    return;
  }

  log('info', `${users.length} usuarios encontrados\n`);

  let successCount = 0;
  let failureCount = 0;

  console.log('─'.repeat(70));

  for (const user of users) {
    const token = await testLogin(user.email, user.password);
    if (token) {
      successCount++;
    } else {
      failureCount++;
    }
  }

  console.log('─'.repeat(70));
  console.log('\n📊 Resumen de pruebas de login:');
  console.log(`   ✅ Exitosos: ${successCount}/${users.length}`);
  console.log(`   ❌ Fallidos: ${failureCount}/${users.length}\n`);
}

async function testRevalidateToken(token) {
  log('info', 'Revalidando token...');
  
  const response = await graphqlRequest(QUERIES.REVALIDATE_TOKEN, {}, token);

  if (!response) return;

  if (response.errors) {
    log('error', `Error: ${response.errors[0].message}`);
    return;
  }

  const result = response.data?.revalidate;

  if (result) {
    log('success', 'Token revalidado exitosamente');
    console.log(`   Usuario:     ${result.user.username}`);
    console.log(`   Email:       ${result.user.email}`);
    console.log(`   Role:        ${result.user.role}`);
    console.log(`   Nuevo Token: ${result.accessToken.substring(0, 20)}...`);
    console.log('');
  }
}

async function testCurrentUser(token) {
  log('info', 'Obteniendo usuario actual...');
  
  const response = await graphqlRequest(QUERIES.REVALIDATE_TOKEN, {}, token);

  if (!response) return;

  if (response.errors) {
    log('error', `Error: ${response.errors[0].message}`);
    return;
  }

  const result = response.data?.revalidate;

  if (result) {
    log('success', 'Usuario obtenido');
    console.log(`   Usuario: ${result.user.username}`);
    console.log(`   Email:   ${result.user.email}`);
    console.log(`   Role:    ${result.user.role}`);
    console.log(`   ID:      ${result.user._id}`);
    console.log('');
  }
}

async function updateUserRole(email, role, adminToken) {
  log('info', `Actualizando rol de ${email} a ${role}...`);
  
  if (!adminToken) {
    log('error', 'Se requiere un token de administrador para cambiar roles');
    return;
  }

  const response = await graphqlRequest(QUERIES.UPDATE_USER_ROLE, {
    updateUserRoleInput: {
      email,
      role
    }
  }, adminToken);

  if (!response) return;

  if (response.errors) {
    log('error', `Error: ${response.errors[0].message}`);
    return;
  }

  const result = response.data?.updateUserRole;

  if (result) {
    log('success', 'Rol actualizado exitosamente');
    console.log(`   Usuario: ${result.username}`);
    console.log(`   Email:   ${result.email}`);
    console.log(`   Nuevo Role: ${result.role}`);
    console.log('');
  }
}

async function batchUpdateRoles(updates, adminToken) {
  log('info', 'Actualizando múltiples roles...');
  
  if (!adminToken) {
    log('error', 'Se requiere un token de administrador para cambiar roles');
    return;
  }

  console.log(`\n👥 Total de roles a actualizar: ${updates.length}`);
  console.log('─'.repeat(70));

  let successCount = 0;
  let failureCount = 0;

  for (const update of updates) {
    const response = await graphqlRequest(QUERIES.UPDATE_USER_ROLE, {
      updateUserRoleInput: {
        email: update.email,
        role: update.role
      }
    }, adminToken);

    if (response?.data?.updateUserRole) {
      log('success', `${update.email} → ${update.role}`);
      successCount++;
    } else {
      const error = response?.errors?.[0]?.message || 'Error desconocido';
      log('error', `${update.email}: ${error}`);
      failureCount++;
    }
  }

  console.log('\n' + '─'.repeat(70));
  console.log('📊 Resumen:');
  console.log(`   ✅ Exitosos: ${successCount}`);
  console.log(`   ❌ Fallidos: ${failureCount}\n`);
}

async function interactiveMenu() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt) =>
    new Promise((resolve) => rl.question(prompt, resolve));

  console.log('\n' + '═'.repeat(70));
  console.log('🧪 Test de Funcionalidad - Gym Tracker WW');
  console.log('═'.repeat(70));
  console.log('Opciones:');
  console.log('  1. Listar todos los usuarios');
  console.log('  2. Probar login (individual)');
  console.log('  3. Probar login desde archivo JSON');
  console.log('  4. Revalidar token');
  console.log('  5. Ver usuario actual (requiere token)');
  console.log('  0. Salir');
  console.log('─'.repeat(70) + '\n');

  let running = true;

  while (running) {
    const choice = await question('Elige una opción (0-5): ');

    switch (choice) {
      case '1':
        await listUsers();
        break;

      case '2':
        const email = await question('📧 Email: ');
        const password = await question('🔑 Contraseña: ');
        await testLogin(email, password);
        break;

      case '3':
        const filePath = await question('📁 Ruta del archivo JSON: ');
        await testLoginFromFile(filePath);
        break;

      case '4':
        const token = await question('🔑 Token: ');
        await testRevalidateToken(token);
        break;

      case '5':
        const userToken = await question('🔑 Token: ');
        await testCurrentUser(userToken);
        break;

      case '0':
        running = false;
        console.log('\n👋 ¡Hasta luego!\n');
        break;

      default:
        log('warning', 'Opción no válida');
    }

    if (running) {
      console.log('');
      await question('Presiona Enter para continuar...');
      console.clear?.() || console.log('\n'.repeat(50));
    }
  }

  rl.close();
}

// Parsear argumentos
function parseArgs() {
  const args = process.argv.slice(2);
  return {
    action: args[0],
    param1: args[1],
    param2: args[2],
  };
}

// Main
async function main() {
  console.log('\n' + '═'.repeat(70));
  console.log('🧪 Test de Funcionalidad - Gym Tracker WW');
  console.log('═'.repeat(70));
  console.log(`📡 Endpoint: ${GRAPHQL_ENDPOINT}\n`);

  const { action, param1, param2 } = parseArgs();

  switch (action) {
    case '--list-users':
      await listUsers();
      break;

    case '--login-test':
      if (!param1 || !param2) {
        log('error', 'Uso: --login-test <email> <password>');
        break;
      }
      await testLogin(param1, param2, true);
      break;

    case '--login-file':
      if (!param1) {
        log('error', 'Uso: --login-file <ruta-archivo.json>');
        break;
      }
      await testLoginFromFile(param1);
      break;

    case '--revalidate-token':
      if (!param1) {
        log('error', 'Uso: --revalidate-token <token>');
        break;
      }
      await testRevalidateToken(param1);
      break;

    case '--current-user':
      if (!param1) {
        log('error', 'Uso: --current-user <token>');
        break;
      }
      await testCurrentUser(param1);
      break;

    default:
      await interactiveMenu();
      break;
  }
}

main().catch(error => {
  console.error('\n❌ Error fatal:', error.message);
  process.exit(1);
});
