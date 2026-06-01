<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Routing\Controller;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

/**
 * 管理后台基础控制器
 */
abstract class AdminController extends Controller
{
    use AuthorizesRequests;

    public function __construct()
    {
        $this->middleware('auth:sanctum');

        $this->middleware(function ($request, $next) {
            $user = auth()->user();
            if (! $user || ((! method_exists($user, 'isSuperUser') || ! $user->isSuperUser()) && (! method_exists($user, 'hasPermission') || ! $user->hasPermission('ai.agent.manage')))) {
                abort(403, 'Unauthorized.');
            }
            return $next($request);
        });
    }
}
