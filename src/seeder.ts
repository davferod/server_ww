/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { SeederModule } from './seeder/seeder.module';
import { SeederService } from './seeder/seeder.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(SeederModule);
  const seederService = app.get(SeederService);

  // Obtener el flag del argumento de línea de comandos
  const args = process.argv.slice(2);
  const flag = args[0];

  console.log('\n' + '═'.repeat(60));
  console.log('🌱 Gym Tracker WW - Database Seeder');
  console.log('═'.repeat(60) + '\n');

  try {
    if (flag === '--all') {
      await seederService.seedUsers();
    } else if (flag === '--users') {
      await seederService.seedRegularUsers();
    } else if (flag === '--admin') {
      await seederService.seedAdmins();
    } else {
      console.log('❌ Flag no reconocido. Uso:');
      console.log('   --all     : Crea todos los usuarios');
      console.log('   --users   : Crea solo usuarios regulares');
      console.log('   --admin   : Crea solo administradores\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error durante seeding:', error.message);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
