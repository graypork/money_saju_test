<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project workflow

## Skill routing

- Before every task, inspect the available skills and invoke relevant process skills before implementation skills.
- For bugs, unexpected behavior, layout failures, test failures, or build failures:
  1. use `superpowers:systematic-debugging`
  2. identify and document the root cause before editing
  3. make the smallest root-cause fix
- For new features, new interactions, or behavior changes:
  1. use `superpowers:brainstorming`
  2. obtain design approval
  3. use `superpowers:writing-plans` before editing code
- For frontend visual implementation or UI refinement, use `.agents/skills/frontend-design/SKILL.md` only after the relevant process skill.
- Before claiming a task is complete, use `superpowers:verification-before-completion`, run fresh verification commands, and report command output and failures honestly.
- Use `superpowers:test-driven-development` when a behavior can reasonably be protected with an automated test.
- Do not invoke multiple competing development frameworks for the same task unless explicitly requested.

## Project constraints

- Stack: Next.js App Router + TypeScript + Tailwind.
- Product: `money-saju-test`.
- Target viewport: mobile-only 390–430px.
- Preserve all saju, scoring, animal mapping, copy-generation, logging, payment, unlock, query-param, localStorage, and `admin22` exclusion behavior unless explicitly requested.
- Do not modify report copy, section order, or generated result meaning unless explicitly requested.
- Reuse existing project patterns and assets.
- Do not perform unrelated refactoring.
- Do not install packages unless the task requires them and approval is obtained.
- Prefer focused changes to named files.
- Do not take repeated screenshots by default.
- For browser verification, use 390px once unless breakpoint-specific behavior requires 414px or 430px.
- Run `npm run build` before completion.
- Run ESLint only on modified TS/TSX files unless full-project lint is explicitly requested.
- Never claim build, lint, or tests pass without running the corresponding fresh command.

## Work sequence

For implementation tasks:

1. Inspect relevant files and recent changes.
2. Identify constraints and root cause.
3. Present or follow the approved design.
4. Implement the smallest scoped change.
5. Inspect `git diff`.
6. Run modified-file lint.
7. Run `npm run build`.
8. Verify the original symptom.
9. Report files changed, root cause, implementation, and verification results.

## Git safety

- Do not reset, discard, or overwrite unrelated user changes.
- Do not use destructive git commands.
- Do not commit or push unless explicitly requested.
- Do not modify files outside the current task scope.
