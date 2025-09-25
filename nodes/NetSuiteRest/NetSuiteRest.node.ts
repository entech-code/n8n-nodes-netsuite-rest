import {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	INodeListSearchResult,
} from 'n8n-workflow';
import { NodePropertyFactory } from './NodePropertyFactory';
import { NetSuiteRestApiSchemaService } from '../../netsuite/NetSuiteRestApiSchemaService';
import NetSuiteRestApiSchema from '../../netsuite/NetSuiteRestApiSchema';
import { NodeOperationExecutor } from './NodeOperationExecutor';
import { NetSuiteRestApi } from '../../netsuite/NetSuiteRestApi';
import { OpenApiUtils } from '../../utils/OpenApiUtils';

export class NetSuiteRest implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'NetSuite REST',
		name: 'netSuiteRest',
		icon: { light: 'file:netsuite-rest.svg', dark: 'file:netsuite-rest.svg' },
		subtitle: '',
		group: ['transform'],
		version: 1,
		description: 'Call NetSuite SuiteTalk REST operations.',
		defaults: { name: 'NetSuite REST' },
		inputs: ['main'],
		outputs: ['main'],
		credentials: [{ name: 'netSuiteRestOAuth2Api', required: true }],
		properties: [
			{
				displayName: 'Debug Mode',
				name: 'isDebugMode',
				type: 'boolean',
				default: false,
				description: 'Whether to include full request and response info in the output',
			},
		],
	};

	constructor() {
		this.addPropertiesFromNetSuiteSchema();
	}

	addPropertiesFromNetSuiteSchema() {
		const schemaService = new NetSuiteRestApiSchemaService();
		const schema: NetSuiteRestApiSchema = schemaService.loadFromFile();

		const config = { sortCollections: true };
		const factory = new NodePropertyFactory(schema, config);

		const resourceProperty = this.description.properties.find((p) => p.name === 'resource');

		var properties = factory.createPropertiesFromNetSuiteRestSchema(resourceProperty);
		this.description.properties.push(...properties);
	}

	methods = {
		listSearch: {
			async loadCustomRecordTypes(this: ILoadOptionsFunctions): Promise<INodeListSearchResult> {
				const api = new NetSuiteRestApi(this);
				const customRecordTypes = await api.getCustomRecordTypes();

				const options = customRecordTypes.map((type: any) => ({
					name: type,
					value: type,
				}));

				return { results: [...options] };
			},
		},
		loadOptions: {
			async loadCustomFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				let resource = this.getNodeParameter('resource', 0) as string;

				if (resource === 'CustomRecord') {
					resource = this.getNodeParameter('customRecordType.value', 0) as string;

					if (!resource)
						throw new NodeOperationError(this.getNode(), {
							message: 'Custom Record Type must be selected',
						});
				}

				const api = new NetSuiteRestApi(this);

				//Convert Customer to customer and AccountingPeriod to accountingPeriod
				const recordType = resource.charAt(0).toLowerCase() + resource.slice(1);
				const customFields = await api.getCustomFields(recordType);

				const options = customFields.map((field) => {
					// Example: if fieldName starts with 'custentity_', add a special marker to description
					if (OpenApiUtils.isReferenceObject(field.schema)) {
						return {
							name: field.fieldName,
							value: field.fieldName,
						};
					} else {
						return {
							name: field.fieldName,
							value: field.fieldName,
							description: field.schema.title || field.schema.description,
						};
					}
				});

				options.sort((a, b) => a.name.localeCompare(b.name));

				return [{ name: '', value: '' }, ...options];
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const schemaService = new NetSuiteRestApiSchemaService();
		const schema: NetSuiteRestApiSchema = schemaService.loadFromFile();

		const executor = new NodeOperationExecutor(this, schema);
		return await executor.execute();
	}
}
