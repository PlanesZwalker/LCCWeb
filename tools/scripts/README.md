# Maintenance scripts

- `cleanup-logs.js` — prune old artifacts in `.agents/logs/console` and `.agents/logs/screenshots`.

Usage:

```bash
node tools/scripts/cleanup-logs.js --days 14
```

Integrate with a scheduler (e.g., Windows Task Scheduler) to run daily.


