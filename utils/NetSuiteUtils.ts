import { ICredentialDataDecryptedObject } from 'n8n-workflow';

export class NetSuiteUtils {
	static baseRestApiUrl(credentials: ICredentialDataDecryptedObject): string {
		return `https://${credentials.accountSubdomain}.suitetalk.api.netsuite.com/services/rest`;
	}

	restletUrl(credentials: ICredentialDataDecryptedObject): string {
		return `https://${credentials.accountSubdomain}.restlets.api.netsuite.com/app/site/hosting/restlet.nl`;
	}
}
