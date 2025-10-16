import NetSuiteRestApiSchema from './NetSuiteRestApiSchema';
import { OPEN_API_SCHEMA } from './OpenApiSchema';
import type { OpenAPIV3 } from 'openapi-types';

export class NetSuiteRestApiSchemaService {
	load(): NetSuiteRestApiSchema {
		const openApiDocument: OpenAPIV3.Document = OPEN_API_SCHEMA;
		const schema = new NetSuiteRestApiSchema(openApiDocument);
		return schema;
	}
}

export default NetSuiteRestApiSchemaService;
