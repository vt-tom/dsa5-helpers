"""Create separate Foundry test packages; optionally install one into a local Foundry data folder (never publishes)."""
import argparse
import copy
from datetime import datetime
import hashlib
import json
from pathlib import Path
import re
import shutil
import tempfile
import zipfile

ROOT = Path(__file__).resolve().parent.parent
RUNTIME = ('scripts', 'styles', 'templates', 'lang', 'LICENSE', 'README.md', 'CHANGELOG.md')


def line_of(generation):
    """Stable version line of a Foundry generation: 7.x.y for v13, 8.x.y for v14 (Nutzerentscheidung 26.10.2026)."""
    return generation - 6


def manifest_for(source, generation, version, channel='beta'):
    if generation not in (13, 14):
        raise ValueError('Only Foundry 13 and 14 are implemented')
    legacy = re.fullmatch(r'0\.\d+\.\d+', version) is not None
    # Bisherige Betas laufen im 0.x-Schema (nur Beta-Kanal). Versionen der Linie 7.x/8.x gibt es für beide Kanäle:
    # Das stabile ZIP zeigt auf foundry-v<gen>, das Beta-ZIP auf foundry-v<gen>-beta, damit Tester in ihrem Kanal bleiben.
    if channel not in ('beta', 'stable') or not (
            re.fullmatch(rf'{line_of(generation)}\.\d+\.\d+', version) or (legacy and channel == 'beta')):
        raise ValueError('Beta: 0.x.y or the line version; stable: 7.x.y for v13, 8.x.y for v14')
    result = copy.deepcopy(source)
    result['version'] = version
    result['compatibility'] = {'minimum': '13.351' if generation == 13 else '14.364', 'maximum': str(generation)}
    # v13 gilt als geprüft (Nutzerentscheidung 03.11.2026, nach Beta-Tests mit 0.6.2/0.6.3): Foundry 13.351, DSA5 7.5.1.
    result['compatibility']['verified'] = '13.351' if generation == 13 else source['compatibility']['verified']
    system = next(item for item in result['relationships']['systems'] if item['id'] == 'dsa5')
    system['compatibility'] = ({'minimum': '7.5.1', 'verified': '7.5.1', 'maximum': '7.5.1'} if generation == 13
                               else copy.deepcopy(system['compatibility']))
    if generation == 13:
        result['styles'] = [style for style in result['styles'] if not style.endswith('dsa5-helpers-mobile.css')]
    suffix = '-beta' if channel == 'beta' else ''
    base = result['url'].rstrip('/') + '/releases/download'
    result['manifest'] = f'{base}/foundry-v{generation}{suffix}/module.json'
    # v13-Betas im 0.x-Schema teilen sich die Nummer mit der v14-Beta und bekommen deshalb ein eigenes Release
    # v13-<Version> (Branch v13, Job „v13“ in .github/workflows/release.yml, seit 0.6.2). Ab 7.0.0/8.0.0 ist die
    # Nummer je Linie eindeutig, der Tag also einfach v<Version>.
    tag = f'v13-{version}' if generation == 13 and legacy else f'v{version}'
    result['download'] = f'{base}/{tag}/module-v{generation}{suffix}.zip'
    return result


def changelog_for(markdown, generation):
    """CHANGELOG.md ohne die Abschnitte der anderen Linie (## [8.x.y] fehlt im v13-Paket und umgekehrt).

    Das Changelog-Fenster im Modul zeigt alle Abschnitte bis zur installierten Version; ohne Filter sähe ein
    v14-Nutzer mit 8.0.0 auch die 7.x-Abschnitte. 0.x-Abschnitte und Vergleichslinks der eigenen Linie bleiben.
    """
    other = {13: '8', 14: '7'}[generation]
    kept, skip = [], False
    for line in markdown.splitlines(keepends=True):
        heading = re.match(r'^##\s+\[?(\d+)\.', line)
        if heading:
            skip = heading.group(1) == other
        elif line.startswith('## ') or line.startswith('['):
            skip = False
        if re.match(rf'^\[{other}\.\d+\.\d+\]:', line) or skip:
            continue
        kept.append(line)
    return ''.join(kept)


def package(generation, version=None, channel='beta', output=None):
    source = json.loads((ROOT / 'module.json').read_text(encoding='utf-8'))
    version = version or source['version']
    manifest = manifest_for(source, generation, version, channel)
    output = Path(output) if output else ROOT / '.deploy' / 'packages'
    output.mkdir(parents=True, exist_ok=True)
    destination = Path(tempfile.mkdtemp(prefix=f'v{generation}-{version}-{channel}-', dir=output))
    folder = destination / 'dsa5-helpers'
    folder.mkdir()
    for name in RUNTIME:
        source_path = ROOT / name
        if source_path.is_dir():
            shutil.copytree(source_path, folder / name)
        else:
            shutil.copy2(source_path, folder / name)
    changelog = (ROOT / 'CHANGELOG.md').read_text(encoding='utf-8')
    (folder / 'CHANGELOG.md').write_text(changelog_for(changelog, generation), encoding='utf-8', newline='')
    (folder / 'module.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    suffix = '-beta' if channel == 'beta' else ''
    archive = destination / f'module-v{generation}{suffix}.zip'
    with zipfile.ZipFile(archive, 'w', compression=zipfile.ZIP_DEFLATED) as handle:
        for entry in sorted(folder.rglob('*')):
            if entry.is_file():
                handle.write(entry, entry.relative_to(folder).as_posix())
    # Verify the finished archive and every file the manifest loads directly.
    with zipfile.ZipFile(archive) as handle:
        if handle.testzip() is not None or json.loads(handle.read('module.json')) != manifest:
            raise ValueError('Archive verification failed')
        for name in manifest['esmodules'] + manifest['styles']:
            if handle.read(name) != (ROOT / name).read_bytes():
                raise ValueError(f'Archive content mismatch: {name}')
    return {'folder': str(folder.resolve()), 'zip': str(archive.resolve()), 'manifest': str((folder / 'module.json').resolve())}


def _hashes(folder):
    folder = Path(folder)
    return {entry.relative_to(folder).as_posix(): hashlib.sha256(entry.read_bytes()).hexdigest()
            for entry in sorted(folder.rglob('*')) if entry.is_file()}


def install(folder, data_path, backup_root=Path('D:/FoundryBackups')):
    """Copy a finished package folder to <data_path>/modules/dsa5-helpers (Nutzerauftrag 2026-10-28, v13-Testwelt).

    Like tools/deploy-foundry.ps1: the old module folder is kept under <backup_root>/<stamp>/dsa5-helpers-v<gen>/
    previous-module, the new copy is checked by SHA-256, and on any error the old folder is restored. Links are refused,
    worlds and systems are not touched. Foundry itself is not restarted — reload the browser (F5) afterwards.
    """
    folder, modules = Path(folder), Path(data_path) / 'modules'
    if not modules.is_dir():
        raise ValueError(f'No Foundry modules folder: {modules}')
    target = modules / 'dsa5-helpers'
    if target.is_symlink() or target.is_junction():
        raise ValueError(f'Refusing to replace a link: {target}')
    generation = json.loads((folder / 'module.json').read_text(encoding='utf-8'))['compatibility']['maximum']
    backup = Path(backup_root) / datetime.now().strftime('%Y%m%d-%H%M%S') / f'dsa5-helpers-v{generation}' / 'previous-module'
    if target.exists():
        shutil.copytree(target, backup)
        if _hashes(backup) != _hashes(target):
            raise ValueError('Backup verification failed')
    staging = modules / '.dsa5-helpers-new'
    shutil.rmtree(staging, ignore_errors=True)
    shutil.copytree(folder, staging)
    try:
        if _hashes(staging) != _hashes(folder):
            raise ValueError('Copy verification failed')
        if target.exists():
            shutil.rmtree(target)
        staging.rename(target)
        if _hashes(target) != _hashes(folder):
            raise ValueError('Installed module differs from package')
    except Exception:
        shutil.rmtree(target, ignore_errors=True)
        if backup.exists():
            shutil.copytree(backup, target)
        raise
    finally:
        shutil.rmtree(staging, ignore_errors=True)
    return {'installed': str(target), 'backup': str(backup) if backup.exists() else None, 'files': len(_hashes(target))}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--foundry', type=int, required=True, choices=(13, 14))
    parser.add_argument('--version', help='Default: version in module.json')
    parser.add_argument('--channel', choices=('beta', 'stable'), default='beta')
    parser.add_argument('--output', metavar='DIR', help='Target folder (default .deploy/packages)')
    parser.add_argument('--install', metavar='DATA_PATH', help='Foundry Data folder, e.g. D:/FoundryVTT/user-data-paths/v13/Data')
    args = parser.parse_args()
    result = package(args.foundry, args.version, args.channel, args.output)
    if args.install:
        result['install'] = install(result['folder'], args.install)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    print('Package only, nothing published. Releases are built by .github/workflows/release.yml (v13 beta: job v13).')
