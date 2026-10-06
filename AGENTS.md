<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture
- Use four public TanStack content routes with a shared shell and centralized semantic design tokens to keep navigation and styling consistent.
- Persist fitness records in Cloud through validated server functions scoped by a SHA-256 private browser capability; direct Data API access is denied because no account system is requested.
- Store only the private access capability in browser storage, never fitness history; clearing it creates a separate journal and the key must be transferred to resume on another device.
- Keep pure training and trend logic in browser-safe modules and query-backed state in a shared provider so all pages use the same real history.
