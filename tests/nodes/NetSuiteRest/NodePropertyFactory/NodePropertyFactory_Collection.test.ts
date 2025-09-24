import { NetSuiteRestApiSchemaBuilder } from '../../../builders/NetSuiteRestApiSchemaBuilder';
import { NodePropertyFactory } from '../../../../nodes/NetSuiteRest/NodePropertyFactory';
import type { OpenAPIV3 } from 'openapi-types';

describe('NodePropertyFactory creating properties when Component has Array property', () => {
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
				required: ['topStringField', 'collectionEntityField'],
				properties: {
					topStringField: {
						type: 'string',
						title: 'Top String Field',
						description: 'A string field',
					},
					collectionEntityField: {
						$ref: '#/components/schemas/testEntity-collectionEntity',
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
				required: ['elementStringField'],
				properties: {
					elementStringField: {
						type: 'string',
						title: 'Element String Field',
						description: 'A string field within the collection element',
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
				displayName: 'Collection Entity Field',
				name: 'collectionEntityField',
				type: 'fixedCollection',
				required: true,
				default: {},
				options: [
					{
						name: 'testEntity-collectionEntity',
						displayName: 'Test Entity - Collection Entity',
						values: [
							{
								displayName: 'Items',
								name: 'items',
								type: 'fixedCollection',
								required: true,
								typeOptions: { multipleValues: true },
								default: {},
								options: [
									{
										name: 'testEntity-collectionEntityElement',
										displayName: 'Test Entity - Collection Entity Element',
										values: [
											{
												displayName: 'Element String Field',
												name: 'elementStringField',
												type: 'string',
												required: true,
												default: '',
												description: 'A string field within the collection element',
											},
										],
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
