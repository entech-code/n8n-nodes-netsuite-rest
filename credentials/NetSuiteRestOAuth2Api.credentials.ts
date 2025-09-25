import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class NetSuiteRestOAuth2Api implements ICredentialType {
	name = 'netSuiteRestOAuth2Api';
	displayName = 'NetSuite REST OAuth2 API';
	extends = ['oAuth2Api'];
	documentationUrl =
		'https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_157780312610.html';
	properties: INodeProperties[] = [
		{
			displayName: 'Grant Type',
			name: 'grantType',
			type: 'hidden',
			default: 'authorizationCode',
		},
		{
			displayName: 'Authentication',
			name: 'authentication',
			type: 'hidden',
			default: 'header',
		},
		{
			displayName: 'Auth URI Query Parameters',
			name: 'authQueryParameters',
			type: 'hidden',
			default: '',
		},
		{
			displayName: 'Scope',
			name: 'scope',
			type: 'hidden',
			default: 'rest_webservices',
		},
		{
			displayName: 'REST API Url',
			name: 'restApiUrl',
			type: 'string',
			required: true,
			default: '',
			placeholder: 'https://<account_id>.suitetalk.api.netsuite.com',
			description:
				'Usually found in Setup -> Company -> Company Information -> Company URLS -> SUITETALK (SOAP and REST WEB SERVICES).',
		},
	];
}
