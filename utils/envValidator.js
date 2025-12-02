/**
 * Validates that all required environment variables are set
 * Call this before starting the server
 */
const validateEnv = () => {
  const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'JWT_EXPIRES_IN'];
  const missingVars = [];

  requiredEnvVars.forEach((varName) => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach((varName) => {
      console.error(`   - ${varName}`);
    });
    console.error('\nPlease create a .env file with the required variables.');
    console.error('See .env.example for reference.\n');
    process.exit(1);
  }

  // Warn if using default JWT_SECRET in production
  if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET === 'your-super-secret-jwt-key-change-this-in-production') {
    console.warn('⚠️  WARNING: Using default JWT_SECRET in production is insecure!');
    console.warn('   Please change JWT_SECRET to a strong, random value.\n');
  }

  // Warn about CORS wildcard in production
  if (process.env.NODE_ENV === 'production' && (!process.env.CORS_ORIGIN || process.env.CORS_ORIGIN === '*')) {
    console.warn('⚠️  WARNING: CORS_ORIGIN is set to wildcard (*) in production!');
    console.warn('   This is insecure. Please set CORS_ORIGIN to your specific frontend domain.\n');
  }

  console.log('✅ Environment variables validated');
};

module.exports = validateEnv;

