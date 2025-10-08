import { NetSuiteRest } from '../../../nodes/NetSuiteRest/NetSuiteRest.node';

describe('NetSuiteRest Node', () => {
	test('should instantiate NetSuiteRest', () => {
		const node = new NetSuiteRest();

		expect(node).toBeDefined();
		expect(node.description).toBeDefined();
		expect(node.description.displayName).toBe('NetSuite REST');

		const fs = require('fs');
		fs.writeFileSync('.\\output\\n8n-node.json', JSON.stringify(node.description, null, 2));
	});
});
