import { NetSuiteRestApiSchemaBuilder } from '../../../builders/NetSuiteRestApiSchemaBuilder';
import { NodeOperationExecutor } from '../../../../nodes/NetSuiteRest/NodeOperationExecutor';
import type { OpenAPIV3 } from 'openapi-types';
import { ApplicationError } from 'n8n-workflow';

describe('NodeOperationExecutor  converts n8n node properties to correct http request data', () => {
	const builder = new NetSuiteRestApiSchemaBuilder();
	const path: OpenAPIV3.PathsObject = {
		'/TestEntity/{pathStringParameter}': {
			post: {
				summary: 'Add Test Entity',
				tags: ['TestEntity'],
				parameters: [
					{
						name: 'pathStringParameter',
						in: 'path',
						required: true,
						schema: { type: 'string' },
						description: 'A path string parameter',
					},
					{
						name: 'pathStringParameter2',
						in: 'path',
						required: true,
						schema: { type: 'string' },
						description: 'A path string parameter 2',
					},
					{
						name: 'headerStringParameter',
						in: 'header',
						required: true,
						schema: { type: 'string' },
						description: 'A header string parameter',
					},

					{
						name: 'queryStringParameter',
						in: 'query',
						required: true,
						schema: { type: 'string' },
						description: 'A query string parameter',
					},
				],
				requestBody: {
					required: true,
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/TestEntity',
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
			TestEntity: {
				type: 'object',
				required: ['bodyStringField'],
				properties: {
					bodyStringField: {
						type: 'string',
						title: 'Body String Field',
						description: 'A body string field',
					},
				},
			},
		},
	});

	test('createPropertiesForOperationParameters creates correct params for TestEntity get', () => {
		const schema = builder.Build();

		const params: Record<string, any> = {
			pathStringParameter: 'pathStringParameter1',
			headerStringParameter: 'headerStringParameter1',
			queryStringParameter: 'queryStringParameter1',
			bodyStringField: 'bodyStringField1',
		};

		const httpRequestData = NodeOperationExecutor.convertParametersToHttpRequestData(
			'TestEntity',
			'post /TestEntity/{pathStringParameter}',
			params,
			schema,
		);

		expect(httpRequestData).toEqual({
			HttpMethod: 'POST',
			RequestUrl: '/TestEntity/pathStringParameter1',
			Headers: {
				headerStringParameter: 'headerStringParameter1',
			},
			QueryString: {
				queryStringParameter: 'queryStringParameter1',
			},
			RequestBody: {
				bodyStringField: 'bodyStringField1',
			},
		});
	});

	test('createPropertiesForOperationParameters throws error if path Parameter is not on path', () => {
		const schema = builder.Build();

		const params: Record<string, any> = {
			pathStringParameter2: 'pathStringParameter2',
		};

		expect(() => {
			const httpRequestData = NodeOperationExecutor.convertParametersToHttpRequestData(
				'TestEntity',
				'post /TestEntity/{pathStringParameter}',
				params,
				schema,
			);

			expect(httpRequestData).toBeUndefined();
		}).toThrow(
			new ApplicationError(
				`Path parameter 'pathStringParameter2' not found in urlPath '/TestEntity/{pathStringParameter}'`,
			),
		);
	});

	test('createPropertiesForOperationParameters handles custom fields correctly', () => {
		const schema = builder.Build();

		const params: Record<string, any> = {
			pathStringParameter: 'pathStringParameter_Value',
			customFields: {
				CustomField: [
					{
						fieldName: 'customNumberField',
						fieldType: 'number',
						value: 123,
					},
					{
						fieldName: 'customStringField',
						fieldType: 'string',
						value: 'customStringField_Value',
					},
					{
						fieldName: 'customMultiSelectField',
						fieldType: 'multiSelect',
						value: {
							items: [
								{
									id: 'customMultiSelectField_InternalId',
								},
								{
									externalId: 'customMultiSelectField_Externad',
								},
							],
						},
					},
					{
						fieldName: 'customSelectField',
						fieldType: 'select',
						value: {
							id: 'customSelectField_InternalId',
							externalId: 'customSelectField_ExternalId',
						},
					},
				],
			},
		};

		const httpRequestData = NodeOperationExecutor.convertParametersToHttpRequestData(
			'TestEntity',
			'post /TestEntity/{pathStringParameter}',
			params,
			schema,
		);

		expect(httpRequestData).toEqual({
			HttpMethod: 'POST',
			RequestUrl: '/TestEntity/pathStringParameter_Value',
			Headers: {},
			QueryString: {},
			RequestBody: {
				customNumberField: 123,
				customStringField: 'customStringField_Value',
				customMultiSelectField: {
					items: [
						{ id: 'customMultiSelectField_InternalId' },
						{ externalId: 'customMultiSelectField_Externad' },
					],
				},
				customSelectField: {
					id: 'customSelectField_InternalId',
					externalId: 'customSelectField_ExternalId',
				},
			},
		});
	});
});
