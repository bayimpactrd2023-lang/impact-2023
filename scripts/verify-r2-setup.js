#!/usr/bin/env node

/**
 * R2 Configuration Verification Script
 * Run this to verify your R2 setup is correct
 */

console.log('\n🔍 Verifying R2 Configuration...\n');

// Read environment variables
const config = {
  accountId: process.env.VITE_R2_ACCOUNT_ID,
  accessKeyId: process.env.VITE_R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.VITE_R2_SECRET_ACCESS_KEY,
  bucketName: process.env.VITE_R2_BUCKET_NAME,
  publicUrl: process.env.VITE_R2_PUBLIC_URL,
};

let hasErrors = false;

// Check each configuration
const checks = [
  {
    name: 'VITE_R2_ACCOUNT_ID',
    value: config.accountId,
    expected: '28eec24bb9bab22e118ae4ba787be7e2',
    required: true,
  },
  {
    name: 'VITE_R2_ACCESS_KEY_ID',
    value: config.accessKeyId,
    required: true,
    secret: true,
  },
  {
    name: 'VITE_R2_SECRET_ACCESS_KEY',
    value: config.secretAccessKey,
    required: true,
    secret: true,
  },
  {
    name: 'VITE_R2_BUCKET_NAME',
    value: config.bucketName,
    expected: 'impact-images',
    required: true,
  },
  {
    name: 'VITE_R2_PUBLIC_URL',
    value: config.publicUrl,
    required: true,
    validation: (val) => {
      if (!val) return 'Not set';
      if (val.includes('XXXXX')) return 'Still using placeholder URL';
      if (!val.startsWith('https://')) return 'Must start with https://';
      if (!val.includes('.r2.dev') && !val.includes('r2.cloudflarestorage.com')) {
        return 'Should be an R2.dev URL or custom domain';
      }
      return null;
    },
  },
];

// Run checks
checks.forEach((check) => {
  const { name, value, expected, required, secret, validation } = check;
  
  let status = '✅';
  let message = 'OK';
  
  if (!value) {
    if (required) {
      status = '❌';
      message = 'Missing (required)';
      hasErrors = true;
    } else {
      status = '⚠️ ';
      message = 'Not set (optional)';
    }
  } else if (expected && value !== expected) {
    status = '⚠️ ';
    message = `Expected: ${expected}, Got: ${value}`;
  } else if (validation) {
    const error = validation(value);
    if (error) {
      status = '❌';
      message = error;
      hasErrors = true;
    }
  }
  
  const displayValue = secret
    ? value ? '***' + value.slice(-4) : 'Not set'
    : value || 'Not set';
  
  console.log(`${status} ${name}`);
  console.log(`   Value: ${displayValue}`);
  if (message !== 'OK') {
    console.log(`   Status: ${message}`);
  }
  console.log();
});

// Summary
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

if (hasErrors) {
  console.log('❌ Configuration has errors!\n');
  console.log('📋 Next Steps:');
  console.log('1. Enable "Public Development URL" in Cloudflare R2 dashboard');
  console.log('2. Copy the R2.dev URL (e.g., https://pub-XXXXX.r2.dev)');
  console.log('3. Update your .env.local file with the correct values');
  console.log('4. Update Netlify environment variables');
  console.log('5. Run this script again to verify\n');
  console.log('📖 See R2_PUBLIC_ACCESS_SETUP.md for detailed instructions\n');
  process.exit(1);
} else {
  console.log('✅ All checks passed!\n');
  console.log('🎉 Your R2 configuration is ready!');
  console.log('🚀 New uploads will use R2 with FREE egress\n');
  console.log('💡 Next: Upload a test image in the admin panel\n');
  process.exit(0);
}
