"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Callcow = void 0;
class Callcow {
  constructor() {
    this.description = {
      displayName: "Callcow",
      name: "callcow",
      icon: "file:callcow.svg",
      group: ["output"],
      version: 1,
      subtitle: "Trigger a Call",
      description: "Trigger an outbound AI phone call using a Callcow workflow",
      defaults: {
        name: "Callcow",
      },
      inputs: ["main"],
      outputs: ["main"],
      credentials: [
        {
          name: "callcowApi",
          required: true,
        },
      ],
      requestDefaults: {
        baseURL: "https://www.callcow.ai",
        url: "/api/call",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
      properties: [
        {
          displayName: "Workflow",
          name: "workflow_id",
          type: "resourceLocator",
          default: { mode: "list", value: "" },
          required: true,
          modes: [
            {
              displayName: "From List",
              name: "list",
              type: "list",
              typeOptions: {
                searchListMethod: "getWorkflows",
                searchable: true,
              },
            },
            {
              displayName: "By ID",
              name: "id",
              type: "string",
              placeholder: "e.g. abc-123-def",
            },
          ],
          routing: {
            send: {
              type: "body",
              property: "workflow_id",
              value: "={{ $value }}",
            },
          },
        },
        {
          displayName: "Recipient Phone",
          name: "recipient_phone",
          type: "string",
          default: "",
          required: true,
          placeholder: "+1234567890",
          description: "Phone number with country code",
          routing: {
            send: {
              type: "body",
              property: "recipient_phone",
            },
          },
        },
        {
          displayName: "Recipient Name",
          name: "recipient_name",
          type: "string",
          default: "",
          description: "Name of the person being called",
          routing: {
            send: {
              type: "body",
              property: "recipient_name",
            },
          },
        },
        {
          displayName: "Recipient Email",
          name: "recipient_email",
          type: "string",
          default: "",
          description: "Email address of the person being called",
          routing: {
            send: {
              type: "body",
              property: "recipient_email",
            },
          },
        },
        {
          displayName: "Additional Context",
          name: "recipient_context",
          type: "string",
          typeOptions: { rows: 4 },
          default: "",
          description: "Additional context for the AI agent during the call",
          routing: {
            send: {
              type: "body",
              property: "recipient_context",
            },
          },
        },
        {
          displayName: "Idempotency Key",
          name: "idempotency_key",
          type: "string",
          default: "",
          description: "Unique key to prevent duplicate calls on retries",
          routing: {
            send: {
              type: "body",
              property: "idempotency_key",
            },
          },
        },
      ],
    };
    this.methods = {
      listSearch: {
        async getWorkflows() {
          const credentials = await this.getCredentials("callcowApi");
          const response =
            await this.helpers.httpRequestWithAuthentication.call(
              this,
              "callcowApi",
              {
                method: "GET",
                url: "https://www.callcow.ai/api/workflows",
                json: true,
              },
            );
          const workflows = response.workflows;
          return {
            results: workflows.map((wf) => {
              var _a;
              return {
                name:
                  (_a = wf.name) !== null && _a !== void 0
                    ? _a
                    : "Unnamed Workflow",
                value: wf.id,
              };
            }),
          };
        },
      },
    };
  }
}
exports.Callcow = Callcow;
//# sourceMappingURL=Callcow.node.js.map
