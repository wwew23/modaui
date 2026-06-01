import { NextResponse } from 'next/server'

/**
 * GET /api/merchants/[merchantId]/stream
 * 代理商家的实时事件流
 */
export async function GET(
  request: Request,
  { params }: { params: { merchantId: string } }
) {
  const { merchantId } = params
  const API_BASE_URL = process.env.OS_API_BASE_URL || 'http://localhost:4000'

  try {
    const response = await fetch(`${API_BASE_URL}/api/os/stream`, {
      headers: {
        'Accept': 'text/event-stream',
        'Authorization': `Bearer ${process.env.INTERNAL_SYSTEM_TOKEN}`
      }
    })

    if (!response.ok) {
      return new Response('Failed to connect to OS Stream', { status: response.status })
    }

    // 转发 SSE 流
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader()
        if (!reader) {
          controller.close()
          return
        }

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            
            // 在这里可以进行数据过滤，只发送属于该 merchantId 的事件
            // const text = new TextDecoder().decode(value)
            // if (text.includes(merchantId)) { ... }
            
            controller.enqueue(value)
          }
        } catch (e) {
          controller.error(e)
        } finally {
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    })

  } catch (error: any) {
    console.error(`[STREAM /api/merchants/${merchantId}/stream] Error:`, error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
