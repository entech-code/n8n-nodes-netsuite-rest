import {
	IHttpRequestOptions,
	IExecuteFunctions,
	ApplicationError,
	ILoadOptionsFunctions,
} from 'n8n-workflow';
import { OpenAPIV3 } from 'openapi-types';

export interface CustomFieldSchema {
	fieldName: string;
	isRequired: boolean;
	schema: OpenAPIV3.SchemaObject;
}

interface HttpRequestData {
	HttpMethod: string;
	RequestUrl: string;
	Headers?: Record<string, any>;
	QueryString?: Record<string, any>;
	RequestBody?: Record<string, any>;
}

export class NetSuiteRestApi {
	private context: IExecuteFunctions | ILoadOptionsFunctions;

	constructor(context: IExecuteFunctions | ILoadOptionsFunctions) {
		this.context = context;
	}

	async getCustomRecordTypes(): Promise<string[]> {
		const httpRequestData: HttpRequestData = {
			HttpMethod: 'GET',
			RequestUrl: '/metadata-catalog',
		};
		const response = await this.request(httpRequestData);
		if (!response || !Array.isArray(response.items)) return [];

		return response.items
			.filter((item: { name: string }) => item.name && item.name.startsWith('customrecord_'))
			.map((item: { name: string }) => item.name)
			.sort();
	}

	async getCustomFields(recordType: string): Promise<CustomFieldSchema[]> {
		const httpRequestData: HttpRequestData = {
			HttpMethod: 'GET',
			RequestUrl: '/metadata-catalog',
			Headers: {
				Accept: 'application/swagger+json',
			},
			QueryString: {
				select: recordType,
			},
		};
		const response = await this.request(httpRequestData);
		const openapi = response as OpenAPIV3.Document;
		if (
			!openapi.components ||
			!openapi.components.schemas ||
			!openapi.components.schemas[recordType]
		) {
			throw new Error(`Schema for record type ${recordType} not found in OpenAPI response`);
		}

		const componentSchema = openapi.components.schemas[recordType] as OpenAPIV3.SchemaObject;
		const customFields: CustomFieldSchema[] = [];
		if (componentSchema.properties) {
			for (const [fieldName, schemaProperty] of Object.entries(componentSchema.properties)) {
				const fieldSchema = schemaProperty as OpenAPIV3.SchemaObject;
				if (
					(fieldSchema as any)['x-ns-custom-field'] === true ||
					fieldName.startsWith('custentity_') ||
					fieldName.startsWith('custrecord_')
				) {
					customFields.push({
						fieldName,
						isRequired: Array.isArray(componentSchema.required)
							? componentSchema.required.includes(fieldName)
							: false,
						schema: fieldSchema,
					});
				}
			}
		}

		return customFields;
	}

	// Example method to make an authenticated request
	async request(httpRequestData: HttpRequestData): Promise<any> {
		console.log('Request Data:', httpRequestData);
		return await this.requestWithN8n(httpRequestData);
	}

	async requestWithN8n(httpRequestData: HttpRequestData): Promise<any> {
		if (!this.context) {
			throw new ApplicationError('Context is null. Cannot retrieve credentials.');
		}
		const credentials = await this.context.getCredentials('netSuiteRestOAuth2Api');

		const url = credentials.restApiUrl + '/services/rest/record/v1' + httpRequestData.RequestUrl;
		console.log('Making N8n request to URL:', url);

		const requestOptions: IHttpRequestOptions = {
			method: httpRequestData.HttpMethod as any,
			url: url,
			headers: httpRequestData.Headers,
			qs: httpRequestData.QueryString,
			body: httpRequestData.RequestBody,
			returnFullResponse: false,
			json: true,
		};

		if (!this.context) {
			throw new Error('Context is null. Cannot make the request.');
		}

		const response = await this.context.helpers.httpRequestWithAuthentication.call(
			this.context,
			'netSuiteRestOAuth2Api',
			requestOptions,
		);

		return response;
	}
}
