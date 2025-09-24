import {
	IHttpRequestOptions,
	IExecuteFunctions,
	ApplicationError,
	ILoadOptionsFunctions,
} from 'n8n-workflow';
import axios, { AxiosRequestConfig } from 'axios';
import { OpenAPIV3 } from 'openapi-types';

export interface GetAccessTokenFromRefreshTokenRequest {
	clientId: string;
	clientSecret: string;
	refreshToken?: string;
	restApiUrl: string;
}

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
	private context: IExecuteFunctions | ILoadOptionsFunctions | null;
	private accessToken?: string;
	private restApiUrl?: string;

	constructor(
		context: IExecuteFunctions | ILoadOptionsFunctions | null,
		accessToken?: string,
		restApiUrl?: string,
	) {
		this.context = context;
		this.accessToken = accessToken;
		this.restApiUrl = restApiUrl;
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
		if (this.context) {
			return await this.requestWithN8n(httpRequestData);
		}

		//use access token
		return await this.requestWithAxios(httpRequestData);
	}

	async requestWithN8n(httpRequestData: HttpRequestData): Promise<any> {
		if (!this.context) {
			throw new ApplicationError('Context is null. Cannot retrieve credentials.');
		}
		const credentials = await this.context.getCredentials('netSuiteRestTestApi');

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
			'netSuiteRestTestApi', // Replace with your credential name
			requestOptions,
		);

		return response;
	}

	async requestWithAxios(httpRequestData: HttpRequestData): Promise<any> {
		const url = this.restApiUrl + '/services/rest/record/v1' + httpRequestData.RequestUrl;

		console.log('Making Axios request to URL:', url);
		const config: AxiosRequestConfig = {
			method: httpRequestData.HttpMethod,
			url: url,
			headers: {
				...httpRequestData.Headers,
				Authorization: `Bearer ${this.accessToken}`,
			},
			params: httpRequestData.QueryString,
			data: httpRequestData.RequestBody,
		};

		const response = await axios(config);
		return response.data;
	}

	static async getAccessTokenFromRefreshToken(
		request: GetAccessTokenFromRefreshTokenRequest,
	): Promise<string> {
		const tokenUrl = `${request.restApiUrl}/services/rest/auth/oauth2/v1/token`;
		const params = new URLSearchParams();
		params.append('grant_type', 'refresh_token');
		params.append('client_id', request.clientId);
		params.append('client_secret', request.clientSecret);
		params.append('refresh_token', request.refreshToken || '');

		// Use axios directly for token request
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: tokenUrl,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			data: params.toString(),
		};
		const response = await axios(config);

		if (!response.data.access_token) throw new Error('No access_token in NetSuite response');
		return response.data.access_token;
	}
}
