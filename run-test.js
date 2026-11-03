#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');

const jestPath = path.join(__dirname, 'node_modules', 'jest', 'bin', 'jest.js');
const testFile = process.argv[2] || 'tests/attendanceController.test.js';

const jest = spawn('node', [jestPath, testFile, '--verbose', '--runInBand'], {
  cwd: __dirname,
  stdio: 'inherit'
});

jest.on('close', (code) => {
  process.exit(code);
});
