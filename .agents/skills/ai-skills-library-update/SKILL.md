---
name: ai-skills-library-update
description: Refresh the shared AI Skills Library when its GitHub repository has changed, then add any newly available skills without replacing existing user skills.
---

# AI Skills Library Update

Use this skill when the user asks to check for updates to the shared AI Skills
Library or reinstall its skills.

1. Set the library root to
   `D:\Documents\Projects\VC\Github\ai-skills-library`.
2. If the library root is absent, clone
   `https://github.com/SamuelAsherRivello/ai-skills-library` there. Otherwise,
   fetch `origin` and compare the current branch with its upstream branch.
3. If the checkout is current, report that no library update is needed, then
   still run the additive skill-link step so newly missing global links are
   restored.
4. If the upstream contains commits, update the checkout with a normal,
   non-force fast-forward only. Stop and report a blocker if the checkout is
   dirty, diverged, or cannot fast-forward; do not discard, overwrite, merge,
   rebase, or force-push changes.
5. Add every library skill under `.agents\skills` to
   `C:\Users\srive\.agents\skills`. Preserve an existing global skill with
   the same name. For each missing target, create a directory symbolic link;
   if that is unavailable, create a directory junction instead.
6. Verify that every linked target resolves to its library skill folder and
   report linked, skipped, and failed names separately. Tell the user to
   restart Codex so its skill catalog refreshes.

Request approval before cloning, fast-forwarding, or writing links outside the
current project. Never expose credentials or remove existing skills or links.
