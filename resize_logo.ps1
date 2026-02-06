
Add-Type -AssemblyName System.Drawing
$path = "C:\Users\Soriano\Documents\gerador_encartes\navas\assets\navas-logo.jpg"
if (Test-Path $path) {
    $img = [System.Drawing.Image]::FromFile($path)
    $newImg = new-object System.Drawing.Bitmap(256, 256)
    $g = [System.Drawing.Graphics]::FromImage($newImg)
    $g.DrawImage($img, 0, 0, 256, 256)
    $img.Dispose()
    $newImg.Save($path, [System.Drawing.Imaging.ImageFormat]::Jpeg)
    $newImg.Dispose()
    $g.Dispose()
    Write-Host "Image resized successfully to 256x256"
} else {
    Write-Error "Image file not found at $path"
    exit 1
}
