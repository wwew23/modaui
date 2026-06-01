import { NextResponse } from 'next/server'

/**
 * GET /api/merchants/[merchantId]/tasks
 * 获取商家的 AI 任务队列历史
 */
export async function GET(
  request: Request,
  { params }: { params: { merchantId: string } }
) {
  try {
    const { merchantId } = params
    
    // 从 OS API 获取历史记录
    const API_BASE_URL = process.env.OS_API_BASE_URL || 'http://localhost:4000'
    
    const response = await fetch(`${API_BASE_URL}/api/os/traces`, {
      headers: {
        'Authorization': `Bearer ${process.env.INTERNAL_SYSTEM_TOKEN}`
      }
    })

    const result = await response.json()

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: response.status })
    }

    // 过滤属于该商家的 Traces (假设 trace meta 中存了 merchantId)
    // 生产环境中，后端 API 应该支持按 merchantId 过滤
    const merchantTasks = result.traces.filter((t: any) => 
      !t.meta?.merchantId || t.meta.merchantId === merchantId
    )

    return NextResponse.json({
      merchantId,
      tasks: merchantTasks
    })

  } catch (error: any) {
    console.error(`[GET /api/merchants/${params.merchantId}/tasks] Error:`, error)
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    )
  }
}
