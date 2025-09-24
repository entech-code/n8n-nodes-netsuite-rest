import { NetSuiteRest } from '../../../nodes/NetSuiteRest/NetSuiteRest.node';

describe('NetSuiteRest Node', () => {
	test('should instantiate NetSuiteRest', () => {
		const start = Date.now();
		const node = new NetSuiteRest();
		const elapsedMs = Date.now() - start;

		expect(node).toBeDefined();
		expect(node.description).toBeDefined();
		expect(node.description.displayName).toBe('NetSuite REST');

		// Write the full node description to D:\console.log for inspection
		//console.dir(node.description, { depth: null, maxArrayLength: null });

		console.log('Loaded properties: ', node.description.properties.length);
		console.log(`NetSuiteRest instantiation took ${(elapsedMs / 1000).toFixed(3)} seconds`);

		const fs = require('fs');
		fs.writeFileSync('.\\output\\n8n-node.json', JSON.stringify(node.description, null, 2));
	});
});
