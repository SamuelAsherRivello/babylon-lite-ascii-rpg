param([Parameter(Mandatory=$true)][string]$OutputDirectory)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$repo = (Resolve-Path (Join-Path $PSScriptRoot '../../..')).Path
Push-Location $repo
try {
  # Use the runtime recipe, not a second hand-maintained coordinate table.
  $recipes = node --input-type=module -e "import { getWallComposition } from './ascii-rpg/src/client/game-layer-babylon-lite/underground-wall-autotile.js'; console.log(JSON.stringify(Array.from({length:16},(_,i)=>getWallComposition(i))))" | ConvertFrom-Json
} finally { Pop-Location }
$source = [System.Drawing.Bitmap]::FromFile((Join-Path $repo 'ascii-rpg/public/assets/images/Dungeons-and-Pixels-v1.4/Tilesets/Tileset_Dungeon.png'))
$canvas = [System.Drawing.Bitmap]::new(1024,920)
$g = [System.Drawing.Graphics]::FromImage($canvas)
$font = [System.Drawing.Font]::new('Consolas', 12)
function Paint-Tile($mask, $x, $y, $scale, $plain=$false) {
  $pieces = $recipes[$mask]
  if ($plain) { $pieces = ,$pieces[0] }
  foreach ($piece in $pieces) {
    $g.DrawImage($source,[System.Drawing.Rectangle]::new($x+$piece[4]*$scale,$y+$piece[5]*$scale,$piece[2]*$scale,$piece[3]*$scale),$piece[0],$piece[1],$piece[2],$piece[3],[System.Drawing.GraphicsUnit]::Pixel)
  }
}
try {
  $g.Clear([System.Drawing.Color]::FromArgb(24,26,32))
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
  $g.DrawString('16 patterns: connected neighbors N=1 E=2 S=4 W=8', $font,[System.Drawing.Brushes]::White,10,5)
  for ($mask=0; $mask -lt 16; $mask++) {
    $x=10+($mask%8)*125; $y=30+[Math]::Floor($mask/8)*93
    Paint-Tile $mask $x $y 2
    $g.DrawString("mask $mask",$font,[System.Drawing.Brushes]::White,$x,$y+65)
  }
  $fixtures = @(
    @{name='Solid 4x4'; rows=@('1111','1111','1111','1111')},
    @{name='2x2'; rows=@('11','11')},
    @{name='Isolated'; rows=@('1')},
    @{name='Horizontal ends'; rows=@('1111')},
    @{name='Vertical ends'; rows=@('1','1','1','1')},
    @{name='T junction'; rows=@('111','010','010')},
    @{name='Concave'; rows=@('111','110','100')},
    @{name='Diagonal contact'; rows=@('10','01')},
    @{name='World border'; rows=@('1111','1110','1000','1000'); border=$true}
  )
  $g.DrawString('Each fixture: phase 1 left / composed phase 2 right', $font,[System.Drawing.Brushes]::White,10,222)
  for ($i=0; $i -lt $fixtures.Count; $i++) {
    $f=$fixtures[$i]; $ox=10+($i%3)*340; $oy=255+[Math]::Floor($i/3)*218
    $g.DrawString($f.name,$font,[System.Drawing.Brushes]::White,$ox,$oy)
    for ($y=0; $y -lt $f.rows.Count; $y++) {
      for ($x=0; $x -lt $f.rows[0].Length; $x++) {
        if ($f.rows[$y][$x] -ne '1') { continue }
        $mask=0
        foreach ($n in @(@(0,-1,1),@(1,0,2),@(0,1,4),@(-1,0,8))) {
          $nx=$x+$n[0]; $ny=$y+$n[1]
          $outside=$nx -lt 0 -or $ny -lt 0 -or $nx -ge $f.rows[0].Length -or $ny -ge $f.rows.Count
          if (($outside -and $f.border) -or (!$outside -and $f.rows[$ny][$nx] -eq '1')) { $mask=$mask -bor $n[2] }
        }
        Paint-Tile $mask ($ox+$x*32) ($oy+26+$y*32) 1 $true
        Paint-Tile $mask ($ox+164+$x*32) ($oy+26+$y*32) 1
      }
    }
  }
  $canvas.Save((Join-Path $OutputDirectory 'composed-wall-fixtures.png'))
} finally { $font.Dispose(); $g.Dispose(); $canvas.Dispose(); $source.Dispose() }
