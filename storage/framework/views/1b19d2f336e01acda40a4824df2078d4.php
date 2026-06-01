<?php $__env->startSection('content'); ?>
<div class="ai-approval-container" style="padding: 20px;">
    <div style="margin-bottom: 25px;">
        <h2 style="font-size: 24px; font-weight: 700; color: #111827;">AI 审批队列</h2>
        <p style="color: #6b7280;">查看并确认 AI 建议的店铺变更操作。所有敏感修改必须经由您手动确认后才会同步至 Shopify。</p>
    </div>

    <?php if(session('error')): ?>
        <div style="margin-bottom: 20px; padding: 16px; border: 1px solid #f3c6c6; background: #fef2f2; border-radius: 10px; color: #991b1b;">
            <?php echo e(session('error')); ?>

        </div>
    <?php endif; ?>

    <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <table class="table" style="width: 100%; border-collapse: collapse;">
            <thead style="background: #f9fafb; border-bottom: 1px solid #e5e7eb;">
                <tr>
                    <th style="padding: 12px 20px; text-align: left; font-size: 12px; font-weight: 600; color: #374151; text-transform: uppercase;">申请时间</th>
                    <th style="padding: 12px 20px; text-align: left; font-size: 12px; font-weight: 600; color: #374151; text-transform: uppercase;">操作类型</th>
                    <th style="padding: 12px 20px; text-align: left; font-size: 12px; font-weight: 600; color: #374151; text-transform: uppercase;">改动原因 (AI Insight)</th>
                    <th style="padding: 12px 20px; text-align: left; font-size: 12px; font-weight: 600; color: #374151; text-transform: uppercase;">状态</th>
                    <th style="padding: 12px 20px; text-align: right; font-size: 12px; font-weight: 600; color: #374151; text-transform: uppercase;">管理</th>
                </tr>
            </thead>
            <tbody style="divide-y divide-gray-200">
                <?php $__empty_1 = true; $__currentLoopData = $approvals; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $approval): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                    <tr style="border-bottom: 1px solid #f3f4f6;">
                        <td style="padding: 16px 20px; font-size: 14px; color: #4b5563;"><?php echo e($approval->created_at->format('Y-m-d H:i')); ?></td>
                        <td style="padding: 16px 20px;">
                            <span style="display: inline-flex; align-items: center; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 500; background: #eff6ff; color: #1e40af;">
                                <?php echo e($approval->action_type); ?>

                            </span>
                        </td>
                        <td style="padding: 16px 20px; font-size: 14px; color: #1f2937; max-width: 400px;">
                            <?php echo e($approval->reason); ?>

                        </td>
                        <td style="padding: 16px 20px;">
                            <?php
                                $statusMap = [
                                    'pending' => ['bg' => '#fef3c7', 'text' => '#92400e', 'label' => '待处理'],
                                    'approved' => ['bg' => '#d1fae5', 'text' => '#065f46', 'label' => '已批准'],
                                    'rejected' => ['bg' => '#fee2e2', 'text' => '#991b1b', 'label' => '已拒绝'],
                                ];
                                $status = $statusMap[$approval->status] ?? ['bg' => '#f3f4f6', 'text' => '#374151', 'label' => $approval->status];
                            ?>
                            <span style="display: inline-flex; align-items: center; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 500; background: <?php echo e($status['bg']); ?>; color: <?php echo e($status['text']); ?>;">
                                <?php echo e($status['label']); ?>

                            </span>
                        </td>
                        <td style="padding: 16px 20px; text-align: right;">
                            <?php if($approval->status === 'pending'): ?>
                                <button onclick="handleApproval(<?php echo e($approval->id); ?>, 'reject')" class="btn btn-sm btn-outline-danger">拒绝</button>
                                <button onclick="handleApproval(<?php echo e($approval->id); ?>, 'approve')" class="btn btn-sm" style="background: #008060; color: #fff; margin-left: 8px;">批准</button>
                            <?php else: ?>
                                <span style="color: #9ca3af; font-size: 12px;">已处理</span>
                            <?php endif; ?>
                        </td>
                    </tr>
                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                    <tr>
                        <td colspan="5" style="padding: 40px; text-align: center; color: #6b7280;">暂无待处理的审批申请。</td>
                    </tr>
                <?php endif; ?>
            </tbody>
        </table>
    </div>

    <div style="margin-top: 20px;">
        <?php echo e($approvals->links()); ?>

    </div>
</div>

<script>
    async function handleApproval(id, action) {
        if (!confirm(`确定要${action === 'approve' ? '批准' : '拒绝'}这项操作吗？`)) return;

        try {
            const response = await fetch(`/admin/ai-approvals/${id}/${action}`, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': "<?php echo e(csrf_token()); ?>",
                    'Accept': 'application/json'
                }
            });

            const data = await response.json();
            if (data.success) {
                location.reload();
            } else {
                alert('操作失败：' + (data.error || '未知错误'));
            }
        } catch (error) {
            alert('连接服务器失败');
        }
    }
</script>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('core/base::layouts.master', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH /www/wwwroot/modaui.com/platform/plugins/ai-commerce/resources/views/approval-queue.blade.php ENDPATH**/ ?>