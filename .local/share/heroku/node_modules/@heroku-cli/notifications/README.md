@heroku-cli/notifications
=========================

display notifications in Heroku CLI commands. Based on [node-notifier](https://github.com/mikaelbr/node-notifier).

[![Version](https://img.shields.io/npm/v/@heroku-cli/notifications.svg)](https://npmjs.org/package/@heroku-cli/notifications)
[![GH CI](https://github.com/heroku/heroku-cli-notifications/actions/workflows/ci.yml/badge.svg)](https://github.com/heroku/heroku-cli-notifications/actions/workflows/ci.yml)
[![License](https://img.shields.io/npm/l/@heroku-cli/notifications.svg)](https://github.com/heroku/heroku-cli-notifications/blob/master/package.json)


<!-- toc -->

# Usage

If `HEROKU_NOTIFICATIONS=0|false` then this will not be displayed.

```typescript
import {notify} from '@heroku-cli/notifications'
notify({
  title: 'notification title',
  message: 'notification message',
})
```

See the [node-notifier](https://github.com/mikaelbr/node-notifier) docs for more information.
