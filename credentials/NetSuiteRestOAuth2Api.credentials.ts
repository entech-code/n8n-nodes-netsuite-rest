import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class NetSuiteRestOAuth2Api implements ICredentialType {
	name = 'netSuiteRestOAuth2Api';
	displayName = 'NetSuite REST OAuth2 API';
	extends = ['oAuth2Api'];
	documentationUrl =
		'https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_157780312610.html';
	properties: INodeProperties[] = [
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
