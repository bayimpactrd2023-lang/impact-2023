#!/bin/bash
# =====================================================
# IMPACT R&D - Supabase Edge Function Deployment Script
# =====================================================
# This script deploys the server Edge Function to your Supabase project
# 
# Prerequisites:
# 1. Supabase CLI installed (npm install -g supabase)
# 2. You're logged in to Supabase CLI (supabase login)
# 3. Your project reference ID (from dashboard)
#
# Usage:
#   ./deploy-edge-function.sh <project-ref>
#
# Example:
#   ./deploy-edge-function.sh itwdgcubpfuuacumgylb
# =====================================================

set -e

PROJECT_REF=$1

if [ -z "$PROJECT_REF" ]; then
    echo "❌ Error: Project reference ID is required"
    echo "Usage: ./deploy-edge-function.sh <project-ref>"
    echo ""
    echo "Find your project ref in Supabase Dashboard → Project Settings → General"
    echo "Example: itwdgcubpfuuacumgylb"
    exit 1
fi

echo "🚀 Deploying Edge Function to project: $PROJECT_REF"
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    npm install -g supabase
fi

# Check if user is logged in
if ! supabase projects list &> /dev/null; then
    echo "🔑 Please login to Supabase CLI first:"
    echo "   supabase login"
    exit 1
fi

echo "📁 Checking Edge Function files..."
if [ ! -f "supabase/functions/server/index.tsx" ]; then
    echo "❌ Edge Function not found at supabase/functions/server/index.tsx"
    exit 1
fi

echo "🔗 Linking to project: $PROJECT_REF"
supabase link --project-ref "$PROJECT_REF"

echo ""
echo "🔧 Setting Edge Function secrets..."
echo "   You will need:"
echo "   - R2_WORKER_URL (from Cloudflare Worker)"
echo "   - R2_WORKER_TOKEN (from Cloudflare Worker)"
echo "   - SUPABASE_ANON_KEY (from Supabase Dashboard → Project Settings → API → anon/public key)"
echo "   - INTERNAL_SERVICE_ROLE_KEY (from Supabase Dashboard → Project Settings → API → service_role key)"
echo ""

read -p "Enter R2_WORKER_URL: " R2_WORKER_URL
read -p "Enter R2_WORKER_TOKEN: " R2_WORKER_TOKEN
read -p "Enter SUPABASE_ANON_KEY (anon key): " ANON_KEY
read -p "Enter INTERNAL_SERVICE_ROLE_KEY (service_role key): " SERVICE_ROLE_KEY

echo ""
echo "📝 Setting secrets..."
supabase secrets set R2_WORKER_URL="$R2_WORKER_URL" --project-ref "$PROJECT_REF"
supabase secrets set R2_WORKER_TOKEN="$R2_WORKER_TOKEN" --project-ref "$PROJECT_REF"
supabase secrets set SUPABASE_ANON_KEY="$ANON_KEY" --project-ref "$PROJECT_REF"
supabase secrets set INTERNAL_SERVICE_ROLE_KEY="$SERVICE_ROLE_KEY" --project-ref "$PROJECT_REF"
supabase secrets set SUPABASE_URL="https://$PROJECT_REF.supabase.co" --project-ref "$PROJECT_REF"

echo ""
echo "📤 Deploying Edge Function..."
supabase functions deploy server --project-ref "$PROJECT_REF"

echo ""
echo "✅ Edge Function deployed successfully!"
echo ""
echo "🔗 Function URL: https://$PROJECT_REF.supabase.co/functions/v1/server"
echo ""
echo "🧪 Test the function:"
echo "   curl https://$PROJECT_REF.supabase.co/functions/v1/server/health"
echo ""
echo "📋 Next steps:"
echo "   1. Create Storage buckets (run supabase_storage_setup.sql in SQL Editor)"
echo "   2. Apply database schema (run database_schema.sql in SQL Editor)"
echo "   3. Make your user an admin (see make-user-admin.sql)"
echo "   4. Restart your dev server and test uploads"
