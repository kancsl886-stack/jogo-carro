param(
  [string]$Root = (Split-Path -Parent $PSScriptRoot)
)

$desktop = [Environment]::GetFolderPath("Desktop")
if (-not $desktop -or -not (Test-Path $desktop)) {
  $desktop = Join-Path $env:USERPROFILE "Desktop"
}
if (-not (Test-Path $desktop)) {
  $desktop = Join-Path $env:USERPROFILE "OneDrive\Desktop"
}

$play = Join-Path $Root "Jogar.bat"
$icon = Join-Path $Root "icons\nitro-surf.ico"
$linkPath = Join-Path $desktop "Nitro Surf.lnk"

if (-not (Test-Path $play)) {
  throw "Nao achei Jogar.bat em $Root"
}

$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($linkPath)
$shortcut.TargetPath = $play
$shortcut.WorkingDirectory = $Root
$shortcut.WindowStyle = 1
$shortcut.Description = "Nitro Surf - corrida infinita de carro"
if (Test-Path $icon) {
  $shortcut.IconLocation = $icon
}
$shortcut.Save()

Write-Output $linkPath
