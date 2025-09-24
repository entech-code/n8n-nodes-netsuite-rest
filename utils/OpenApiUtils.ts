import type { OpenAPIV3 } from 'openapi-types';

export enum OpenApiType {
	Boolean = 'boolean',
	Number = 'number',
	String = 'string',
	Integer = 'integer',
	Object = 'object',
	Array = 'array',
}

export enum OpenApiFormat {
	Int32 = 'int32',
	Int64 = 'int64',
	Float = 'float',
	Double = 'double',
	Date = 'date',
	DateTime = 'date-time',
	URI = 'URI',
	JSONPath = 'JSONPath',
}

export class OpenApiUtils {
	public static readonly validHttpMethods = [
		'get',
		'put',
		'post',
		'delete',
		'options',
		'head',
		'patch',
		'trace',
	] as const;

	private static readonly simpleTypesSet = new Set<string>([
		OpenApiType.Boolean,
		OpenApiType.Number,
		OpenApiType.String,
		OpenApiType.Integer,
	]);

	public static isReferenceObject(obj: any): obj is OpenAPIV3.ReferenceObject {
		return obj && typeof obj === 'object' && '$ref' in obj;
	}

	public static isSchemaObject(obj: any): obj is OpenAPIV3.SchemaObject {
		return obj && typeof obj === 'object' && ('type' in obj || 'properties' in obj);
	}

	public static isOneOfObject(obj: any): obj is { oneOf: any[] } {
		return obj && typeof obj === 'object' && Array.isArray(obj.oneOf);
	}

	public static isSimpleType(type: string): boolean {
		return OpenApiUtils.simpleTypesSet.has(type);
	}

	public static isObjectType(type: string): boolean {
		return type === OpenApiType.Object;
	}

	public static isArrayType(type: string): boolean {
		return type === OpenApiType.Array;
	}
}
