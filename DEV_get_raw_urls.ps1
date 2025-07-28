$REPO_URL = "https://raw.githubusercontent.com/willplayforfun/envdash"
$BRANCH = "main"

Get-ChildItem -Path "." -Recurse -Include "*.js", "*.jsx", "*.json", "*.html" | ForEach-Object { 
    $relativePath = $_.FullName.Replace((Get-Location).Path + "\", "").Replace("\", "/")
    "$REPO_URL/$BRANCH/$relativePath"
}