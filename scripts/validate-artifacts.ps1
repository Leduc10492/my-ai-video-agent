param(
  [string]$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
)

$ErrorActionPreference = 'Stop'

function Get-Metadata {
  param([string]$Path)
  $text = Get-Content -Raw -Encoding UTF8 -LiteralPath $Path
  $meta = [ordered]@{ Artifact=''; Id=''; Version=''; Upstream='' }
  foreach ($line in ($text -split "`r?`n")) {
    if ($line -match '^# Artifact:\s*(.+)$') { $meta.Artifact = $Matches[1].Trim() }
    elseif ($line -match '^-\s*id:\s*(.+)$') { $meta.Id = $Matches[1].Trim() }
    elseif ($line -match '^-\s*version:\s*(v\d+)\s*$') { $meta.Version = $Matches[1].Trim() }
    elseif ($line -match '^-\s*upstream:\s*(.+)$') { $meta.Upstream = $Matches[1].Trim() }
    elseif ($line -eq '---') { break }
  }
  [pscustomobject]$meta
}

function Get-UpstreamIds {
  param([string]$Raw)
  if ([string]::IsNullOrWhiteSpace($Raw) -or $Raw.Trim() -eq '[]') { return @() }
  return @([regex]::Matches($Raw, 'A-\d{8}-\d{3}') | ForEach-Object { $_.Value } | Sort-Object -Unique)
}

function Get-MarkdownImageLinks {
  param([string]$Text)
  return @([regex]::Matches($Text, '!\[[^\]]*\]\(([^)]+)\)') | ForEach-Object { $_.Groups[1].Value.Trim() })
}

function Test-ExternalLink {
  param([string]$Link)
  return ($Link -match '^[a-zA-Z][a-zA-Z0-9+.-]*:')
}

$allMarkdown = @(
  Get-ChildItem -LiteralPath (Join-Path $Root 'deliverables') -Recurse -File -Filter *.md
  if (Test-Path -LiteralPath (Join-Path $Root 'archives')) {
    Get-ChildItem -LiteralPath (Join-Path $Root 'archives') -Recurse -File -Filter *.md
  }
)

$knownIds = New-Object System.Collections.Generic.HashSet[string]
foreach ($file in $allMarkdown) {
  $meta = Get-Metadata -Path $file.FullName
  if ($meta.Id -match '^A-\d{8}-\d{3}$') { [void]$knownIds.Add($meta.Id) }
}

$issues = New-Object System.Collections.Generic.List[object]
$productionFiles = Get-ChildItem -LiteralPath (Join-Path $Root 'deliverables') -Recurse -File -Filter *.md |
  Where-Object { $_.FullName -notmatch '\\00_admin\\' -and $_.FullName -notmatch '\\generated\\' }

foreach ($file in $productionFiles) {
  $rel = $file.FullName.Substring($Root.Length + 1)
  $text = Get-Content -Raw -Encoding UTF8 -LiteralPath $file.FullName
  $meta = Get-Metadata -Path $file.FullName

  if (!$meta.Artifact) { $issues.Add([pscustomobject]@{ File=$rel; Severity='P0'; Issue='Missing # Artifact line' }) | Out-Null }
  if ($meta.Id -notmatch '^A-\d{8}-\d{3}$') { $issues.Add([pscustomobject]@{ File=$rel; Severity='P0'; Issue='Invalid or missing artifact id' }) | Out-Null }
  if ($meta.Version -notmatch '^v\d+$') { $issues.Add([pscustomobject]@{ File=$rel; Severity='P0'; Issue='Invalid or missing version' }) | Out-Null }

  if ($file.Name -notmatch '_v(\d+)\.md$') {
    $issues.Add([pscustomobject]@{ File=$rel; Severity='P0'; Issue='Filename missing _v{N}.md suffix' }) | Out-Null
  } else {
    $filenameVersion = "v$($Matches[1])"
    if ($meta.Version -and $meta.Version -ne $filenameVersion) {
      $issues.Add([pscustomobject]@{ File=$rel; Severity='P0'; Issue="Frontmatter version $($meta.Version) does not match filename $filenameVersion" }) | Out-Null
    }
  }

  foreach ($upstreamId in (Get-UpstreamIds -Raw $meta.Upstream)) {
    if (!$knownIds.Contains($upstreamId)) {
      $issues.Add([pscustomobject]@{ File=$rel; Severity='P1'; Issue="Unknown upstream id $upstreamId" }) | Out-Null
    }
  }

  foreach ($imageLink in (Get-MarkdownImageLinks -Text $text)) {
    if (Test-ExternalLink -Link $imageLink) { continue }
    if ($imageLink.StartsWith('#')) { continue }
    $withoutAnchor = ($imageLink -split '#')[0]
    $resolved = Join-Path $file.DirectoryName $withoutAnchor
    if (!(Test-Path -LiteralPath $resolved)) {
      $issues.Add([pscustomobject]@{ File=$rel; Severity='P1'; Issue="Markdown image reference does not exist: $imageLink" }) | Out-Null
    }
  }
}

if ($issues.Count -eq 0) {
  Write-Host 'Artifact validation passed.'
  exit 0
}

$issues | Format-Table -AutoSize
exit 1
