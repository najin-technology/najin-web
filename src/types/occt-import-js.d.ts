declare module "occt-import-js" {
  type OcctMesh = {
    attributes: {
      position: { array: number[] };
      normal?: { array: number[] };
    };
    index: { array: number[] };
    color?: number[];
  };
  type OcctResult = {
    success: boolean;
    meshes?: OcctMesh[];
  };
  type OcctApi = {
    ReadStepFile: (data: Uint8Array, params: unknown) => OcctResult;
    ReadIgesFile: (data: Uint8Array, params: unknown) => OcctResult;
    ReadBrepFile: (data: Uint8Array, params: unknown) => OcctResult;
  };
  type OcctFactory = (config?: { locateFile?: (path: string) => string }) => Promise<OcctApi>;
  const factory: OcctFactory;
  export default factory;
}
