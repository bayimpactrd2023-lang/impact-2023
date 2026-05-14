#!/bin/bash

# R2 Setup Progress Tracker
# Run this to check your R2 setup progress

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         🎯 R2 SETUP PROGRESS TRACKER                           ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check functions
check_env_file() {
    if [ -f ".env.local" ]; then
        echo -e "${GREEN}✅${NC} .env.local file exists"
        return 0
    else
        echo -e "${RED}❌${NC} .env.local file missing"
        return 1
    fi
}

check_r2_url() {
    if grep -q "VITE_R2_PUBLIC_URL=" .env.local 2>/dev/null; then
        local url=$(grep "VITE_R2_PUBLIC_URL=" .env.local | cut -d'=' -f2)
        if [[ $url == *"XXXXX"* ]] || [ -z "$url" ]; then
            echo -e "${YELLOW}⚠️${NC}  VITE_R2_PUBLIC_URL has placeholder value"
            return 1
        else
            echo -e "${GREEN}✅${NC} VITE_R2_PUBLIC_URL is configured"
            return 0
        fi
    else
        echo -e "${RED}❌${NC} VITE_R2_PUBLIC_URL not found in .env.local"
        return 1
    fi
}

check_node_modules() {
    if [ -d "node_modules/@aws-sdk/client-s3" ]; then
        echo -e "${GREEN}✅${NC} @aws-sdk/client-s3 installed"
        return 0
    else
        echo -e "${YELLOW}⚠️${NC}  @aws-sdk/client-s3 not installed (run npm install)"
        return 1
    fi
}

check_r2_files() {
    if [ -f "src/utils/r2Upload.ts" ]; then
        echo -e "${GREEN}✅${NC} R2 upload utility exists"
        return 0
    else
        echo -e "${RED}❌${NC} R2 upload utility missing"
        return 1
    fi
}

# Run checks
echo "📋 Checking Prerequisites..."
echo ""

total=0
passed=0

((total++))
if check_r2_files; then ((passed++)); fi

((total++))
if check_node_modules; then ((passed++)); fi

echo ""
echo "📝 Checking Configuration..."
echo ""

((total++))
if check_env_file; then ((passed++)); fi

((total++))
if check_r2_url; then ((passed++)); fi

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                       📊 SUMMARY                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "  Progress: $passed/$total checks passed"
echo ""

if [ $passed -eq $total ]; then
    echo -e "  ${GREEN}🎉 READY TO GO!${NC}"
    echo ""
    echo "  Next steps:"
    echo "    1. Run: npm run verify:r2"
    echo "    2. Test by uploading an image in admin panel"
    echo "    3. Deploy to production"
    echo ""
elif [ $passed -ge 2 ]; then
    echo -e "  ${YELLOW}⚠️  ALMOST THERE!${NC}"
    echo ""
    echo "  Next steps:"
    echo "    1. Enable 'Public Development URL' in Cloudflare R2"
    echo "    2. Add VITE_R2_PUBLIC_URL to .env.local"
    echo "    3. Run this script again"
    echo ""
else
    echo -e "  ${RED}❌ SETUP REQUIRED${NC}"
    echo ""
    echo "  Next steps:"
    echo "    1. Read: R2_QUICK_SETUP.md"
    echo "    2. Follow the 5-minute setup guide"
    echo "    3. Run this script again"
    echo ""
fi

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    📚 DOCUMENTATION                             ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "  Quick Start:  R2_QUICK_SETUP.md"
echo "  Checklist:    R2_COMPLETE_CHECKLIST.md"
echo "  Full Guide:   R2_PUBLIC_ACCESS_SETUP.md"
echo "  Visual Guide: R2_VISUAL_GUIDE.txt"
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    💰 COST SAVINGS                              ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "  Without R2: \$2,772/month (10K users)"
echo "  With R2:    \$90/month (10K users)"
echo "  Savings:    \$2,682/month (97% reduction!) 🎉"
echo ""
