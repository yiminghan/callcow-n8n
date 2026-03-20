import type {
	ILoadOptionsFunctions,
	INodeListSearchResult,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

export class Callcow implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Callcow',
		name: 'callcow',
		icon: 'file:callcow.svg',
		group: ['output'],
		version: 1,
		subtitle: 'Trigger a Call',
		description: 'Trigger an outbound AI phone call using a Callcow workflow',
		defaults: {
			name: 'Callcow',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'callcowApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: 'https://app.callcow.ai',
			url: '/api/call',
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Workflow',
				name: 'workflow_id',
				type: 'resourceLocator',
				default: { mode: 'list', value: '' },
				required: true,
				modes: [
					{
						displayName: 'From List',
						name: 'list',
						type: 'list',
						typeOptions: {
							searchListMethod: 'getWorkflows',
							searchable: true,
						},
					},
					{
						displayName: 'By ID',
						name: 'id',
						type: 'string',
						placeholder: 'e.g. abc-123-def',
					},
				],
				routing: {
					send: {
						type: 'body',
						property: 'workflow_id',
						value: '={{ $value }}',
					},
				},
			},
			{
				displayName: 'Recipient Phone',
				name: 'recipient_phone',
				type: 'string',
				default: '',
				required: true,
				placeholder: '+1234567890',
				description: 'Phone number with country code',
				routing: {
					send: {
						type: 'body',
						property: 'recipient_phone',
					},
				},
			},
			{
				displayName: 'Recipient Name',
				name: 'recipient_name',
				type: 'string',
				default: '',
				description: 'Name of the person being called',
				routing: {
					send: {
						type: 'body',
						property: 'recipient_name',
					},
				},
			},
			{
				displayName: 'Recipient Email',
				name: 'recipient_email',
				type: 'string',
				default: '',
				description: 'Email address of the person being called',
				routing: {
					send: {
						type: 'body',
						property: 'recipient_email',
					},
				},
			},
			{
				displayName: 'Additional Context',
				name: 'recipient_context',
				type: 'string',
				typeOptions: { rows: 4 },
				default: '',
				description: 'Additional context for the AI agent during the call',
				routing: {
					send: {
						type: 'body',
						property: 'recipient_context',
					},
				},
			},
			{
				displayName: 'Idempotency Key',
				name: 'idempotency_key',
				type: 'string',
				default: '',
				description: 'Unique key to prevent duplicate calls on retries',
				routing: {
					send: {
						type: 'body',
						property: 'idempotency_key',
					},
				},
			},
		],
	};

	methods = {
		listSearch: {
			async getWorkflows(this: ILoadOptionsFunctions): Promise<INodeListSearchResult> {
				const credentials = await this.getCredentials('callcowApi');
				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'callcowApi',
					{
						method: 'GET',
						url: 'https://app.callcow.ai/api/workflows',
						json: true,
					},
				);
				const workflows = (response as { workflows: Array<{ id: string; name: string | null }> }).workflows;
				return {
					results: workflows.map((wf) => ({
						name: wf.name ?? 'Unnamed Workflow',
						value: wf.id,
					})),
				};
			},
		},
	};
}
