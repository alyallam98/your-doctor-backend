export default () => ({
  NODE_ENV: process.env.NODE_ENV,
  database_url: process.env.DATABASE_URL,
  EMAIL_SERVICE: process.env.EMAIL_SERVICE,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
});
