/**
 * Local subset of the OpenAPI v3 type definitions, mirroring the shapes we use
 * from the `openapi-types` package. n8n Cloud does not allow community nodes
 * to have runtime dependencies, so these are inlined here instead of imported.
 */
export namespace OpenAPIV3 {
	export interface Document {
		openapi: string;
		info: InfoObject;
		servers?: ServerObject[];
		paths: PathsObject;
		components?: ComponentsObject;
		security?: SecurityRequirementObject[];
		tags?: TagObject[];
		externalDocs?: ExternalDocumentationObject;
	}

	export interface InfoObject {
		title: string;
		description?: string;
		termsOfService?: string;
		contact?: ContactObject;
		license?: LicenseObject;
		version: string;
	}

	export interface ContactObject {
		name?: string;
		url?: string;
		email?: string;
	}

	export interface LicenseObject {
		name: string;
		url?: string;
	}

	export interface ServerObject {
		url: string;
		description?: string;
		variables?: { [variable: string]: ServerVariableObject };
	}

	export interface ServerVariableObject {
		enum?: string[];
		default: string;
		description?: string;
	}

	export interface TagObject {
		name: string;
		description?: string;
		externalDocs?: ExternalDocumentationObject;
	}

	export interface PathsObject {
		[pattern: string]: PathItemObject | undefined;
	}

	export type HttpMethod = 'get' | 'put' | 'post' | 'delete' | 'options' | 'head' | 'patch' | 'trace';

	export type PathItemObject = {
		$ref?: string;
		summary?: string;
		description?: string;
		servers?: ServerObject[];
		parameters?: (ReferenceObject | ParameterObject)[];
	} & {
		[method in HttpMethod]?: OperationObject;
	};

	export interface OperationObject {
		tags?: string[];
		summary?: string;
		description?: string;
		externalDocs?: ExternalDocumentationObject;
		operationId?: string;
		parameters?: (ReferenceObject | ParameterObject)[];
		requestBody?: ReferenceObject | RequestBodyObject;
		responses: ResponsesObject;
		callbacks?: { [callback: string]: ReferenceObject | CallbackObject };
		deprecated?: boolean;
		security?: SecurityRequirementObject[];
		servers?: ServerObject[];
	}

	export interface ExternalDocumentationObject {
		description?: string;
		url: string;
	}

	export interface ParameterBaseObject {
		description?: string;
		required?: boolean;
		deprecated?: boolean;
		allowEmptyValue?: boolean;
		style?: string;
		explode?: boolean;
		allowReserved?: boolean;
		schema?: ReferenceObject | SchemaObject;
		example?: any;
		examples?: { [media: string]: ReferenceObject | ExampleObject };
		content?: { [media: string]: MediaTypeObject };
	}

	export interface ParameterObject extends ParameterBaseObject {
		name: string;
		in: string;
	}

	export interface HeaderObject extends ParameterBaseObject {}

	export type NonArraySchemaObjectType = 'boolean' | 'object' | 'number' | 'string' | 'integer';
	export type ArraySchemaObjectType = 'array';
	export type SchemaObject = ArraySchemaObject | NonArraySchemaObject;

	export interface BaseSchemaObject {
		title?: string;
		description?: string;
		format?: string;
		default?: any;
		multipleOf?: number;
		maximum?: number;
		exclusiveMaximum?: boolean;
		minimum?: number;
		exclusiveMinimum?: boolean;
		maxLength?: number;
		minLength?: number;
		pattern?: string;
		additionalProperties?: boolean | ReferenceObject | SchemaObject;
		maxItems?: number;
		minItems?: number;
		uniqueItems?: boolean;
		maxProperties?: number;
		minProperties?: number;
		required?: string[];
		enum?: any[];
		properties?: { [name: string]: ReferenceObject | SchemaObject };
		allOf?: (ReferenceObject | SchemaObject)[];
		oneOf?: (ReferenceObject | SchemaObject)[];
		anyOf?: (ReferenceObject | SchemaObject)[];
		not?: ReferenceObject | SchemaObject;
		nullable?: boolean;
		discriminator?: DiscriminatorObject;
		readOnly?: boolean;
		writeOnly?: boolean;
		xml?: XMLObject;
		externalDocs?: ExternalDocumentationObject;
		example?: any;
		deprecated?: boolean;
	}

	export interface ArraySchemaObject extends BaseSchemaObject {
		type: ArraySchemaObjectType;
		items: ReferenceObject | SchemaObject;
	}

	export interface NonArraySchemaObject extends BaseSchemaObject {
		type?: NonArraySchemaObjectType;
	}

	export interface DiscriminatorObject {
		propertyName: string;
		mapping?: { [value: string]: string };
	}

	export interface XMLObject {
		name?: string;
		namespace?: string;
		prefix?: string;
		attribute?: boolean;
		wrapped?: boolean;
	}

	export interface ReferenceObject {
		$ref: string;
	}

	export interface ExampleObject {
		summary?: string;
		description?: string;
		value?: any;
		externalValue?: string;
	}

	export interface MediaTypeObject {
		schema?: ReferenceObject | SchemaObject;
		example?: any;
		examples?: { [media: string]: ReferenceObject | ExampleObject };
		encoding?: { [media: string]: EncodingObject };
	}

	export interface EncodingObject {
		contentType?: string;
		headers?: { [header: string]: ReferenceObject | HeaderObject };
		style?: string;
		explode?: boolean;
		allowReserved?: boolean;
	}

	export interface RequestBodyObject {
		description?: string;
		content: { [media: string]: MediaTypeObject };
		required?: boolean;
	}

	export interface ResponsesObject {
		[code: string]: ReferenceObject | ResponseObject;
	}

	export interface ResponseObject {
		description: string;
		headers?: { [header: string]: ReferenceObject | HeaderObject };
		content?: { [media: string]: MediaTypeObject };
		links?: { [link: string]: ReferenceObject | LinkObject };
	}

	export interface LinkObject {
		operationRef?: string;
		operationId?: string;
		parameters?: { [parameter: string]: any };
		requestBody?: any;
		description?: string;
		server?: ServerObject;
	}

	export interface CallbackObject {
		[url: string]: PathItemObject;
	}

	export interface SecurityRequirementObject {
		[name: string]: string[];
	}

	export interface SecuritySchemeObject {
		type: string;
		description?: string;
		name?: string;
		in?: string;
		scheme?: string;
		bearerFormat?: string;
		flows?: any;
		openIdConnectUrl?: string;
	}

	export interface ComponentsObject {
		schemas?: { [key: string]: ReferenceObject | SchemaObject };
		responses?: { [key: string]: ReferenceObject | ResponseObject };
		parameters?: { [key: string]: ReferenceObject | ParameterObject };
		examples?: { [key: string]: ReferenceObject | ExampleObject };
		requestBodies?: { [key: string]: ReferenceObject | RequestBodyObject };
		headers?: { [key: string]: ReferenceObject | HeaderObject };
		securitySchemes?: { [key: string]: ReferenceObject | SecuritySchemeObject };
		links?: { [key: string]: ReferenceObject | LinkObject };
		callbacks?: { [key: string]: ReferenceObject | CallbackObject };
	}
}
