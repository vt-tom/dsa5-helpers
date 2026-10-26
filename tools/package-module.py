"""Create separate Foundry test packages; does not deploy or publish anything."""
import argparse
import copy
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
    result['download'] = f'{base}/v{version}/module-v{generation}{suffix}.zip'
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


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--foundry', type=int, required=True, choices=(13, 14))
    parser.add_argument('--version', default='0.6.2')
    parser.add_argument('--channel', choices=('beta', 'stable'), default='beta')
    args = parser.parse_args()
    print(json.dumps(package(args.foundry, args.version, args.channel), ensure_ascii=False, indent=2))
    print('Local package only. Generation-specific web/update links are reserved, not published.')
