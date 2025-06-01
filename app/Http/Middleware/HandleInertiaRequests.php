<?php

namespace App\Http\Middleware;

use Inertia\Middleware;
use Illuminate\Http\Request;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? array_merge(
                    $request->user()->toArray(),
                    [
                        'roles' => $request->user()->getRoleNames(),
                        'notifications' => $request->user()->notifications()
                            ->orderBy('created_at', 'desc')
                            ->take(50)
                            ->get()
                            ->map(function($n) {
                                return [
                                    'id' => $n->id,
                                    'title' => $n->data['title'] ?? '',
                                    'message' => $n->data['message'] ?? '',
                                    'read_at' => $n->read_at,
                                    'at' => $n->created_at->toIso8601String(),
                                ];
                            }),
                    ]
                ) : null,
            ],
        ];
    }
}
