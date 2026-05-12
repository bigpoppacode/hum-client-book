#!/usr/bin/env bash
set -e

echo "🧪 HUM Client Book QA Suite"
echo "================================"

if ! nc -z localhost 31912 2>/dev/null; then
  echo "⚠️  App not running on port 31912"
  echo "Starting app..."
  npm run dev &
  APP_PID=$!
  sleep 8
  NEED_CLEANUP=true
else
  echo "✓ App already running on port 31912"
  NEED_CLEANUP=false
fi

echo ""
echo "📊 Running unit tests..."
npm run test:unit -- --json --outputFile=qa/unit-results.json || true

echo ""
echo "🎭 Running E2E tests..."
npm run test:e2e -- || true

echo ""
echo "📝 Merging test results..."
node -e "
const fs = require('fs');
const path = require('path');
const unitPath = path.join('qa','unit-results.json');
const e2ePath = path.join('qa','e2e-results.json');
let unit = {};
let e2e = {};
try { unit = JSON.parse(fs.readFileSync(unitPath, 'utf8')); } catch (e) { unit = { testResults: [], numPassedTests: 0, numFailedTests: 0, numTotalTests: 0 }; }
try { e2e = JSON.parse(fs.readFileSync(e2ePath, 'utf8')); } catch (e) { e2e = { suites: [] }; }
fs.mkdirSync('qa', { recursive: true });
fs.writeFileSync(path.join('qa','results.json'), JSON.stringify({ unit, e2e }, null, 2));
"

echo ""
echo "📄 Generating HTML report..."
npx ts-node --project scripts/tsconfig.json scripts/generate-report.ts

if [ "$NEED_CLEANUP" = true ]; then
  echo ""
  echo "🧹 Cleaning up..."
  kill "$APP_PID" 2>/dev/null || true
fi

echo ""
echo "✅ QA Suite Complete!"
echo "Report: qa/report/index.html"
echo ""
if [ -f qa/unit-results.json ]; then
  node -e "const u=require('./qa/unit-results.json'); console.log('Jest:', u.numPassedTests||0,'passed,',u.numFailedTests||0,'failed,',u.numTotalTests||0,'total');" || true
fi

echo ""
echo "📤 Deploying to Surge..."
if command -v surge &> /dev/null; then
  cd qa/report && surge . hum-client-book-qa.surge.sh
  echo "✅ Report deployed: https://hum-client-book-qa.surge.sh"
else
  echo "⚠️  Surge not installed. Run: npm install -g surge"
  echo "Then deploy manually: cd qa/report && surge . hum-client-book-qa.surge.sh"
fi
