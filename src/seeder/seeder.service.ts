/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { LoginUserInput } from 'src/auth/dto/login-user.input';
import * as fs from 'fs';
import * as path from 'path';

interface SeedUser {
  email: string;
  username: string;
  password: string;
  role: string;
}

@Injectable()
export class SeederService {
  private readonly logger = new Logger('SeederService');

  constructor(private readonly usersService: UsersService) {}

  /**
   * Carga usuarios desde el archivo JSON de seed
   */
  private loadSeedData(): SeedUser[] {
    const seedFilePath = path.resolve(__dirname, '../../scripts/users-seed.example.json');
    try {
      const data = fs.readFileSync(seedFilePath, 'utf-8');
      const users: SeedUser[] = JSON.parse(data);
      this.logger.log(`✅ Cargados ${users.length} usuarios de ${seedFilePath}`);
      return users;
    } catch (error) {
      this.logger.error(`❌ Error cargando seed data: ${error.message}`);
      throw error;
    }
  }

  /**
   * Crea usuarios desde el archivo de seed
   */
  async seedUsers(): Promise<void> {
    this.logger.log('🌱 Iniciando seeding de usuarios...');

    const seedUsers = this.loadSeedData();
    let successCount = 0;
    let skipCount = 0;
    let failureCount = 0;

    for (const seedUser of seedUsers) {
      try {
        // Verificar si el usuario ya existe
        const existingUser = await this.usersService.findOne(seedUser.email);
        if (existingUser) {
          this.logger.warn(`⊘ Usuario ya existe: ${seedUser.email}`);
          skipCount++;
          continue;
        }

        // Crear el usuario (UsersService.create hace bcrypt automáticamente)
        const loginUserInput: LoginUserInput = {
          email: seedUser.email,
          username: seedUser.username,
          password: seedUser.password,
        };

        const createdUser = await this.usersService.create(loginUserInput);
        this.logger.log(`✓ Usuario creado: ${seedUser.email}`);

        // Asignar el rol si es diferente a 'user'
        if (seedUser.role && seedUser.role !== 'user') {
          await this.usersService.updateRole(seedUser.email, seedUser.role);
          this.logger.log(`✓ Rol asignado: ${seedUser.email} → ${seedUser.role}`);
        }

        successCount++;
      } catch (error) {
        this.logger.error(`✗ Error con ${seedUser.email}: ${error.message}`);
        failureCount++;
      }
    }

    // Resumen
    this.logger.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    this.logger.log(`📊 Resumen de seeding:`);
    this.logger.log(`   ✅ Creados: ${successCount}`);
    this.logger.log(`   ⊘ Saltados: ${skipCount}`);
    this.logger.log(`   ✗ Fallidos: ${failureCount}`);
    this.logger.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    if (failureCount > 0) {
      process.exit(1);
    }
  }

  /**
   * Crea solo usuarios regulares (role: user)
   */
  async seedRegularUsers(): Promise<void> {
    this.logger.log('🌱 Iniciando seeding de usuarios regulares...');

    const seedUsers = this.loadSeedData().filter(u => u.role === 'user');
    let successCount = 0;
    let skipCount = 0;

    for (const seedUser of seedUsers) {
      try {
        const existingUser = await this.usersService.findOne(seedUser.email);
        if (existingUser) {
          this.logger.warn(`⊘ Usuario ya existe: ${seedUser.email}`);
          skipCount++;
          continue;
        }

        const loginUserInput: LoginUserInput = {
          email: seedUser.email,
          username: seedUser.username,
          password: seedUser.password,
        };

        await this.usersService.create(loginUserInput);
        this.logger.log(`✓ Usuario creado: ${seedUser.email}`);
        successCount++;
      } catch (error) {
        this.logger.error(`✗ Error con ${seedUser.email}: ${error.message}`);
      }
    }

    this.logger.log(`\n✅ Usuarios regulares creados: ${successCount} (saltados: ${skipCount})\n`);
  }

  /**
   * Crea solo administradores y superadmins
   */
  async seedAdmins(): Promise<void> {
    this.logger.log('🌱 Iniciando seeding de administradores...');

    const seedUsers = this.loadSeedData().filter(u => u.role !== 'user');
    let successCount = 0;
    let skipCount = 0;

    for (const seedUser of seedUsers) {
      try {
        const existingUser = await this.usersService.findOne(seedUser.email);
        if (existingUser) {
          this.logger.warn(`⊘ Administrador ya existe: ${seedUser.email}`);
          skipCount++;
          continue;
        }

        const loginUserInput: LoginUserInput = {
          email: seedUser.email,
          username: seedUser.username,
          password: seedUser.password,
        };

        const createdUser = await this.usersService.create(loginUserInput);
        this.logger.log(`✓ Administrador creado: ${seedUser.email}`);

        // Asignar el rol
        await this.usersService.updateRole(seedUser.email, seedUser.role);
        this.logger.log(`✓ Rol asignado: ${seedUser.email} → ${seedUser.role}`);

        successCount++;
      } catch (error) {
        this.logger.error(`✗ Error con ${seedUser.email}: ${error.message}`);
      }
    }

    this.logger.log(`\n✅ Administradores creados: ${successCount} (saltados: ${skipCount})\n`);
  }
}
