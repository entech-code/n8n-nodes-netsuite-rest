import { NetSuiteRestApiSchema } from '../../netsuite/NetSuiteRestApiSchema';
import NetSuiteRestApiSchemaService from '../../netsuite/NetSuiteRestApiSchemaService';

describe('NetSuiteRestApiSchemaService', () => {
	test('should load schema if file exists', () => {
		const service = new NetSuiteRestApiSchemaService();

		const result = service.loadFromFile();
		expect(result).not.toBeNull();

		const typedResult = result as NetSuiteRestApiSchema;
		expect(typedResult).toBeDefined();

		const openApiDocument = result.openApiDocument;

		const pathCount = openApiDocument.paths ? Object.keys(openApiDocument.paths).length : 0;
		const componentCount =
			openApiDocument.components && openApiDocument.components.schemas
				? Object.keys(openApiDocument.components.schemas).length
				: 0;
		console.log('Paths count:', pathCount);
		console.log('Components count:', componentCount);
	});
});
