param(
  [string]$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
)

$ErrorActionPreference = 'Stop'

function Add-Issue {
  param(
    [System.Collections.Generic.List[object]]$Issues,
    [string]$Path,
    [string]$Severity,
    [string]$Issue
  )
  $Issues.Add([pscustomobject]@{ Path=$Path; Severity=$Severity; Issue=$Issue }) | Out-Null
}

function Get-TextValue {
  param([string]$Text, [string]$Key)
  $pattern = [regex]::Escape($Key) + ':\s*`?([^`\r\n]+)`?'
  if ($Text -match $pattern) { return $Matches[1].Trim() }
  return ''
}

function Get-RelativePath {
  param([string]$Path)
  return $Path.Substring($Root.Length + 1)
}

$issues = New-Object System.Collections.Generic.List[object]

$motionRoot = Join-Path $Root 'deliverables/60_motion'
if (!(Test-Path -LiteralPath $motionRoot)) {
  Write-Host 'No deliverables/60_motion directory found; no generated shotlist assets to validate.'
  exit 0
}

$htmlFiles = @(Get-ChildItem -LiteralPath $motionRoot -File -Filter 'Shotlist_*_ZH_v*.html' -ErrorAction SilentlyContinue)
foreach ($html in $htmlFiles) {
  $relHtml = Get-RelativePath -Path $html.FullName
  $htmlText = Get-Content -Raw -Encoding UTF8 -LiteralPath $html.FullName
  $promptIds = @([regex]::Matches($htmlText, '\bP\d{3}\b') | ForEach-Object { $_.Value } | Sort-Object -Unique)
  $imgSources = @([regex]::Matches($htmlText, '<img[^>]+src=["'']([^"'']+)["'']', 'IgnoreCase') | ForEach-Object { $_.Groups[1].Value })

  if ($promptIds.Count -eq 0) {
    Add-Issue $issues $relHtml 'P1' 'Shotlist HTML contains no P### prompt envelope IDs'
  }

  foreach ($src in $imgSources) {
    if ($src -match '^[a-zA-Z][a-zA-Z0-9+.-]*:' -or [System.IO.Path]::IsPathRooted($src)) {
      Add-Issue $issues $relHtml 'P1' "Preview image path should be relative: $src"
      continue
    }
    $resolved = Join-Path $html.DirectoryName $src
    if (!(Test-Path -LiteralPath $resolved)) {
      Add-Issue $issues $relHtml 'P1' "Preview image path does not exist: $src"
    }
  }
}

$previewDirs = @(Get-ChildItem -LiteralPath $motionRoot -Directory -Filter 'shotlist_previews_*' -ErrorAction SilentlyContinue)
foreach ($dir in $previewDirs) {
  $relDir = Get-RelativePath -Path $dir.FullName
  $manifest = Join-Path $dir.FullName 'manifest.md'
  if (!(Test-Path -LiteralPath $manifest)) {
    Add-Issue $issues $relDir 'P1' 'Preview directory missing manifest.md'
    continue
  }

  $manifestText = Get-Content -Raw -Encoding UTF8 -LiteralPath $manifest
  $referenceMode = Get-TextValue -Text $manifestText -Key 'reference_mode'
  if ([string]::IsNullOrWhiteSpace($referenceMode)) {
    Add-Issue $issues $relDir 'P1' 'Preview manifest missing reference_mode'
  }

  $manifestPromptIds = @([regex]::Matches($manifestText, '\bP\d{3}\b') | ForEach-Object { $_.Value } | Sort-Object -Unique)
  $pngCount = @(Get-ChildItem -LiteralPath $dir.FullName -File -Filter '*.png' -ErrorAction SilentlyContinue).Count
  if ($manifestPromptIds.Count -gt 0 -and $pngCount -gt 0 -and $manifestPromptIds.Count -ne $pngCount) {
    Add-Issue $issues $relDir 'P1' "Preview PNG count $pngCount does not match manifest prompt count $($manifestPromptIds.Count)"
  }
}

$generatedDirs = @(Get-ChildItem -LiteralPath (Join-Path $motionRoot 'generated') -Directory -ErrorAction SilentlyContinue)
foreach ($dir in $generatedDirs) {
  $relDir = Get-RelativePath -Path $dir.FullName
  $readme = Join-Path $dir.FullName 'README.md'
  if (!(Test-Path -LiteralPath $readme)) {
    Add-Issue $issues $relDir 'P1' 'Generated video test directory missing README.md manifest'
    continue
  }

  $readmeText = Get-Content -Raw -Encoding UTF8 -LiteralPath $readme
  if ($readmeText -notmatch '\bP\d{3}\b') {
    Add-Issue $issues $relDir 'P1' 'Generated video test manifest does not cite source P### envelope'
  }
  if ($readmeText -notmatch '(?i)reference[_ -]?mode|text_dna_draft|text_only_draft|prompt_only|image_reference_bound') {
    Add-Issue $issues $relDir 'P1' 'Generated video test manifest does not state reference mode'
  }
}

$refDirs = @(Get-ChildItem -LiteralPath (Join-Path $Root 'deliverables/50_art') -Directory -Filter 'generated_ref*' -ErrorAction SilentlyContinue)
foreach ($dir in $refDirs) {
  $relDir = Get-RelativePath -Path $dir.FullName
  $readme = Join-Path $dir.FullName 'README.md'
  if (!(Test-Path -LiteralPath $readme)) {
    Add-Issue $issues $relDir 'P1' 'Generated reference directory missing README.md manifest'
    continue
  }

  $readmeText = Get-Content -Raw -Encoding UTF8 -LiteralPath $readme
  $referenceMode = Get-TextValue -Text $readmeText -Key 'reference_mode'
  if ([string]::IsNullOrWhiteSpace($referenceMode)) {
    Add-Issue $issues $relDir 'P1' 'Generated reference manifest missing reference_mode'
  }
  if ($dir.Name -match '^generated_ref' -and $referenceMode -ne 'image_reference_bound') {
    Add-Issue $issues $relDir 'P2' "Generated reference set is not production-approved; reference_mode is $referenceMode"
  }
}

if ($issues.Count -eq 0) {
  Write-Host 'Generated shotlist asset validation passed.'
  exit 0
}

$issues | Format-Table -AutoSize
exit 1
