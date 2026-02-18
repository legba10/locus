# Откат к коммиту db0d053

**Цель:** fix(header): уведомления и меню аватара на mobile (ТЗ)

---

## Важно: перед откатом

1. **Закрой все окна Cursor/VS Code**, которые открывают этот репозиторий (чтобы не было блокировки `.git/index.lock`).
2. Либо закрой все вкладки с этим проектом и подожди 10–15 секунд.
3. Открой **новый терминал** (PowerShell или cmd) **вне Cursor** — например, из проводника: правый клик по папке `locus-new` → «Открыть в терминале».

---

## 1. Локальный откат и пуш в GitHub

В корне проекта выполни по порядку:

```powershell
cd c:\Users\surgu\locus\locus-new

git fetch origin
git checkout main
git reset --hard db0d053
git log -1 --oneline
```

Должно быть: `db0d053 fix(header): уведомления и меню аватара на mobile (ТЗ)`.

Затем перезапись ветки на GitHub:

```powershell
git push origin main --force
```

После этого **GitHub main = db0d053**, все коммиты после него удалены.

---

## 2. Синхронизация локальной копии

```powershell
git pull origin main
git status
```

Ожидаемо: `nothing to commit, working tree clean`.

---

## 3. Vercel (вручную в панели)

- **Deployments** → найти деплой с коммитом **db0d053** → **Redeploy** или **Promote to Production**.
- Если прод не обновился: **Settings → Build & Cache → Clear build cache**, затем снова **Redeploy**.
- При необходимости: **Settings → Cache → Purge** (CDN/кеш).

---

## 4. Проверка

- **GitHub:** последний коммит на `main` — **db0d053**.
- **Vercel:** Production deployment — **db0d053**.
- **Сайт:** интерфейс соответствует старой сборке (header, уведомления, меню аватара на mobile).

---

## Если снова «index.lock»

- Закрой все программы, использующие этот репозиторий (Cursor, VS Code, Git GUI, клонеры).
- Удали файл вручную: `c:\Users\surgu\locus\locus-new\.git\index.lock`.
- Повтори шаги из раздела 1.
