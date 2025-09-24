import { NetSuiteRestApiSchemaBuilder } from '../../../builders/NetSuiteRestApiSchemaBuilder';
import { NodePropertyFactory } from '../../../../nodes/NetSuiteRest/NodePropertyFactory';
import type { OpenAPIV3 } from 'openapi-types';

describe('NodePropertyFactory optional only are handled correctly in operation params, requestBody and respons and nested objects', () => {
	const builder = new NetSuiteRestApiSchemaBuilder();

	const path: OpenAPIV3.PathsObject = {
		'/TestEntity': {
			post: {
				summary: 'Add Test Entity',
				tags: ['TestEntity'],
				parameters: [
					{
						name: 'optionalParameter',
						in: 'query',
						required: false,
						schema: { type: 'string' },
						description: 'An optional parameter',
					},
				],
				requestBody: {
					required: true,
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/testEntity',
							},
						},
					},
				},
				responses: {
					'201': {
						description: 'testEntity created',
					},
				},
			},
		},
	};
	builder.addPath(path);

	builder.addComponent({
		schemas: {
			testEntity: {
				type: 'object',
				properties: {
					testEntity_OptionalField: {
						type: 'string',
						title: 'Test Entity - Optional Field',
						description: 'An optional field',
					},
					nestedEntityField: {
						$ref: '#/components/schemas/testEntity-nestedEntity',
					},
					collectionEntityField: {
						$ref: '#/components/schemas/testEntity-collectionEntity',
					},
				},
			},
			'testEntity-nestedEntity': {
				type: 'object',
				properties: {
					nestedOptionalField: {
						type: 'string',
						title: 'Nested Optional Field',
						description: 'A nested optional field',
					},
				},
			},
			'testEntity-nestedNestedEntity': {
				type: 'object',
				properties: {
					nestedNestedOptionalField: {
						type: 'string',
						title: 'Nested Nested Optional Field',
						description: 'A nested nested optional field',
					},
				},
			},
			'testEntity-collectionEntity': {
				type: 'object',
				properties: {
					items: {
						type: 'array',
						items: {
							$ref: '#/components/schemas/testEntity-collectionEntityElement',
						},
					},
				},
			},
			'testEntity-collectionEntityElement': {
				type: 'object',
				properties: {
					elementOptionalField: {
						type: 'string',
						title: 'Element Optional Field',
						description: 'An optional field within the collection element',
						default: '',
					},
				},
			},
		},
	});

	test('createPropertiesForOperationRequestBody returns property for Collection nested entity', () => {
		const schema = builder.Build();
		const factory = new NodePropertyFactory(schema);
		const operation = schema.getApiOperation('TestEntity', '/TestEntity', 'post');
		const props = factory.createN8nPropertiesForApiOperation(
			operation,
			'TestEntity',
			'post /TestEntity',
		);

		expect(props).toEqual([
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				default: {},
				displayOptions: {
					show: {
						resource: ['TestEntity'],
						operation: ['post /TestEntity'],
					},
				},
				options: [
					{
						displayName: 'Optional Parameter',
						name: 'optionalParameter',
						type: 'string',
						default: '',
						description: 'An optional parameter',
					},
					{
						displayName: 'Test Entity - Optional Field',
						name: 'testEntity_OptionalField',
						type: 'string',
						default: '',
						description: 'An optional field',
					},
					{
						displayName: 'Nested Entity Field',
						name: 'nestedEntityField',
						type: 'collection',
						default: {},
						options: [
							{
								displayName: 'Nested Optional Field',
								name: 'nestedOptionalField',
								type: 'string',
								default: '',
								description: 'A nested optional field',
							},
						],
					},
					{
						displayName: 'Collection Entity Field',
						name: 'collectionEntityField',
						type: 'collection',
						default: {},
						options: [
							{
								displayName: 'Items',
								name: 'items',
								type: 'collection',
								default: {},
								typeOptions: { multipleValues: true },
								options: [
									{
										displayName: 'Element Optional Field',
										name: 'elementOptionalField',
										type: 'string',
										default: '',
										description: 'An optional field within the collection element',
									},
								],
							},
						],
					},
				],
			},
		]);
	});
});
