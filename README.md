<img width="206" height="19" alt="image" src="https://github.com/user-attachments/assets/630d08a0-4961-4f77-9a4d-5c8aa4669765" />![Banner image](https://user-images.githubusercontent.com/10284570/173569848-c624317f-42b1-45a6-ab09-f0ea3c247648.png)

# n8n NetSuite REST Custom Node

This project provides a custom n8n node for integrating with NetSuite's SuiteTalk REST API. It allows you to automate NetSuite operations (such as creating, retrieving, and updating records) directly from n8n workflows.

## Features

- Connect to NetSuite using REST API credentials
- Full support for 150+ NetSuite standard record types like Customers, InventoryItems, SalesOrders, etc...
- Handles required/optional fields and nested collections
- Automatically extracts new record IDs from NetSuite responses
- Includes debug mode for detailed request/response output
- **Custom Fields support** - Work with custom entity fields (`custentity_*`) and body fields (`custbody_*`)
- **Custom Records integration** - Create, read, update, and delete custom record types
- **SuiteQL queries** - Execute powerful SQL-like queries against NetSuite data with full SuiteQL syntax support

## Screenshots of NetSuite REST node in Action

150+ NetSuite Standard Record types with all the fields including custom fields:

<div align="center">
<img alt="Standard Record Types" src="https://raw.githubusercontent.com/entech-code/n8n-nodes-netsuite-rest-assets/main/feature-standard-record-types.png" style="max-width: 100%; height: auto; width: 600px;"> 
</div>

SuiteQL and Debug Mode:

<div align="center">
<img alt="SuiteQL and Debug Mode" src="https://raw.githubusercontent.com/entech-code/n8n-nodes-netsuite-rest-assets/main/feature-suiteql-and-debug-mode.png" style="max-width: 100%; height: auto; width: 600px;"> 
</div>

Custom Records and Custom Fields:

<div align="center">
<img alt="Custom Record and Custom Fields" src="https://raw.githubusercontent.com/entech-code/n8n-nodes-netsuite-rest-assets/main/feature-custom-record-and-custom-fields.png" style="max-width: 100%; height: auto; width: 600px;"> 
</div>

## Upcoming Features

- Custom Fields support for line fields like Sales Order line items
- Triggers

## Installation

> [!NOTE]
> Only the n8n instance owner of a self-hosted n8n instance can install and manage community nodes from npm. The instance owner is the person who sets up and manages user management.

To install a community node from npm:

1. Go to Settings > Community Nodes.
2. Select Install.
3. Enter the npm package name 'n8n-nodes-netsuite-rest'. 
4. Agree to the risks of using community nodes: select I understand the risks of installing unverified code from a public source.
5. Select Install. n8n installs the node, and returns to the Community Nodes list in Settings.

<div align="center">
<img alt="Install node from npm" src="https://raw.githubusercontent.com/entech-code/n8n-nodes-netsuite-rest-assets/main/setup-install-node-from-npm.png" style="max-width: 100%; height: auto; width: 600px;"> 
</div>



[Full n8n Installation Instructions](https://docs.n8n.io/integrations/community-nodes/installation/gui-install)
 
## Usage

1. Install and configure your NetSuite REST API credentials in n8n.
2. Add the NetSuite REST Test node to your workflow.
3. Select the resource and operation (e.g., Customer > Insert record).
4. Fill in required fields and run the workflow.
5. The node will return NetSuite API responses, including new record IDs for POST operations.

## Example

Add a new customer:

1. Set resource to `Customer` and operation to `Insert record`.
2. Provide required, optional and custom fields (e.g., Email).
3. On success, the response will include the new customer ID extracted from the NetSuite location header.

# NetSuite Connector Config

### NetSuite Integration Record

You must [create an integration record](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_157771733782.html) in NetSuite and enable OAuth 2.0.

<div align="center">
<img alt="NetSuite Integration" src="https://raw.githubusercontent.com/entech-code/n8n-nodes-netsuite-rest-assets/main/setup-netsuite-integration.png" style="max-width: 100%; height: auto; width: 600px;"> 
</div>


For Redirect URI use the OAuth Redirect Url from n8n Credentials.  See next section.
<div align="center">
<img alt="Get OAuth Redirect Url from N8n Credentials" src="https://raw.githubusercontent.com/entech-code/n8n-nodes-netsuite-rest-assets/main/setup-n8n-oauth-redirect-url.png" style="max-width: 100%; height: auto; width: 600px;"> 
</div>


## N8n NetSuite Credential Fields Explained

**Note:** For NetSuite sandboxes, your account ID is usually formatted as `1234567_SB1` in the NetSuite UI, but in URLs it must be lowercase and use a dash: `1234567-sb1`.

When creating your NetSuite REST API credential in n8n for OAuth 2.0, fill in the following fields:

- **Authorization URL**: `https://<accountId>.app.netsuite.com/app/login/oauth2/authorize.nl`
- **Access Token URL**: `https://<accountId>.suitetalk.api.netsuite.com/services/rest/auth/oauth2/v1/token`
- **Client ID**: Your NetSuite application (integration record) Client ID
- **Client Secret**: Your NetSuite application (integration record) Client Secret
- **Scope**: Use `rest_webservices`
- **REST API URL**: `https://<accountId>.suitetalk.api.netsuite.com`

### Configuration Tips

- Ensure your NetSuite account has SuiteTalk REST Web Services enabled.
- The REST API URL should match your account's region and sandbox/production status.
- Permissions for the integration user must include access to the required records and REST web services.

## Known Issues and workarounds

- Entering date into date field and submitting operation may throw error. NetSuite expects dates in ISO 8601 format (like '2025-09-25T14:00:00Z'), but n8n field with Date Selector returns format like '2025-09-25T14:00:00'

  **Workaround**: use n8n expression to format date to conform to ISO

```javascript
{{ '2025-09-25T14:00:00'+'Z' }}   --> 2025-09-25T14:00:00Z
{{ DateTime.fromISO('2025-09-25T14:00:00').toUTC().toISO() }}  --> 2025-09-25T18:00:00.000Z
{{ DateTime.fromISO('2025-09-25T14:00:00').toISO() }} --> 2025-09-25T14:00:00.000-04:00
```

- Search is not available when adding new step using ". This seems to be limitation for community N8n Nodes.

<div align="center">
<img alt="Missing search box" src="https://raw.githubusercontent.com/entech-code/n8n-nodes-netsuite-rest-assets/main/known-issue-missing-search-box.png" style="max-width: 100%; height: auto; width: 400px;"> 
</div>

**Workaround**: use browser search, for example in chrome press Ctrl-F and name of operation.

<div align="center">
<img alt="Missing search box workaround" src="https://raw.githubusercontent.com/entech-code/n8n-nodes-netsuite-rest-assets/main/known-issue-missing-search-box-workaround.png" style="max-width: 100%; height: auto; width: 400px;"> 
</div>

- When filling Custom Fields - can't auto select field type based on NetSuite meta data. It is related to n8n bug where loadOptionsDependsOn is not working inside FixedCollection

  **Workaround**: select field type manually
  <div align="center">
  <img alt="Search is not availabl" src="https://raw.githubusercontent.com/entech-code/n8n-nodes-netsuite-rest-assets/main/known-issue-custom-field-specify-field-type.png" style="max-width: 100%; height: auto; width: 400px;"> 
  </div>

## Development

If you would like to have access to code or assist with development, please contact by email: support@entechsolutions.com .

## License

[MIT](https://github.com/n8n-io/n8n-nodes-starter/blob/master/LICENSE.md)
