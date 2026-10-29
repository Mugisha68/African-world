$ErrorActionPreference = "Stop"

$secureKey = Read-Host "Enter your Google AI Studio API key (input is hidden)" -AsSecureString
$keyPointer = [IntPtr]::Zero

try {
    $keyPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureKey)
    $apiKey = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($keyPointer).Trim()

    if ([string]::IsNullOrWhiteSpace($apiKey)) {
        throw "The API key cannot be empty."
    }

    $envFile = Join-Path $PSScriptRoot ".env.local"
    $existingLines = @()

    if (Test-Path -LiteralPath $envFile -PathType Leaf) {
        $existingLines = @(
            Get-Content -LiteralPath $envFile |
                Where-Object { $_ -notmatch '^\s*GEMINI_API_KEY\s*=' }
        )
    }

    $escapedKey = $apiKey.Replace('\', '\\').Replace('"', '\"')
    $existingLines += "GEMINI_API_KEY=`"$escapedKey`""
    $content = ($existingLines -join [Environment]::NewLine) + [Environment]::NewLine
    $utf8WithoutBom = [System.Text.UTF8Encoding]::new($false)
    [System.IO.File]::WriteAllText($envFile, $content, $utf8WithoutBom)

    Write-Output "Gemini API key saved to .env.local. The key was not displayed."
    Write-Output "Restart the local server with npm start to load the key."
}
finally {
    if ($keyPointer -ne [IntPtr]::Zero) {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($keyPointer)
    }

    if ($secureKey) {
        $secureKey.Dispose()
    }

    Remove-Variable apiKey, escapedKey, content -ErrorAction SilentlyContinue
}
