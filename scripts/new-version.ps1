param(
  [Parameter(Mandatory=$true)]
  [string]$CurrentPath,

  [Parameter(Mandatory=$true)]
  [string]$SourcePath,

  [string]$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path,

  [switch]$Force
)

$ErrorActionPreference = 'Stop'

$rootResolved = (Resolve-Path -LiteralPath $Root).Path
$currentResolved = (Resolve-Path -LiteralPath (Join-Path $Root $CurrentPath)).Path
$sourceResolved = (Resolve-Path -LiteralPath (Join-Path $Root $SourcePath)).Path

if (!$currentResolved.StartsWith((Join-Path $rootResolved 'deliverables'), [System.StringComparison]::OrdinalIgnoreCase)) {
  throw "CurrentPath must be inside deliverables/: $CurrentPath"
}

if ($currentResolved -notmatch '_v(\d+)\.md$') {
  throw "CurrentPath must use _v{N}.md naming: $CurrentPath"
}

$currentVersionNumber = [int]$Matches[1]
$nextVersionNumber = $currentVersionNumber + 1
$nextVersion = "v$nextVersionNumber"
$currentFile = Get-Item -LiteralPath $currentResolved
$nextName = $currentFile.Name -replace '_v\d+\.md$', "_$nextVersion.md"
$currentDir = Split-Path $currentResolved -Parent
$nextPath = Join-Path $currentDir $nextName

$relativeCurrentDir = $currentDir.Substring((Join-Path $rootResolved 'deliverables').Length).TrimStart('\','/')
$archiveDir = Join-Path (Join-Path $rootResolved 'archives') $relativeCurrentDir
$archivePath = Join-Path $archiveDir $currentFile.Name

if ((Test-Path -LiteralPath $archivePath) -and !$Force) {
  throw "Archive target already exists. Use -Force to overwrite: $archivePath"
}

if (Test-Path -LiteralPath $nextPath) {
  throw "Next version already exists: $nextPath"
}

New-Item -ItemType Directory -Force -Path $archiveDir | Out-Null
Move-Item -LiteralPath $currentResolved -Destination $archivePath -Force:$Force

$content = Get-Content -Raw -Encoding UTF8 -LiteralPath $sourceResolved
$content = $content -replace '(?m)^-\s*version:\s*v\d+\s*$', "- version: $nextVersion"
Set-Content -Encoding UTF8 -LiteralPath $nextPath -Value $content

[pscustomobject]@{
  Archived = $archivePath.Substring($rootResolved.Length + 1)
  Current = $nextPath.Substring($rootResolved.Length + 1)
  Version = $nextVersion
}
