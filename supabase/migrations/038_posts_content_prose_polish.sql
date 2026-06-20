-- ============================================================
-- 게시글(제작사례) 본문 프로즈 윤문.
-- - 서술(이야기) 형태는 유지하고 문장 표현·리듬만 다듬음.
-- - 사실·수치·고유명사·소재·공정·인과·순서는 불변 (신규 사실/과장 추가 없음).
-- - gm-shanghai: 숨겨진 '출처' 섹션을 정리하고 개요/납품이력을 서술로 합침
--   (content_zh 는 원래 없었으므로 손대지 않음).
-- - antistatic-urethane: 이미 구조·표현이 양호하여 변경하지 않음.
-- UPDATE 문이라 idempotent.
-- ============================================================

UPDATE posts SET
  content_ko = $$<p>PE 환봉에 추가 가공 의뢰가 들어왔습니다. 카운터 보어를 뚫고, MCT에서 양 끝을 깎아내는 작업이었습니다.</p><p>환봉은 바이스로 물려도 가공 중에 흔들리기 쉽습니다. 게다가 PE는 무른 소재라 세게 고정하기도 어렵습니다. 그래서 이번에는 양 끝을 잡아 주는 지그를 직접 만들어, 흔들림 없이 불량 없이 가공했습니다.</p><p>휘거나 파인 곳 없이 깔끔하게 마무리됐습니다.</p>$$,
  content_en = $$<p>We received a request for additional machining on a PE rod: drilling a counter bore and machining both ends on the MCT.</p><p>A rod tends to shake during machining even when clamped in a vise. On top of that, PE is a soft material, so it is hard to clamp firmly. So this time we built a jig to hold both ends, and machined the part with no movement and no defects.</p><p>It came out cleanly finished, with no warping or gouges.</p>$$,
  content_zh = $$<p>我们收到对 PE 圆棒进行追加加工的委托：钻沉头孔，并在 MCT 上加工两端。</p><p>圆棒即使用虎钳夹持，加工中也容易晃动。再加上 PE 材质较软，难以牢固夹紧。因此这次我们自制了固定两端的夹具，实现了无晃动、无不良的加工。</p><p>成品干净利落，没有弯曲或凹陷。</p>$$
WHERE slug = 'pe-rod-precision';

UPDATE posts SET
  content_ko = $$<p>르노삼성·LG 배터리팩 라인에 납품한 전기차 부품 가공 사례입니다. 아세탈(POM)을 정밀 가공해, 배터리팩 공정에 들어가는 부품을 만들었습니다.</p><p>아세탈은 내마모성과 치수 안정성이 좋아, 반복해서 쓰이는 지그나 부품에 잘 맞는 소재입니다.</p>$$,
  content_en = $$<p>EV part machining delivered to the Renault Samsung·LG battery pack line. We precision-machined acetal (POM) into parts used in the battery pack process.</p><p>Acetal offers strong wear resistance and dimensional stability, which makes it a good fit for jigs and parts that get used over and over.</p>$$,
  content_zh = $$<p>交付给雷诺三星·LG 电池组生产线的电动车部件加工案例。我们将缩醛（POM）精密加工成用于电池组工序的部件。</p><p>缩醛具有优异的耐磨性和尺寸稳定性，非常适合需要反复使用的夹具和部件。</p>$$
WHERE slug = 'ev-battery-insulation';

UPDATE posts SET
  content_ko = $$<p>상해 GM의 자동창고 시스템에 쓰이는 우레탄 시트를 가공해 납품한 사례입니다.</p><p>납품 시기는 2017년 10월입니다.</p>$$,
  content_en = $$<p>Urethane sheets machined and delivered for use in GM Shanghai's automated warehouse systems.</p><p>Delivered in October 2017.</p>$$
WHERE slug = 'gm-shanghai-insulation';

UPDATE posts SET
  content_ko = $$<p>알루미늄(AL)으로 금형을 제작한 가공 사례입니다. CNC·MCT 가공으로 형상과 치수를 정밀하게 잡았습니다.</p><p>알루미늄은 가볍고 가공성이 좋아, 시제품이나 소량 양산용 금형에 적합한 소재입니다.</p>$$,
  content_en = $$<p>A mold made from aluminum (AL). CNC/MCT machining brought the shape and dimensions to a precise finish.</p><p>Aluminum is light and easy to machine, which makes it well suited to molds for prototypes and small-batch production.</p>$$,
  content_zh = $$<p>采用铝（AL）制作模具的加工案例。通过 CNC/MCT 加工，将形状和尺寸做到精准。</p><p>铝材轻便、易于加工，非常适合用于样品和小批量生产的模具。</p>$$
WHERE slug = 'aluminum-mold-fabrication';

UPDATE posts SET
  content_ko = $$<p>현대자동차 프레스공장에 납품한 우레탄 금형받침대(TANK PAD) 사례입니다.</p><p>자체 특허 기술로 만든 우레탄 받침대는 금속에 비해 충격 흡수와 내구성이 뛰어납니다. 덕분에 프레스 금형을 안정적으로 받쳐 주고, 금형 수명을 늘리는 데도 도움이 됩니다.</p>$$,
  content_en = $$<p>Urethane mold supports (TANK PAD) delivered to Hyundai Motor's press shop.</p><p>Made with our own patented technology, these urethane supports absorb impact and resist wear better than metal. That helps the press molds sit stably and last longer.</p>$$,
  content_zh = $$<p>交付给现代汽车冲压车间的聚氨酯模具支撑（TANK PAD）案例。</p><p>采用自有专利技术制造的聚氨酯支撑，抗冲击和耐磨性优于金属，因此能稳定支撑冲压模具，并有助于延长模具寿命。</p>$$
WHERE slug = 'hyundai-urethane-bumper';

UPDATE posts SET
  content_ko = $$<p>합판에 우레탄을 코팅해 달라는 발주가 들어왔습니다.</p><p>먼저 합판을 가공한 뒤 열처리를 거칩니다. 열처리를 해야 표면이 깨끗해지고, 나무가 머금은 습기도 빠집니다. 이 과정을 끝내야 비로소 우레탄을 입힐 수 있습니다.</p><p>코팅이 끝나면 마지막으로 다듬어 제품을 완성합니다. 나무가 최대한 덜 휘고 깔끔하게 마무리되도록, 전 직원이 끝까지 정성을 들입니다.</p>$$,
  content_en = $$<p>A client asked us to coat plywood with urethane.</p><p>First we machine the plywood, then heat-treat it. The heat treatment cleans the surface and draws out the moisture held in the wood — only after that can the urethane go on.</p><p>Once the coating is done, a final trim finishes the product. Our whole team takes care through to the finish, keeping the wood as flat and clean as possible.</p>$$,
  content_zh = $$<p>客户委托在胶合板上进行聚氨酯涂层。</p><p>我们先对胶合板进行加工，再进行热处理。经过热处理，表面才会干净，木材中的水分也会排出；完成这一步之后，才能涂覆聚氨酯。</p><p>涂层完成后，再做最后修整，产品即告完成。为了让木材尽可能平整、干净，全体员工用心做到最后。</p>$$
WHERE slug = 'plywood-urethane-coating';

UPDATE posts SET
  content_ko = $$<p>SK 전지공장에 납품한 정밀 가공 사례입니다. 3D 형상의 MC(엔지니어링 플라스틱) 블록과 스테인리스(SUS) 플랜지를 도면에 맞춰 가공했습니다.</p><p>다축 가공으로 복잡한 3D 형상과 여러 개의 정밀 홀을 오차 없이 처리했습니다.</p>$$,
  content_en = $$<p>Precision machining delivered to SK's battery plant. We machined 3D-shaped MC (engineering plastic) blocks and stainless steel (SUS) flanges to the drawings.</p><p>Multi-axis machining handled the complex 3D shapes and the many precision holes without error.</p>$$,
  content_zh = $$<p>交付给 SK 电池工厂的精密加工案例。我们按图纸加工了 3D 形状的 MC（工程塑料）块和不锈钢（SUS）法兰。</p><p>通过多轴加工，准确处理了复杂的 3D 形状和多个精密孔。</p>$$
WHERE slug = 'sk-cnc-precision-parts';
