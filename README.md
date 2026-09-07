# screenlogic-electron

An attempt to build an electron based frontend for the screenlogic.

## Development

```sh
npm install
npm run generate-preload   # regenerates preload.js (checked in)
npm start                  # run the app
npm test                   # run tests
```

## Packaging locally

```sh
npm run package:mac        # .dmg + .zip into dist/
npm run package:win        # .exe (NSIS) + .zip into dist/
npm run package:linux      # .AppImage + .deb into dist/
```

## CI

- **Build workflow** (`.github/workflows/build.yml`): runs on every push and pull request — install, generate preload, run tests.
- **Release workflow** (`.github/workflows/release.yml`): triggered by a `v*` git tag. Builds unsigned installers for macOS, Windows, and Linux and attaches them to a GitHub Release for that tag.

## Publishing a release

Releases are versioned with git tags. To publish:

```sh
npm version patch   # or minor / major; bumps package.json and creates a git tag
git push --tags     # triggers the Release workflow
```

The workflow builds for all three platforms and creates a GitHub Release (with auto-generated notes) at `https://github.com/mikemucc/screenlogic-electron/releases`.

Installers are unsigned for now; macOS/Windows may show OS warnings on first launch.