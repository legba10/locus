# Все изменения: один коммит + пуш
# Запуск из корня репо: .\scripts\commit-and-push-block1.ps1

Set-Location (Split-Path -Parent $PSScriptRoot)

git add -A
git status
git commit -m "fix: listing page crash (useQuery enabled, null-guards for item/owner)"
git push
