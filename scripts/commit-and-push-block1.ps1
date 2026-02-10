# Все изменения: один коммит + пуш
# Запуск из корня репо: .\scripts\commit-and-push-block1.ps1

Set-Location (Split-Path -Parent $PSScriptRoot)

git add -A
git status
git commit -m "fix: profile email NOT NULL, avatar 400 for missing file, reviews list visible, PATCH profile throws on fail"
git push
