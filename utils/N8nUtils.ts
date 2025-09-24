export enum N8nPropertyType {
	String = 'string',
	Number = 'number',
	Boolean = 'boolean',
	Collection = 'collection',
	FixedCollection = 'fixedCollection',
	Options = 'options',
	DateTime = 'dateTime',
	Json = 'json',
	ResourceLocator = 'resourceLocator',
}

export const N8nSimplePropertyTypes: N8nPropertyType[] = [
	N8nPropertyType.String,
	N8nPropertyType.Number,
	N8nPropertyType.Boolean,
	N8nPropertyType.DateTime,
];

// Utility class for n8n property helpers
export class N8nUtils {
	/**
	 * Returns the n8n default value for a given n8n property type
	 */
	static getDefaultValue(propertyType: string): any {
		switch (propertyType) {
			case N8nPropertyType.String:
			case N8nPropertyType.DateTime:
			case N8nPropertyType.Options:
				return '';
			case N8nPropertyType.Number:
				return null;
			case N8nPropertyType.Boolean:
				return false;
			case N8nPropertyType.Collection:
				return {};
			default:
				throw new Error(`Unknown N8n property type: ${propertyType}`);
		}
	}
}
