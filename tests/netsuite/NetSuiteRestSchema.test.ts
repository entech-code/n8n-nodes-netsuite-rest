import { NetSuiteRestApiSchemaBuilder } from '../builders/NetSuiteRestApiSchemaBuilder';
import type { OpenAPIV3 } from 'openapi-types';

describe('NetSuiteRestApiSchema', () => {
	const builder = new NetSuiteRestApiSchemaBuilder();
	const path: OpenAPIV3.PathsObject = {
		'/customer': {
			get: {
				summary: 'Get Customer',
				tags: ['Customer'],
				parameters: [
					{
						name: 'email',
						in: 'query',
						required: true,
						schema: { type: 'string' },
						description: 'Customer email address',
					},
				],
				responses: {
					'200': {
						description: 'Customer found',
					},
				},
			},
			post: {
				summary: 'Add Customer',
				tags: ['Customer'],
				requestBody: {
					required: true,
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/Customer',
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

	// Add components Customer and Address
	builder.addComponent({
		schemas: {
			Customer: {
				type: 'object',
				required: ['email'],
				properties: {
					email: { type: 'string', description: 'Customer email address' },
					firstName: { type: 'string', description: 'Customer first name' },
					lastName: { type: 'string', description: 'Customer last name' },
					id: { type: 'string' },
					name: { type: 'string' },
				},
			},
			Address: {
				type: 'object',
				properties: {
					street: { type: 'string' },
					city: { type: 'string' },
				},
			},
		},
	});

	test('getTagToOperations return customer with operations', () => {
		const schema = builder.Build();
		expect(schema.openApiDocument.paths['/customer']).toBeDefined();

		const tagMap = schema.getTagToOperationsMap();

		expect(tagMap).toHaveProperty('Customer');
		expect(Array.isArray(tagMap['Customer'])).toBe(true);
		expect(tagMap['Customer'].length).toBe(2);
	});

	test('getNameToComponentMap returns correct components', () => {
		const schema = builder.Build();

		const compMap = schema.getNameToComponentMap();

		expect(compMap).toHaveProperty('Customer');
		expect(compMap).toHaveProperty('Address');
		expect(compMap['Customer']).toMatchObject({
			type: 'object',
			properties: { id: { type: 'string' }, name: { type: 'string' } },
		});
		expect(compMap['Address']).toMatchObject({
			type: 'object',
			properties: { street: { type: 'string' }, city: { type: 'string' } },
		});
	});
});
