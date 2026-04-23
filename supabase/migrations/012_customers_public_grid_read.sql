-- 거래처 그리드(홈/포트폴리오/clients/[slug]) 가 anon 클라이언트로 customers 메타를
-- 읽을 수 있도록 제한적 public SELECT 정책 추가.
-- 조건: client_slug IS NOT NULL (= 그리드 노출 설정된 거래처만).
-- lead/quote 자동 생성 customers 는 client_slug 가 NULL 이라 PII 가 안 노출됨.

CREATE POLICY "Anyone can read display clients"
  ON customers FOR SELECT
  TO anon, authenticated
  USING (client_slug IS NOT NULL AND deleted_at IS NULL);
