$ErrorActionPreference='Stop'
$root=Split-Path $PSScriptRoot -Parent
Write-Output 'Vorschau: http://127.0.0.1:8877/modules/dsa5-helpers/clickdummy/index.html (Strg+C beendet)'
python (Join-Path $PSScriptRoot 'serve-clickdummy.py')
