param([Parameter(Mandatory=$true)][string]$OutputDirectory)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$sourcePath = Join-Path $PSScriptRoot '../../../ascii-rpg/src/assets/underground/walls_floor.png'
$source = [System.Drawing.Bitmap]::FromFile((Resolve-Path $sourcePath))
$font = [System.Drawing.Font]::new('Consolas', 10)
try {
  foreach ($page in 0..2) {
    $firstRow = $page * 10
    $rowCount = [Math]::Min(10,29-$firstRow)
    $canvas = [System.Drawing.Bitmap]::new(17*68,$rowCount*88)
    $g = [System.Drawing.Graphics]::FromImage($canvas)
    $g.Clear([System.Drawing.Color]::FromArgb(35,45,40))
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
    for ($row=0; $row -lt $rowCount; $row++) {
      for ($col=0; $col -lt 17; $col++) {
        $sx=$col*16; $sy=($firstRow+$row)*16
        $g.DrawImage($source,[System.Drawing.Rectangle]::new($col*68,$row*88,64,64),$sx,$sy,16,16,[System.Drawing.GraphicsUnit]::Pixel)
        $g.DrawString("$sx,$sy",$font,[System.Drawing.Brushes]::White,$col*68,$row*88+65)
      }
    }
    $canvas.Save((Join-Path $OutputDirectory "wall-art-page-$page.png"))
    $g.Dispose(); $canvas.Dispose()
  }
  # Diagnostic only: the nine matching perimeter/face pieces are not a
  # complete cardinal family. Red squares explicitly mark unresolved masks.
  $frames = @{
    3=@(80,64); 6=@(80,16); 9=@(112,64); 12=@(112,16)
    7=@(80,32); 11=@(96,64); 13=@(112,32); 14=@(96,16); 15=@(96,32)
  }
  $fixtures = @(
    @{name='Solid block'; rows=@('1111','1111','1111','1111')},
    @{name='2x2'; rows=@('11','11')},
    @{name='Isolated'; rows=@('1')},
    @{name='Vertical strip / ends'; rows=@('1','1','1','1')},
    @{name='Horizontal strip / ends'; rows=@('1111')},
    @{name='T junction'; rows=@('111','010','010')},
    @{name='Concave corner'; rows=@('111','110','100')},
    @{name='Diagonal contacts'; rows=@('10','01')},
    @{name='World border'; rows=@('1111','1110','1000','1000'); border=$true}
  )
  $canvas = [System.Drawing.Bitmap]::new(900,900)
  $g = [System.Drawing.Graphics]::FromImage($canvas)
  $g.Clear([System.Drawing.Color]::FromArgb(35,45,40))
  $g.InterpolationMode=[System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
  $g.PixelOffsetMode=[System.Drawing.Drawing2D.PixelOffsetMode]::Half
  for ($f=0; $f -lt $fixtures.Count; $f++) {
    $fixture=$fixtures[$f]; $rows=$fixture.rows
    $ox=($f%3)*300+8; $oy=[Math]::Floor($f/3)*300+32
    $g.DrawString($fixture.name,$font,[System.Drawing.Brushes]::White,$ox,$oy-25)
    for($y=0;$y -lt $rows.Count;$y++) { for($x=0;$x -lt $rows[0].Length;$x++) {
      if($rows[$y][$x] -ne '1') { continue }
      $mask=0
      foreach($n in @(@(0,-1,1),@(1,0,2),@(0,1,4),@(-1,0,8))) {
        $nx=$x+$n[0]; $ny=$y+$n[1]
        $outside=$nx -lt 0 -or $ny -lt 0 -or $ny -ge $rows.Count -or $nx -ge $rows[0].Length
        if(($outside -and $fixture.border) -or (!$outside -and $rows[$ny][$nx] -eq '1')) { $mask=$mask -bor $n[2] }
      }
      if($frames.ContainsKey($mask)) {
        $xy=$frames[$mask]
        $g.DrawImage($source,[System.Drawing.Rectangle]::new($ox+$x*64,$oy+$y*64,64,64),$xy[0],$xy[1],16,16,[System.Drawing.GraphicsUnit]::Pixel)
      } else {
        $g.FillRectangle([System.Drawing.Brushes]::DarkRed,$ox+$x*64,$oy+$y*64,64,64)
        $g.DrawString("?$mask",$font,[System.Drawing.Brushes]::White,$ox+$x*64+14,$oy+$y*64+23)
      }
    }}
  }
  $canvas.Save((Join-Path $OutputDirectory 'wall-art-fixtures.png'))
  $g.Dispose(); $canvas.Dispose()
} finally { $font.Dispose(); $source.Dispose() }
