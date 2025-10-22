import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class NetSuiteRestOAuth2Api implements ICredentialType {
	name = 'netSuiteRestOAuth2Api';
	displayName = 'NetSuite REST OAuth2 API';
	extends = ['oAuth2Api'];
	documentationUrl =
		'https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_157780312610.html';
	properties: INodeProperties[] = [
		{
			displayName: 'Account Subdomain',
			name: 'accountSubdomain',
			required: true,
			type: 'string',
			default: '',
			description:
				'Get account subdomain from NetSuite url after login into your NetSuite account. Usually https://[account-subdomain].app.netsuite.com',
		},
		{
			displayName: 'Grant Type',
			name: 'grantType',
			type: 'hidden',
			default: 'authorizationCode',
		},
		{
			displayName: 'Authorization URL',
			name: 'authUrl',
			type: 'hidden',
			default:
				'=https://{{$self["accountSubdomain"]}}.app.netsuite.com/app/login/oauth2/authorize.nl',
			required: true,
		},
		{
			displayName: 'Access Token URL',
			name: 'accessTokenUrl',
			type: 'hidden',
			default:
				'=https://{{$self["accountSubdomain"]}}.suitetalk.api.netsuite.com/services/rest/auth/oauth2/v1/token',
			required: true,
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
			default: 'rest_webservices restlets',
		},
	];
}
