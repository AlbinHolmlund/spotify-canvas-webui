REM FILEPATH: C:\Users\Dator\Documents\PM2Services\spotify-canvas-webui\build_safe.bat
REM Step 1: Build the new version into a new directory
cd client

REM Build path is build_ + timestamp
set TIMESTAMP=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set BUILD_PATH=build_%TIMESTAMP%
npm run build --output-path=%BUILD_PATH%

REM Step 2: After successful build, switch the served directory to the new version
REM This step depends on your server setup. For example, you might:
move build build_old_%TIMESTAMP%
move %BUILD_PATH% build

REM Step 3: Restart the server
REM This step depends on your server setup. For example, you might:
activate textgen
pm2 restart spotify-canvases-server