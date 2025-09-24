import { NetSuiteRestApiSchemaBuilder } from '../../../builders/NetSuiteRestApiSchemaBuilder';
import { NodePropertyFactory } from '../../../../nodes/NetSuiteRest/NodePropertyFactory';
import type { OpenAPIV3 } from 'openapi-types';

describe('NodePropertyFactory creates customFields collection', () => {
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
				required: ['stringField'],
				properties: {
					stringField: { type: 'string', title: 'String Field', description: 'A string field' },
				},
			},
		},
	});

	builder.addNsResourceComponent();

	test('createPropertyForCustomFieldList creates correct property', () => {
		const schema = builder.Build();
		const factory = new NodePropertyFactory(schema);

		const prop = factory.createPropertyForCustomFields();

		expect(prop).toEqual({
			displayName: 'Custom Fields',
			name: 'customFields',
			type: 'fixedCollection',
			default: {},
			typeOptions: { multipleValues: true },
			options: [
				{
					name: 'CustomField',
					displayName: 'CustomField',
					values: [
						{
							displayName: 'Field Name',
							name: 'fieldName',
							type: 'options',
							default: '',
							required: true,
							typeOptions: {
								loadOptionsMethod: 'loadCustomFields',
							},
						},
						{
							displayName: 'Field Type',
							name: 'fieldType',
							type: 'options',
							default: '',
							required: true,
							options: [
								{ name: '', value: '' },
								{ name: 'Boolean', value: 'boolean' },
								{ name: 'Date Time', value: 'dateTime' },
								{ name: 'Multi Select', value: 'multiSelect' },
								{ name: 'Number', value: 'number' },
								{ name: 'Select', value: 'select' },
								{ name: 'String', value: 'string' },
							],
						},
						{
							displayName: 'Value',
							name: 'value',
							type: 'boolean',
							default: false,
							displayOptions: { show: { fieldType: ['boolean'] } },
						},
						{
							displayName: 'Value',
							name: 'value',
							type: 'dateTime',
							default: '',
							displayOptions: { show: { fieldType: ['dateTime'] } },
						},
						{
							displayName: 'Value',
							name: 'value',
							type: 'collection',
							default: {},
							displayOptions: { show: { fieldType: ['multiSelect'] } },
							options: [
								{
									name: 'items',
									displayName: 'Items',
									type: 'collection',
									default: {},
									typeOptions: { multipleValues: true },
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
							],
						},
						{
							displayName: 'Value',
							name: 'value',
							type: 'number',
							default: null,
							displayOptions: { show: { fieldType: ['number'] } },
						},
						{
							displayName: 'Value',
							name: 'value',
							type: 'collection',
							default: {},
							displayOptions: { show: { fieldType: ['select'] } },
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
							displayName: 'Value',
							name: 'value',
							type: 'string',
							default: '',
							displayOptions: { show: { fieldType: ['string'] } },
						},
					],
				},
			],
			description: 'List of Custom Fields',
		});
	});
});
