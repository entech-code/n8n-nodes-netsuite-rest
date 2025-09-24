import { NetSuiteRestApiSchemaBuilder } from '../../../builders/NetSuiteRestApiSchemaBuilder';
import { NodePropertyFactory } from '../../../../nodes/NetSuiteRestTest/NodePropertyFactory';
import type { OpenAPIV3 } from 'openapi-types';

describe('NodePropertyFactory creating properties when Component has Object property', () => {
	const builder = new NetSuiteRestApiSchemaBuilder();
	const path: OpenAPIV3.PathsObject = {
		'/TestEntity': {
			post: {
				summary: 'Add Test Entity',
				tags: ['TestEntity'],
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
						description: 'Customer created',
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
				required: ['topStringField', 'referenceField', 'parent', 'parent2'],
				properties: {
					topStringField: {
						type: 'string',
						title: 'Top String Field',
						description: 'A string field',
					},
					referenceField: {
						$ref: '#/components/schemas/testEntity-referenceEntity',
					},
					parent: {
						$ref: '#/components/schemas/testEntity',
					},
					parent2: {
						oneOf: [{ $ref: '#/components/schemas/testEntity' }],
					},
				},
			},
			'testEntity-referenceEntity': {
				type: 'object',
				required: ['nestedStringField', 'nestedObjectField'],
				properties: {
					nestedStringField: {
						type: 'string',
						title: 'Nested String Field',
						description: 'A nested string field',
					},
					nestedObjectField: {
						type: 'object',
						required: ['nestedObjStringField'],
						properties: {
							nestedObjStringField: {
								type: 'string',
								title: 'Nested Object String Field',
								description: 'A nested object string field',
							},
						},
					},
				},
			},
		},
	});

	builder.addNsResourceComponent();

	test('createPropertiesForOperationRequestBody returns collection property for component with nested component', () => {
		const schema = builder.Build();
		const factory = new NodePropertyFactory(schema);

		const operation = schema.getApiOperation('TestEntity', '/TestEntity', 'post');

		const props = factory.createN8nPropertiesForApiOperationRequestBody(operation);

		expect(props).toEqual([
			{
				displayName: 'Top String Field',
				name: 'topStringField',
				type: 'string',
				required: true,
				description: 'A string field',
				default: '',
			},
			{
				displayName: 'Reference Field',
				name: 'referenceField',
				type: 'fixedCollection',
				required: true,
				default: {},
				options: [
					{
						name: 'testEntity-referenceEntity',
						displayName: 'Test Entity - Reference Entity',
						values: [
							{
								displayName: 'Nested String Field',
								name: 'nestedStringField',
								type: 'string',
								description: 'A nested string field',
								default: '',
								required: true,
							},
							{
								displayName: 'Nested Object Field',
								name: 'nestedObjectField',
								type: 'fixedCollection',
								default: {},
								required: true,
								options: [
									{
										name: 'anonymousObject',
										displayName: 'Anonymous Object',
										values: [
											{
												displayName: 'Nested Object String Field',
												name: 'nestedObjStringField',
												type: 'string',
												description: 'A nested object string field',
												default: '',
												required: true,
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
				displayName: 'Parent',
				name: 'parent',
				type: 'collection',
				default: {},
				required: true,
				options: [
					{
						displayName: 'Internal identifier',
						name: 'id',
						type: 'string',
						default: '',
						description: '',
					},
					{
						displayName: 'External identifier',
						name: 'externalId',
						type: 'string',
						default: '',
						description: '',
					},
				],
			},
			{
				displayName: 'Parent2',
				name: 'parent2',
				type: 'collection',
				default: {},
				required: true,
				options: [
					{
						displayName: 'Internal identifier',
						name: 'id',
						type: 'string',
						default: '',
						description: '',
					},
					{
						displayName: 'External identifier',
						name: 'externalId',
						type: 'string',
						default: '',
						description: '',
					},
				],
			},
		]);
	});
});
