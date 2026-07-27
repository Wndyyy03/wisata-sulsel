# bulkUploadDestinationImages.ps1
#
# Upload BANYAK gambar sekaligus buat destinasi yang belum ada gambarnya,
# TANPA perlu lewat Swagger satu-satu.
#
# CARA PAKAI:
#   1. Kumpulkan semua gambar di 1 folder.
#   2. Beri nama tiap file SESUAI SLUG destinasinya, contoh:
#        air-terjun-cambang-cui.jpg
#        bukit-rumbia-bantaeng.jpg
#      (Slug bisa dilihat dari field "slug" di response GET /destinations,
#       atau kira-kira: nama destinasi huruf kecil semua, spasi jadi "-")
#   3. Jalankan:
#        .\bulkUploadDestinationImages.ps1 -FolderPath "C:\path\ke\folder-gambar"
#
# Skrip ini otomatis: cocokkan file -> destinasi (via slug, fallback ke nama),
# upload ke MinIO lewat endpoint backend, update field "images", dan kasih
# laporan lengkap di akhir (berhasil / gagal / tidak ketemu pasangannya).

param(
  [Parameter(Mandatory=$true)][string]$FolderPath,
  [string]$ApiBaseUrl = "http://localhost:5000/api"
)

function Normalize-Slug([string]$text) {
  $t = $text.ToLower()
  $t = $t -replace "[^a-z0-9\s-]", ""
  $t = $t -replace "\s+", "-"
  $t = $t -replace "-+", "-"
  return $t.Trim("-")
}

function Send-ImageUpload([string]$FilePath, [string]$UploadUrl) {
  $fileBytes = [System.IO.File]::ReadAllBytes($FilePath)
  $fileName = [System.IO.Path]::GetFileName($FilePath)
  $boundary = [System.Guid]::NewGuid().ToString()
  $LF = "`r`n"

  $bodyLines = "--$boundary$LF" +
    "Content-Disposition: form-data; name=`"file`"; filename=`"$fileName`"$LF" +
    "Content-Type: application/octet-stream$LF$LF"
  $bodyLinesEnd = "$LF--$boundary--$LF"

  $bodyStart = [System.Text.Encoding]::UTF8.GetBytes($bodyLines)
  $bodyEnd = [System.Text.Encoding]::UTF8.GetBytes($bodyLinesEnd)
  $bodyBytes = New-Object byte[] ($bodyStart.Length + $fileBytes.Length + $bodyEnd.Length)
  [Array]::Copy($bodyStart, 0, $bodyBytes, 0, $bodyStart.Length)
  [Array]::Copy($fileBytes, 0, $bodyBytes, $bodyStart.Length, $fileBytes.Length)
  [Array]::Copy($bodyEnd, 0, $bodyBytes, $bodyStart.Length + $fileBytes.Length, $bodyEnd.Length)

  return Invoke-RestMethod -Uri $UploadUrl -Method POST -ContentType "multipart/form-data; boundary=$boundary" -Body $bodyBytes
}

if (-not (Test-Path $FolderPath)) {
  Write-Host "Folder tidak ditemukan: $FolderPath" -ForegroundColor Red
  exit 1
}

Write-Host "Mengambil daftar destinasi dari API..." -ForegroundColor Cyan
$destRaw = Invoke-RestMethod -Uri "$ApiBaseUrl/destinations" -Method GET
$destinations = if ($destRaw -is [System.Array]) { $destRaw } elseif ($destRaw.data) { $destRaw.data } else { @($destRaw) }
Write-Host "Total destinasi di database: $($destinations.Count)`n"

$imageFiles = Get-ChildItem -Path $FolderPath -File | Where-Object { $_.Extension -match "\.(jpg|jpeg|png|webp)$" }
Write-Host "Total file gambar ditemukan di folder: $($imageFiles.Count)`n"

$results = @()

foreach ($file in $imageFiles) {
  $baseName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
  $slugGuess = Normalize-Slug $baseName

  $dest = $destinations | Where-Object { $_.slug -eq $slugGuess } | Select-Object -First 1
  if (-not $dest) {
    $dest = $destinations | Where-Object { (Normalize-Slug $_.name) -eq $slugGuess } | Select-Object -First 1
  }

  if (-not $dest) {
    Write-Host "LEWAT - $($file.Name): tidak ketemu destinasi yang cocok (coba slug: $slugGuess)" -ForegroundColor Yellow
    $results += [PSCustomObject]@{ File = $file.Name; Destination = "(tidak ketemu)"; Status = "LEWAT" }
    continue
  }

  try {
    $uploadRes = Send-ImageUpload -FilePath $file.FullName -UploadUrl "$ApiBaseUrl/upload/image"
    $publicUrl = $uploadRes.url -replace "http://minio:9000", "http://localhost:9000"

    $body = @{ images = @($publicUrl) } | ConvertTo-Json
    $updateRes = Invoke-RestMethod -Uri "$ApiBaseUrl/destinations/$($dest._id)" -Method PUT -Body $body -ContentType "application/json"

    Write-Host "OK    - $($file.Name) -> $($updateRes.name)" -ForegroundColor Green
    $results += [PSCustomObject]@{ File = $file.Name; Destination = $updateRes.name; Status = "OK" }
  } catch {
    Write-Host "GAGAL - $($file.Name) -> $($_.Exception.Message)" -ForegroundColor Red
    $results += [PSCustomObject]@{ File = $file.Name; Destination = $dest.name; Status = "GAGAL: $($_.Exception.Message)" }
  }
}

Write-Host "`n=== RINGKASAN ===" -ForegroundColor Cyan
$results | Format-Table -AutoSize
