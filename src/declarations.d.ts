declare module 'swagger-ui-react' {
  import { ComponentType } from 'react';

  interface SwaggerRequest {
    url: string;
    method: string;
    body?: unknown;
    headers?: Record<string, string>;
    [key: string]: unknown;
  }

  interface SwaggerResponse {
    status: number;
    ok: boolean;
    url: string;
    headers: Record<string, string>;
    body?: unknown;
    [key: string]: unknown;
  }

  interface SwaggerUIProps {
    url?: string;
    spec?: Record<string, unknown>;
    docExpansion?: 'none' | 'list' | 'full';
    defaultModelsExpandDepth?: number;
    defaultModelExpandDepth?: number;
    supportedSubmitMethods?: Array<'get' | 'put' | 'post' | 'delete' | 'options' | 'head' | 'patch' | 'trace'>;
    displayOperationId?: boolean;
    displayRequestDuration?: boolean;
    tryItOutEnabled?: boolean;
    requestInterceptor?: (req: SwaggerRequest) => SwaggerRequest;
    responseInterceptor?: (res: SwaggerResponse) => SwaggerResponse;
    presets?: unknown[];
    plugins?: unknown[];
    layout?: string;
    validatorUrl?: string | null;
  }

  const SwaggerUI: ComponentType<SwaggerUIProps>;
  export default SwaggerUI;
}
