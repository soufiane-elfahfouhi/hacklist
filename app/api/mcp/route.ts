import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken, MCP_TOOLS, handleMcpToolCall } from '@/lib/mcp/server';

export async function POST(req: NextRequest) {
  // Extract Bearer token from Authorization header or URL search param
  const authHeader = req.headers.get('authorization') || '';
  let token = authHeader.replace(/^Bearer\s+/i, '').trim();

  if (!token) {
    token = req.nextUrl.searchParams.get('token') || '';
  }

  const userId = await authenticateToken(token);
  if (!userId) {
    return NextResponse.json(
      {
        jsonrpc: '2.0',
        error: {
          code: -32001,
          message: 'Unauthorized: Invalid or revoked Hacklist API token. Please supply a valid Bearer token.',
        },
        id: null,
      },
      { status: 401 }
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { jsonrpc: '2.0', error: { code: -32700, message: 'Parse error: invalid JSON' }, id: null },
      { status: 400 }
    );
  }

  const { jsonrpc, id, method, params } = body || {};

  // 1. Initialize
  if (method === 'initialize') {
    return NextResponse.json({
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {},
        },
        serverInfo: {
          name: 'hacklist-mcp-server',
          version: '1.0.0',
        },
      },
    });
  }

  // 2. Initialized notification
  if (method === 'notifications/initialized') {
    return new NextResponse(null, { status: 204 });
  }

  // 3. Ping
  if (method === 'ping') {
    return NextResponse.json({ jsonrpc: '2.0', id, result: {} });
  }

  // 4. Tools list
  if (method === 'tools/list') {
    return NextResponse.json({
      jsonrpc: '2.0',
      id,
      result: {
        tools: MCP_TOOLS,
      },
    });
  }

  // 5. Tools call
  if (method === 'tools/call') {
    const toolName = params?.name;
    const toolArgs = params?.arguments || {};

    try {
      const output = await handleMcpToolCall(userId, toolName, toolArgs);
      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        result: {
          content: [
            {
              type: 'text',
              text: typeof output === 'string' ? output : JSON.stringify(output, null, 2),
            },
          ],
        },
      });
    } catch (err: any) {
      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        error: {
          code: -32603,
          message: err.message || 'Internal tool execution error',
        },
      });
    }
  }

  return NextResponse.json({
    jsonrpc: '2.0',
    id,
    error: {
      code: -32601,
      message: `Method not found: ${method}`,
    },
  });
}

export async function GET() {
  return NextResponse.json({
    status: 'online',
    service: 'Hacklist Streamable HTTP MCP Server',
    toolsCount: MCP_TOOLS.length,
    documentation: 'Pass personal token in Authorization: Bearer <token> or use /api/mcp/k/<token>',
  });
}
