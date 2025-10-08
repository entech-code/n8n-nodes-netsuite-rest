import { ApplicationError } from 'n8n-workflow';

import type { OpenAPIV3 } from 'openapi-types';

import { NetSuiteRestApiSchema } from '../../netsuite/NetSuiteRestApiSchema';
import { N8nUtils, N8nPropertyType, N8nSimplePropertyTypes } from '../../utils/N8nUtils';

import { OpenApiUtils } from '../../utils/OpenApiUtils';
import { OpenApiType as OpenApiType } from '../../utils/OpenApiUtils';
import { OpenApiFormat as OpenApiFormat } from '../../utils/OpenApiUtils';

export interface DisplayOptions {
	resourceName: string;
	operationValues: string[];
}

export interface Path {
	pathName: string;
	pathItem: OpenAPIV3.PathItemObject;
}

export interface NodePropertyFactoryConfig {
	sortCollections: boolean;
}

const defaultFactoryConfig: NodePropertyFactoryConfig = { sortCollections: false };

export class NodePropertyFactory {
	private config: NodePropertyFactoryConfig;

	private schema: NetSuiteRestApiSchema;

	constructor(
		schema: NetSuiteRestApiSchema,
		config: NodePropertyFactoryConfig = defaultFactoryConfig,
	) {
		this.schema = schema;
		this.config = config;
	}

	createPropertiesFromNetSuiteRestSchema(resourceProperty: any = null): any[] {
		const properties: any[] = [];

		if (!resourceProperty) {
			resourceProperty = {
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				options: [],
				noDataExpression: true,
				default: '',
			};

			properties.push(resourceProperty);
		}

		// Get sorted resource names (tags)
		const resourceNames = Object.keys(this.schema.tagToOperationsMap).sort((a, b) =>
			a.localeCompare(b),
		);

		for (const resourceName of resourceNames) {
			resourceProperty.options.push({
				name: this.getLabelFromName(resourceName),
				value: resourceName,
			});

			const operationProp = this.createN8nOperationPropertyForResource(resourceName);
			operationProp.options.sort((a, b) => a.name.localeCompare(b.name));
			properties.push(operationProp);

			const operations = this.schema.tagToOperationsMap[resourceName];

			for (const operation of operations) {
				const props = this.createN8nPropertiesForApiOperation(
					operation.apiOperation,
					resourceName,
					operation.operationId,
				);

				properties.push(...props);
			}
		}

		//add custom fields property
		const customFieldsProp = this.createPropertyWithDisplayOptionsForCustomFields(resourceNames);

		properties.push(customFieldsProp);

		return properties;
	}

	createPropertyWithDisplayOptionsForCustomFields(resourceNames: string[]): any {
		const customFieldsProp = this.createPropertyForCustomFields();

		const insertAndUpdateOperationIds = [];

		for (const resourceName of resourceNames) {
			const operations = this.schema.tagToOperationsMap[resourceName];

			for (const operation of operations) {
				if (
					operation.apiOperation.summary === 'Insert record.' ||
					operation.apiOperation.summary === 'Update record.' ||
					operation.apiOperation.summary === 'Insert or update record.'
				) {
					insertAndUpdateOperationIds.push(operation.operationId);
				}
			}
		}

		customFieldsProp.displayOptions = {
			show: {
				resource: resourceNames,
				operation: insertAndUpdateOperationIds,
			},
		};

		/*

		customFieldsProp.displayOptions = {
			show: {
				resource: ['Customer'],
				operation: ['post /customer', 'put /customer/{id}'],
			},
		};

		*/
		return customFieldsProp;
	}

	public createN8nOperationPropertyForResource(resourceName: string) {
		const operations = this.schema.tagToOperationsMap[resourceName];
		const operationOptions: any[] = [];

		for (const operation of operations) {
			{
				const apiOperation = operation.apiOperation;

				let name = apiOperation.summary;
				if (name?.endsWith('.')) {
					name = name.slice(0, -1);
				}

				operationOptions.push({
					name: name,
					value: operation.operationId,
					action: `${this.getLabelFromName(resourceName)} - ${name}`,
				});
			}
		}

		const operationProp = {
			displayName: 'Operation',
			name: 'operation',
			type: 'options' as 'options',
			displayOptions: { show: { resource: [resourceName] } },
			options: operationOptions,
			noDataExpression: true,
			default: operationOptions[0]?.value || 'get',
		};
		return operationProp;
	}

	public createN8nPropertiesForApiOperation(
		apiOperation: OpenAPIV3.OperationObject,
		resourceName: string,
		operationId: string,
	): any[] {
		const displayOptions: DisplayOptions = {
			resourceName: resourceName,
			operationValues: [operationId],
		};

		const paramProps = this.createN8nPropertiesForApiOperationParameters(
			apiOperation,
			resourceName,
		);

		let bodyProps: any[] = [];
		if (apiOperation.requestBody) {
			bodyProps = this.createN8nPropertiesForApiOperationRequestBody(apiOperation);
		}

		let props = [...paramProps, ...bodyProps];
		props = this.applyAdditionalFields(props);

		for (const prop of props) {
			this.addDisplayOptions(prop, displayOptions);
		}

		return props;
	}

	public createN8nPropertiesForApiOperationParameters(
		apiOperation: OpenAPIV3.OperationObject,
		resourceName: string,
	): any[] {
		const properties: any[] = [];
		if (Array.isArray(apiOperation.parameters)) {
			for (const param of apiOperation.parameters) {
				const prop = this.createN8nPropertyForApiRequestParameter(param);

				if (
					resourceName === 'CustomRecord' &&
					(param as OpenAPIV3.ParameterObject).name === 'customRecordType'
				) {
					prop.type = N8nPropertyType.ResourceLocator;
					prop.default = { mode: 'enterId', value: '' };

					prop.modes = [
						{
							displayName: 'Enter ID',
							name: 'enterId',
							type: 'string',
							default: '',
						},
						{
							displayName: 'From List',
							name: 'list',
							type: 'list',
							typeOptions: { searchListMethod: 'loadCustomRecordTypes' },
							hint: 'Can take several mins to load.',
							default: '',
						},
					];
				}

				properties.push(prop);
			}
		}
		return properties;
	}

	getLabelFromName(name: string): string {
		if (name === 'CustomRecord') return '[Custom Record]';

		if (name === 'SuiteQL') return '[SuiteQL]';

		// Split on hyphens, process each word, then join with ' - '
		return name
			.split('-')
			.map((word) => {
				// Add space before uppercase letters
				let w = word.replace(/([A-Z])/g, ' $1');
				// Capitalize first character
				w = w.replace(/^./, (str) => str.toUpperCase());
				// Replace multiple spaces with single space
				w = w.replace(/\s+/, ' ');
				// Trim
				return w.trim();
			})
			.join(' - ');
	}

	addDisplayOptions(prop: any, displayOptions: DisplayOptions) {
		prop.displayOptions = {
			show: {
				resource: [displayOptions.resourceName],
				operation: displayOptions.operationValues,
			},
		};
	}

	public createN8nPropertiesForApiOperationRequestBody(
		apiOperation: OpenAPIV3.OperationObject,
	): any[] {
		if (
			!(
				apiOperation.requestBody &&
				typeof apiOperation.requestBody === 'object' &&
				'content' in apiOperation.requestBody
			)
		) {
			throw new ApplicationError(
				'Invalid or missing requestBody: must be an object with a content property',
			);
		}

		const content = apiOperation.requestBody.content;
		const firstContentType = Object.keys(content)[0];
		const firstContent = content[firstContentType];

		if (!firstContent || !firstContent.schema) {
			throw new ApplicationError('Invalid requestBody schema');
		}

		let schema = firstContent.schema;
		// If schema is a $ref, resolve it from nameToComponentMap
		if (!OpenApiUtils.isReferenceObject(schema)) {
			throw new ApplicationError('Only $ref schemas are supported for requestBody');
		}

		const ref = schema.$ref;

		const refComponentName = this.schema.getComponentNameFromRef(ref, true);
		const refComponentSchema = this.schema.nameToComponentMap[refComponentName];

		if (!OpenApiUtils.isSchemaObject(refComponentSchema)) {
			throw new ApplicationError('Component schema should be schema object');
		}

		const properties: any[] = this.getN8nPropertiesFromApiComponentSchemaProperties(
			refComponentName,
			refComponentSchema as OpenAPIV3.NonArraySchemaObject,
		);

		return properties;
	}

	areAllN8nPropertiesOptional(n8nProperties: any[]): boolean {
		if (!n8nProperties || n8nProperties.length === 0) {
			throw new ApplicationError('No n8n properties provided');
		}

		if (!n8nProperties.some((prop) => prop.required)) {
			return true;
		}

		return false;
	}

	getN8nPropertiesFromApiComponentSchemaProperties(
		componentName: string,
		componentSchema: OpenAPIV3.NonArraySchemaObject,
	): any[] {
		if (!componentSchema) {
			throw new ApplicationError(`Component schema for ${componentName} is missing`);
		}

		if (!OpenApiUtils.isSchemaObject(componentSchema)) {
			throw new ApplicationError(`Component schema for ${componentName} should be a schema object`);
		}

		if (!componentSchema.properties) {
			throw new ApplicationError(`Component schema for ${componentName} does not have properties`);
		}

		const props: any[] = [];

		for (const [propName, propSchema] of Object.entries(componentSchema.properties)) {
			const propSchemaObject = propSchema as OpenAPIV3.SchemaObject;
			if (propSchemaObject.readOnly || this.skipComponentProperty(componentName, propName))
				continue;

			const isRequired: boolean = (componentSchema.required ?? []).includes(propName);

			const prop = this.createN8nPropertyForApiComponentProperty(
				propName,
				propSchemaObject,
				isRequired,
			);

			props.push(prop);
		}

		return props;
	}

	private static readonly skipComponentProperties = new Set(['nsResource_refName']);

	skipComponentProperty(componentName: string, propName: string): boolean {
		const fullPropName: string = `${componentName}_${propName}`;
		if (NodePropertyFactory.skipComponentProperties.has(fullPropName)) {
			return true;
		}

		return false;
	}

	getEnumOptions(enumValues: any[]): any[] {
		const emptyOption = { name: '', value: '' };
		const enumOptions = enumValues.map((val) => ({ name: val, value: val }));
		return [emptyOption, ...enumOptions];
	}

	createN8nPropertyForApiRequestParameter(
		param: OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject,
	): any {
		var prop: any = null;

		if ('$ref' in param) throw new ApplicationError('Referenced parameters not supported');

		if (!param.schema || !('type' in param.schema)) {
			throw new ApplicationError('Parameter schema does not have type');
		}

		const paramSchema = param.schema as OpenAPIV3.SchemaObject;

		const openApiType = paramSchema.type;

		if (typeof openApiType === 'undefined' || !OpenApiUtils.isSimpleType(openApiType)) {
			throw new ApplicationError(
				`Parameter '${param.name}' has unsupported or missing  type: ${openApiType}`,
			);
		}

		const n8nType = this.getN8nTypeFromSchemObject(paramSchema);

		var prop: any = {
			displayName: this.getLabelFromName(param.name),
			name: param.name,
			type: n8nType,
			default: N8nUtils.getDefaultValue(n8nType),
			description: param.description || '',
		};

		if (!!param.required) {
			prop.required = true;
		}

		if (n8nType === N8nPropertyType.Options && paramSchema.enum) {
			prop.options = this.getEnumOptions(paramSchema.enum);
		}

		return prop;
	}

	createN8nPropertyForApiComponentProperty(
		propName: string,
		propSchema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject,
		isRequired: boolean = false,
	): any {
		if (OpenApiUtils.isReferenceObject(propSchema)) {
			const ref = propSchema.$ref;
			const refComponentName = this.schema.getComponentNameFromRef(ref);

			return this.createN8nPropertyForApiComponentReferenceProperty(
				propName,
				refComponentName,
				isRequired,
			);
		}

		if (OpenApiUtils.isOneOfObject(propSchema)) {
			return this.createN8nPropertyForApiComponentReferenceProperty(
				propName,
				'nsResource',
				isRequired,
			);
		}

		if (!OpenApiUtils.isSchemaObject(propSchema)) {
			throw new ApplicationError(
				`Component Property schema for property '${propName}' should be a schema object.`,
			);
		}

		let openApiType = propSchema.type;

		//There are some edge cases like "quantity" where type is not defined for some reason
		if (typeof openApiType === 'undefined') openApiType = OpenApiType.Object;

		if (OpenApiUtils.isObjectType(openApiType)) {
			return this.createN8nPropertyForApiComponentObjectProperty(
				propName,
				'anonymousObject',
				propSchema as OpenAPIV3.NonArraySchemaObject,
				isRequired,
			);
		}

		if (OpenApiUtils.isArrayType(openApiType)) {
			return this.createN8nPropertyForApiComponentArrayProperty(
				propName,
				propSchema as OpenAPIV3.ArraySchemaObject,
				isRequired,
			);
		}

		if (!OpenApiUtils.isSimpleType(openApiType)) {
			throw new ApplicationError(`Unsupported or missing parameter type: ${openApiType}`);
		}

		const n8nType = this.getN8nTypeFromSchemObject(propSchema);

		const prop: any = {
			displayName: propSchema.title?.trim() || this.getLabelFromName(propName),
			name: propName,
			type: n8nType,
			default: N8nUtils.getDefaultValue(n8nType),
			description: propSchema.description || '',
		};

		if (isRequired) {
			prop.required = true;
		}

		if (n8nType === N8nPropertyType.Options && propSchema.enum) {
			prop.options = this.getEnumOptions(propSchema.enum);
		}

		return prop;
	}

	createN8nPropertyForApiComponentReferenceProperty(
		apiComponentPropertyName: string,
		refComponentName: string,
		isRequired: boolean = false,
	): any {
		const refComponentSchema = this.schema.nameToComponentMap[refComponentName];

		if (!OpenApiUtils.isSchemaObject(refComponentSchema)) {
			throw new ApplicationError('Referenced component is not a valid schema');
		}

		const prop = this.createN8nPropertyForApiComponentObjectProperty(
			apiComponentPropertyName,
			refComponentName as string,
			refComponentSchema as OpenAPIV3.NonArraySchemaObject,
			isRequired,
		);

		return prop;
	}

	createN8nPropertyForApiComponentObjectProperty(
		apiComponentPropertyName: string,
		apiComponentName: string,
		apiComponentObjectSchema: OpenAPIV3.NonArraySchemaObject,
		isRequired: boolean = false,
	): any {
		const prop = this.createN8nCollectionProperty(
			apiComponentPropertyName,
			apiComponentName,
			apiComponentObjectSchema,
			false,
			isRequired,
		);

		return prop;
	}

	createN8nPropertyForApiComponentArrayProperty(
		apiComponentPropertyName: string,
		apiComponentArraySchema: OpenAPIV3.ArraySchemaObject,
		isRequired: boolean = false,
	): any {
		const ref = (apiComponentArraySchema.items as OpenAPIV3.ReferenceObject).$ref;
		const apiComponentName = this.schema.getComponentNameFromRef(ref);
		const apiComponentObjectSchema = this.schema.nameToComponentMap[
			apiComponentName
		] as OpenAPIV3.NonArraySchemaObject;

		const prop: any = this.createN8nCollectionProperty(
			apiComponentPropertyName,
			apiComponentName,
			apiComponentObjectSchema,
			true,
			isRequired,
		);
		return prop;
	}

	createN8nCollectionProperty(
		apiComponentPropertyName: string,
		apiComponentName: string,
		apiComponentObjectSchema: OpenAPIV3.NonArraySchemaObject,
		multipleValues: boolean = false,
		isRequired: boolean = false,
	): any {
		let childProps = this.getN8nPropertiesFromApiComponentSchemaProperties(
			apiComponentName,
			apiComponentObjectSchema as OpenAPIV3.NonArraySchemaObject,
		);

		let n8nPropertyType = N8nPropertyType.FixedCollection;

		if (apiComponentName === 'nsResource') n8nPropertyType = N8nPropertyType.Collection;
		else {
			if (this.areAllN8nPropertiesOptional(childProps)) {
				n8nPropertyType = N8nPropertyType.Collection;

				if (this.config.sortCollections) {
					childProps.sort((a, b) => a.displayName.localeCompare(b.displayName));
				}
			} else {
				childProps = this.applyAdditionalFields(childProps);
			}
		}

		const prop: any = {
			displayName: this.getLabelFromName(apiComponentPropertyName),
			name: apiComponentPropertyName,
			type: n8nPropertyType,
			default: {},
		};

		if (multipleValues) {
			prop.typeOptions = { multipleValues: true };
		}

		if (isRequired) {
			prop.required = true;
		}

		if (n8nPropertyType === N8nPropertyType.FixedCollection) {
			prop.options = [
				{
					name: apiComponentName,
					displayName: this.getLabelFromName(apiComponentName),
					values: childProps,
				},
			];
		} else {
			prop.options = childProps;
		}

		return prop;
	}

	applyAdditionalFields(props: any[]): any[] {
		const updatedProps: any[] = [];
		const requiredProps = props.filter((prop) => prop.required);
		const optionalProps = props.filter((prop) => prop.required !== true);

		if (this.config.sortCollections) {
			requiredProps.sort((a, b) => a.displayName.localeCompare(b.displayName));
			optionalProps.sort((a, b) => a.displayName.localeCompare(b.displayName));
		}

		if (requiredProps.length > 0 && optionalProps.length == 0) {
			updatedProps.push(...requiredProps);
			return updatedProps;
		}

		updatedProps.push(...requiredProps);

		const addlFieldsProp = {
			displayName: 'Additional Fields',
			name: 'additionalFields',
			type: 'collection',
			default: {},
			options: [...optionalProps],
		};

		updatedProps.push(addlFieldsProp);

		return updatedProps;
	}

	getN8nTypeFromSchemObject(schema: OpenAPIV3.SchemaObject): string {
		const openApiType = schema.type;
		if (typeof openApiType === 'undefined')
			throw new ApplicationError('Property schema does not have type');

		if (!OpenApiUtils.isSimpleType(openApiType)) {
			throw new ApplicationError(`Unsupported or missing parameter type: ${openApiType}`);
		}

		const format = schema.format;
		switch (openApiType) {
			case OpenApiType.String:
				if (format === OpenApiFormat.Date || format === OpenApiFormat.DateTime)
					return N8nPropertyType.DateTime;

				if (schema.enum) return N8nPropertyType.Options;

				//URI and JSONPath need to handle also at some point
				return N8nPropertyType.String;

			case OpenApiType.Number:
				return N8nPropertyType.Number;

			case OpenApiType.Integer:
				return N8nPropertyType.Number;

			case OpenApiType.Boolean:
				return N8nPropertyType.Boolean;

			default:
				throw new ApplicationError(`Unsupported OpenAPI type: ${openApiType}`);
		}
	}

	createPropertyForCustomFields(): any {
		const customFieldTypes = N8nSimplePropertyTypes.map((type) => {
			return { name: `${this.getLabelFromName(type)}`, value: `${type}` };
		});

		customFieldTypes.push({ name: '', value: '' });
		customFieldTypes.push({ name: 'Select', value: 'select' });
		customFieldTypes.push({ name: 'Multi Select', value: 'multiSelect' });
		customFieldTypes.sort((a, b) => a.name.localeCompare(b.name));

		const customFieldOptions: any[] = [];

		const fieldNameOpt = {
			displayName: 'Field Name',
			name: 'fieldName',
			type: N8nPropertyType.Options,
			default: '',
			required: true,
			typeOptions: {
				loadOptionsMethod: 'loadCustomFields',
			},
		};
		customFieldOptions.push(fieldNameOpt);

		const fieldTypeOpt = {
			displayName: 'Field Type',
			name: 'fieldType',
			type: N8nPropertyType.Options,
			default: '',
			required: true,
			options: customFieldTypes,
		};
		customFieldOptions.push(fieldTypeOpt);

		for (const type of customFieldTypes) {
			if (type.value === '') continue;

			const option = this.createPropertyForCustomFieldType(type.value);
			customFieldOptions.push(option);
		}

		const prop: any = {
			displayName: 'Custom Fields',
			name: 'customFields',
			type: 'fixedCollection',
			default: {},
			typeOptions: { multipleValues: true },
			options: [
				{
					name: 'CustomField',
					displayName: 'CustomField',
					values: customFieldOptions,
				},
			],
			description: 'List of Custom Fields',
		};

		return prop;
	}

	createPropertyForCustomFieldType(type: string): any {
		let customFieldProperty;

		if (type === 'select') {
			const nsResourceSchema = this.schema.nameToComponentMap['nsResource'];
			customFieldProperty = {
				displayName: 'Value',
				name: 'value',
				type: 'collection',
				default: {},
				displayOptions: { show: { fieldType: [type] } },
				options: this.getN8nPropertiesFromApiComponentSchemaProperties(
					'nsResource',
					nsResourceSchema as OpenAPIV3.NonArraySchemaObject,
				),
			};
		} else if (type === 'multiSelect') {
			const nsResourceSchema = this.schema.nameToComponentMap['nsResource'];
			customFieldProperty = {
				displayName: 'Value',
				name: 'value',
				type: 'collection',
				default: {},
				displayOptions: { show: { fieldType: [type] } },
				options: [
					{
						displayName: 'Items',
						name: 'items',
						type: 'collection',
						default: {},
						typeOptions: { multipleValues: true },
						options: this.getN8nPropertiesFromApiComponentSchemaProperties(
							'nsResource',
							nsResourceSchema as OpenAPIV3.NonArraySchemaObject,
						),
					},
				],
			};
		} else {
			customFieldProperty = {
				displayName: 'Value',
				name: `value`,
				type: type,
				default: N8nUtils.getDefaultValue(type),
				displayOptions: { show: { fieldType: [type] } },
			} as any;
		}

		return customFieldProperty;
	}
}
