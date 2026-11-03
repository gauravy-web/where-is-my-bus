@echo off
cd /d "%~dp0"
npx jest tests/pickupFlowE2E.test.js --runInBand --verbose
