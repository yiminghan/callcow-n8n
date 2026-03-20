"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallcowApi = void 0;
class CallcowApi {
    constructor() {
        this.name = 'callcowApi';
        this.displayName = 'Callcow API';
        this.documentationUrl = 'https://docs.callcow.ai/api';
        this.properties = [
            {
                displayName: 'API Key',
                name: 'apiKey',
                type: 'string',
                typeOptions: { password: true },
                default: '',
                required: true,
                description: 'Your Callcow API key (starts with ck_live_). Generate from Settings → API Keys.',
            },
        ];
        this.authenticate = {
            type: 'generic',
            properties: {
                headers: {
                    Authorization: '=Bearer {{$credentials.apiKey}}',
                },
            },
        };
        this.test = {
            request: {
                baseURL: 'https://app.callcow.ai',
                url: '/api/workflows',
                method: 'GET',
            },
        };
    }
}
exports.CallcowApi = CallcowApi;
//# sourceMappingURL=CallcowApi.credentials.js.map