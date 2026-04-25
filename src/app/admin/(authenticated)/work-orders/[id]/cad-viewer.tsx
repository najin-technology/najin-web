"use client";

import { useEffect, useRef, useState } from "react";
import { X, Loader2, AlertCircle } from "lucide-react";

type Props = {
  url: string;
  fileName: string;
  ext: string;
  onClose: () => void;
};

const SUPPORTED_2D = ["dxf"];
const SUPPORTED_3D = ["step", "stp", "igs", "iges", "stl", "obj"];

export function CadViewer({ url, fileName, ext, onClose }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;
    if (!container) return;

    async function load() {
      try {
        if (SUPPORTED_2D.includes(ext)) {
          const mod = await import("dxf-viewer");
          if (cancelled || !container) return;
          const viewer = new mod.DxfViewer(container, {
            clearColor: { r: 0.98, g: 0.97, b: 0.95, a: 1 },
          });
          const buf = await fetch(url).then((r) => r.arrayBuffer());
          if (cancelled) return;
          await viewer.Load({ url: URL.createObjectURL(new Blob([buf])) });
          if (cancelled) return;
          setLoading(false);
        } else if (SUPPORTED_3D.includes(ext)) {
          const [{ default: occtImportJs }, THREE, { OrbitControls }] = await Promise.all([
            import("occt-import-js"),
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
            } else if (ext === "step" || ext === "stp" || ext === "igs" || ext === "iges") {
              const occt = await occtImportJs();
              const result =
                ext === "step" || ext === "stp"
                  ? occt.ReadStepFile(new Uint8Array(buf), null)
                  : occt.ReadIgesFile(new Uint8Array(buf), null);
              if (result?.meshes) {
                for (const mesh of result.meshes) {
                  const geom = new THREE.BufferGeometry();
                  geom.setAttribute(
                    "position",
                    new THREE.Float32BufferAttribute(mesh.attributes.position.array, 3)
                  );
                  if (mesh.attributes.normal) {
                    geom.setAttribute(
                      "normal",
                      new THREE.Float32BufferAttribute(mesh.attributes.normal.array, 3)
                    );
                  } else {
                    geom.computeVertexNormals();
                  }
                  geom.setIndex(mesh.index.array);
                  const material = new THREE.MeshStandardMaterial({
                    color: mesh.color
                      ? new THREE.Color(mesh.color[0], mesh.color[1], mesh.color[2])
                      : 0x4a90e2,
                    flatShading: false,
                  });
                  scene.add(new THREE.Mesh(geom, material));
                }
              }
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

          const animate = () => {
            if (cancelled) return;
            requestAnimationFrame(animate);
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
            <p className="font-mono text-sm font-semibold text-brand-navy truncate">{fileName}</p>
            <p className="text-[11px] text-gray-400 uppercase tracking-widest">{ext} 미리보기</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="flex-1 relative overflow-hidden rounded-b-2xl">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-surface-warm-50">
              <Loader2 className="w-6 h-6 text-brand-copper animate-spin" />
              <p className="text-xs text-gray-500">미리보기 로드 중...</p>
              <p className="text-[10px] text-gray-400">큰 파일은 시간이 걸릴 수 있습니다</p>
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
