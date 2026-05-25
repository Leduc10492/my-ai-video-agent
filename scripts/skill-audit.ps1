param(
  [string]$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
)

$ErrorActionPreference = 'Stop'

$skillsRoot = Join-Path $Root '.agents/skills'
$agentsRoot = Join-Path $Root '.codex/agents'
$registryPath = Join-Path $Root '.agents/skill_registry.md'
$skillDirs = @(Get-ChildItem -LiteralPath $skillsRoot -Directory | Sort-Object Name)
$skillNames = @($skillDirs | Select-Object -ExpandProperty Name)
$issues = New-Object System.Collections.Generic.List[object]
$agentNames = @()
if (Test-Path -LiteralPath $agentsRoot) {
  $agentNames = @(
    Get-ChildItem -LiteralPath $agentsRoot -File -Filter *.toml -ErrorAction SilentlyContinue |
      ForEach-Object {
        $text = Get-Content -Raw -Encoding UTF8 -LiteralPath $_.FullName
        $nameMatch = [regex]::Match($text, '(?m)^name\s*=\s*"([^"]+)"')
        if ($nameMatch.Success) { $nameMatch.Groups[1].Value } else { $_.BaseName }
      }
  )
}

if (!(Test-Path -LiteralPath $agentsRoot)) {
  $issues.Add([pscustomobject]@{ File='.codex/agents'; Severity='P1'; Issue='Missing Codex custom agents directory' }) | Out-Null
} else {
  foreach ($agentFile in @(Get-ChildItem -LiteralPath $agentsRoot -File -Filter *.toml -ErrorAction SilentlyContinue | Sort-Object Name)) {
    $relAgent = $agentFile.FullName.Substring($Root.Length + 1)
    $text = Get-Content -Raw -Encoding UTF8 -LiteralPath $agentFile.FullName
    if ($text -notmatch '(?m)^name\s*=\s*"[^"]+"') {
      $issues.Add([pscustomobject]@{ File=$relAgent; Severity='P0'; Issue='Missing name field' }) | Out-Null
    }
    if ($text -notmatch '(?m)^description\s*=\s*"[^"]+"') {
      $issues.Add([pscustomobject]@{ File=$relAgent; Severity='P0'; Issue='Missing description field' }) | Out-Null
    }
    if ($text -notmatch '(?ms)^instructions\s*=\s*"""(.+?)"""') {
      $issues.Add([pscustomobject]@{ File=$relAgent; Severity='P0'; Issue='Missing instructions block' }) | Out-Null
    }
  }
}

foreach ($dir in $skillDirs) {
  $skillFile = Join-Path $dir.FullName 'SKILL.md'
  $relSkill = $skillFile.Substring($Root.Length + 1)
  if (!(Test-Path -LiteralPath $skillFile)) {
    $issues.Add([pscustomobject]@{ File=$relSkill; Severity='P0'; Issue='Missing SKILL.md' }) | Out-Null
    continue
  }

  $text = Get-Content -Raw -Encoding UTF8 -LiteralPath $skillFile
  if ($text -notmatch '(?ms)^---\s*\n.*?^name:\s*.+?\n.*?^description:\s*.+?\n.*?^---') {
    $issues.Add([pscustomobject]@{ File=$relSkill; Severity='P0'; Issue='Invalid frontmatter' }) | Out-Null
  }
  if ($text -match '(?m)^version:\s*') {
    $issues.Add([pscustomobject]@{ File=$relSkill; Severity='P1'; Issue='Frontmatter contains unsupported version key' }) | Out-Null
  }

  foreach ($match in [regex]::Matches($text, 'references/([A-Za-z0-9_.-]+)')) {
    $refPath = Join-Path $dir.FullName $match.Value
    if (!(Test-Path -LiteralPath $refPath)) {
      $issues.Add([pscustomobject]@{ File=$relSkill; Severity='P1'; Issue="Missing reference $($match.Value)" }) | Out-Null
    }
  }

  foreach ($match in [regex]::Matches($text, '`([a-z0-9]+(?:-[a-z0-9]+)+)`')) {
    $ref = $match.Groups[1].Value
    if ($ref -match '^A-\d{8}-\d{3}$' -or $ref -eq 'yyyymmdd-nnn') { continue }
    if ($skillNames -contains $ref -or $agentNames -contains $ref) { continue }
    $issues.Add([pscustomobject]@{ File=$relSkill; Severity='P2'; Issue="Backtick reference is not a known skill/agent: $ref" }) | Out-Null
  }
}

if (!(Test-Path -LiteralPath $registryPath)) {
  $issues.Add([pscustomobject]@{ File='.agents/skill_registry.md'; Severity='P1'; Issue='Missing skill assembly registry' }) | Out-Null
} else {
  $relRegistry = $registryPath.Substring($Root.Length + 1)
  $registryText = Get-Content -Raw -Encoding UTF8 -LiteralPath $registryPath
  foreach ($match in [regex]::Matches($registryText, '`([a-z0-9]+(?:-[a-z0-9]+)+)`')) {
    $ref = $match.Groups[1].Value
    if ($skillNames -contains $ref -or $agentNames -contains $ref) { continue }
    $issues.Add([pscustomobject]@{ File=$relRegistry; Severity='P1'; Issue="Registry reference is not a known skill/agent: $ref" }) | Out-Null
  }
}

if ($issues.Count -eq 0) {
  Write-Host 'Skill audit passed.'
  exit 0
}

$issues | Format-Table -AutoSize
exit 1
