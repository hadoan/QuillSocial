@echo off
REM Wrapper to run enum-generator-runner.js using node in the same directory as this script
SETLOCAL ENABLEDELAYEDEXPANSION
SET SCRIPT_DIR=%~dp0
node "%SCRIPT_DIR%enum-generator-runner.js" %*
