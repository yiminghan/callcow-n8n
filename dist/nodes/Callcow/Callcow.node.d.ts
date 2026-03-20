import type { ILoadOptionsFunctions, INodeListSearchResult, INodeType, INodeTypeDescription } from 'n8n-workflow';
export declare class Callcow implements INodeType {
    description: INodeTypeDescription;
    methods: {
        listSearch: {
            getWorkflows(this: ILoadOptionsFunctions): Promise<INodeListSearchResult>;
        };
    };
}
//# sourceMappingURL=Callcow.node.d.ts.map