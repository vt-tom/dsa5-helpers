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


def manifest_for(source, generation, version, channel='beta'):
    if generation not in (13, 14):
        raise ValueError('Only Foundry 13 and 14 are implemented')
    major = 0 if channel == 'beta' else generation - 6
    if channel not in ('beta', 'stable') or not re.fullmatch(rf'{major}\.\d+\.\d+', version):
        raise ValueError('Beta: 0.x.y; stable: 7.x.y for v13, 8.x.y for v14')
    result = copy.deepcopy(source)
    result['version'] = version
    result['compatibility'] = {'minimum': '13.351' if generation == 13 else '14.364', 'maximum': str(generation)}
    # v13 has source/static verification only; do not declare a live-verified build yet.
    if generation == 14:
        result['compatibility']['verified'] = source['compatibility']['verified']
    system = next(item for item in result['relationships']['systems'] if item['id'] == 'dsa5')
    system['compatibility'] = ({'minimum': '7.5.1', 'maximum': '7.5.1'} if generation == 13
                               else copy.deepcopy(system['compatibility']))
    if generation == 13:
        result['styles'] = [style for style in result['styles'] if not style.endswith('dsa5-helpers-mobile.css')]
    suffix = '-beta' if channel == 'beta' else ''
    base = result['url'].rstrip('/') + '/releases/download'
    result['manifest'] = f'{base}/foundry-v{generation}{suffix}/module.json'
    # v13-Betas teilen sich die Nummer mit der v14-Beta und bekommen deshalb ein eigenes Release v13-<Version>
    # (Branch v13, Job „v13“ in .github/workflows/release.yml, seit 0.6.2).
    tag = f'v13-{version}' if generation == 13 and channel == 'beta' else f'v{version}'
    result['download'] = f'{base}/{tag}/module-v{generation}{suffix}.zip'
    return result


def package(generation, version='0.6.2', channel='beta', output=None):
    source = json.loads((ROOT / 'module.json').read_text(encoding='utf-8'))
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
    parser.add_argument('--version', default='0.6.2')
    parser.add_argument('--channel', choices=('beta', 'stable'), default='beta')
    parser.add_argument('--output', metavar='DIR', help='Target folder (default .deploy/packages)')
    parser.add_argument('--install', metavar='DATA_PATH', help='Foundry Data folder, e.g. D:/FoundryVTT/user-data-paths/v13/Data')
    args = parser.parse_args()
    result = package(args.foundry, args.version, args.channel, args.output)
    if args.install:
        result['install'] = install(result['folder'], args.install)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    print('Package only, nothing published. Releases are built by .github/workflows/release.yml (v13 beta: job v13).')
