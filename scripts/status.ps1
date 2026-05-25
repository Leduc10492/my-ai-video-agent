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
  $files = Get-ChildItem -LiteralPath $Dir -File -Filter $Pattern
  $latest = $null
  foreach ($file in $files) {
    if ($file.Name -match '_v(\d+)\.md$') {
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
  @{ Stage='Asset Guide'; Dir='deliverables/20_guides'; Pattern='02_asset_guide_v*.md'; Required=$true },
  @{ Stage='Style Guide'; Dir='deliverables/20_guides'; Pattern='02_style_guide_v*.md'; Required=$true },
  @{ Stage='Storyboard'; Dir='deliverables/30_breakdown'; Pattern='03_storyboard_v*.md'; Required=$true },
  @{ Stage='Storyboard Prompts'; Dir='deliverables/40_boards'; Pattern='04_storyboard_prompts_v*.md'; Required=$true },
  @{ Stage='Art Prompts'; Dir='deliverables/50_art'; Pattern='05_art_prompts_v*.md'; Required=$true },
  @{ Stage='Video Prompts'; Dir='deliverables/60_motion'; Pattern='06_video_prompts_v*.md'; Required=$true }
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
  $meta = Get-Metadata -Path $latest.File.FullName
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

$imageRows = New-Object System.Collections.Generic.List[object]
$imageRows.Add([pscustomobject]@{
  Stage = 'Character Refs'
  Count = @(Get-ChildItem -LiteralPath (Join-Path $Root 'deliverables/20_guides/refs') -File -Include *.png,*.jpg,*.jpeg -ErrorAction SilentlyContinue).Count
  ReferenceMode = 'source'
  Dir = 'deliverables/20_guides/refs'
}) | Out-Null

foreach ($dir in @(Get-ChildItem -LiteralPath (Join-Path $Root 'deliverables/40_boards') -Directory -Filter 'generated*' -ErrorAction SilentlyContinue | Sort-Object Name)) {
  $imageRows.Add([pscustomobject]@{
    Stage = 'Storyboard Sheets'
    Count = @(Get-ChildItem -LiteralPath $dir.FullName -File -Filter '*.png' -ErrorAction SilentlyContinue).Count
    ReferenceMode = Get-ReferenceMode -ReadmePath (Join-Path $dir.FullName 'README.md')
    Dir = $dir.FullName.Substring($Root.Length + 1)
  }) | Out-Null
}

foreach ($dir in @(Get-ChildItem -LiteralPath (Join-Path $Root 'deliverables/50_art') -Directory -Filter 'generated*' -ErrorAction SilentlyContinue | Sort-Object Name)) {
  $imageRows.Add([pscustomobject]@{
    Stage = 'Art Keyframes'
    Count = @(Get-ChildItem -LiteralPath $dir.FullName -File -Filter '*.png' -ErrorAction SilentlyContinue).Count
    ReferenceMode = Get-ReferenceMode -ReadmePath (Join-Path $dir.FullName 'README.md')
    Dir = $dir.FullName.Substring($Root.Length + 1)
  }) | Out-Null
}

Write-Host ''
Write-Host 'Image assets:' -ForegroundColor Cyan
$imageRows | Format-Table -AutoSize

$missingRequired = @($rows | Where-Object { $_.Status -eq 'Missing' })
if ($missingRequired.Count -gt 0) {
  Write-Host ''
  Write-Host 'Missing required stages:' -ForegroundColor Yellow
  $missingRequired | ForEach-Object { Write-Host "- $($_.Stage)" }
  exit 1
}

exit 0
