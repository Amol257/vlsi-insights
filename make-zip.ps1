# make-zip.ps1
# Creates a ZIP with forward-slash paths (ZIP spec compliant) for Netlify deployment.
# Uses .NET System.IO.Compression directly to control entry names.

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$sourceDir   = "c:\Users\acer\Desktop\Antigravity\VLSI Insights\Website"
$outZip      = "c:\Users\acer\Desktop\Antigravity\VLSI Insights\VLSI-Insights-Website.zip"
$backupZip   = "c:\Users\acer\Desktop\Antigravity\VLSI Insights\backups\VLSI-Insights-Website-v7.zip"

function New-ForwardSlashZip($sourceDir, $outPath) {
    # Remove existing file
    if (Test-Path $outPath) { Remove-Item $outPath -Force }

    $stream = [System.IO.File]::Open($outPath, [System.IO.FileMode]::Create)
    $archive = [System.IO.Compression.ZipArchive]::new($stream, [System.IO.Compression.ZipArchiveMode]::Create, $false)

    $sourceDir = (Resolve-Path $sourceDir).Path.TrimEnd('\')
    $files = Get-ChildItem -Path $sourceDir -Recurse -File

    foreach ($file in $files) {
        # Build forward-slash entry name relative to sourceDir
        $entryName = $file.FullName.Substring($sourceDir.Length + 1).Replace('\', '/')

        $entry = $archive.CreateEntry($entryName, [System.IO.Compression.CompressionLevel]::Optimal)
        $entryStream = $entry.Open()
        $fileStream  = [System.IO.File]::OpenRead($file.FullName)
        $fileStream.CopyTo($entryStream)
        $fileStream.Close()
        $entryStream.Close()
    }

    $archive.Dispose()
    $stream.Dispose()

    $size = [math]::Round((Get-Item $outPath).Length / 1MB, 2)
    Write-Host "Created: $outPath ($size MB, $($files.Count) files)"
}

New-ForwardSlashZip $sourceDir $outZip
New-ForwardSlashZip $sourceDir $backupZip

Write-Host "Done. Both ZIPs use forward-slash paths (Netlify-safe)."
