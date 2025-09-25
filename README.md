![Banner image](https://user-images.githubusercontent.com/10284570/173569848-c624317f-42b1-45a6-ab09-f0ea3c247648.png)

# n8n NetSuite REST Custom Node

This project provides a custom n8n node for integrating with NetSuite's SuiteTalk REST API. It allows you to automate NetSuite operations (such as creating, retrieving, and updating records) directly from n8n workflows.

## Features

- Connect to NetSuite using REST API credentials
- Supports standard NetSuite record operations (GET, POST, etc.)
- Handles required/optional fields and nested collections
- Automatically extracts new record IDs from NetSuite responses
- Includes debug mode for detailed request/response output
- **Custom Fields support** - Work with custom entity fields (`custentity_*`) and body fields (`custbody_*`)
- **Custom Records integration** - Create, read, update, and delete custom record types
- **SuiteQL queries** - Execute powerful SQL-like queries against NetSuite data with full SuiteQL syntax support

## Upcoming Features
- Custom Fields support for line fields like Sales Order line items
- Triggers

## Usage

1. Install and configure your NetSuite REST API credentials in n8n.
2. Add the NetSuite REST Test node to your workflow.
3. Select the resource and operation (e.g., Customer > Add).
4. Fill in required fields and run the workflow.
5. The node will return NetSuite API responses, including new record IDs for POST operations.

## Example

Add a new customer:

1. Set resource to `Customer` and operation to `Insert record`.
2. Provide required, optional and custom fields (e.g., Email).
3. On success, the response will include the new customer ID extracted from the NetSuite location header.


## Known Issues and workarounds

- Entering date into date field and submitting operation will throw error
  Workaround: use expression to format date using ISO

	
- Search is not available when adding new step using ".  This seems to be limitation for community N8n Nodes.
  workaround: use browser search, for example in chrome press Ctrl-F and name of operation.
![Search is not available](https://raw.githubusercontent.com/entech-code/n8n-nodes-netsuite-rest-assets/main/custom-field-specify-field-type.png)

- Custom Fields - can't auto select type (because searcListMethodOn is not working)


# NetSuite Connector Config

## NetSuite Credential Fields Explained (OAuth 2.0)

**Note:** For NetSuite sandboxes, your account ID is usually formatted as `1234567_SB1` in the NetSuite UI, but in URLs it must be lowercase and use a dash: `1234567-sb1`.

When creating your NetSuite REST API credential in n8n for OAuth 2.0, fill in the following fields:

- **Authorization URL**: `https://<accountId>.app.netsuite.com/app/login/oauth2/authorize.nl`
- **Access Token URL**: `https://<accountId>.suitetalk.api.netsuite.com/services/rest/auth/oauth2/v1/token`
- **Client ID**: Your NetSuite application (integration record) Client ID
- **Client Secret**: Your NetSuite application (integration record) Client Secret
- **Scope**: Use `rest_webservices`
- **REST API URL**: `https://<accountId>.suitetalk.api.netsuite.com`

### OAuth 2.0 Notes

- You must [create an integration record](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_157771733782.html) in NetSuite and enable OAuth 2.0.
- The user authorizing the connection must have permissions for SuiteTalk REST Web Services and the required records.

### Configuration Tips

- Ensure your NetSuite account has SuiteTalk REST Web Services enabled.
- The REST API URL should match your account's region and sandbox/production status.
- Permissions for the integration user must include access to the required records and REST web services.

## Development

If you would like to have access to code or assist with development, please contact by email: support@entechsolutions.com .

## License

[MIT](https://github.com/n8n-io/n8n-nodes-starter/blob/master/LICENSE.md)
