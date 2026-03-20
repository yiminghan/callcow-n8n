import type {
	IHookFunctions,
	ILoadOptionsFunctions,
	INodeListSearchResult,
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
} from 'n8n-workflow';

const BASE_URL = 'https://www.callcow.ai';

export class CallcowTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Callcow Trigger',
		name: 'callcowTrigger',
		icon: 'file:callcow.svg',
		group: ['trigger'],
		version: 1,
		subtitle: 'Call Completed',
		description: 'Triggers when a call is completed in Callcow',
		defaults: {
			name: 'Callcow Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'callcowApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Workflow',
				name: 'workflow_id',
				type: 'resourceLocator',
				default: { mode: 'list', value: '' },
				required: true,
				description: 'The Callcow workflow to listen for completed calls',
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
			},
		],
	};

	methods = {
		listSearch: {
			async getWorkflows(this: ILoadOptionsFunctions): Promise<INodeListSearchResult> {
				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'callcowApi',
					{
						method: 'GET',
						url: `${BASE_URL}/api/workflows`,
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

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				return webhookData.webhookId !== undefined;
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default')!;
				const workflowIdParam = this.getNodeParameter('workflow_id') as { value: string };
				const workflowId = workflowIdParam.value ?? workflowIdParam;

				try {
					const response = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'callcowApi',
						{
							method: 'POST',
							url: `${BASE_URL}/api/webhooks`,
							body: {
								workflow_id: workflowId,
								webhook_url: webhookUrl,
								name: 'n8n Trigger',
							},
							json: true,
						},
					);

					const data = response as { id: string };
					const webhookData = this.getWorkflowStaticData('node');
					webhookData.webhookId = data.id;
					return true;
				} catch (error) {
					const statusCode = (error as { statusCode?: number }).statusCode;
					if (statusCode === 401) {
						throw new Error('Authentication failed. Check your Callcow API key in credentials.');
					}
					if (statusCode === 404) {
						throw new Error('Workflow not found. Make sure the selected workflow exists and belongs to your organization.');
					}
					if (statusCode === 429) {
						throw new Error('Rate limit exceeded. Please wait and try again.');
					}
					throw new Error(`Failed to register webhook with Callcow: ${(error as Error).message}`);
				}
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				const webhookId = webhookData.webhookId as string | undefined;

				if (!webhookId) {
					return true;
				}

				try {
					await this.helpers.httpRequestWithAuthentication.call(
						this,
						'callcowApi',
						{
							method: 'DELETE',
							url: `${BASE_URL}/api/webhooks/${webhookId}`,
							json: true,
						},
					);
				} catch (error) {
					const statusCode = (error as { statusCode?: number }).statusCode;
					// Swallow 404 — webhook may have been deleted from Callcow dashboard
					if (statusCode !== 404) {
						throw error;
					}
				}

				delete webhookData.webhookId;
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const bodyData = this.getBodyData();
		return {
			workflowData: [this.helpers.returnJsonArray(bodyData)],
		};
	}
}
