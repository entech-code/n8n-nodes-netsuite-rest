import { NetSuiteRestApiSchemaBuilder } from '../../../builders/NetSuiteRestApiSchemaBuilder';
import { NodePropertyFactory } from '../../../../nodes/NetSuiteRest/NodePropertyFactory';
import type { OpenAPIV3 } from 'openapi-types';

describe('NodePropertyFactory optional and required properties are handled correctly in operation params, requestBody and respons and nested objects', () => {
	const builder = new NetSuiteRestApiSchemaBuilder();

	const path: OpenAPIV3.PathsObject = {
		'/TestEntity': {
			post: {
				summary: 'Add Test Entity',
				tags: ['TestEntity'],
				parameters: [
					{
						name: 'requiredParameter',
						in: 'query',
						required: true,
						schema: { type: 'string' },
						description: 'A required parameter',
					},
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
				required: ['testEntity_RequiredField', 'nestedEntityField', 'collectionEntityField'],
				properties: {
					testEntity_RequiredField: {
						type: 'string',
						title: 'Test Entity - Required Field',
						description: 'A required field',
					},
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
				required: ['nestedRequiredField', 'nestedNestedEntityField'],
				properties: {
					nestedRequiredField: {
						type: 'string',
						title: 'Nested Required Field',
						description: 'A nested required field',
					},
					nestedOptionalField: {
						type: 'string',
						title: 'Nested Optional Field',
						description: 'A nested optional field',
					},
					nestedNestedEntityField: {
						$ref: '#/components/schemas/testEntity-nestedNestedEntity',
					},
				},
			},
			'testEntity-nestedNestedEntity': {
				type: 'object',
				required: ['nestedNestedRequiredield'],
				properties: {
					nestedNestedRequiredield: {
						type: 'string',
						title: 'Nested Nested Required Field',
						description: 'A nested nested required field',
					},
					nestedNestedOptionalField: {
						type: 'string',
						title: 'Nested Nested Optional Field',
						description: 'A nested nested optional field',
					},
				},
			},
			'testEntity-collectionEntity': {
				type: 'object',
				required: ['items'],
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
				required: ['elementRequiredField'],
				properties: {
					elementRequiredField: {
						type: 'string',
						title: 'Element Required Field',
						description: 'A required field within the collection element',
						default: '',
					},
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
				displayName: 'Required Parameter',
				name: 'requiredParameter',
				type: 'string',
				default: '',
				description: 'A required parameter',
				required: true,
				displayOptions: {
					show: { resource: ['TestEntity'], operation: ['post /TestEntity'] },
				},
			},
			{
				displayName: 'Test Entity - Required Field',
				name: 'testEntity_RequiredField',
				type: 'string',
				default: '',
				description: 'A required field',
				required: true,
				displayOptions: {
					show: { resource: ['TestEntity'], operation: ['post /TestEntity'] },
				},
			},
			{
				displayName: 'Nested Entity Field',
				name: 'nestedEntityField',
				type: 'fixedCollection',
				default: {},
				required: true,
				displayOptions: {
					show: { resource: ['TestEntity'], operation: ['post /TestEntity'] },
				},
				options: [
					{
						name: 'testEntity-nestedEntity',
						displayName: 'Test Entity - Nested Entity',
						values: [
							{
								displayName: 'Nested Required Field',
								name: 'nestedRequiredField',
								type: 'string',
								default: '',
								description: 'A nested required field',
								required: true,
							},
							{
								displayName: 'Nested Nested Entity Field',
								name: 'nestedNestedEntityField',
								type: 'fixedCollection',
								default: {},
								required: true,
								options: [
									{
										name: 'testEntity-nestedNestedEntity',
										displayName: 'Test Entity - Nested Nested Entity',
										values: [
											{
												displayName: 'Nested Nested Required Field',
												name: 'nestedNestedRequiredield',
												type: 'string',
												default: '',
												description: 'A nested nested required field',
												required: true,
											},
											{
												displayName: 'Additional Fields',
												name: 'additionalFields',
												type: 'collection',
												default: {},
												options: [
													{
														displayName: 'Nested Nested Optional Field',
														name: 'nestedNestedOptionalField',
														type: 'string',
														default: '',
														description: 'A nested nested optional field',
													},
												],
											},
										],
									},
								],
							},
							{
								displayName: 'Additional Fields',
								name: 'additionalFields',
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
						],
					},
				],
			},
			{
				displayName: 'Collection Entity Field',
				name: 'collectionEntityField',
				type: 'fixedCollection',
				default: {},
				required: true,
				displayOptions: {
					show: { resource: ['TestEntity'], operation: ['post /TestEntity'] },
				},
				options: [
					{
						name: 'testEntity-collectionEntity',
						displayName: 'Test Entity - Collection Entity',
						values: [
							{
								displayName: 'Items',
								name: 'items',
								type: 'fixedCollection',
								default: {},
								typeOptions: { multipleValues: true },
								required: true,
								options: [
									{
										name: 'testEntity-collectionEntityElement',
										displayName: 'Test Entity - Collection Entity Element',
										values: [
											{
												displayName: 'Element Required Field',
												name: 'elementRequiredField',
												type: 'string',
												default: '',
												description: 'A required field within the collection element',
												required: true,
											},
											{
												displayName: 'Additional Fields',
												name: 'additionalFields',
												type: 'collection',
												default: {},
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
						],
					},
				],
			},
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
				],
			},
		]);
	});
});
