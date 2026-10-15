# @open-reaction-database/ui

The theme and components that the Open Reaction Database web apps share: the Mantine theme, the global
stylesheet, icons, display primitives and form controls, the reaction model, the reaction view with its
drawer, the page shell and its Google Analytics loader, and a Ketcher structure dialog. Apps import it only through the subpaths in its `package.json` `exports`
(`@open-reaction-database/ui/theme`, `…/display`, `…/reaction`, `…/reaction/model`, `…/reaction/previews`,
`…/shell`, `…/ketcher`, `…/testing`), never by a path into `src/`. Each app's Vite build compiles it from TypeScript
source; it has no build step of its own and is not published.

## What a host provides

- The stylesheets: `@mantine/core/styles.css`, `@mantine/dates/styles.css`,
  `@mantine/notifications/styles.css`, and `@open-reaction-database/ui/theme/global.scss`.
- A `MantineProvider` given the package's `theme` from `@open-reaction-database/ui/theme`, which the
  view's colors and type come from.
- A mounted `<Notifications />` from `@mantine/notifications`, which shows the view's notices.
- `svgr()` from `vite-plugin-svgr` among its Vite plugins, which turns the icons' `*.svg?react` imports
  into components.
- A `ReactionProvider` around the reaction view, with a source, the slots, and actions for an editable
  reaction.
- A `<ReactionDetailsSidebar />` inside that provider, which shows the drawer forms the view's buttons
  open; without it, those buttons open nothing.
- `wouter`, for the page shell's breadcrumbs, which link through the host's router.
- For `@open-reaction-database/ui/ketcher`: `define: { 'process.env': {} }` in its Vite config, since
  Ketcher reads `process.env`. `StructureDialog` installs the `global` and `Buffer` Ketcher's modules
  expect, and loads Ketcher the first time it opens.
