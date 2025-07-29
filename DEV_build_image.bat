powershell "docker compose --progress=plain build | Tee-Object -FilePath 'build.log'"
@echo off
if NOT "%ERRORLEVEL%" == "0" (
		echo An error occurred during image build.
		pause
)