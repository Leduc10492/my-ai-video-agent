param(
  [string]$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
)

$ErrorActionPreference = 'Stop'

function Get-Metadata {
  param([string]$Path)
  $text = Get-Content -Raw -Encoding UTF8 -LiteralPath $Path
  $meta = [ordered]@{}
  foreach ($line in ($text -split "`r?`n")) {
    if ($line -match '^# Artifact:\s*(.+)$') { $meta.Artifact = $Matches[1].Trim() }
    elseif ($line -match '^-\s*id:\s*(.+)$') { $meta.Id = $Matches[1].Trim() }
    elseif ($line -match '^-\s*version:\s*(v\d+)\s*$') { $meta.Version = $Matches[1].Trim() }
    elseif ($line -match '^-\s*upstream:\s*(.+)$') { $meta.Upstream = $Matches[1].Trim() }
    elseif ($line -eq '---') { break }
  }
  [pscustomobject]$meta
}

function Get-LatestVersionedFile {
  param([string]$Dir, [string]$Pattern)
  if (!(Test-Path -LiteralPath $Dir)) { return $null }
  $latest = $null
  foreach ($file in (Get-ChildItem -LiteralPath $Dir -File -Filter $Pattern -ErrorAction SilentlyContinue)) {
    if ($file.Name -match '_v(\d+)\.(md|html)$') {
      $versionNumber = [int]$Matches[1]
      if ($null -eq $latest -or $versionNumber -gt $latest.VersionNumber) {
        $latest = [pscustomobject]@{ File = $file; VersionNumber = $versionNumber }
      }
    }
  }
  $latest
}

$stages = @(
  @{ Stage='Script'; Dir='deliverables/10_story'; Pattern='01_script_v*.md'; Required=$true },
  @{ Stage='Audit'; Dir='deliverables/10_story'; Pattern='01_audit_report_v*.md'; Required=$false },
  @{ Stage='Asset Guide'; Dir='deliverables/20_guides'; Pattern='02_asset_guide_v*.md'; Required=$false },
  @{ Stage='Style Guide'; Dir='deliverables/20_guides'; Pattern='02_style_guide_v*.md'; Required=$false },
  @{ Stage='Shotlist Breakdown'; Dir='deliverables/30_breakdown'; Pattern='03_shotlist_breakdown_v*.md'; Required=$false },
  @{ Stage='Legacy Planning Input'; Dir='deliverables/30_breakdown'; Pattern='03_storyboard_v*.md'; Required=$false },
  @{ Stage='Shotlist HTML'; Dir='deliverables/60_motion'; Pattern='Shotlist_*_ZH_v*.html'; Required=$false }
)

$rows = foreach ($stage in $stages) {
  $dir = Join-Path $Root $stage.Dir
  $latest = Get-LatestVersionedFile -Dir $dir -Pattern $stage.Pattern
  if ($null -eq $latest) {
    [pscustomobject]@{
      Stage = $stage.Stage
      Status = $(if ($stage.Required) { 'Missing' } else { 'Optional Missing' })
      Version = ''
      Id = ''
      Upstream = ''
      File = ''
    }
    continue
  }

  $meta = if ($latest.File.Extension -eq '.md') { Get-Metadata -Path $latest.File.FullName } else { [pscustomobject]@{ Version="v$($latest.VersionNumber)"; Id=''; Upstream='' } }
  [pscustomobject]@{
    Stage = $stage.Stage
    Status = 'Ready'
    Version = $meta.Version
    Id = $meta.Id
    Upstream = $meta.Upstream
    File = $latest.File.FullName.Substring($Root.Length + 1)
  }
}

$rows | Format-Table -AutoSize

function Get-ReferenceMode {
  param([string]$ReadmePath)
  if (!(Test-Path -LiteralPath $ReadmePath)) { return '' }
  $text = Get-Content -Raw -Encoding UTF8 -LiteralPath $ReadmePath
  if ($text -match 'reference_mode:\s*`?([^`\r\n]+)`?') { return $Matches[1].Trim() }
  return ''
}

$assetRows = New-Object System.Collections.Generic.List[object]

$guideRefs = Join-Path $Root 'deliverables/20_guides/refs'
$assetRows.Add([pscustomobject]@{
  Stage = 'Guide Refs'
  Count = @(Get-ChildItem -LiteralPath $guideRefs -File -Include *.png,*.jpg,*.jpeg -ErrorAction SilentlyContinue).Count
  ReferenceMode = 'source'
  Dir = 'deliverables/20_guides/refs'
}) | Out-Null

foreach ($dir in @(Get-ChildItem -LiteralPath (Join-Path $Root 'deliverables/50_art') -Directory -Filter 'generated_ref*' -ErrorAction SilentlyContinue | Sort-Object Name)) {
  $assetRows.Add([pscustomobject]@{
    Stage = 'Generated References'
    Count = @(Get-ChildItem -LiteralPath $dir.FullName -File -Filter '*.png' -ErrorAction SilentlyContinue).Count
    ReferenceMode = Get-ReferenceMode -ReadmePath (Join-Path $dir.FullName 'README.md')
    Dir = $dir.FullName.Substring($Root.Length + 1)
  }) | Out-Null
}

foreach ($dir in @(Get-ChildItem -LiteralPath (Join-Path $Root 'deliverables/60_motion') -Directory -Filter 'shotlist_previews_*' -ErrorAction SilentlyContinue | Sort-Object Name)) {
  $assetRows.Add([pscustomobject]@{
    Stage = 'Shotlist Previews'
    Count = @(Get-ChildItem -LiteralPath $dir.FullName -File -Filter '*.png' -ErrorAction SilentlyContinue).Count
    ReferenceMode = Get-ReferenceMode -ReadmePath (Join-Path $dir.FullName 'manifest.md')
    Dir = $dir.FullName.Substring($Root.Length + 1)
  }) | Out-Null
}

Write-Host ''
Write-Host 'Generated/reference assets:' -ForegroundColor Cyan
$assetRows | Format-Table -AutoSize

$missingRequired = @($rows | Where-Object { $_.Status -eq 'Missing' })
if ($missingRequired.Count -gt 0) {
  Write-Host ''
  Write-Host 'Missing required stages:' -ForegroundColor Yellow
  $missingRequired | ForEach-Object { Write-Host "- $($_.Stage)" }
  exit 1
}

exit 0
