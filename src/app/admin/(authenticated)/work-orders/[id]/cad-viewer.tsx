"use client";

import { useEffect, useRef, useState } from "react";
import { X, Loader2, AlertCircle } from "lucide-react";
// 타입 전용 import — 컴파일 시 지워지므로 three 가 번들에 들어가지 않는다.
import type * as ThreeNS from "three";

type Props = {
  url: string;
  fileName: string;
  ext: string;
  onClose: () => void;
};

const SUPPORTED_2D = ["dxf"];
// ponytail: STEP/IGES 는 occt-import-js(7.6MB wasm)가 필요한데, emscripten 이
// 런타임에 경로를 조립해서 번들러가 wasm 을 emit 하지 못한다 → 배포본에 파일이
// 없어 100% 실패했다. 첨부 이력 0건이라 wasm 을 커밋하는 대신 제거하고
// 다운로드 안내로 넘긴다. 필요해지면 public/wasm/ 에 넣고 locateFile 지정.
const SUPPORTED_3D = ["stl", "obj"];

export function CadViewer({ url, fileName, ext, onClose }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;
    if (!container) return;

    // 정리해야 할 자원들. cleanup 이 container.innerHTML="" 만 하면
    // WebGL 컨텍스트·지오메트리·리스너가 그대로 남는다(브라우저당 컨텍스트
    // 상한이 있어서 뷰어를 여러 번 열면 결국 렌더가 죽는다).
    const disposers: Array<() => void> = [];
    let objectUrl: string | null = null;

    async function load() {
      try {
        if (SUPPORTED_2D.includes(ext)) {
          const [mod, THREE] = await Promise.all([import("dxf-viewer"), import("three")]);
          if (cancelled || !container) return;
          // clearColor 는 THREE.Color 여야 한다. 평범한 {r,g,b,a} 객체를 넘기면
          // DxfViewer 생성자의 this.options.clearColor.getHex() 에서 즉시
          // TypeError → DXF 미리보기가 100% 실패했다.
          const viewer = new mod.DxfViewer(container, {
            clearColor: new THREE.Color(0xfaf8f5),
            clearAlpha: 1,
          });
          disposers.push(() => viewer.Destroy());
          const buf = await fetch(url).then((r) => r.arrayBuffer());
          if (cancelled) return;
          objectUrl = URL.createObjectURL(new Blob([buf]));
          await viewer.Load({ url: objectUrl });
          if (cancelled) return;
          setLoading(false);
        } else if (SUPPORTED_3D.includes(ext)) {
          const [THREE, { OrbitControls }] = await Promise.all([
            import("three"),
            import("three/examples/jsm/controls/OrbitControls.js"),
          ]);
          if (cancelled || !container) return;

          const scene = new THREE.Scene();
          scene.background = new THREE.Color(0xfaf8f5);
          const camera = new THREE.PerspectiveCamera(
            45,
            container.clientWidth / container.clientHeight,
            0.1,
            10000
          );
          const renderer = new THREE.WebGLRenderer({ antialias: true });
          renderer.setSize(container.clientWidth, container.clientHeight);
          container.innerHTML = "";
          container.appendChild(renderer.domElement);

          scene.add(new THREE.AmbientLight(0xffffff, 0.6));
          const dir = new THREE.DirectionalLight(0xffffff, 0.8);
          dir.position.set(1, 1, 1);
          scene.add(dir);

          const controls = new OrbitControls(camera, renderer.domElement);

          // load file
          const buf = await fetch(url).then((r) => r.arrayBuffer());
          if (cancelled) return;

          try {
            if (ext === "stl") {
              const { STLLoader } = await import("three/examples/jsm/loaders/STLLoader.js");
              const loader = new STLLoader();
              const geometry = loader.parse(buf);
              const material = new THREE.MeshStandardMaterial({ color: 0x4a90e2, flatShading: true });
              scene.add(new THREE.Mesh(geometry, material));
            } else if (ext === "obj") {
              const { OBJLoader } = await import("three/examples/jsm/loaders/OBJLoader.js");
              const loader = new OBJLoader();
              const text = new TextDecoder().decode(buf);
              const obj = loader.parse(text);
              scene.add(obj);
            }
          } catch (e) {
            console.error(e);
            setError("이 파일은 인앱 미리보기를 지원하지 않습니다. 다운로드해서 PC 뷰어로 열어주세요.");
            setLoading(false);
            return;
          }

          // Center + zoom to fit
          const box = new THREE.Box3().setFromObject(scene);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          camera.position.set(center.x + maxDim * 1.5, center.y + maxDim * 1.2, center.z + maxDim * 1.5);
          controls.target.copy(center);
          controls.update();

          if (cancelled) return;
          setLoading(false);

          let raf = 0;
          const animate = () => {
            if (cancelled) return;
            raf = requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
          };
          animate();

          const onResize = () => {
            if (!container) return;
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
          };
          window.addEventListener("resize", onResize);

          disposers.push(() => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", onResize);
            controls.dispose();
            scene.traverse((o) => {
              const m = o as ThreeNS.Mesh;
              m.geometry?.dispose?.();
              const mat = m.material;
              if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
              else mat?.dispose?.();
            });
            // WebGL 컨텍스트를 명시적으로 반납한다. dispose() 만으로는
            // 컨텍스트가 GC 될 때까지 남아 상한(보통 16개)을 잡아먹는다.
            renderer.forceContextLoss();
            renderer.dispose();
          });
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setError("미리보기 실패: " + (e instanceof Error ? e.message : "unknown"));
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
      for (const d of disposers) {
        try {
          d();
        } catch {
          /* 정리 실패가 언마운트를 막지 않게 한다 */
        }
      }
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      if (container) container.innerHTML = "";
    };
  }, [url, ext]);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-surface-warm-50 rounded-2xl shadow-2xl w-full max-w-5xl h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <div className="min-w-0">
            <p className="font-mono text-sm font-bold text-brand-navy truncate">{fileName}</p>
            <p className="text-xs text-gray-600 uppercase tracking-widest font-bold">{ext} 미리보기</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="미리보기 닫기"
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-brand-charcoal transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 relative overflow-hidden rounded-b-2xl">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-surface-warm-50">
              <Loader2 className="w-7 h-7 text-brand-copper animate-spin" />
              <p className="text-sm text-gray-700 font-semibold">미리보기 로드 중...</p>
              <p className="text-xs text-gray-500 font-medium">큰 파일은 시간이 걸릴 수 있습니다</p>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
              <AlertCircle className="w-6 h-6 text-rose-400" />
              <p className="text-sm text-rose-700">{error}</p>
              <a
                href={url}
                download={fileName}
                className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-medium text-brand-charcoal hover:bg-white"
              >
                다운로드하기
              </a>
            </div>
          )}
          <div ref={containerRef} className="w-full h-full" />
        </div>
      </div>
    </div>
  );
}
