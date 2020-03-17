require('dotenv').config();

module.exports = {
  'migrationDirectory': 'migrations',
  'driver': 'pg',
  'host': process.env.MIGRATION_DATABASE_HOST,
  'port': process.env.MIGRATION_DATABASE_PORT,
  'database': process.env.MIGRATION_DATABASE_NAME,
  'username': process.env.MIGRATION_DATABSE_USER,
  'password': process.env.MIGRATION_DATABASE_PASS,
  'connectionString': (process.env.NODE_ENV === 'text')
    ? process.env.TEST_DATABASE_URL
    : process.env.DATABASE_URL,
  'ssl': !!process.env.SSL
};
