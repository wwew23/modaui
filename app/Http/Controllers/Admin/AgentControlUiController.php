<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Routing\Controller;
use Illuminate\Http\Request;

class AgentControlUiController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');

        $this->middleware(function ($request, $next) {
            $user = auth()->user();

            if (! $user || ((! method_exists($user, 'isSuperUser') || ! $user->isSuperUser())
                && (! method_exists($user, 'hasPermission') || ! $user->hasPermission('ai.agent.manage')))) {
                abort(403, 'Unauthorized.');
            }

            return $next($request);
        });
    }

    public function index(Request $request)
    {
        return view('admin.agent-control.dashboard');
    }
}
