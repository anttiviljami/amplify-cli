import { FunctionRuntimeContributorFactory } from 'amplify-function-plugin-interface';
import { buildResource } from './utils/legacyBuild';
import { packageResource } from './utils/legacyPackage';
import { invoke } from './utils/invoke';
import path from 'path';

export const functionRuntimeContributorFactory: FunctionRuntimeContributorFactory = context => {
  return {
    contribute: request => {
      const selection = request.selection;
      if (selection !== 'nodejs') {
        return Promise.reject(new Error(`Unknown selection ${selection}`));
      }
      return Promise.resolve({
        runtime: {
          name: 'NodeJS',
          value: 'nodejs',
          cloudTemplateValue: 'nodejs12.x',
          defaultHandler: 'index.handler',
          layerExecutablePath: 'nodejs/node_modules/',
          layerDefaultFiles: [
            {
              path: 'nodejs/',
              filename: 'package.json',
              content: JSON.stringify({
                name: 'nodejs',
                version: '1.0.0',
                description: '',
                main: 'index.js',
                dependencies: {},
                devDependencies: {},
                scripts: {
                  test: 'echo "Error: no test specified" && exit 1',
                },
                author: '',
                license: 'ISC',
              }),
            },
          ],
        },
      });
    },
    checkDependencies: () => Promise.resolve({ hasRequiredDependencies: true }),
    package: params => packageResource(params, context),
    build: params => buildResource(params),
    invoke: async params => {
      await buildResource(params);
      return invoke({
        packageFolder: path.join(params.srcRoot, 'src'),
        handler: params.handler,
        event: params.event,
        environment: params.envVars,
      });
    },
  };
};
