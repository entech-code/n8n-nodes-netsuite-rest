import {
	ApplicationError,
	IExecuteFunctions,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodeParameters,
	NodeApiError,
} from 'n8n-workflow';
import NetSuiteRestApiSchema from '../../netsuite/NetSuiteRestApiSchema';
import { OpenAPIV3 } from 'openapi-types';

interface HttpRequestData {
	HttpMethod: string;
	RequestUrl: string;
	Headers: Record<string, any>;
	QueryString: Record<string, any>;
	RequestBody: Record<string, any>;
}

export class NodeOperationExecutor {
	private context: IExecuteFunctions;
	private schema: NetSuiteRestApiSchema;

	constructor(context: IExecuteFunctions, schema: NetSuiteRestApiSchema) {
		this.context = context;
		this.schema = schema;
	}

	async execute(): Promise<INodeExecutionData[][]> {
		const operation = this.context.getNodeParameter('operation', 0);
		let resource = this.context.getNodeParameter('resource', 0);
		const isDebugMode: boolean = Boolean(this.context.getNodeParameter('isDebugMode', 0, false));

		this.context.logger.info(`Executing operation: ${operation}, resource: ${resource}`);

		let nodeParameters = this.context.getNode().parameters;

		let evaluatedParameters: any = {};
		for (const key of Object.keys(nodeParameters)) {
			evaluatedParameters[key] = this.context.getNodeParameter(key, 0);
		}

		// Build HTTP request data
		const httpRequestData = NodeOperationExecutor.convertParametersToHttpRequestData(
			resource,
			operation,
			evaluatedParameters,
			this.schema,
		);

		if (httpRequestData.RequestUrl.includes('{'))
			throw new NodeApiError(this.context.getNode(), {
				message: `Request URL is invalid: ${httpRequestData.RequestUrl}`,
			});

		//Special handling for SuiteQL requests
		let basePath = '/services/rest/record/v1';
		if (resource === 'SuiteQL') {
			basePath = '/services/rest/query/v1';
			httpRequestData.Headers['Prefer'] = 'transient';
		}

		const credentials = await this.context.getCredentials('netSuiteRestOAuth2Api');
		const url = credentials.restApiUrl + basePath + httpRequestData.RequestUrl;

		const requestOptions: IHttpRequestOptions = {
			method: httpRequestData.HttpMethod as any,
			url: url,
			headers: httpRequestData.Headers,
			qs: httpRequestData.QueryString,
			body: httpRequestData.RequestBody,
			returnFullResponse: isDebugMode || httpRequestData.HttpMethod === 'POST',
			json: true,
		};

		// Make HTTP request using n8n helper
		let response;
		let fullResponse;
		try {
			response = await this.context.helpers.httpRequestWithAuthentication.call(
				this.context,
				'netSuiteRestOAuth2Api', // Replace with your credential name
				requestOptions,
			);

			if (isDebugMode || httpRequestData.HttpMethod === 'POST') {
				fullResponse = response;
				response = response.body;

				if (httpRequestData.HttpMethod === 'POST' && fullResponse.statusCode === 204) {
					// location example:  "https://<accountId>.suitetalk.api.netsuite.com/services/rest/record/v1/customer/<newId>"
					const location: string = fullResponse?.headers?.location;

					if (!location)
						throw new ApplicationError('Location header not found in response, cannot extract ID');

					const newId = NodeOperationExecutor.getIdFromResponseLocation(location);

					if (newId) {
						response = { id: newId };
					}
				}

				if (isDebugMode) {
					response = this.appendDebugInfoToResponse(requestOptions, response, fullResponse);
				}
			}
		} catch (error) {
			if (!isDebugMode) throw new NodeApiError(this.context.getNode(), error);

			response = {
				statusCode: error?.context?.data?.status,
				statusMessage: error?.description,
			};

			response = this.appendErrorDebugInfoToResponse(requestOptions, response, error);
		}

		return [[{ json: response }]];
	}

	static getIdFromResponseLocation(location: string): string {
		const match = location.match(/\/(\d+)(?:\?|$)/);

		if (!match) throw new ApplicationError(`Cannot extract new ID from location: ${location}`);
		return match[1];
	}

	appendDebugInfoToResponse(
		requestOptions: IHttpRequestOptions,
		response: any,
		fullResponse: any,
	): any {
		//request
		const debugRequest = this.getDebugRequest(requestOptions);

		const debugResponse: Record<string, any> = {
			statusCode: fullResponse.statusCode,
			statusMessage: fullResponse.statusMessage,
		};

		if (fullResponse.headers && Object.keys(fullResponse.headers).length > 0) {
			debugResponse.headers = fullResponse.headers;
		}

		response = {
			debug: {
				request: debugRequest,
				response: debugResponse,
			},
			...response,
		};

		return response;
	}

	getDebugRequest(requestOptions: IHttpRequestOptions): Record<string, any> {
		const debugRequest: Record<string, any> = {
			method: requestOptions.method,
			url: requestOptions.url,
		};
		if (requestOptions.headers && Object.keys(requestOptions.headers).length > 0) {
			debugRequest.headers = { ...requestOptions.headers };

			//Mask Authorization header
			if (debugRequest.headers.Authorization) {
				debugRequest.headers.Authorization = 'Bearer **********';
			}
		}
		if (requestOptions.qs && Object.keys(requestOptions.qs).length > 0) {
			debugRequest.qs = requestOptions.qs;
		}
		if (
			requestOptions.body &&
			((typeof requestOptions.body === 'object' && Object.keys(requestOptions.body).length > 0) ||
				(typeof requestOptions.body === 'string' && requestOptions.body.length > 0))
		) {
			debugRequest.body = requestOptions.body;
		}

		return debugRequest;
	}

	appendErrorDebugInfoToResponse(
		requestOptions: IHttpRequestOptions,
		response: any,
		error: any,
	): any {
		//request
		const debugRequest = this.getDebugRequest(requestOptions);

		response = {
			debug: {
				request: debugRequest,
				error: error,
			},
			...response,
		};

		return response;
	}

	static skipNodeParameters = new Set(['resource', 'operation', 'isDebugMode']);

	static convertParametersToHttpRequestData(
		resource: string,
		operationId: string,
		nodeParameters: Record<string, any>,
		schema: NetSuiteRestApiSchema,
	): HttpRequestData {
		const operationIdParts = operationId.split(' ');
		const httpMethod = operationIdParts[0];
		let urlPath = operationIdParts[1]; // keep original case for replacement

		const apiOperation: OpenAPIV3.OperationObject = schema.getApiOperationByTagAndOperationId(
			resource,
			operationId,
		);

		const queryString: Record<string, any> = {};
		const requestBody: Record<string, any> = {};
		const headers: Record<string, any> = {};

		// Build a map for fast lookup: name -> OpenAPI parameter object
		const nameToOperationParameter: Record<string, OpenAPIV3.ParameterObject> = {};
		if (apiOperation && Array.isArray(apiOperation.parameters)) {
			for (const param of apiOperation.parameters) {
				if (!param || typeof param !== 'object') continue;
				const paramObj = param as OpenAPIV3.ParameterObject;
				nameToOperationParameter[paramObj.name] = paramObj;
			}
		}

		let allNodeParameters: INodeParameters = nodeParameters;

		// Set allNodeParameters to nodeParameters except 'additionalFields'
		if (nodeParameters['additionalFields']) {
			allNodeParameters = NodeOperationExecutor.flattenAdditionalFields(nodeParameters);
		}

		//Iterate nodeParameters and classify using the map
		for (let [key, value] of Object.entries(allNodeParameters)) {
			if (NodeOperationExecutor.skipNodeParameters.has(key)) {
				continue;
			}

			//if (typeof value === 'object' && value !== null) this.trimObject(value); //Remove empty properties recursively

			if (this.isEmptyValue(value)) {
				continue;
			}

			if (key === 'customRecordType') {
				//Special handling for customRecordType resourceLocator
				value = (value as any)?.value;
			}

			const paramObj = nameToOperationParameter[key];
			if (paramObj) {
				const location = paramObj.in;

				switch (location) {
					case 'header':
						headers[key] = value;
						break;
					case 'query':
						queryString[key] = value;
						break;
					case 'path':
						// Replace path param in urlPath, e.g. /customer/{id} => /customer/123

						const schemaPattern = (paramObj?.schema as OpenAPIV3.SchemaObject)?.pattern;

						if (schemaPattern) {
							if (schemaPattern != 'eid:(.+)')
								throw new ApplicationError(
									`Unknown schema pattern '${schemaPattern}' for '${key}': ${value}`,
								);

							value = `eid:${value}`;
						}

						const placeholder = `{${key}}`;

						if (!urlPath.includes(placeholder)) {
							throw new ApplicationError(
								`Path parameter '${key}' not found in urlPath '${urlPath}'`,
							);
						}
						urlPath = urlPath.replace(
							new RegExp(placeholder, 'g'),
							encodeURIComponent(String(value)),
						);
						break;
					case 'cookie':
						throw new ApplicationError(`Cookie parameter '${key}' is not supported`);
						break;
					default:
						// If location is not recognized, treat as body
						requestBody[key] = value;
						break;
				}
			} else {
				// If parameter not found in OpenAPI parameters, treat as body
				requestBody[key] = value;
			}
		}

		//Remove fixedCollection related properties included by n8n
		const flatRequestBody = this.flattenRequestBodyObject(requestBody);

		return {
			RequestUrl: urlPath,
			HttpMethod: httpMethod.toUpperCase(),
			Headers: headers,
			QueryString: queryString,
			RequestBody: flatRequestBody,
		};
	}

	static flattenAdditionalFields(nodeParameters: INodeParameters): INodeParameters {
		let allNodeParameters: INodeParameters = {};
		const additionalFields = nodeParameters['additionalFields'] as Record<string, any>;

		for (const [key, value] of Object.entries(nodeParameters)) {
			if (key !== 'additionalFields') {
				allNodeParameters[key] = value;
			}

			allNodeParameters = { ...allNodeParameters, ...additionalFields };
		}

		return allNodeParameters;
	}

	static isEmptyValue(value: any): boolean {
		return (
			value === undefined ||
			value === null ||
			(typeof value === 'string' && value.trim() === '') ||
			(Array.isArray(value) && value.length === 0) ||
			(typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0)
		);
	}

	static trimObject(obj: any): void {
		for (const key of Object.keys(obj)) {
			const value = obj[key];
			if (NodeOperationExecutor.isEmptyValue(value)) {
				delete obj[key];
			}

			if (typeof value === 'object' && value !== null) this.trimObject(value);
		}
	}

	//Fixed collection add ns.. or properts with dashes
	//For example
	/*

	{
		"subsidiary": {
			"nsResource": {
				"id": "2"
			}
		}
	}

	should be:

	{
		"subsidiary": {
			"id": "2"
		}
	}
  */

	static flattenRequestBodyObject(obj: any): any {
		if (typeof obj !== 'object' || obj === null) return obj;
		if (Array.isArray(obj)) return obj.map(NodeOperationExecutor.flattenRequestBodyObject);

		const keys = Object.keys(obj);

		//Handle special case when the object has a single property that is an intermediary ns... object or has dashes in the name
		if (
			keys.length === 1 &&
			(keys[0].startsWith('ns') ||
				keys[0].includes('-') ||
				keys[0] === 'additionalFields' ||
				keys[0] === 'anonymousObject') &&
			typeof obj[keys[0]] === 'object' &&
			obj[keys[0]] !== null
		) {
			// Replace this object with its single child, recursively
			return NodeOperationExecutor.flattenRequestBodyObject(obj[keys[0]]);
		}

		// Recursively flatten all properties
		const result: any = {};
		for (const key of keys) {
			if (key === 'customFields') {
				const flattenedCustomFields = NodeOperationExecutor.flattenCustomFields(
					obj['customFields'],
				);
				Object.assign(result, flattenedCustomFields);
			} else {
				result[key] = NodeOperationExecutor.flattenRequestBodyObject(obj[key]);
			}
		}

		return result;
	}

	static flattenCustomFields(customFieldsObj: any): Record<string, any> {
		if (!customFieldsObj || !Array.isArray(customFieldsObj.CustomField)) return {};

		const result: Record<string, any> = {};
		for (const field of customFieldsObj.CustomField) {
			if (!field.fieldName || typeof field.value === 'undefined')
				throw new ApplicationError(`Invalid custom field entry: ${JSON.stringify(field)}`);

			result[field.fieldName] = field.value;
		}
		return result;
	}

	public static logNodeParameters(context: IExecuteFunctions | ILoadOptionsFunctions) {
		const allParams = context.getNode().parameters;

		const paramValues: Record<string, any> = {};
		for (const key of Object.keys(allParams)) {
			try {
				const value = context.getNodeParameter(key, 0);
				paramValues[key] = value;
			} catch (e) {
				context.logger.info(`Error parsing node parameter '${key}':  `, e);
			}
		}

		console.log('Node Parameters: ', JSON.stringify(paramValues, null, 2));
	}
}
