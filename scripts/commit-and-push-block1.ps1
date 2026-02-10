# Все изменения: один коммит + пуш
# Запуск из корня репо: .\scripts\commit-and-push-block1.ps1

Set-Location (Split-Path -Parent $PSScriptRoot)

git add -A
git status
git commit -m "fix: profile save/avatar sync, reviews UI and 409 handling"
git push
