import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { google } from "googleapis";
import path from "path";

// 🎯 الثابت بتاعنا: حط الـ ID بتاع الشيت هنا بين علامات التنصيص
const TARGET_SPREADSHEET_ID = "11AyVoybor11-erevQP_v-tYbOdu5wFZpeGyTLI6dVS8";

// 1. Authentication
const auth = new google.auth.GoogleAuth({
    keyFile: path.join(process.cwd(), 'credentials.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// 2. Server Initialization
const server = new Server({
    name: "DMS-Supreme-Schema-Manager",
    version: "1.1.0", // كبرنا الإصدار
}, {
    capabilities: { tools: {} }
});

// 3. Define the Allowed Tools (شيلنا الـ spreadsheetId من الـ AI)
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "create_new_sheet",
                description: "Creates a new empty sheet (tab) in the Database.",
                inputSchema: {
                    type: "object",
                    properties: {
                        title: { type: "string", description: "The exact name of the new sheet" }
                    },
                    required: ["title"]
                }
            },
            {
                name: "add_column_header",
                description: "Adds a new column header to the FIRST ROW only.",
                inputSchema: {
                    type: "object",
                    properties: {
                        sheetName: { type: "string", description: "The name of the target sheet (e.g., Users)" },
                        headerName: { type: "string", description: "The exact name of the new column" }
                    },
                    required: ["sheetName", "headerName"]
                }
            },
            {
                name: "read_sheet_data",
                description: "Reads the entire content or a specific range of a sheet.",
                inputSchema: {
                    type: "object",
                    properties: {
                        sheetName: { type: "string", description: "The name of the target sheet (e.g., Users)" },
                        range: { type: "string", description: "Optional A1 range to read (e.g., A1:Z100). If omitted, reads the entire sheet." }
                    },
                    required: ["sheetName"]
                }
            },
            {
                name: "read_sheet_columns",
                description: "Reads only the column headers (the first row) of a specific sheet.",
                inputSchema: {
                    type: "object",
                    properties: {
                        sheetName: { type: "string", description: "The name of the target sheet (e.g., Users)" }
                    },
                    required: ["sheetName"]
                }
            },
            {
                name: "write_sheet_data",
                description: "Writes or updates a range of cells in a sheet.",
                inputSchema: {
                    type: "object",
                    properties: {
                        sheetName: { type: "string", description: "The name of the target sheet" },
                        range: { type: "string", description: "A1 range to write to (e.g. A2:D100)" },
                        values: {
                            type: "array",
                            items: {
                                type: "array",
                                items: { type: "string" }
                            },
                            description: "2D array of values to write (rows of cells)"
                        }
                    },
                    required: ["sheetName", "range", "values"]
                }
            },
            {
                name: "append_sheet_data",
                description: "Appends rows of data to the end of a sheet.",
                inputSchema: {
                    type: "object",
                    properties: {
                        sheetName: { type: "string", description: "The name of the target sheet" },
                        values: {
                            type: "array",
                            items: {
                                type: "array",
                                items: { type: "string" }
                            },
                            description: "2D array of values to append (rows of cells)"
                        }
                    },
                    required: ["sheetName", "values"]
                }
            }
        ]
    };
});

// 4. Execute the Tools
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
        if (name === "create_new_sheet") {
            await sheets.spreadsheets.batchUpdate({
                spreadsheetId: TARGET_SPREADSHEET_ID, // <-- بيستخدم الثابت
                requestBody: {
                    requests: [{ addSheet: { properties: { title: args.title } } }]
                }
            });
            return { content: [{ type: "text", text: `[SUCCESS] Sheet '${args.title}' created.` }] };
        }

        if (name === "add_column_header") {
            // 1. نجيب بيانات الصف الأول عشان نعرف عدد الأعمدة الموجودة
            const getRes = await sheets.spreadsheets.values.get({
                spreadsheetId: TARGET_SPREADSHEET_ID,
                range: `${args.sheetName}!1:1`
            });
            
            const currentHeaders = getRes.data.values && getRes.data.values[0] ? getRes.data.values[0] : [];
            const nextColIndex = currentHeaders.length;
            
            // 2. دالة تحويل الرقم لحرف العمود (A, B, C, ...)
            const getColumnLetter = (index) => {
                let letter = '';
                while (index >= 0) {
                    letter = String.fromCharCode((index % 26) + 65) + letter;
                    index = Math.floor(index / 26) - 1;
                }
                return letter;
            };

            const colLetter = getColumnLetter(nextColIndex);
            const targetRange = `${args.sheetName}!${colLetter}1`;

            // 3. نحدث الخلية المحددة
            await sheets.spreadsheets.values.update({
                spreadsheetId: TARGET_SPREADSHEET_ID,
                range: targetRange,
                valueInputOption: "USER_ENTERED",
                requestBody: { values: [[args.headerName]] }
            });
            
            return { content: [{ type: "text", text: `[SUCCESS] Column '${args.headerName}' added horizontally to '${args.sheetName}' at ${colLetter}1.` }] };
        }

        if (name === "read_sheet_data") {
            const range = args.range ? `${args.sheetName}!${args.range}` : args.sheetName;
            const res = await sheets.spreadsheets.values.get({
                spreadsheetId: TARGET_SPREADSHEET_ID,
                range: range
            });
            const values = res.data.values || [];
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(values, null, 2)
                }]
            };
        }

        if (name === "read_sheet_columns") {
            const res = await sheets.spreadsheets.values.get({
                spreadsheetId: TARGET_SPREADSHEET_ID,
                range: `${args.sheetName}!1:1`
            });
            const headers = res.data.values && res.data.values[0] ? res.data.values[0] : [];
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(headers, null, 2)
                }]
            };
        }

        if (name === "write_sheet_data") {
            await sheets.spreadsheets.values.update({
                spreadsheetId: TARGET_SPREADSHEET_ID,
                range: `${args.sheetName}!${args.range}`,
                valueInputOption: "USER_ENTERED",
                requestBody: { values: args.values }
            });
            return { content: [{ type: "text", text: `[SUCCESS] Wrote data to '${args.sheetName}!${args.range}'.` }] };
        }

        if (name === "append_sheet_data") {
            await sheets.spreadsheets.values.append({
                spreadsheetId: TARGET_SPREADSHEET_ID,
                range: args.sheetName,
                valueInputOption: "USER_ENTERED",
                insertDataOption: "INSERT_ROWS",
                requestBody: { values: args.values }
            });
            return { content: [{ type: "text", text: `[SUCCESS] Appended ${args.values.length} rows to '${args.sheetName}'.` }] };
        }

        throw new Error("Tool not recognized.");
    } catch (error) {
        return { content: [{ type: "text", text: `[ERROR] ${error.message}` }], isError: true };
    }
});

// 5. Start the MCP Server
async function run() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("🛡️ DMS Supreme Schema Manager MCP is running securely with Hardcoded ID.");
}

run().catch(console.error);