import * as fs from 'fs';
import * as path from 'path';
import type { OpenAPIV3 } from 'openapi-types';
import { ApplicationError } from 'n8n-workflow';
import NetSuiteRestApiSchema from './NetSuiteRestApiSchema';

export class NetSuiteRestApiSchemaService {
	/**
	 * Loads the OpenAPI schema from rest-schema.json and returns the parsed SchemaObject.
	 */
	loadFromFile(): NetSuiteRestApiSchema {
		//const filePath = path.join(__dirname, 'customer-rest-schema.json');
		const filePath = path.join(__dirname, 'rest-schema.json');
		//const filePath = path.join(__dirname, 'missing-rest-schema.json');

		if (!fs.existsSync(filePath)) {
			throw new ApplicationError(`Schema file not found: ${filePath}`);
		}
		const data = fs.readFileSync(filePath, 'utf8');
		const openAPiDocument: OpenAPIV3.Document = JSON.parse(data);
		const schema = new NetSuiteRestApiSchema(openAPiDocument);
		return schema;
	}
}

export default NetSuiteRestApiSchemaService;
