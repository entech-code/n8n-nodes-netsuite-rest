import { NetSuiteRestApiSchemaBuilder } from '../../../builders/NetSuiteRestApiSchemaBuilder';
import { NodePropertyFactory } from '../../../../nodes/NetSuiteRest/NodePropertyFactory';
import type { OpenAPIV3 } from 'openapi-types';

describe('NodePropertyFactory creating properties for Simple Properties in RequestParams and RequestBody', () => {
	const builder = new NetSuiteRestApiSchemaBuilder();
	const path: OpenAPIV3.PathsObject = {
		'/TestEntity': {
			get: {
				summary: 'Get Test Entity',
				tags: ['TestEntity'],
				parameters: [
					{
						name: 'stringParameter',
						in: 'query',
						required: true,
						schema: { type: 'string' },
						description: 'A string parameter',
					},
					{
						name: 'stringDateParameter',
						in: 'query',
						required: true,
						schema: { type: 'string', format: 'date' },
						description: 'A string date parameter',
					},
					{
						name: 'stringDateTimeParameter',
						in: 'query',
						required: true,
						schema: { type: 'string', format: 'date-time' },
						description: 'A string date-time parameter',
					},
					{
						name: 'stringEnumParameter',
						in: 'query',
						required: true,
						schema: { type: 'string', enum: ['Opt1', 'Opt2'] },
						description: 'A string enum parameter',
					},
					{
						name: 'stringUriParameter',
						in: 'query',
						required: true,
						schema: { type: 'string', format: 'URI' },
						description: 'A string URI parameter',
					},
					{
						name: 'stringJsonPathParameter',
						in: 'query',
						required: true,
						schema: { type: 'string', format: 'JSONPath' },
						description: 'A string JSONPath parameter',
					},
					{
						name: 'numberParameter',
						in: 'query',
						required: true,
						schema: { type: 'number' },
						description: 'A number parameter',
					},
					{
						name: 'numberFloatParameter',
						in: 'query',
						required: true,
						schema: { type: 'number', format: 'float' },
						description: 'A number float parameter',
					},
					{
						name: 'numberDoubleParameter',
						in: 'query',
						required: true,
						schema: { type: 'number', format: 'double' },
						description: 'A number double parameter',
					},
					{
						name: 'booleanParameter',
						in: 'query',
						required: true,
						schema: { type: 'boolean' },
						description: 'A boolean parameter',
					},
					{
						name: 'integerParameter',
						in: 'query',
						required: true,
						schema: { type: 'integer' },
						description: 'An integer parameter',
					},
					{
						name: 'integerInt32Parameter',
						in: 'query',
						required: true,
						schema: { type: 'integer', format: 'int32' },
						description: 'An integer int32 parameter',
					},
					{
						name: 'integerIntParameter',
						in: 'query',
						required: true,
						schema: { type: 'integer', format: 'int' },
						description: 'An integer int parameter',
					},
				],
				responses: {
					'200': {
						description: 'TestEntity found',
					},
				},
			},
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
				required: [
					'stringField',
					'stringDateField',
					'stringDateTimeField',
					'stringEnumField',
					'stringUriField',
					'stringJsonPathField',
					'numberField',
					'numberFloatField',
					'numberDoubleField',
					'booleanField',
					'integerField',
					'integerInt32Field',
					'integerIntField',
				],
				properties: {
					stringField: { type: 'string', title: 'String Field', description: 'A string field' },
					stringDateField: {
						type: 'string',
						format: 'date',
						title: 'String Date Field',
						description: 'A string date field',
					},
					stringDateTimeField: {
						type: 'string',
						format: 'date-time',
						title: 'String DateTime Field',
						description: 'A string date-time field',
					},
					stringEnumField: {
						type: 'string',
						enum: ['Opt1', 'Opt2'],
						title: 'String Enum Field',
						description: 'A string enum field',
					},
					stringUriField: {
						type: 'string',
						format: 'URI',
						title: 'String URI Field',
						description: 'A string URI field',
					},
					stringJsonPathField: {
						type: 'string',
						format: 'JSONPath',
						title: 'String JSONPath Field',
						description: 'A string JSONPath field',
					},
					numberField: { type: 'number', title: 'Number Field', description: 'A number field' },
					numberFloatField: {
						type: 'number',
						format: 'float',
						title: 'Number Float Field',
						description: 'A number float field',
					},
					numberDoubleField: {
						type: 'number',
						format: 'double',
						title: 'Number Double Field',
						description: 'A number double field',
					},
					booleanField: { type: 'boolean', title: 'Boolean Field', description: 'A boolean field' },
					integerField: {
						type: 'integer',
						title: 'Integer Field',
						description: 'An integer field',
					},
					integerInt32Field: {
						type: 'integer',
						format: 'int32',
						title: 'Integer Int32 Field',
						description: 'An integer int32 field',
					},
					integerIntField: {
						type: 'integer',
						format: 'int',
						title: 'Integer Int Field',
						description: 'An integer int field',
					},
				},
			},
		},
	});

	test('createPropertiesForOperationParameters creates correct params for TestEntity get', () => {
		const schema = builder.Build();
		const factory = new NodePropertyFactory(schema);

		const operation = schema.getApiOperation('TestEntity', '/TestEntity', 'get');

		const props = factory.createN8nPropertiesForApiOperationParameters(operation, 'TestEntity');

		expect(props).toEqual([
			{
				displayName: 'String Parameter',
				name: 'stringParameter',
				type: 'string',
				required: true,
				description: 'A string parameter',
				default: '',
			},
			{
				displayName: 'String Date Parameter',
				name: 'stringDateParameter',
				type: 'dateTime',
				required: true,
				description: 'A string date parameter',
				default: '',
			},
			{
				displayName: 'String Date Time Parameter',
				name: 'stringDateTimeParameter',
				type: 'dateTime',
				required: true,
				description: 'A string date-time parameter',
				default: '',
			},
			{
				displayName: 'String Enum Parameter',
				name: 'stringEnumParameter',
				type: 'options',
				required: true,
				description: 'A string enum parameter',
				default: '',
				options: [
					{ name: '', value: '' },
					{ name: 'Opt1', value: 'Opt1' },
					{ name: 'Opt2', value: 'Opt2' },
				],
			},
			{
				displayName: 'String Uri Parameter',
				name: 'stringUriParameter',
				type: 'string',
				required: true,
				description: 'A string URI parameter',
				default: '',
			},
			{
				displayName: 'String Json Path Parameter',
				name: 'stringJsonPathParameter',
				type: 'string',
				required: true,
				description: 'A string JSONPath parameter',
				default: '',
			},
			{
				displayName: 'Number Parameter',
				name: 'numberParameter',
				type: 'number',
				required: true,
				description: 'A number parameter',
				default: null,
			},
			{
				displayName: 'Number Float Parameter',
				name: 'numberFloatParameter',
				type: 'number',
				required: true,
				description: 'A number float parameter',
				default: null,
			},
			{
				displayName: 'Number Double Parameter',
				name: 'numberDoubleParameter',
				type: 'number',
				required: true,
				description: 'A number double parameter',
				default: null,
			},
			{
				displayName: 'Boolean Parameter',
				name: 'booleanParameter',
				type: 'boolean',
				required: true,
				description: 'A boolean parameter',
				default: false,
			},
			{
				displayName: 'Integer Parameter',
				name: 'integerParameter',
				type: 'number',
				required: true,
				description: 'An integer parameter',
				default: null,
			},
			{
				displayName: 'Integer Int32 Parameter',
				name: 'integerInt32Parameter',
				type: 'number',
				required: true,
				description: 'An integer int32 parameter',
				default: null,
			},
			{
				displayName: 'Integer Int Parameter',
				name: 'integerIntParameter',
				type: 'number',
				required: true,
				description: 'An integer int parameter',
				default: null,
			},
		]);
	});

	test('createPropertiesForOperationRequestBody returns correct operations for TestEntity post', () => {
		const schema = builder.Build();
		const factory = new NodePropertyFactory(schema);

		const operation = schema.getApiOperation('TestEntity', '/TestEntity', 'post');

		const props = factory.createN8nPropertiesForApiOperationRequestBody(operation);

		expect(props).toEqual([
			{
				displayName: 'String Field',
				name: 'stringField',
				type: 'string',
				required: true,
				description: 'A string field',
				default: '',
			},
			{
				displayName: 'String Date Field',
				name: 'stringDateField',
				type: 'dateTime',
				required: true,
				description: 'A string date field',
				default: '',
			},
			{
				displayName: 'String DateTime Field',
				name: 'stringDateTimeField',
				type: 'dateTime',
				required: true,
				description: 'A string date-time field',
				default: '',
			},
			{
				displayName: 'String Enum Field',
				name: 'stringEnumField',
				type: 'options',
				required: true,
				description: 'A string enum field',
				default: '',
				options: [
					{ name: '', value: '' },
					{ name: 'Opt1', value: 'Opt1' },
					{ name: 'Opt2', value: 'Opt2' },
				],
			},
			{
				displayName: 'String URI Field',
				name: 'stringUriField',
				type: 'string',
				required: true,
				description: 'A string URI field',
				default: '',
			},
			{
				displayName: 'String JSONPath Field',
				name: 'stringJsonPathField',
				type: 'string',
				required: true,
				description: 'A string JSONPath field',
				default: '',
			},
			{
				displayName: 'Number Field',
				name: 'numberField',
				type: 'number',
				required: true,
				description: 'A number field',
				default: null,
			},
			{
				displayName: 'Number Float Field',
				name: 'numberFloatField',
				type: 'number',
				required: true,
				description: 'A number float field',
				default: null,
			},
			{
				displayName: 'Number Double Field',
				name: 'numberDoubleField',
				type: 'number',
				required: true,
				description: 'A number double field',
				default: null,
			},
			{
				displayName: 'Boolean Field',
				name: 'booleanField',
				type: 'boolean',
				required: true,
				description: 'A boolean field',
				default: false,
			},
			{
				displayName: 'Integer Field',
				name: 'integerField',
				type: 'number',
				required: true,
				description: 'An integer field',
				default: null,
			},
			{
				displayName: 'Integer Int32 Field',
				name: 'integerInt32Field',
				type: 'number',
				required: true,
				description: 'An integer int32 field',
				default: null,
			},
			{
				displayName: 'Integer Int Field',
				name: 'integerIntField',
				type: 'number',
				required: true,
				description: 'An integer int field',
				default: null,
			},
		]);
	});
});
