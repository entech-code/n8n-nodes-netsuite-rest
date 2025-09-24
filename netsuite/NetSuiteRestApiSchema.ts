import type { OpenAPIV3 } from 'openapi-types';
import { ApplicationError } from 'n8n-workflow';
import { OpenApiUtils } from '../utils/OpenApiUtils';

export interface Operation {
	operationId: string;
	apiOperation: OpenAPIV3.OperationObject;
}

export class NetSuiteRestApiSchema {
	public openApiDocument: OpenAPIV3.Document;

	public tagToOperationsMap: Record<string, Operation[]>;

	public nameToComponentMap: Record<string, OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject>;

	constructor(openApiDocument: OpenAPIV3.Document) {
		this.openApiDocument = openApiDocument;

		if (!this.openApiDocument?.paths || !this.openApiDocument?.components?.schemas) {
			throw new ApplicationError('Invalid schema: Missing components or schemas');
		}
		this.tagToOperationsMap = this.getTagToOperationsMap();
		this.nameToComponentMap = this.getNameToComponentMap();
	}

	getTagToOperationsMap(): Record<string, Operation[]> {
		const map: Record<string, Operation[]> = {};

		for (const [pathName, pathItem] of Object.entries(this.openApiDocument.paths)) {
			if (!pathItem) continue;

			for (const method of Object.keys(pathItem)) {
				this.validateMethod(method);

				const apiOperation = pathItem[method as (typeof OpenApiUtils.validHttpMethods)[number]] as
					| OpenAPIV3.OperationObject
					| undefined;

				if (apiOperation && Array.isArray(apiOperation.tags)) {
					if (apiOperation.tags.length !== 1)
						throw new ApplicationError('Each path must have exactly one tag');

					const tag = apiOperation.tags[0];

					if (!map[tag]) {
						map[tag] = new Array<Operation>();
					}

					const operationId = this.getOperationId(pathName, method);
					map[tag].push({ operationId, apiOperation: apiOperation });
				}
			}
		}

		return map;
	}

	private getOperationId(urlPath: string, method: string) {
		return `${method} ${urlPath}`;
	}

	verifyAllItemsAreSame(items: string[]): void {
		const allItemsAreSame = items.every((item) => item === items[0]);

		if (!allItemsAreSame) {
			throw new ApplicationError('Not all items are the same in the array: ' + items.join(', '));
		}
	}

	getNameToComponentMap(): Record<string, OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject> {
		const map: Record<string, OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject> = {};
		const schemas = this.openApiDocument.components?.schemas ?? {};

		for (const [name, schemaObj] of Object.entries(schemas)) {
			map[name] = schemaObj;
		}

		return map;
	}

	getComponentNameFromRef(ref: string, isTopLevelInBodyRequest: boolean = false): string {
		// Extract component name from $ref (e.g., '#/components/schemas/Customer')
		const match = ref.match(/#\/components\/schemas\/(.+)$/i);
		let componentName = '';
		if (match) {
			componentName = match[1];

			if (!isTopLevelInBodyRequest) {
				// there are 3 types of references
				// 1. ns<Resource | Error ...> - standard NetSuite components
				// 2. customer-someCollection or customer-address - nested objects
				// 3. parent of type Customer - can cause circular references. In which case we go with nsResource

				if (!componentName.startsWith('ns') && !componentName.includes('-'))
					componentName = 'nsResource';
			}

			// Handle namespaced components
			if (this.nameToComponentMap[componentName]) return componentName;
		}

		throw new ApplicationError(
			`Component not found for reference: ${ref}, component name: ${componentName}`,
		);
	}

	getApiOperation(tag: string, urlPath: string, httpMethod: string): OpenAPIV3.OperationObject {
		return this.getApiOperationByTagAndOperationId(tag, this.getOperationId(urlPath, httpMethod));
	}

	getApiOperationByTagAndOperationId(tag: string, operationId: string): OpenAPIV3.OperationObject {
		const operations = this.tagToOperationsMap[tag];
		if (!operations || operations.length === 0) {
			throw new ApplicationError(`No operations found for tag: ${tag}`);
		}

		for (const { operationId: opId, apiOperation: operation } of operations) {
			if (opId === operationId) {
				return operation;
			}
		}

		throw new ApplicationError(
			`Could not find operation with tag ${tag} and OperationId: ${operationId}`,
		);
	}

	private validateMethod(method: string): void {
		if (!OpenApiUtils.validHttpMethods.includes(method as any)) {
			throw new ApplicationError(`Invalid HTTP method: ${method}`);
		}
	}
}

export default NetSuiteRestApiSchema;
