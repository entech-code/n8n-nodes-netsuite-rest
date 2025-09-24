import type { OpenAPIV3 } from 'openapi-types';
import NetSuiteRestApiSchema from '../../netsuite/NetSuiteRestApiSchema';

export class NetSuiteRestApiSchemaBuilder {
	private openApiDocument: OpenAPIV3.Document;

	constructor() {
		this.openApiDocument = {
			openapi: '3.0.0',
			info: { title: 'Test Schema', version: '1.0.0' },
			paths: {},
			components: { schemas: {} },
		};
	}

	addPath(path: OpenAPIV3.PathsObject) {
		this.openApiDocument.paths = { ...this.openApiDocument.paths, ...path };
		return this;
	}

	addComponent(component: OpenAPIV3.ComponentsObject) {
		if (!this.openApiDocument.components) {
			this.openApiDocument.components = {};
		}
		if (component.schemas) {
			this.openApiDocument.components.schemas = {
				...(this.openApiDocument.components.schemas || {}),
				...component.schemas,
			};
		}
		return this;
	}

	addNsResourceComponent() {
		this.addComponent({
			schemas: {
				nsResource: {
					type: 'object',
					properties: {
						id: {
							title: 'Internal identifier',
							type: 'string',
						},
						refName: {
							title: 'Reference Name',
							type: 'string',
						},
						externalId: {
							title: 'External identifier',
							type: 'string',
						},
						links: {
							title: 'Links',
							type: 'array',
							readOnly: true,
							items: {
								$ref: '#/components/schemas/nsLink',
							},
						},
					},
				},
			},
		});
	}

	Build() {
		return new NetSuiteRestApiSchema(this.openApiDocument);
	}
}
