-- ============================================================
-- 나진테크 블로그 포스팅 시드 데이터 (추가분)
-- 네이버 블로그(kinghak1)에서 마이그레이션 - 나머지 포스트
-- ============================================================

INSERT INTO posts (slug, title_ko, title_en, content_ko, content_en, excerpt_ko, excerpt_en, category, image_urls, thumbnail_url, tags, original_date, original_url, is_published, published_at) VALUES

-- 15. 3D MC형상가공품 (2022.01.27)
(
  '3d-mc-shape-machining-2022',
  '3D MC형상가공품',
  '3D MC Shape Machined Parts',
  '3D MC 형상가공품입니다. MCT와 라우터를 활용하여 복잡한 3차원 형상의 MC(모노머 캐스트 나일론) 부품을 정밀 가공합니다.

자동차 부품, 산업용 부품 등 다양한 용도에 사용됩니다.',
  '3D MC (Monomer Cast Nylon) shaped parts precision machined using MCT and router for complex three-dimensional geometries.',
  'MCT와 라우터를 활용한 3D MC 형상 정밀가공품.',
  '3D MC shaped parts precision machined with MCT and router.',
  'CNC가공',
  ARRAY['/images/posts/3d-mc-2022.jpg'],
  '/images/posts/3d-mc-2022.jpg',
  ARRAY['자동차부품안착', '3D가공', '라우터', '알루미늄', '양산', 'MC가공'],
  '2022-01-27',
  'https://blog.naver.com/kinghak1/222632790152',
  TRUE,
  '2022-01-27T14:41:52+09:00'
),

-- 16. 나진테크 이전 공지 (2021.12.20)
(
  'najintech-relocation-2021',
  '나진테크 이전',
  'NAJIN TECH Relocation',
  '나진테크가 확장하여 공장을 이전하게 되었습니다.

합성수지 가공, 금형가공, 우레탄 성형 전문 기업 나진테크가 더 넓은 공간으로 이전합니다.

새 주소로 찾아주세요.',
  'NAJIN TECH is expanding and relocating to a larger factory.',
  '나진테크 공장 확장 이전 안내.',
  'NAJIN TECH factory expansion and relocation notice.',
  '회사소식',
  ARRAY['/images/posts/relocation-1.png', '/images/posts/relocation-2.jpg'],
  '/images/posts/relocation-1.png',
  ARRAY['나진테크', '이전', '양산'],
  '2021-12-20',
  'https://blog.naver.com/kinghak1/222600209088',
  TRUE,
  '2021-12-20T18:13:54+09:00'
),

-- 17. 자동차부품 안착 (2021.12.20)
(
  'auto-parts-seating',
  '자동차부품 안착',
  'Auto Parts Seating',
  '자동차 부품 안착용 가공품입니다. 자동차 조립 라인에서 부품을 정확한 위치에 고정하기 위한 맞춤형 지그 및 안착대를 제작합니다.

3D 가공과 라우터를 활용하여 복잡한 형상도 정밀하게 대응합니다.',
  'Custom-machined seating jigs for automotive parts assembly lines. Precision 3D machining ensures exact part positioning.',
  '자동차 부품 안착용 맞춤형 지그 및 안착대.',
  'Custom seating jigs for automotive parts assembly.',
  'CNC가공',
  ARRAY['/images/posts/auto-parts-seating-1.jpg', '/images/posts/auto-parts-seating-2.jpg'],
  '/images/posts/auto-parts-seating-1.jpg',
  ARRAY['자동차부품안착', '3D가공', '라우터', '지그'],
  '2021-12-20',
  'https://blog.naver.com/kinghak1/222600198338',
  TRUE,
  '2021-12-20T18:00:40+09:00'
),

-- 18. 우레탄 pad 금형 (2021.09.24)
(
  'urethane-pad-mold',
  '우레탄 pad 금형',
  'Urethane Pad Mold',
  '우레탄 패드용 금형입니다. 자체 설계 및 제작한 정밀 금형으로 균일한 품질의 우레탄 패드를 생산합니다.

나진테크의 특허 기술인 우레탄 금형베이스 기술이 적용되어 내구성과 정밀도가 뛰어납니다.',
  'Urethane pad mold with in-house design and fabrication. Features NAJIN TECH''s patented mold base technology.',
  '우레탄 패드 금형. 특허 금형베이스 기술 적용.',
  'Urethane pad mold with patented mold base technology.',
  '금형',
  ARRAY['/images/posts/urethane-pad-mold.jpg'],
  '/images/posts/urethane-pad-mold.jpg',
  ARRAY['우레탄', '금형', '패드', '특허'],
  '2021-09-24',
  'https://blog.naver.com/kinghak1/222515412258',
  TRUE,
  '2021-09-24T14:58:34+09:00'
),

-- 19. 우레탄 디바이드 (2021.09.24)
(
  'urethane-divide-2021',
  '우레탄 디바이드',
  'Urethane Divider (2021)',
  '우레탄 디바이더 제품입니다. 자동 창고 시스템, 부품 이송 라인 등에 사용되는 간격 유지 및 충격 흡수용 우레탄 디바이더입니다.

나진테크의 특허 제품으로, 금속이나 플라스틱 대비 뛰어난 내구성과 형상 자유도를 제공합니다.',
  'Urethane divider products for automated warehouse systems and parts transfer lines. Patented product with superior durability.',
  '자동 창고용 우레탄 디바이더. 특허 제품.',
  'Urethane dividers for automated warehouses. Patented product.',
  '우레탄',
  ARRAY['/images/posts/urethane-divide-2021-1.jpg', '/images/posts/urethane-divide-2021-2.jpg'],
  '/images/posts/urethane-divide-2021-1.jpg',
  ARRAY['우레탄', '디바이드', '디바이더', '자동창고'],
  '2021-09-24',
  'https://blog.naver.com/kinghak1/222515411590',
  TRUE,
  '2021-09-24T14:57:59+09:00'
),

-- 20. AL금형 (2021.09.24)
(
  'aluminum-mold',
  'AL금형',
  'Aluminum Mold',
  '알루미늄 금형 제작입니다. CNC/MCT 장비를 활용하여 알루미늄 소재의 정밀 금형을 제작합니다.

경량이면서도 내구성이 우수한 알루미늄 금형은 시제품 제작부터 소량 생산까지 폭넓게 활용됩니다.',
  'Aluminum mold fabrication using CNC/MCT equipment. Lightweight yet durable, suitable for prototyping to small batch production.',
  'CNC/MCT를 활용한 알루미늄 정밀 금형 제작.',
  'Precision aluminum mold fabrication with CNC/MCT.',
  '금형',
  ARRAY['/images/posts/al-mold.jpg'],
  '/images/posts/al-mold.jpg',
  ARRAY['알루미늄', '금형', 'CNC', 'MCT'],
  '2021-09-24',
  'https://blog.naver.com/kinghak1/222515390403',
  TRUE,
  '2021-09-24T14:38:58+09:00'
),

-- 21. 연녹PC가공품 (2021.09.24)
(
  'green-pc-machined-parts',
  '연녹PC가공품',
  'Green PC Machined Parts',
  '연녹색 PC(폴리카보네이트) 가공품입니다. PC 소재는 투명성, 내충격성, 내열성이 뛰어나 전자, 자동차, 산업용 부품에 널리 사용됩니다.

나진테크는 PC 소재의 정밀 가공에 풍부한 경험을 갖고 있습니다.',
  'Green-tinted PC (polycarbonate) machined parts. PC offers excellent transparency, impact resistance, and heat resistance.',
  '연녹색 PC(폴리카보네이트) 정밀 가공품.',
  'Green-tinted polycarbonate precision machined parts.',
  '합성수지',
  ARRAY['/images/posts/green-pc-1.jpg', '/images/posts/green-pc-2.jpg'],
  '/images/posts/green-pc-1.jpg',
  ARRAY['PC', '폴리카보네이트', '합성수지', '가공'],
  '2021-09-24',
  'https://blog.naver.com/kinghak1/222515389381',
  TRUE,
  '2021-09-24T14:38:04+09:00'
),

-- 22. PE 디바이드 (2021.09.24)
(
  'pe-divide',
  'PE 디바이드',
  'PE Divider',
  'PE(폴리에틸렌) 소재의 디바이더입니다. PE는 내화학성과 내마모성이 우수하여 각종 산업 현장에서 부품 간격 유지용으로 사용됩니다.

용도에 맞춰 다양한 규격으로 가공이 가능합니다.',
  'PE (polyethylene) dividers with excellent chemical and wear resistance. Available in various specifications.',
  'PE 소재 디바이더. 내화학성, 내마모성 우수.',
  'PE dividers with excellent chemical and wear resistance.',
  '합성수지',
  ARRAY['/images/posts/pe-divide-1.jpg', '/images/posts/pe-divide-2.jpg'],
  '/images/posts/pe-divide-1.jpg',
  ARRAY['PE', '디바이드', '폴리에틸렌', '합성수지'],
  '2021-09-24',
  'https://blog.naver.com/kinghak1/222515388512',
  TRUE,
  '2021-09-24T14:37:16+09:00'
),

-- 23. 우레탄 A95도 (2021.09.24)
(
  'urethane-a95-hardness',
  '우레탄 A95도',
  'Urethane Hardness A95',
  '경도 A95도의 우레탄 제품입니다. A스케일 95도는 비교적 높은 경도의 우레탄으로, 내마모성과 내구성이 뛰어나 산업용 롤러, 완충재 등에 사용됩니다.',
  'Urethane products at A95 hardness scale. High hardness urethane with excellent wear and durability for industrial rollers and cushioning.',
  '우레탄 경도 A95도. 높은 내마모성과 내구성.',
  'Urethane A95 hardness. High wear resistance and durability.',
  '우레탄',
  ARRAY['/images/posts/urethane-a95.jpg'],
  '/images/posts/urethane-a95.jpg',
  ARRAY['우레탄', 'A95도', '경도', '롤러'],
  '2021-09-24',
  'https://blog.naver.com/kinghak1/222515387236',
  TRUE,
  '2021-09-24T14:36:09+09:00'
),

-- 24. 우레탄 D95도 (2021.09.24)
(
  'urethane-d95-hardness',
  '우레탄 D95도',
  'Urethane Hardness D95',
  '경도 D95도의 우레탄 제품입니다. D스케일 95도는 매우 높은 경도의 우레탄으로, 금속에 가까운 강성을 가지면서도 탄성을 유지합니다.

정밀 산업용 부품, 가이드, 지그 등에 적합합니다.',
  'Urethane products at D95 hardness scale. Very high hardness with near-metal rigidity while maintaining elasticity. Suitable for precision industrial components.',
  '우레탄 경도 D95도. 금속에 가까운 강성과 탄성.',
  'Urethane D95 hardness. Near-metal rigidity with elasticity.',
  '우레탄',
  ARRAY['/images/posts/urethane-d95-1.jpg', '/images/posts/urethane-d95-2.jpg'],
  '/images/posts/urethane-d95-1.jpg',
  ARRAY['우레탄', 'D95도', '경도', '산업용'],
  '2021-09-24',
  'https://blog.naver.com/kinghak1/222515386234',
  TRUE,
  '2021-09-24T14:35:19+09:00'
),

-- 25. AL가공품 (2021.08.24)
(
  'aluminum-machined-parts',
  'AL가공품',
  'Aluminum Machined Parts',
  '알루미늄 가공품입니다. CNC/MCT 장비를 활용하여 알루미늄 소재를 고정밀 가공합니다.

경량이면서 강도가 우수한 알루미늄은 자동차, 전자, 항공 등 다양한 산업에서 사용됩니다.',
  'Aluminum machined parts using CNC/MCT equipment. Lightweight and strong, used across automotive, electronics, and aerospace industries.',
  'CNC/MCT를 활용한 알루미늄 정밀 가공품.',
  'Precision aluminum parts machined with CNC/MCT.',
  'CNC가공',
  ARRAY['/images/posts/al-machining.jpg'],
  '/images/posts/al-machining.jpg',
  ARRAY['알루미늄', 'AL', 'CNC', '가공품'],
  '2021-08-24',
  'https://blog.naver.com/kinghak1/222482837684',
  TRUE,
  '2021-08-24T23:45:16+09:00'
),

-- 26. 신주 가공품 (2021.08.24)
(
  'brass-machined-parts',
  '신주 가공품',
  'Brass Machined Parts',
  '신주(황동) 가공품입니다. 황동은 가공성이 우수하고 내부식성이 뛰어나 전기 부품, 밸브, 커넥터 등에 널리 사용됩니다.

나진테크는 CNC 선반과 MCT를 활용하여 황동 소재의 정밀 부품을 제작합니다.',
  'Brass machined parts. Brass offers excellent machinability and corrosion resistance, widely used for electrical components, valves, and connectors.',
  '황동(신주) 정밀 가공품. 전기부품, 밸브, 커넥터용.',
  'Precision brass parts for electrical components and connectors.',
  'CNC가공',
  ARRAY['/images/posts/brass-machining.jpg'],
  '/images/posts/brass-machining.jpg',
  ARRAY['신주', '황동', 'CNC', '가공품'],
  '2021-08-24',
  'https://blog.naver.com/kinghak1/222482836452',
  TRUE,
  '2021-08-24T23:43:47+09:00'
);
