import { resolve } from "node:path";

export default [
  {
    requestLibPath: "import request from '@workspace/ui/lib/request';",
    serversPath: "./src/services",
    schemaPath: resolve("backend-openapi.json"),
    templatesFolder: resolve("openapi-templates"),
    projectName: "backend",
    namespace: "BackendAPI",
    apiPrefix: "process.env.NEXT_PUBLIC_API_PREFIX || ''",
  },
];
