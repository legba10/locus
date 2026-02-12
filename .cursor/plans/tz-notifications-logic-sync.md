# TZ Notifications Logic Sync (server/events)

## Status
in_progress

## Tasks
- [x] Extend notification data model with `text/link/entityId/isRead/isSeen`.
- [x] Add dedup rule (`type + entityId + 5s`) in notification creation.
- [x] Badge logic on unseen (`isSeen=false`) and seen/read endpoints.
- [x] Add realtime stream endpoint (`/notifications/stream`) and read sync events.
- [x] Add API aliases (`/notifications/read`, `/notifications/unread`, `/notifications/push/register`).
- [x] Add presence endpoint and offline-only push rule.
- [x] Hook message notification to new typed payload + chat link.
- [x] Run lints and sanity check changed files.
