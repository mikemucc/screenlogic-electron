'use strict';

// Ad-hoc sign the packaged macOS app.
//
// This project publishes unsigned releases (no Developer ID), so
// electron-builder either skips signing entirely (leaving a "code object is
// not signed at all" bundle) or leaves a broken linker-signed signature
// ("code has no resources but signature indicates they must be present").
// macOS reports either condition as "damaged or invalid" when the bundle is
// quarantined from a download. A clean ad-hoc signature makes
// `codesign --verify --deep --strict` pass and lets the user bypass Gatekeeper
// with `xattr -dr com.apple.quarantine`.
//
// This hook runs in `afterPack`, which fires for every target on every
// platform before DMG/zip creation. Only macOS produces an .app bundle, so we
// detect it by scanning the output directory and no-op on win/linux.
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports = async function afterPack(context) {
  const appOutDir = context.appOutDir;
  if (!appOutDir) {
    return;
  }

  const apps = fs
    .readdirSync(appOutDir)
    .filter((entry) => entry.endsWith('.app'))
    .map((entry) => path.join(appOutDir, entry));

  // No .app means a non-macOS target (or nothing to sign).
  if (apps.length === 0) {
    return;
  }

  for (const appPath of apps) {
    // --force --deep --sign - writes a valid ad-hoc signature for the whole
    // bundle, inside-out, overwriting whatever electron-builder produced.
    execFileSync('codesign', ['--force', '--deep', '--sign', '-', appPath], {
      stdio: 'inherit',
    });

    // Fail the build loudly if the signature did not become valid, rather than
    // shipping another "damaged" installer.
    execFileSync('codesign', ['--verify', '--deep', '--strict', appPath], {
      stdio: 'inherit',
    });
  }
};
