@echo off
echo Fixing Gradle file permissions...

REM Stop any running Gradle daemons
call gradlew --stop

REM Delete the problematic Gradle cache
rmdir /s /q "android\.gradle\8.10.2\fileHashes"
mkdir "android\.gradle\8.10.2\fileHashes"

REM Grant full permissions to the directory
icacls "android\.gradle\8.10.2\fileHashes" /grant Everyone:(OI)(CI)F /T

echo Done! Please try building your app again.
pause