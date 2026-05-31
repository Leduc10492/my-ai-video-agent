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

function Get-Rel {
  param([string]$Path)
  return $Path.Substring($Root.Length + 1).Replace('\','/')
}

function Add-Issue {
  param(
    [System.Collections.Generic.List[object]]$Issues,
    [string]$File,
    [string]$Severity,
    [string]$Issue
  )
  $Issues.Add([pscustomobject]@{ File=$File; Severity=$Severity; Issue=$Issue }) | Out-Null
}

$allMarkdown = @()
if (Test-Path -LiteralPath (Join-Path $Root 'deliverables')) {
  $allMarkdown += Get-ChildItem -LiteralPath (Join-Path $Root 'deliverables') -Recurse -File -Filter *.md
}
if (Test-Path -LiteralPath (Join-Path $Root 'archives')) {
  $allMarkdown += Get-ChildItem -LiteralPath (Join-Path $Root 'archives') -Recurse -File -Filter *.md
}

$knownIds = New-Object System.Collections.Generic.HashSet[string]
foreach ($file in $allMarkdown) {
  $meta = Get-Metadata -Path $file.FullName
  if ($meta.Id -match '^A-\d{8}-\d{3}$') { [void]$knownIds.Add($meta.Id) }
}

$issues = New-Object System.Collections.Generic.List[object]
$productionPatterns = @(
  'deliverables/10_story/01_script_v*.md',
  'deliverables/10_story/01_audit_report_v*.md',
  'deliverables/20_guides/02_asset_guide_v*.md',
  'deliverables/20_guides/02_style_guide_v*.md',
  'deliverables/30_breakdown/03_shotlist_breakdown_v*.md'
)

$productionFiles = @()
foreach ($pattern in $productionPatterns) {
  $dir = Split-Path $pattern -Parent
  $filter = Split-Path $pattern -Leaf
  $fullDir = Join-Path $Root $dir
  if (Test-Path -LiteralPath $fullDir) {
    $productionFiles += Get-ChildItem -LiteralPath $fullDir -File -Filter $filter -ErrorAction SilentlyContinue
  }
}

foreach ($file in $productionFiles) {
  $rel = Get-Rel -Path $file.FullName
  $text = Get-Content -Raw -Encoding UTF8 -LiteralPath $file.FullName
  $meta = Get-Metadata -Path $file.FullName

  if (!$meta.Artifact) { Add-Issue $issues $rel 'P0' 'Missing # Artifact line' }
  if ($meta.Id -notmatch '^A-\d{8}-\d{3}$') { Add-Issue $issues $rel 'P0' 'Invalid or missing artifact id' }
  if ($meta.Version -notmatch '^v\d+$') { Add-Issue $issues $rel 'P0' 'Invalid or missing version' }

  if ($file.Name -notmatch '_v(\d+)\.md$') {
    Add-Issue $issues $rel 'P0' 'Filename missing _v{N}.md suffix'
  } else {
    $filenameVersion = "v$($Matches[1])"
    if ($meta.Version -and $meta.Version -ne $filenameVersion) {
      Add-Issue $issues $rel 'P0' "Frontmatter version $($meta.Version) does not match filename $filenameVersion"
    }
  }

  foreach ($upstreamId in (Get-UpstreamIds -Raw $meta.Upstream)) {
    if (!$knownIds.Contains($upstreamId)) {
      Add-Issue $issues $rel 'P1' "Unknown upstream id $upstreamId"
    }
  }

  foreach ($imageLink in (Get-MarkdownImageLinks -Text $text)) {
    if (Test-ExternalLink -Link $imageLink) { continue }
    if ($imageLink.StartsWith('#')) { continue }
    $withoutAnchor = ($imageLink -split '#')[0]
    $resolved = Join-Path $file.DirectoryName $withoutAnchor
    if (!(Test-Path -LiteralPath $resolved)) {
      Add-Issue $issues $rel 'P1' "Markdown image reference does not exist: $imageLink"
    }
  }
}

if ($issues.Count -eq 0) {
  Write-Host 'Artifact validation passed.'
  exit 0
}

$issues | Format-Table -AutoSize
exit 1
