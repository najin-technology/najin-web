-- ============================================================
-- 나진테크 블로그 포스팅 시드 데이터
-- 네이버 블로그(kinghak1)에서 마이그레이션
-- ============================================================

INSERT INTO posts (slug, title_ko, title_en, content_ko, content_en, excerpt_ko, excerpt_en, category, image_urls, thumbnail_url, tags, original_date, original_url, is_published, published_at) VALUES

-- 1. PE 환봉 가공 (2026.03.17)
(
  'pe-rod-machining',
  'PE 환봉 가공',
  'PE Rod Machining',
  '오늘은 PE 환봉에 추가 가공 의뢰가 들어왔습니다.

카운터 보어를 뚫고 MCT에서 양 끄트머리를 깎아야 하는 작업인데요. 환봉이라 아무리 바이스를 물려도 가공중에 흔들리기도 하고 PE 특성상 물렁물렁 하기 때문에 세게 물리기도 어려워요.

하지만 저희 직장님의 아이디어로 양 끝을 추가로 고정시키는 장비를 만들어 불량없이 가공할 수 있었습니다.

휘거나 파인 곳 없이 깔끔하게 작업이 된 모습입니다.',
  'Today we received an order for additional processing on PE rods. The work required counter-boring and trimming both ends on the MCT. PE is soft and tends to wobble in the vise, but our team devised a custom fixture to secure both ends, achieving zero-defect machining.',
  'PE 환봉 카운터 보어 및 MCT 양 끝 가공. 맞춤 고정 장비로 불량없는 정밀 가공.',
  'PE rod counter-boring and end trimming with custom fixture for zero-defect precision.',
  '합성수지',
  ARRAY['/images/posts/pe-rod-1.jpg', '/images/posts/pe-rod-2.jpg', '/images/posts/pe-rod-3.jpg'],
  '/images/posts/pe-rod-1.jpg',
  ARRAY['PE', 'PE환봉', 'MCT', 'PE가공'],
  '2026-03-17',
  'https://blog.naver.com/kinghak1/224219284172',
  TRUE,
  '2026-03-17T09:50:56+09:00'
),

-- 2. 합판 우레탄 코팅 (2026.03.04)
(
  'plywood-urethane-coating',
  '합판 우레탄 코팅',
  'Plywood Urethane Coating',
  '이번에 저희 회사에 합판에 우레탄을 코팅해달라는 발주가 들어왔습니다.

열심히 가공해서 합판 열처리를 하러 갑니다. 열처리를 해야 표면도 깨끗해지고 나무가 머금은 습기가 빠지기 때문이죠.

열처리를 마친 후에야 우레탄을 코팅할 수 있게됩니다.

마지막으로 깔끔하게 다듬어주면... 제품 완성입니다.

최대한 나무가 덜 휘게, 깔끔하게 만들어 내기 위해 모든 직원 분들이 열심히 노력하고 있습니다.

궁금하신 점이나 필요하신 게 있으시다면 나진테크에 연락 해주세요~.',
  'We received an order for urethane coating on plywood. The process involves heat treatment to remove moisture, followed by urethane coating and finishing.',
  '합판 위에 우레탄 코팅 작업. 열처리 후 코팅으로 내구성과 표면 품질 확보.',
  'Urethane coating on plywood. Heat treatment followed by coating for durability.',
  '우레탄',
  ARRAY['/images/posts/urethane-coating-1.jpg', '/images/posts/urethane-coating-2.jpg', '/images/posts/urethane-coating-3.jpg', '/images/posts/urethane-coating-4.jpg'],
  '/images/posts/urethane-coating-1.jpg',
  ARRAY['우레탄코팅', '합판', '열처리'],
  '2026-03-04',
  'https://blog.naver.com/kinghak1/224203817767',
  TRUE,
  '2026-03-04T12:47:33+09:00'
),

-- 3. 3D MC 형상가공품 (2026.02.26)
(
  '3d-mc-shape-machining-2026',
  '3D MC 형상가공품',
  '3D MC Shape Machining',
  '3D MC 형상가공품입니다. MCT와 라우터를 활용하여 복잡한 3차원 형상을 정밀하게 가공합니다.

나진테크는 다년간의 경험으로 복잡한 곡면과 형상도 높은 정밀도로 가공할 수 있는 기술력을 보유하고 있습니다.',
  '3D MC shaped parts machined using MCT and router for complex three-dimensional geometries with high precision.',
  'MCT와 라우터를 활용한 복잡한 3D 형상 정밀가공.',
  'Complex 3D shape precision machining using MCT and router.',
  'CNC가공',
  ARRAY['/images/products/3d-mc-sample-1.jpg'],
  '/images/products/3d-mc-sample-1.jpg',
  ARRAY['MC', 'MC가공', '3D', 'MCT', '형상가공'],
  '2026-02-26',
  'https://blog.naver.com/kinghak1/224196311178',
  TRUE,
  '2026-02-26T08:30:30+09:00'
),

-- 4. 제전방지 우레탄 (2025.12.31)
(
  'antistatic-urethane',
  '제전방지 우레탄, 직접 제작해서 판매하고 있습니다',
  'Anti-static Urethane - Made and Sold Directly',
  '현장에서 작업을 하다 보면 정전기 때문에 불편하거나 문제가 생기는 경우가 생각보다 많습니다. 전자부품 작업 중 먼지가 달라붙거나, 작업자가 미세한 정전기를 느끼거나, 정전기로 인해 제품 손상이 우려되는 환경도 많죠. 심지어 정전기로 인한 화재/폭발 사고가 가장 많을 정도입니다.

그래서 저희 ''나진테크''는 정전기 발생을 줄일 수 있는 제전방지 우레탄을 직접 제작하게 되었습니다.

■ 제전방지 우레탄이란?
일반 우레탄의 탄성과 내구성은 유지하면서, 정전기가 쌓이지 않도록 설계된 우레탄 소재입니다. 정전기를 완전히 차단하는 것이 아니라 천천히 외부로 흘려보내 작업 환경을 안정적으로 유지해주는 것이 특징입니다.

■ 나진테크가 만드는 제전방지 우레탄의 특징
· 정전기 발생 억제
· 먼지 부착 최소화
· 현장 사용에 적합한 내구성
· 직접 제작 및 관리

용도에 따라 바닥재, 매트, 산업용 부품 등 다양한 형태로 제작이 가능합니다.

■ 이런 분들께 추천
· 전자/반도체 관련 작업 환경
· 클린룸, 연구실, 정밀 작업 공간
· 정전기로 인한 불량이나 불편을 줄이고 싶은 분

제전방지 우레탄에 대해 궁금하신 점이나 사용 환경에 맞는 제작 상담이 필요하시면 나진테크에 편하게 문의 주세요.',
  'Static electricity causes many problems in manufacturing environments. NAJIN TECH produces anti-static urethane that maintains elasticity while safely dissipating static charges. Available in various forms: flooring, mats, and industrial parts.',
  '정전기 문제를 해결하는 제전방지 우레탄을 직접 제작 판매합니다. 바닥재, 매트, 산업용 부품 등 다양한 형태 제작 가능.',
  'Anti-static urethane that solves static electricity problems. Available as flooring, mats, and industrial parts.',
  '우레탄',
  ARRAY['/images/posts/antistatic-urethane-1.jpg', '/images/posts/antistatic-urethane-2.jpg', '/images/posts/antistatic-urethane-3.png'],
  '/images/posts/antistatic-urethane-1.jpg',
  ARRAY['제전방지', '우레탄', '정전기', '클린룸', '반도체'],
  '2025-12-31',
  'https://blog.naver.com/kinghak1/224128901851',
  TRUE,
  '2025-12-31T10:46:37+09:00'
),

-- 5. 우레탄 배관 받침대 (2025.12.17)
(
  'urethane-pipe-support',
  '우레탄 배관 받침대',
  'Urethane Pipe Support',
  '며칠 전 발주가 들어온 우레탄 청색 경도 65D의 파이프 배관 받침대 샘플을 만들어 봤어요.

각각 125A, 200A, 300A 규격으로 맞춰봤습니다.

■ 배관 받침대 - 우레탄 경도 65D 청색

사진으로 찍으니 새까만 검정색으로 보이지만 실제로 볼 땐 아주 진하고 말끔한 청색입니다.

125A / 200A / 300A

아주 깔끔하게 잘 나온 것 같습니다.

이 외에도 우레탄이나 합성수지 가공에 관한 문의는 저희 ''나진테크''에 넣어주시면 자세히 알려드리겠습니다.',
  'We made pipe support samples in urethane hardness 65D (blue) in 125A, 200A, and 300A specifications. Clean finish with excellent quality.',
  '우레탄 경도 65D 청색 배관 받침대. 125A, 200A, 300A 규격 샘플 제작.',
  'Urethane pipe supports in 65D hardness, 125A/200A/300A specifications.',
  '우레탄',
  ARRAY['/images/posts/pipe-support-1.jpg', '/images/posts/pipe-support-2.jpg', '/images/posts/pipe-support-3.jpg', '/images/posts/pipe-support-4.jpg'],
  '/images/posts/pipe-support-1.jpg',
  ARRAY['배관받침대', '우레탄', '65D', '125A', '200A', '300A'],
  '2025-12-17',
  'https://blog.naver.com/kinghak1/224112885295',
  TRUE,
  '2025-12-17T13:30:36+09:00'
),

-- 6. SUS후렌지 홀가공 (2022.04.18)
(
  'sus-flange-hole-machining',
  'SUS후렌지 홀가공',
  'SUS Flange Hole Machining',
  'SUS(스테인리스) 후렌지의 홀가공 작업입니다. CNC 장비를 활용하여 정밀한 홀 가공을 수행합니다.',
  'Stainless steel flange hole machining using CNC equipment for precision results.',
  'SUS 스테인리스 후렌지 정밀 홀가공.',
  'Precision SUS stainless steel flange hole machining.',
  'CNC가공',
  ARRAY['/images/posts/sus-flange-1.jpg', '/images/posts/sus-flange-2.jpg'],
  '/images/posts/sus-flange-1.jpg',
  ARRAY['SUS', '후렌지', '홀가공', 'CNC'],
  '2022-04-18',
  'https://blog.naver.com/kinghak1/222704119713',
  TRUE,
  '2022-04-18T14:53:32+09:00'
),

-- 7. Ev차 용 아세탈가공 (2022.03.11)
(
  'ev-acetal-machining',
  'EV차 용 아세탈가공',
  'EV Car Acetal Machining',
  '전기차(EV) 부품에 사용되는 아세탈(POM) 소재의 정밀 가공입니다. 배터리팩 내부 절연 부품 등 전기차 전용 부품을 높은 정밀도로 가공합니다.',
  'Precision machining of acetal (POM) material for electric vehicle parts, including battery pack insulation components.',
  'EV 전기차 부품용 아세탈(POM) 정밀 가공.',
  'Precision acetal (POM) machining for EV parts.',
  'EV부품',
  ARRAY['/images/posts/ev-acetal-1.jpg', '/images/posts/ev-acetal-2.jpg'],
  '/images/posts/ev-acetal-1.jpg',
  ARRAY['EV', '전기차', '아세탈', 'POM', '배터리팩'],
  '2022-03-11',
  'https://blog.naver.com/kinghak1/222670054735',
  TRUE,
  '2022-03-11T20:11:31+09:00'
),

-- 8. 케스팅우레탄 (2022.03.11)
(
  'casting-urethane',
  '케스팅우레탄',
  'Casting Urethane',
  '케스팅(주조) 우레탄 제품입니다. 금형에 우레탄 원액을 주입하여 성형하는 방식으로, 복잡한 형상의 우레탄 제품을 제작할 수 있습니다.

나진테크는 자체 금형 제작 능력을 갖추고 있어 시제품부터 양산까지 일관된 품질로 대응이 가능합니다.',
  'Casting urethane products made by injecting urethane into molds. NAJIN TECH has in-house mold fabrication capabilities for consistent quality from prototype to mass production.',
  '금형 주입 방식의 케스팅 우레탄 제품. 시제품부터 양산까지 대응.',
  'Casting urethane products. From prototype to mass production.',
  '우레탄',
  ARRAY['/images/posts/casting-urethane-1.jpg'],
  '/images/posts/casting-urethane-1.jpg',
  ARRAY['우레탄', '케스팅', '주조', '금형'],
  '2022-03-11',
  'https://blog.naver.com/kinghak1/222670054132',
  TRUE,
  '2022-03-11T20:10:33+09:00'
),

-- 9. 엔진 케리어 MC 가공 (2022.03.11)
(
  'engine-carrier-mc-machining',
  '엔진 케리어 MC 가공',
  'Engine Carrier MC Machining',
  '엔진 케리어(캐리어) MC 가공품입니다. 자동차 엔진 부품에 사용되는 MC(모노머 캐스트 나일론) 소재의 정밀 가공으로, 높은 내열성과 내마모성이 요구되는 부품입니다.',
  'Engine carrier MC (Monomer Cast Nylon) machined parts for automotive engines, requiring high heat and wear resistance.',
  '자동차 엔진 케리어 MC 정밀 가공. 내열·내마모 부품.',
  'Engine carrier MC precision machining. Heat and wear resistant.',
  'CNC가공',
  ARRAY['/images/posts/engine-carrier-1.jpg'],
  '/images/posts/engine-carrier-1.jpg',
  ARRAY['MC가공', '엔진', '케리어', '자동차부품'],
  '2022-03-11',
  'https://blog.naver.com/kinghak1/222670052999',
  TRUE,
  '2022-03-11T20:08:55+09:00'
),

-- 10. 우레탄 디바이드 (2022.03.11)
(
  'urethane-divide',
  '우레탄 디바이드',
  'Urethane Divider',
  '나진테크의 특허 제품인 우레탄 디바이더입니다. 금속 또는 플라스틱 대비 내구성 및 안정성이 뛰어나고, 형상 자유도가 높아 현장 맞춤 설계가 가능합니다.

자동차 부품 이송 라인, 자동 창고 시스템 등에 사용되며, 부품 간 간격 유지와 충격 흡수 역할을 합니다.',
  'NAJIN TECH''s patented urethane divider. Superior durability and stability compared to metal or plastic, with high design freedom for custom on-site solutions. Used in automotive parts transfer lines and automated warehouse systems.',
  '나진테크 특허 우레탄 디바이더. 내구성 우수, 현장 맞춤 설계 가능.',
  'Patented urethane divider. Excellent durability with custom design.',
  '우레탄',
  ARRAY['/images/posts/urethane-divide-1.jpg', '/images/posts/urethane-divide-2.jpg', '/images/posts/urethane-divide-3.jpg'],
  '/images/posts/urethane-divide-1.jpg',
  ARRAY['우레탄', '디바이드', '디바이더', '특허', '자동차부품'],
  '2022-03-11',
  'https://blog.naver.com/kinghak1/222670049388',
  TRUE,
  '2022-03-11T20:03:43+09:00'
),

-- 11. 나진테크 확장 이전 (2022.02.09)
(
  'najintech-expansion-relocation',
  '나진테크 새로이 확장 이전하였습니다',
  'NAJIN TECH Has Expanded and Relocated',
  '나진테크가 확장 이전했습니다.

합성수지 가공, 금형가공, 우레탄 성형 전문 기업 나진테크가 더 넓고 새로운 공장으로 이전하였습니다.

■ 새 공장 주소
경남 양산시 산막공단남14길 170

T. 055-367-2596
F. 055-367-2597

더 넓어진 공간에서 더 좋은 품질의 제품을 만들어 나가겠습니다.',
  'NAJIN TECH has expanded and relocated to a larger, new factory. New address: 170, Sanmakgongdannam 14-gil, Yangsan-si, Gyeongsangnam-do.',
  '나진테크가 경남 양산시 산막공단남14길 170으로 확장 이전했습니다.',
  'NAJIN TECH expanded and relocated to a new, larger factory in Yangsan.',
  '회사소식',
  ARRAY['/images/posts/expansion-1.jpg', '/images/posts/expansion-2.jpg', '/images/posts/expansion-3.jpg'],
  '/images/posts/expansion-1.jpg',
  ARRAY['나진테크', '확장이전', '양산', '새공장'],
  '2022-02-09',
  'https://blog.naver.com/kinghak1/222643171051',
  TRUE,
  '2022-02-09T17:07:14+09:00'
),

-- 12. TANK PAD (2019.02.14)
(
  'tank-pad',
  'TANK PAD',
  'Tank Pad',
  '우레탄 TANK PAD 제품입니다. 자동차 연료탱크 등에 사용되는 우레탄 패드로, 진동 흡수와 충격 완화 역할을 합니다.

정밀 금형으로 제작되어 균일한 품질을 보장합니다.',
  'Urethane tank pad products for automotive fuel tanks. Absorbs vibration and dampens impact with uniform quality from precision molds.',
  '자동차 연료탱크용 우레탄 TANK PAD. 진동 흡수 및 충격 완화.',
  'Urethane tank pad for automotive fuel tanks. Vibration and impact absorption.',
  '우레탄',
  ARRAY['/images/posts/tank-pad-1.jpg'],
  '/images/posts/tank-pad-1.jpg',
  ARRAY['우레탄', 'TANKPAD', '자동차', '연료탱크'],
  '2019-02-14',
  'https://blog.naver.com/kinghak1/221465798932',
  TRUE,
  '2019-02-14T16:40:10+09:00'
),

-- 13. 나진테크 회사 소개 (2019.01.08)
(
  'najintech-company-introduction',
  '나진테크 회사 소개',
  'NAJIN TECH Company Introduction',
  '[ 회사소개 ]

경남 양산시 산막공단 남 11길 65-5 / 나진 테크
TEL : 055–367-2596 / E-MAIL : kinghak1@naver.com
MOBILE : 010.8244.0338

■ 1. 회사 개요
· 회사명 : 나진테크
· 대표이사 : ***
· 소재지 : 경남 양산시 산막공단 남 11길 65-5번지
· 업종 : 제조업/금형제작 (합성수지가공/우레탄성형)
· 설립일 : 2002년 12월 20일
· 연락처 : TEL : 055–367-2596 / FAX : 055-367-2597

■ 2. 회사 연혁
※ 2002.12. 나진테크 설립
※ 2003.06. ㈜한화종합 화학등록
※ 2005.06. 부산사상구 괘법동 공장 설립
※ 2010.06. ㈜주요 부품사 등록
※ 2013.04. 경남 양산 산막공단 남11길 자가공장설립
※ 2013.06. ISO 9001 획득
※ 2013.08. CLEAN 사업장 인정
※ 2014.01. 국내 완성차사 자동차㈜ 등록
※ 2014.02. 주요 부품사 등록
※ 2016.04. SK㈜ 등록
※ 2016.06. 우레탄 금형 받침대 특허획득

■ 3. 납품현황
※ 2008.12. 울산국내외 주요 완성차사/CRANK SHAPT LINE MC가공
※ 2009.07. 울산국내외 주요 완성차사/변속기라인 청MC판가공
※ 2012.12. 국내외 주요 완성차사 프레서공자 우레탄 금형받침대
※ 2016.04. 서산 주요 부품사 우레탄조립
※ 2017.03. 중국고안 대세 우레탄 판(자동창고용시트)
※ 2017.04. 중국 절강 대세 우레탄 판
※ 2017.04. SK 전지공장용 MC블럭가공
※ 2017.10. 해외 자동차사 (자동창고용시트)
※ 2017.12. 리어 다이모스 (중국공장) 자동창고용시트
※ 2018.04. SK전지공장용 MC블럭가공
※ 2018.01. 주요 부품사 TM. PE. PC 가공
※ 2018.10. 주요 부품사 LX2. PE. PC 가공
※ 2019.08. 주요 부품사 CN7 PE. MC 가공
※ 2019.12. 국내 완성차사 LG BATTER PACK 가공
※ 2020.01. RG3 우레탄 성형
※ 2020.07. US4 FENDER·SIDE 우레탄 성형

■ 4. 회사소개
저희 나진테크는 우레탄 성형품, 우레탄 금형 제작, 합성수지 가공품을 전문적으로 생산하는 회사입니다.

PE,MC 분야에서 축적된 기술력을 바탕으로 공정 효율과 내구성을 동시에 개선하는 기술 중심 솔루션을 제공하고 마모, 변형등의 문제를 분석하고 개선해 왔습니다.

또한 라우터, CNC, MCT를 활용한 복잡한 3D 형상 가공도 수많은 경험을 바탕으로 품질을 꾸준히 발전시켰습니다.

우레탄 분야에서는 정밀 금형 제작이 가능한 설비와 함께, 우레탄 주입 및 성형 장비, 대형 가공이 가능한 설비를 보유하고 있어 소량 시제품부터 양산까지 일관된 품질로 대응 가능합니다.

저희 회사의 특허 상품인 우레탄 디바이더는 금속 또는 플라스틱 대비 내구성 및 안정성이 뛰어나고 형상 자유도가 높아 현장 맞춤 설계가 가능합니다.

만일 귀사의 기술적인 검토가 필요하신 사항이 있으시면 언제든지 편하게 말씀해주셔도 됩니다.

최선을 다해 귀사에 실질적인 성과를 만들어 드리겠습니다.',
  'Company introduction of NAJIN TECH - a manufacturer specializing in urethane molding, mold fabrication, and synthetic resin processing since 2002.',
  '나진테크 회사소개. 우레탄 성형, 금형 제작, 합성수지 가공 전문기업.',
  'NAJIN TECH introduction. Urethane molding, mold fabrication, and synthetic resin processing.',
  '회사소식',
  ARRAY['/images/factory/workshop-1.jpg'],
  '/images/factory/workshop-1.jpg',
  ARRAY['나진테크', '우레탄성형', '우레탄금형제작', '합성수지CNC', '양산'],
  '2019-01-08',
  'https://blog.naver.com/kinghak1/221437105999',
  TRUE,
  '2019-01-08T15:41:32+09:00'
),

-- 14. 나진테크 현장 (2018.02.21)
(
  'najintech-factory-tour',
  '나진테크 현장',
  'NAJIN TECH Factory Tour',
  '나진테크 공장 현장 모습입니다. CNC선반, MCT, 범용 밀링 등 다양한 장비를 갖추고 합성수지 가공, 우레탄 성형, PC가공 등을 수행하고 있습니다.',
  'A look inside the NAJIN TECH factory. Equipped with CNC lathes, MCT machines, and milling equipment for synthetic resin processing, urethane molding, and PC machining.',
  '나진테크 공장 현장. CNC선반, MCT, 밀링 등 다양한 장비 보유.',
  'NAJIN TECH factory with CNC lathes, MCT, and milling equipment.',
  '회사소식',
  ARRAY['/images/posts/factory-1.jpg'],
  '/images/posts/factory-1.jpg',
  ARRAY['나진테크', '합성수지가공', '우레탄성형', 'PC가공'],
  '2018-02-21',
  'https://blog.naver.com/kinghak1/221213355220',
  TRUE,
  '2018-02-21T00:00:00+09:00'
);
