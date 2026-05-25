param(
  [string]$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
)

$ErrorActionPreference = 'Stop'

function Get-LatestVersionedFile {
  param([string]$Dir, [string]$Pattern)
  if (!(Test-Path -LiteralPath $Dir)) { return $null }
  $latest = $null
  foreach ($file in (Get-ChildItem -LiteralPath $Dir -File -Filter $Pattern)) {
    if ($file.Name -match '_v(\d+)\.md$') {
      $versionNumber = [int]$Matches[1]
      if ($null -eq $latest -or $versionNumber -gt $latest.VersionNumber) {
        $latest = [pscustomobject]@{ File = $file; VersionNumber = $versionNumber }
      }
    }
  }
  $latest
}

function Get-ReadmeValue {
  param([string]$Text, [string]$Key)
  $pattern = [regex]::Escape($Key) + ':\s*`?([^`\r\n]+)`?'
  if ($Text -match $pattern) { return $Matches[1].Trim() }
  return ''
}

function Add-Issue {
  param(
    [System.Collections.Generic.List[object]]$Issues,
    [string]$Path,
    [string]$Severity,
    [string]$Issue
  )
  $Issues.Add([pscustomobject]@{ Path=$Path; Severity=$Severity; Issue=$Issue }) | Out-Null
}

$issues = New-Object System.Collections.Generic.List[object]

$artPrompt = Get-LatestVersionedFile -Dir (Join-Path $Root 'deliverables/50_art') -Pattern '05_art_prompts_v*.md'
$expectedArtShots = 0
if ($null -ne $artPrompt) {
  $expectedArtShots = ([regex]::Matches((Get-Content -Raw -Encoding UTF8 -LiteralPath $artPrompt.File.FullName), '^### Shot \d{3}', 'Multiline')).Count
}

$artRoot = Join-Path $Root 'deliverables/50_art'
$artDirs = @(Get-ChildItem -LiteralPath $artRoot -Directory -Filter 'generated*' -ErrorAction SilentlyContinue)
if ($artDirs.Count -eq 0) {
  Write-Host 'No generated art directories found; treating this as a prompt-only or empty project state.'
}

foreach ($dir in $artDirs) {
  $relDir = $dir.FullName.Substring($Root.Length + 1)
  $readme = Join-Path $dir.FullName 'README.md'
  if (!(Test-Path -LiteralPath $readme)) {
    Add-Issue $issues $relDir 'P1' 'Generated directory missing README.md manifest'
    continue
  }

  $readmeText = Get-Content -Raw -Encoding UTF8 -LiteralPath $readme
  $referenceMode = Get-ReadmeValue -Text $readmeText -Key 'reference_mode'
  $declaredCountRaw = Get-ReadmeValue -Text $readmeText -Key 'image_count'
  $sourcePrompt = Get-ReadmeValue -Text $readmeText -Key 'source_prompt_artifact'
  $pngCount = @(Get-ChildItem -LiteralPath $dir.FullName -File -Filter '*.png').Count

  if ([string]::IsNullOrWhiteSpace($referenceMode)) {
    Add-Issue $issues $relDir 'P1' 'README missing reference_mode'
  }
  if ($declaredCountRaw -match '^\d+$' -and [int]$declaredCountRaw -ne $pngCount) {
    Add-Issue $issues $relDir 'P1' "README image_count $declaredCountRaw does not match png count $pngCount"
  }
  if (![string]::IsNullOrWhiteSpace($sourcePrompt)) {
    $sourcePath = Join-Path $Root $sourcePrompt
    if (!(Test-Path -LiteralPath $sourcePath)) {
      Add-Issue $issues $relDir 'P1' "source_prompt_artifact does not exist: $sourcePrompt"
    }
  }

  $isProductionArt = $dir.Name -match '^generated_ref'
  if ($isProductionArt) {
    if ($referenceMode -ne 'image_reference_bound') {
      Add-Issue $issues $relDir 'P0' "Production keyframes must use reference_mode image_reference_bound, got $referenceMode"
    }
    if ($expectedArtShots -gt 0 -and $pngCount -ne $expectedArtShots) {
      Add-Issue $issues $relDir 'P0' "Production keyframe count $pngCount does not match expected $expectedArtShots"
    }
    if ($expectedArtShots -gt 0) {
      for ($i = 1; $i -le $expectedArtShots; $i++) {
        $shot = '{0:D3}' -f $i
        $expected = Join-Path $dir.FullName "art_keyframe_shot_$shot`_ref_v1.png"
        if (!(Test-Path -LiteralPath $expected)) {
          Add-Issue $issues $relDir 'P0' "Missing production keyframe art_keyframe_shot_$shot`_ref_v1.png"
        }
      }
    }
  } elseif ($referenceMode -eq 'text_only_draft') {
    # Draft sets are allowed as review material and should not block production validation.
  }
}

$videoPrompt = Get-LatestVersionedFile -Dir (Join-Path $Root 'deliverables/60_motion') -Pattern '06_video_prompts_v*.md'
if ($null -ne $videoPrompt) {
  $videoRel = $videoPrompt.File.FullName.Substring($Root.Length + 1)
  $videoText = Get-Content -Raw -Encoding UTF8 -LiteralPath $videoPrompt.File.FullName
  $sourceMatches = @([regex]::Matches($videoText, '\*\*source_keyframe\*\*:\s*`([^`]+)`') | ForEach-Object { $_.Groups[1].Value })
  $isImageToVideo = $videoText -match '(?i)image-to-video|source_keyframe'
  if ($isImageToVideo) {
    if ($sourceMatches.Count -eq 0) {
      Add-Issue $issues $videoRel 'P0' 'Image-to-video prompt does not list source_keyframe entries'
    }
    if ($expectedArtShots -gt 0 -and $sourceMatches.Count -ne $expectedArtShots) {
      Add-Issue $issues $videoRel 'P0' "Video prompt v$($videoPrompt.VersionNumber) has $($sourceMatches.Count) source_keyframe entries, expected $expectedArtShots"
    }
    foreach ($source in $sourceMatches) {
      if ($source -match 'deliverables/50_art/generated/') {
        Add-Issue $issues $videoRel 'P0' "Video prompt references draft keyframe path: $source"
      }
      $sourcePath = Join-Path $Root $source
      if (!(Test-Path -LiteralPath $sourcePath)) {
        Add-Issue $issues $videoRel 'P0' "source_keyframe does not exist: $source"
      }
    }
  }
}

if ($issues.Count -eq 0) {
  Write-Host 'Generated asset validation passed.'
  exit 0
}

$issues | Format-Table -AutoSize
exit 1
