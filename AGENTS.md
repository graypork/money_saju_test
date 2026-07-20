<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Project workflow

## Skill and tool routing

* Before every task, inspect the available skills and invoke relevant process skills before implementation skills.
* Use only skills relevant to the current task.
* Do not invoke multiple competing or overlapping development frameworks for the same task unless explicitly requested.

### Bugs and failures

For bugs, unexpected behavior, layout failures, test failures, or build failures:

1. Use `superpowers:systematic-debugging`.
2. Reproduce the problem and identify the root cause before editing.
3. Document the root cause.
4. Make the smallest root-cause fix.
5. Verify the original symptom after the change.

### New features and behavior changes

For significant new features, new interactions, or behavior changes:

1. Use `superpowers:brainstorming`.
2. Clarify the intended behavior and constraints.
3. Obtain design approval when the visual direction, interaction, or scope is materially ambiguous.
4. Use `superpowers:writing-plans` before editing code when the implementation requires multiple coordinated changes.

Do not block small, clearly specified changes with unnecessary approval or planning steps.

### Frontend design

* For frontend visual implementation, UI refinement, visual hierarchy, typography, spacing, color, composition, or layout work, use the `frontend-design` skill after any relevant process skill.
* Treat `frontend-design` as a globally installed skill. Do not assume it exists at a repository-relative file path.
* Preserve the established product identity and existing design direction unless a redesign is explicitly requested.
* Do not use multiple overlapping visual-design skills unless the task specifically benefits from comparing different approaches.

### Design system documentation

* Before UI work, read the project-root `DESIGN.md` and the target component's existing tokens and styles.
* Reuse existing tokens and components before introducing a new color, radius, shadow, type role, or UI primitive.
* If Figma, current code, and `DESIGN.md` conflict, report the values and the implementation impact to the user before choosing a new standard.
* Do not treat a generic Figma UI kit as an automatic implementation source; adopt only rules that are applicable to money-saju-test and documented as canonical.
* Use Apple reference material only for document structure, never as the visual or brand standard for this project.

### Animation and motion

* For animations, transitions, hover effects, drag interactions, card expansion or collapse, modal motion, page transitions, or motion-performance fixes, use the `animate` skill after any relevant process skill.
* Prefer CSS transitions for simple state changes.
* Use an animation library only when the interaction requires enter/exit orchestration, shared layout, interruption, gestures, or measured height animation.
* Respect `prefers-reduced-motion`.
* Do not add motion that interferes with usability, scrolling, reading, or touch interaction.

### External documentation

* Use Context7 when current library documentation, version-specific APIs, deprecated APIs, or framework configuration must be checked.
* For Next.js behavior, read the relevant local guide in `node_modules/next/dist/docs/` before relying on remembered framework behavior.
* Prefer primary documentation over blog posts or examples from unrelated framework versions.

### Browser verification

* Use Playwright MCP when it is available and browser verification is relevant.
* Use Playwright for user-flow verification, interaction testing, console-error inspection, viewport checks, and reproduction of browser-specific bugs.
* Do not use Playwright when static inspection and existing automated tests are sufficient.
* Do not repeatedly capture screenshots unless visual comparison is necessary.

### Completion verification

* Before claiming a task is complete, use `superpowers:verification-before-completion`.
* Run fresh verification commands.
* Report actual command output and failures honestly.
* Use `superpowers:test-driven-development` when behavior can reasonably be protected with an automated test.

## Project constraints

* Stack: Next.js App Router + TypeScript + Tailwind.
* Product: `money-saju-test`.
* Target viewport: mobile-only 390–430px.
* Preserve all saju, scoring, animal mapping, copy-generation, logging, payment, unlock, query-param, localStorage, and `admin22` exclusion behavior unless explicitly requested.
* Do not modify report copy, section order, or generated result meaning unless explicitly requested.
* Reuse existing project patterns and assets.
* Do not perform unrelated refactoring.
* Do not install packages unless the task requires them and approval is obtained.
* Prefer focused changes to named files.
* Do not take repeated screenshots by default.
* For browser verification, use 390px once unless breakpoint-specific behavior requires 414px or 430px.
* Run `npm run build` before completion.
* Run ESLint only on modified TS/TSX files unless full-project lint is explicitly requested.
* Never claim build, lint, or tests pass without running the corresponding fresh command.

## Work sequence

For implementation tasks:

1. Inspect relevant files and recent changes.
2. Identify constraints and, when applicable, the root cause.
3. Present or follow the approved design when approval is required.
4. Implement the smallest scoped change.
5. Inspect `git diff`.
6. Run modified-file lint.
7. Run `npm run build`.
8. Verify the original symptom or requested behavior.
9. Report files changed, root cause when applicable, implementation, and verification results.

## Git safety

* Do not reset, discard, or overwrite unrelated user changes.
* Do not use destructive git commands.
* Do not commit or push unless explicitly requested.
* Do not modify files outside the current task scope.
