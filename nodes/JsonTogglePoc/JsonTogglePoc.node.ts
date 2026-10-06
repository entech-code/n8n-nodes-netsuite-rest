import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionTypes,
	NodeOperationError,
} from 'n8n-workflow';

export class JsonTogglePoc implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'JSON Toggle POC',
		name: 'jsonTogglePoc',
		icon: 'fa:exchange-alt',
		group: ['transform'],
		version: 1,
		subtitle: '',
		description:
			'Prototype: mirrors the NetSuite REST node\'s Additional Fields pattern, with a JSON-mode toggle added specifically to the repeatable Items sublist.',
		defaults: { name: 'JSON Toggle POC' },
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		properties: [
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				options: [
					{
						displayName: 'Currency',
						name: 'currency',
						type: 'collection',
						placeholder: 'Add Field',
						default: {},
						options: [
							{
								displayName: 'External Identifier',
								name: 'externalId',
								type: 'string',
								default: '',
								description: 'NetSuite external ID for the currency, e.g. USD',
							},
						],
					},
					{
						displayName: 'Items: Choose Mode',
						name: 'specifyItems',
						type: 'options',
						options: [
							{ name: 'Using Fields Below', value: 'fields' },
							{ name: 'Using JSON', value: 'json' },
						],
						default: 'fields',
						description:
							'Whether to add sublist rows one at a time below, or supply the whole array as raw JSON (e.g. built by an upstream Code node from a variable-length source array)',
					},
					{
						displayName: 'Items: Fields',
						name: 'item',
						type: 'collection',
						placeholder: 'Add Field',
						default: {},
						displayOptions: {
							show: { specifyItems: ['fields'] },
						},
						options: [
							{
								displayName: 'Items: Rows',
								name: 'items',
								type: 'fixedCollection',
								typeOptions: { multipleValues: true },
								placeholder: 'Add Item',
								default: {},
								options: [
									{
										name: 'item',
										displayName: 'Item',
										values: [
											{
												displayName: 'Item',
												name: 'itemId',
												type: 'string',
												default: '',
												description: 'NetSuite item reference (internal ID or external ID)',
											},
											{
												displayName: 'Quantity',
												name: 'quantity',
												type: 'number',
												default: 1,
											},
											{
												displayName: 'Rate',
												name: 'rate',
												type: 'number',
												default: 0,
											},
										],
									},
								],
							},
						],
					},
					{
						displayName: 'Items: Raw JSON',
						name: 'itemsJson',
						type: 'json',
						displayOptions: {
							show: { specifyItems: ['json'] },
						},
						default: '[]',
						description:
							'The sublist rows as a raw JSON array, e.g. [{ "itemId": "SKU-1", "quantity": 2, "rate": 9.99 }]. Use this when the number of rows is only known at runtime.',
					},
					{
						displayName: 'Memo',
						name: 'memo',
						type: 'string',
						default: '',
						description: 'Plain example field placed after Items, purely to check layout/spacing below the Items block',
					},
					{
						displayName: 'Order #',
						name: 'orderNumber',
						type: 'string',
						default: '',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const inputItems = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < inputItems.length; itemIndex++) {
			try {
				const additionalFields = this.getNodeParameter('additionalFields', itemIndex, {}) as {
					currency?: { externalId?: string };
					orderNumber?: string;
					specifyItems?: string;
					item?: { items?: { item?: any[] } };
					itemsJson?: any;
					memo?: string;
				};

				const specifyItems = additionalFields.specifyItems ?? 'fields';

				let lineItems: any;
				if (specifyItems === 'json') {
					const rawJson = additionalFields.itemsJson;
					lineItems = typeof rawJson === 'string' ? JSON.parse(rawJson) : (rawJson ?? []);
				} else {
					lineItems = additionalFields.item?.items?.item ?? [];
				}

				const payload = {
					currency: { externalId: additionalFields.currency?.externalId ?? '' },
					orderNumber: additionalFields.orderNumber ?? '',
					item: { items: lineItems },
					memo: additionalFields.memo ?? '',
				};

				returnData.push({ json: { specifyItems, payload }, pairedItem: { item: itemIndex } });
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: itemIndex },
					});
					continue;
				}
				throw new NodeOperationError(this.getNode(), error as Error, { itemIndex });
			}
		}

		return [returnData];
	}
}
