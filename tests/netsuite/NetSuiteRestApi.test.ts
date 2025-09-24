import {
	GetAccessTokenFromRefreshTokenRequest,
	NetSuiteRestApi,
} from '../../netsuite/NetSuiteRestApi';
import * as fs from 'fs';
import * as path from 'path';

async function createNetSuiteApi(): Promise<NetSuiteRestApi> {
	const configPath = path.resolve(__dirname, 'NetSuiteRestApiConfig.json');
	const configRaw = fs.readFileSync(configPath, 'utf-8');
	const configJson = JSON.parse(configRaw);

	console.dir(configJson, { depth: null });
	const getAccessTokenRequest: GetAccessTokenFromRefreshTokenRequest = {
		restApiUrl: configJson.restApiUrl,
		clientId: configJson.clientId,
		clientSecret: configJson.clientSecret,
		refreshToken: configJson.refreshToken,
	};

	const accessToken = await NetSuiteRestApi.getAccessTokenFromRefreshToken(getAccessTokenRequest);
	return new NetSuiteRestApi(null, accessToken, configJson.restApiUrl);
}

describe('NetSuiteRestApi', () => {
	let api: NetSuiteRestApi;

	beforeAll(async () => {
		api = await createNetSuiteApi();
	});

	test.skip('getCustomRecordTypes returns custom records', async () => {
		const response = await api.getCustomRecordTypes();
		console.dir(response, { depth: null });
		console.log('Custom Record Types:', response.length);

		expect(response).toBeDefined();
		expect(Array.isArray(response)).toBe(true);
		expect(response.length).toBeGreaterThan(0);
		expect(response[0].startsWith('customrecord_')).toBe(true);
	}, 30000);

	test.skip('getCustomFields returns custom fields for customer', async () => {
		const customFields = await api.getCustomFields('customer');

		expect(Array.isArray(customFields)).toBe(true);
		expect(customFields.length).toBeGreaterThan(0);

		console.dir(customFields, { depth: null });
		console.log('Total custom fields for customer:', customFields.length);
	}, 30000);
});
