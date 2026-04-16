import { Project, ts } from "ts-morph";

export function createProject(absoluteFilePaths: string[]): Project {
  const project = new Project({
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      jsx: ts.JsxEmit.ReactJSX,
      strict: true,
    },
  });

  for (const filePath of absoluteFilePaths) {
    project.addSourceFileAtPath(filePath);
  }

  return project;
}
