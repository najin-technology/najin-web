# scripts/seed

이 디렉토리의 `*.sql` 파일은 **운영 DB seed 데이터**입니다.
거래처 실명, 블로그 본문, 제품 카탈로그 등 실제 비즈니스 데이터를 담고 있어
**public GitHub repo 에는 커밋하지 않습니다** (`.gitignore` 참고).

원본은 사내 위키 / 1Password / DB 백업본에서 받으세요.

## 파일 목록 (gitignored)

| 파일 | 설명 | 적용 대상 테이블 |
|------|------|------------------|
| `customers.sql`            | 거래처 마스터 INSERT                  | `customers`                          |
| `customer_meta.sql`        | 거래처 표시 메타 (logo/name_en) UPDATE | `customers`                          |
| `client_deliveries.sql`    | 거래처 협업사례 INSERT                | `client_deliveries`                  |
| `posts.sql`                | 블로그 글 INSERT                      | `posts`                              |
| `products.sql`             | 제품 카탈로그 INSERT                  | `products`                           |
| `about_content.sql`        | CEO 인사말 등 about 콘텐츠 UPDATE     | `site_about`                         |

## 적용 방법

신규 staging/local 환경 구축 시:

```bash
# 1) Schema migration 먼저 (supabase CLI)
supabase db reset           # 또는 supabase db push (원격)

# 2) Seed 적용 (순서 중요)
psql "$SUPABASE_DB_URL" -f scripts/seed/customers.sql
psql "$SUPABASE_DB_URL" -f scripts/seed/customer_meta.sql
psql "$SUPABASE_DB_URL" -f scripts/seed/client_deliveries.sql
psql "$SUPABASE_DB_URL" -f scripts/seed/products.sql
psql "$SUPABASE_DB_URL" -f scripts/seed/posts.sql
psql "$SUPABASE_DB_URL" -f scripts/seed/about_content.sql
```

또는 Supabase Dashboard SQL editor 에 붙여넣기, 또는 MCP `apply_migration` / `execute_sql`.

## 운영 DB 변경 후

운영 DB (production) 에 직접 admin UI 로 입력한 데이터가 source of truth 입니다.
필요 시 `pg_dump --table=customers --table=client_deliveries ...` 로 시드 파일을 갱신하여
1Password 등 사내 안전한 위치에 백업해두세요.
