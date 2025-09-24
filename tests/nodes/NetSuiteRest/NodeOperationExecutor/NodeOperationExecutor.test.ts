import { NodeOperationExecutor } from '../../../../nodes/NetSuiteRest/NodeOperationExecutor';

describe('NodeOperationExecutor  test static methods', () => {
	test('flattenRequestBodyObject flattens intermediary ns objects', () => {
		const input = {
			subsidiary: {
				nsResource: {
					id: '2',
				},
			},
		};

		const result = NodeOperationExecutor.flattenRequestBodyObject(input);

		const expected = {
			subsidiary: {
				id: '2',
			},
		};

		expect(result).toEqual(expected);
	});

	test('flattenRequestBodyObject removes intermediary objects with dashes in property names', () => {
		const input = {
			addressBook: {
				'customer-addressBookCollection': {
					items: {
						'customer-addressBookElement': [
							{
								addressBookAddress: {
									'customer-addressBook-addressBookAddress': {
										addr1: 'Addr1',
										override: false,
									},
								},
								defaultBilling: false,
							},
							{
								addressBookAddress: {
									'customer-addressBook-addressBookAddress': {
										addr1: 'Adress1_2',
										override: false,
									},
								},
								defaultBilling: false,
							},
						],
					},
				},
			},
		};

		const result = NodeOperationExecutor.flattenRequestBodyObject(input);

		const expected = {
			addressBook: {
				items: [
					{
						addressBookAddress: {
							addr1: 'Addr1',
							override: false,
						},
						defaultBilling: false,
					},
					{
						addressBookAddress: {
							addr1: 'Adress1_2',
							override: false,
						},
						defaultBilling: false,
					},
				],
			},
		};

		expect(result).toEqual(expected);
	});
});

describe('NodeOperationExecutor.getIdFromResponseLocation', () => {
	test('should extract the ID from the location URL', () => {
		const location =
			'https://12345.suitetalk.api.netsuite.com/services/rest/record/v1/customer/36912';

		const id = NodeOperationExecutor.getIdFromResponseLocation(location);
		expect(id).toBe('36912');
	});
});
