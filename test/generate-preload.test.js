'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const generatorPath = path.join(__dirname, '..', 'scripts', 'generate-preload.js');
const committedPreloadPath = path.join(__dirname, '..', 'preload.js');

function runGenerator() {
  const tmp = path.join(os.tmpdir(), `preload-regenerated-${Date.now()}-${Math.random().toString(36).slice(2)}.js`);
  execFileSync(process.execPath, [generatorPath], { env: { ...process.env, PRELOAD_PATH: tmp } });
  const content = fs.readFileSync(tmp, 'utf8');
  fs.unlinkSync(tmp);
  return content;
}

describe('generate-preload', () => {
  test('generated preload matches the committed preload', () => {
    expect(runGenerator()).toBe(fs.readFileSync(committedPreloadPath, 'utf8'));
  });

  test('generated preload exposes window.screenlogic service', () => {
    const generated = runGenerator();
    expect(generated).toContain('window.screenlogic');
  });

  test('generated preload requires screenlogic-service', () => {
    const generated = runGenerator();
    expect(generated).toContain("require('./src/screenlogic-service')");
  });
});
