import { NetSuiteRestApiSchemaBuilder } from '../../../builders/NetSuiteRestApiSchemaBuilder';
import { NodePropertyFactory } from '../../../../nodes/NetSuiteRest/NodePropertyFactory';
import type { OpenAPIV3 } from 'openapi-types';

describe('NodePropertyFactory creating properties when Component Reference in RequestBody', () => {
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
				required: ['topStringField', 'nestedEntityField'],
				properties: {
					topStringField: {
						type: 'string',
						title: 'Top String Field',
						description: 'A string field',
					},
					nestedEntityField: {
						$ref: '#/components/schemas/testEntity-nestedEntity',
					},
				},
			},
			'testEntity-nestedEntity': {
				type: 'object',
				required: ['nestedStringField', 'nestedDateField', 'nestedNestedEntityField'],
				properties: {
					nestedStringField: {
						type: 'string',
						title: 'Nested String Field',
						description: 'A nested string field',
					},
					nestedDateField: {
						type: 'string',
						format: 'date',
						title: 'Nested Date Field',
						description: 'A nested date field',
					},
					nestedNestedEntityField: {
						$ref: '#/components/schemas/testEntity-nestedNestedEntity',
					},
				},
			},
			'testEntity-nestedNestedEntity': {
				type: 'object',
				required: ['nestedNestedStringField'],
				properties: {
					nestedNestedStringField: {
						type: 'string',
						title: 'Nested Nested String Field',
						description: 'A nested nested string field',
					},
				},
			},
		},
	});

	test('createPropertiesForOperationRequestBody returns collection property for component with fields that references another component', () => {
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
				displayName: 'Nested Entity Field',
				name: 'nestedEntityField',
				type: 'fixedCollection',
				required: true,
				default: {},
				options: [
					{
						displayName: 'Test Entity - Nested Entity',
						name: 'testEntity-nestedEntity',
						values: [
							{
								displayName: 'Nested String Field',
								name: 'nestedStringField',
								type: 'string',
								required: true,
								description: 'A nested string field',
								default: '',
							},
							{
								displayName: 'Nested Date Field',
								name: 'nestedDateField',
								type: 'dateTime',
								description: 'A nested date field',
								default: '',
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
												displayName: 'Nested Nested String Field',
												name: 'nestedNestedStringField',
												type: 'string',
												required: true,
												description: 'A nested nested string field',
												default: '',
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
