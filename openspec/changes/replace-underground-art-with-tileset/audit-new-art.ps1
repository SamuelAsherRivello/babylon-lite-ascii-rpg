param([Parameter(Mandatory=$true)][string]$OutputDirectory)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$path = Join-Path $PSScriptRoot '../../../ascii-rpg/public/assets/images/Dungeons-and-Pixels-v1.4/Tilesets/Tileset_Dungeon.png'
$source = [System.Drawing.Bitmap]::FromFile((Resolve-Path $path))
$canvas = [System.Drawing.Bitmap]::new(12*96,9*116)
$g = [System.Drawing.Graphics]::FromImage($canvas)
$font = [System.Drawing.Font]::new('Consolas', 10)
try {
  $g.Clear([System.Drawing.Color]::FromArgb(70,40,65))
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
  for ($row=0; $row -lt 9; $row++) {
    for ($col=0; $col -lt 12; $col++) {
      $g.DrawImage($source,[System.Drawing.Rectangle]::new($col*96,$row*116,96,96),$col*32,$row*32,32,32,[System.Drawing.GraphicsUnit]::Pixel)
      $g.DrawString("$($row*12+$col):$($col*32),$($row*32)",$font,[System.Drawing.Brushes]::White,$col*96,$row*116+97)
    }
  }
  $canvas.Save((Join-Path $OutputDirectory 'new-dungeon-contact.png'))
} finally { $font.Dispose(); $g.Dispose(); $canvas.Dispose(); $source.Dispose() }
