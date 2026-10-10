# @open-reaction-database/ui

The theme and components that the Open Reaction Database web apps share: the Mantine theme, the global
stylesheet, and display primitives. Apps import it only through the subpaths in its `package.json` `exports`
(`@open-reaction-database/ui/theme`, `@open-reaction-database/ui/display`), never by a path into `src/`. Each app's
Vite build compiles it from TypeScript source; it has no build step of its own and is not published.
