@AGENTS.md

## Merge / Deploy 규칙 (필수)

**PR 머지는 사용자가 직접 하거나, 사용자가 명시적으로 "머지해" / "merge" 라고 지시한 경우에만 수행한다.**

- PR 생성까지만 자동으로 한다. 머지는 절대 자동으로 하지 않는다.
- `gh pr merge`, `git push origin main`, production 배포에 영향을 주는 모든 행위는 사용자 승인 필수.
- "커밋하고 PR 만들어" = PR 생성까지만. 머지는 별도 지시.
- 사용자가 "머지해", "merge", "적용해", "배포해" 라고 말해야만 머지 실행.
- 이 규칙은 Claude, Codex, 기타 모든 AI 에이전트에 적용된다.
