#!/usr/bin/env ts-node

import { DataSource } from 'typeorm';
import databaseConfig from '../../config/database.config';
import { seedDatabase } from './seed';

async function runSeeder() {
  const config = databaseConfig();
  const dataSource = new DataSource(config as any);

  try {
    await dataSource.initialize();
    console.log('📦 Database connection established\n');

    await seedDatabase(dataSource);

    await dataSource.destroy();
    console.log('👋 Database connection closed\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

runSeeder();
