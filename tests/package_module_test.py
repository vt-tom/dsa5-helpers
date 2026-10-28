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
                    self.assertEqual(manifest['version'], '0.6.2')
                    self.assertEqual(manifest['compatibility']['maximum'], str(generation))
                    self.assertNotIn('AGENTS.md', archive.namelist())
                    self.assertFalse(any(name.startswith(('tests/', 'clickdummy/', '.git/')) for name in archive.namelist()))
                    self.assertEqual(json.loads(Path(artifact['manifest']).read_text(encoding='utf-8')), manifest)
                    for name in manifest['esmodules'] + manifest['styles']:
                        self.assertEqual(archive.read(name), (ROOT / name).read_bytes())
            self.assertNotEqual(manifests[0]['manifest'], manifests[1]['manifest'])
            self.assertNotEqual(manifests[0]['download'], manifests[1]['download'])
            self.assertNotIn('verified', manifests[0]['compatibility'])
            self.assertNotIn('styles/dsa5-helpers-mobile.css', manifests[0]['styles'])
            self.assertIn('styles/dsa5-helpers-mobile.css', manifests[1]['styles'])
        self.assertEqual(hashlib.sha256(base.read_bytes()).hexdigest(), before)

    def test_stable_versions_cannot_cross_generations(self):
        source = json.loads((ROOT / 'module.json').read_text(encoding='utf-8'))
        for generation, version in ((13, '7.0.0'), (14, '8.0.0')):
            manifest = builder.manifest_for(source, generation, version, 'stable')
            self.assertNotIn('-beta', manifest['manifest'])
            self.assertEqual(manifest['version'], version)
        for generation, version, channel in ((13, '8.0.0', 'stable'), (14, '7.0.0', 'stable'), (13, '7.0.0', 'beta')):
            with self.assertRaises(ValueError):
                builder.manifest_for(source, generation, version, channel)



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
