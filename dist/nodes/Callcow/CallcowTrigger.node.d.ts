import type { IHookFunctions, ILoadOptionsFunctions, INodeListSearchResult, INodeType, INodeTypeDescription, IWebhookFunctions, IWebhookResponseData } from 'n8n-workflow';
export declare class CallcowTrigger implements INodeType {
    description: INodeTypeDescription;
    methods: {
        listSearch: {
            getWorkflows(this: ILoadOptionsFunctions): Promise<INodeListSearchResult>;
        };
    };
    webhookMethods: {
        default: {
            checkExists(this: IHookFunctions): Promise<boolean>;
            create(this: IHookFunctions): Promise<boolean>;
            delete(this: IHookFunctions): Promise<boolean>;
        };
    };
    webhook(this: IWebhookFunctions): Promise<IWebhookResponseData>;
}
//# sourceMappingURL=CallcowTrigger.node.d.ts.map