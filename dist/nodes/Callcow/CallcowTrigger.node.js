"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallcowTrigger = void 0;
const BASE_URL = 'https://app.callcow.ai';
class CallcowTrigger {
    constructor() {
        this.description = {
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
        this.methods = {
            listSearch: {
                async getWorkflows() {
                    const response = await this.helpers.httpRequestWithAuthentication.call(this, 'callcowApi', {
                        method: 'GET',
                        url: `${BASE_URL}/api/workflows`,
                        json: true,
                    });
                    const workflows = response.workflows;
                    return {
                        results: workflows.map((wf) => {
                            var _a;
                            return ({
                                name: (_a = wf.name) !== null && _a !== void 0 ? _a : 'Unnamed Workflow',
                                value: wf.id,
                            });
                        }),
                    };
                },
            },
        };
        this.webhookMethods = {
            default: {
                async checkExists() {
                    const webhookData = this.getWorkflowStaticData('node');
                    return webhookData.webhookId !== undefined;
                },
                async create() {
                    var _a;
                    const webhookUrl = this.getNodeWebhookUrl('default');
                    const workflowIdParam = this.getNodeParameter('workflow_id');
                    const workflowId = (_a = workflowIdParam.value) !== null && _a !== void 0 ? _a : workflowIdParam;
                    try {
                        const response = await this.helpers.httpRequestWithAuthentication.call(this, 'callcowApi', {
                            method: 'POST',
                            url: `${BASE_URL}/api/webhooks`,
                            body: {
                                workflow_id: workflowId,
                                webhook_url: webhookUrl,
                                name: 'n8n Trigger',
                            },
                            json: true,
                        });
                        const data = response;
                        const webhookData = this.getWorkflowStaticData('node');
                        webhookData.webhookId = data.id;
                        return true;
                    }
                    catch (error) {
                        const statusCode = error.statusCode;
                        if (statusCode === 401) {
                            throw new Error('Authentication failed. Check your Callcow API key in credentials.');
                        }
                        if (statusCode === 404) {
                            throw new Error('Workflow not found. Make sure the selected workflow exists and belongs to your organization.');
                        }
                        if (statusCode === 429) {
                            throw new Error('Rate limit exceeded. Please wait and try again.');
                        }
                        throw new Error(`Failed to register webhook with Callcow: ${error.message}`);
                    }
                },
                async delete() {
                    const webhookData = this.getWorkflowStaticData('node');
                    const webhookId = webhookData.webhookId;
                    if (!webhookId) {
                        return true;
                    }
                    try {
                        await this.helpers.httpRequestWithAuthentication.call(this, 'callcowApi', {
                            method: 'DELETE',
                            url: `${BASE_URL}/api/webhooks/${webhookId}`,
                            json: true,
                        });
                    }
                    catch (error) {
                        const statusCode = error.statusCode;
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
    }
    async webhook() {
        const bodyData = this.getBodyData();
        return {
            workflowData: [this.helpers.returnJsonArray(bodyData)],
        };
    }
}
exports.CallcowTrigger = CallcowTrigger;
//# sourceMappingURL=CallcowTrigger.node.js.map