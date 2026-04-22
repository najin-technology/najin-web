-- ============================================================
-- 제품 카탈로그 시드 (products 테이블)
-- 출처: 기존 posts 시드의 검증된 콘텐츠를 카테고리별 제품으로 매핑.
--   - name/desc: posts excerpt 와 동일 톤. 새 사실 추가 없음.
--   - images: posts.image_urls 그대로 재활용.
-- 카테고리 CHECK: '우레탄' | '합성수지' | 'CNC' | '금형' | 'EV'
-- ============================================================

INSERT INTO products (category, name_ko, name_en, description_ko, description_en, image_urls, alt_text_ko, alt_text_en, sort_order, is_active) VALUES

  -- ===== 우레탄 =====
  ('우레탄', '우레탄 디바이더', 'Urethane Divider',
   '나진테크 특허 제품. 자동 창고 시스템, 부품 이송 라인 등에 사용되는 간격 유지 및 충격 흡수용 우레탄 디바이더. 금속·플라스틱 대비 내구성과 형상 자유도가 뛰어남.',
   'Patented urethane divider for automated warehouses and parts transfer lines. Superior durability and design freedom vs. metal or plastic.',
   ARRAY['/images/posts/urethane-divide-1.jpg', '/images/posts/urethane-divide-2.jpg', '/images/posts/urethane-divide-3.jpg'],
   '우레탄 디바이더 제품 사진', 'Urethane divider product photo', 10, TRUE),

  ('우레탄', '케스팅 우레탄', 'Casting Urethane',
   '금형 주입 방식의 케스팅 우레탄. 자체 금형 제작으로 시제품부터 양산까지 일관된 품질 대응.',
   'Cast urethane molded in-house. Consistent quality from prototype to mass production.',
   ARRAY['/images/posts/casting-urethane-1.jpg'],
   '케스팅 우레탄 제품 사진', 'Casting urethane product photo', 20, TRUE),

  ('우레탄', '우레탄 패드 금형', 'Urethane Pad Mold',
   '우레탄 패드용 정밀 금형. 나진테크 특허 우레탄 금형베이스 기술 적용.',
   'Precision mold for urethane pads with patented mold base technology.',
   ARRAY['/images/posts/urethane-pad-mold.jpg'],
   '우레탄 패드 금형 사진', 'Urethane pad mold photo', 30, TRUE),

  ('우레탄', '우레탄 A95도', 'Urethane Hardness A95',
   '경도 A95도 우레탄. 산업용 롤러·완충재에 적합한 내마모성과 내구성.',
   'Urethane at A95 hardness. Wear-resistant and durable for industrial rollers and cushioning.',
   ARRAY['/images/posts/urethane-a95.jpg'],
   '우레탄 A95 제품 사진', 'Urethane A95 product photo', 40, TRUE),

  ('우레탄', '우레탄 D95도', 'Urethane Hardness D95',
   '경도 D95도 우레탄. 금속에 가까운 강성과 탄성을 동시에 제공. 정밀 산업용 부품, 가이드, 지그용.',
   'Urethane at D95 hardness. Near-metal rigidity with elasticity for precision parts, guides, and jigs.',
   ARRAY['/images/posts/urethane-d95-1.jpg', '/images/posts/urethane-d95-2.jpg'],
   '우레탄 D95 제품 사진', 'Urethane D95 product photo', 50, TRUE),

  ('우레탄', '제전방지 우레탄', 'Anti-static Urethane',
   '정전기 발생을 억제하는 우레탄 소재. 바닥재·매트·산업용 부품 형태로 제작 가능. 전자·반도체·클린룸 작업 환경에 적합.',
   'Urethane that suppresses static electricity. Made as flooring, mats, or industrial parts. Suited to electronics, semiconductor, and clean-room environments.',
   ARRAY['/images/posts/antistatic-urethane-1.jpg', '/images/posts/antistatic-urethane-2.jpg', '/images/posts/antistatic-urethane-3.png'],
   '제전방지 우레탄 사진', 'Anti-static urethane photo', 60, TRUE),

  ('우레탄', '우레탄 배관 받침대', 'Urethane Pipe Support',
   '우레탄 경도 65D 청색 배관 받침대. 125A / 200A / 300A 규격.',
   'Urethane pipe supports in 65D blue. 125A / 200A / 300A sizes.',
   ARRAY['/images/posts/pipe-support-1.jpg', '/images/posts/pipe-support-2.jpg', '/images/posts/pipe-support-3.jpg', '/images/posts/pipe-support-4.jpg'],
   '우레탄 배관 받침대 사진', 'Urethane pipe support photo', 70, TRUE),

  ('우레탄', 'TANK PAD', 'Tank Pad',
   '자동차 연료탱크용 우레탄 TANK PAD. 진동 흡수 및 충격 완화. 정밀 금형으로 균일한 품질.',
   'Urethane tank pad for automotive fuel tanks. Vibration and impact absorption with uniform quality from precision molds.',
   ARRAY['/images/posts/tank-pad-1.jpg'],
   'TANK PAD 사진', 'Tank pad photo', 80, TRUE),

  -- ===== 합성수지 =====
  ('합성수지', 'PE 환봉 가공', 'PE Rod Machining',
   'PE 환봉 카운터 보어 및 MCT 양 끝 가공. 맞춤 고정 장비로 불량 없는 정밀 가공.',
   'PE rod counter-boring and end trimming with custom fixture for zero-defect precision.',
   ARRAY['/images/posts/pe-rod-1.jpg', '/images/posts/pe-rod-2.jpg', '/images/posts/pe-rod-3.jpg'],
   'PE 환봉 가공 사진', 'PE rod machining photo', 10, TRUE),

  ('합성수지', 'PE 디바이더', 'PE Divider',
   'PE(폴리에틸렌) 소재 디바이더. 내화학성과 내마모성이 우수해 다양한 산업 현장의 부품 간격 유지에 사용.',
   'Polyethylene dividers with excellent chemical and wear resistance for industrial spacing.',
   ARRAY['/images/posts/pe-divide-1.jpg', '/images/posts/pe-divide-2.jpg'],
   'PE 디바이더 사진', 'PE divider photo', 20, TRUE),

  ('합성수지', '연녹 PC 가공품', 'Green PC Machined Parts',
   '연녹색 PC(폴리카보네이트) 정밀 가공품. 투명성·내충격성·내열성이 뛰어나 전자·자동차·산업용 부품에 사용.',
   'Green-tinted polycarbonate precision parts. Transparent, impact- and heat-resistant for electronics, automotive, industrial use.',
   ARRAY['/images/posts/green-pc-1.jpg', '/images/posts/green-pc-2.jpg'],
   '연녹 PC 가공품 사진', 'Green PC machined parts photo', 30, TRUE),

  ('합성수지', '합판 우레탄 코팅', 'Plywood Urethane Coating',
   '합판 위 우레탄 코팅. 열처리 후 코팅으로 내구성과 표면 품질 확보.',
   'Urethane coating on plywood. Heat treatment then coating for durability and surface quality.',
   ARRAY['/images/posts/urethane-coating-1.jpg', '/images/posts/urethane-coating-2.jpg', '/images/posts/urethane-coating-3.jpg', '/images/posts/urethane-coating-4.jpg'],
   '합판 우레탄 코팅 사진', 'Plywood urethane coating photo', 40, TRUE),

  -- ===== CNC =====
  ('CNC', '3D MC 형상가공품', '3D MC Shape Machining',
   'MCT와 라우터를 활용한 복잡한 3D MC(모노머 캐스트 나일론) 형상 정밀 가공.',
   '3D MC shape precision machining using MCT and router for complex geometries.',
   ARRAY['/images/products/3d-mc-sample-1.jpg'],
   '3D MC 형상가공품 사진', '3D MC shape machining photo', 10, TRUE),

  ('CNC', '엔진 케리어 MC 가공', 'Engine Carrier MC Machining',
   '자동차 엔진 케리어 MC 정밀 가공. 내열·내마모성이 요구되는 부품.',
   'Engine carrier MC precision machining. Heat- and wear-resistant components.',
   ARRAY['/images/posts/engine-carrier-1.jpg'],
   '엔진 케리어 MC 가공 사진', 'Engine carrier MC machining photo', 20, TRUE),

  ('CNC', 'AL 가공품', 'Aluminum Machined Parts',
   'CNC/MCT를 활용한 알루미늄 정밀 가공품. 자동차·전자·항공 산업용.',
   'Aluminum precision parts machined with CNC/MCT for automotive, electronics, aerospace.',
   ARRAY['/images/posts/al-machining.jpg'],
   '알루미늄 가공품 사진', 'Aluminum machined part photo', 30, TRUE),

  ('CNC', '신주(황동) 가공품', 'Brass Machined Parts',
   '황동 정밀 가공품. 가공성과 내부식성이 우수. 전기부품·밸브·커넥터용.',
   'Brass precision parts. Excellent machinability and corrosion resistance for electrical components, valves, connectors.',
   ARRAY['/images/posts/brass-machining.jpg'],
   '신주 가공품 사진', 'Brass machined part photo', 40, TRUE),

  ('CNC', 'SUS 후렌지 홀가공', 'SUS Flange Hole Machining',
   'SUS(스테인리스) 후렌지 정밀 홀가공. CNC 장비 활용.',
   'Precision SUS stainless steel flange hole machining with CNC equipment.',
   ARRAY['/images/posts/sus-flange-1.jpg', '/images/posts/sus-flange-2.jpg'],
   'SUS 후렌지 홀가공 사진', 'SUS flange hole machining photo', 50, TRUE),

  ('CNC', '자동차부품 안착', 'Auto Parts Seating',
   '자동차 부품 안착용 맞춤형 지그 및 안착대. 3D 가공·라우터 활용 정밀 대응.',
   'Custom seating jigs for automotive parts assembly with 3D machining and router precision.',
   ARRAY['/images/posts/auto-parts-seating-1.jpg', '/images/posts/auto-parts-seating-2.jpg'],
   '자동차부품 안착 사진', 'Auto parts seating photo', 60, TRUE),

  -- ===== 금형 =====
  ('금형', 'AL 금형', 'Aluminum Mold',
   'CNC/MCT 활용 알루미늄 정밀 금형. 경량·내구성으로 시제품부터 소량 생산까지 활용.',
   'Aluminum precision molds via CNC/MCT. Lightweight and durable for prototype to small-batch production.',
   ARRAY['/images/posts/al-mold.jpg'],
   '알루미늄 금형 사진', 'Aluminum mold photo', 10, TRUE),

  -- ===== EV =====
  ('EV', 'EV용 아세탈(POM) 가공', 'EV Acetal (POM) Machining',
   '전기차(EV) 부품용 아세탈(POM) 소재 정밀 가공. 배터리팩 내부 절연 부품 등.',
   'Acetal (POM) precision machining for EV parts including battery pack insulation components.',
   ARRAY['/images/posts/ev-acetal-1.jpg', '/images/posts/ev-acetal-2.jpg'],
   'EV 아세탈 가공 사진', 'EV acetal machining photo', 10, TRUE);
