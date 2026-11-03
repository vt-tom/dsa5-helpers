"""Round-trip checks for the two installable packages, without Foundry or publishing."""
import hashlib
import importlib.util
import json
from pathlib import Path
import tempfile
import sys
import unittest
import zipfile

ROOT = Path(__file__).resolve().parent.parent
sys.dont_write_bytecode = True
spec = importlib.util.spec_from_file_location('package_module', ROOT / 'tools/package-module.py')
builder = importlib.util.module_from_spec(spec)
spec.loader.exec_module(builder)


class PackageTests(unittest.TestCase):
    def test_separate_archives_keep_identity_and_do_not_change_source(self):
        base = ROOT / 'module.json'
        before = hashlib.sha256(base.read_bytes()).hexdigest()
        temporary_root = ROOT / '.deploy' / 'package-tests'
        temporary_root.mkdir(parents=True, exist_ok=True)
        with tempfile.TemporaryDirectory(dir=temporary_root) as temporary:
            # Check the resolved cleanup target before TemporaryDirectory recursively removes it.
            self.assertTrue(Path(temporary).resolve().is_relative_to(temporary_root.resolve()))
            manifests = []
            for generation in (13, 14):
                artifact = builder.package(generation, output=temporary)
                with zipfile.ZipFile(artifact['zip']) as archive:
                    self.assertIsNone(archive.testzip())
                    manifest = json.loads(archive.read('module.json'))
                    manifests.append(manifest)
                    self.assertEqual(manifest['id'], 'dsa5-helpers')
                    self.assertEqual(manifest['version'], json.loads(base.read_text(encoding='utf-8'))['version'])
                    self.assertEqual(manifest['compatibility']['maximum'], str(generation))
                    self.assertNotIn('AGENTS.md', archive.namelist())
                    self.assertFalse(any(name.startswith(('tests/', 'clickdummy/', '.git/')) for name in archive.namelist()))
                    self.assertEqual(json.loads(Path(artifact['manifest']).read_text(encoding='utf-8')), manifest)
                    for name in manifest['esmodules'] + manifest['styles']:
                        self.assertEqual(archive.read(name), (ROOT / name).read_bytes())
            self.assertNotEqual(manifests[0]['manifest'], manifests[1]['manifest'])
            self.assertNotEqual(manifests[0]['download'], manifests[1]['download'])
            self.assertEqual(manifests[0]['compatibility']['verified'], '13.351')
            self.assertEqual(manifests[0]['relationships']['systems'][0]['compatibility']['verified'], '7.5.1')
            self.assertNotIn('styles/dsa5-helpers-mobile.css', manifests[0]['styles'])
            self.assertIn('styles/dsa5-helpers-mobile.css', manifests[1]['styles'])
        self.assertEqual(hashlib.sha256(base.read_bytes()).hexdigest(), before)

    def test_stable_versions_cannot_cross_generations(self):
        source = json.loads((ROOT / 'module.json').read_text(encoding='utf-8'))
        for generation, version in ((13, '7.0.0'), (14, '8.0.0')):
            manifest = builder.manifest_for(source, generation, version, 'stable')
            self.assertNotIn('-beta', manifest['manifest'])
            self.assertEqual(manifest['version'], version)
        for generation, version, channel in ((13, '8.0.0', 'stable'), (14, '7.0.0', 'stable'), (13, '8.0.0', 'beta'),
                                             (14, '0.6.4', 'stable'), (14, '8.0.0-beta', 'beta')):
            with self.assertRaises(ValueError):
                builder.manifest_for(source, generation, version, channel)

    def test_line_releases_keep_testers_in_their_channel(self):
        # 8.0.0/7.0.0: stabiles ZIP → foundry-v<gen>, Beta-ZIP → foundry-v<gen>-beta, beide am Tag v<Version>.
        source = json.loads((ROOT / 'module.json').read_text(encoding='utf-8'))
        base = 'https://github.com/vt-tom/dsa5-helpers/releases/download'
        for generation, version in ((13, '7.0.0'), (14, '8.0.0')):
            stable = builder.manifest_for(source, generation, version, 'stable')
            beta = builder.manifest_for(source, generation, version, 'beta')
            self.assertEqual(stable['manifest'], f'{base}/foundry-v{generation}/module.json')
            self.assertEqual(stable['download'], f'{base}/v{version}/module-v{generation}.zip')
            self.assertEqual(beta['manifest'], f'{base}/foundry-v{generation}-beta/module.json')
            self.assertEqual(beta['download'], f'{base}/v{version}/module-v{generation}-beta.zip')
        # Bisherige v13-Betas behalten ihren eigenen Tag.
        self.assertEqual(builder.manifest_for(source, 13, '0.6.3')['download'], f'{base}/v13-0.6.3/module-v13-beta.zip')

    def test_changelog_drops_the_other_line(self):
        markdown = ('# Changelog\n\n## [8.0.0] — x\n\n### Neu\n\n- v14\n\n## [7.0.0] — x\n\n- v13\n\n'
                    '## [0.6.3] — x\n\n- beide\n\n[8.0.0]: https://a\n[7.0.0]: https://b\n[0.6.3]: https://c\n')
        v13, v14 = builder.changelog_for(markdown, 13), builder.changelog_for(markdown, 14)
        self.assertNotIn('8.0.0', v13)
        self.assertNotIn('7.0.0', v14)
        for text, own in ((v13, '- v13'), (v14, '- v14')):
            self.assertIn(own, text)
            self.assertIn('- beide', text)
            self.assertIn('[0.6.3]: https://c', text)
        self.assertIn('### Neu', v14)



class InstallTest(unittest.TestCase):
    def test_install_backs_up_and_replaces_module(self):
        with tempfile.TemporaryDirectory() as tmp:
            tmp = Path(tmp)
            built = builder.package(13, output=tmp / 'out')
            data = tmp / 'Data'
            old = data / 'modules' / 'dsa5-helpers'
            old.mkdir(parents=True)
            (old / 'module.json').write_text('{"old": true}', encoding='utf-8')
            result = builder.install(built['folder'], data, backup_root=tmp / 'backups')
            self.assertEqual(builder._hashes(old), builder._hashes(built['folder']))
            self.assertEqual(json.loads((Path(result['backup']) / 'module.json').read_text(encoding='utf-8')), {'old': True})
            self.assertIn('dsa5-helpers-v13', result['backup'])
            self.assertFalse((data / 'modules' / '.dsa5-helpers-new').exists())

    def test_install_refuses_missing_modules_folder(self):
        with tempfile.TemporaryDirectory() as tmp:
            built = builder.package(13, output=Path(tmp) / 'out')
            with self.assertRaises(ValueError):
                builder.install(built['folder'], Path(tmp) / 'nothing', backup_root=Path(tmp) / 'backups')

if __name__ == '__main__':
    unittest.main()
