<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

abstract class AdminResourceController extends AdminController
{
    protected string $modelClass;
    protected array $validationRules = [];
    protected array $relations = [];

    public function index(Request $request): JsonResponse
    {
        $query = ($this->modelClass)::query();

        if ($request->filled('search')) {
            $keyword = $request->input('search');
            $query->where(function ($query) use ($keyword) {
                foreach (['name', 'namespace'] as $field) {
                    $query->orWhere($field, 'like', "%{$keyword}%");
                }
            });
        }

        if ($request->has('enabled')) {
            $query->where('enabled', $request->boolean('enabled'));
        }

        $perPage = $request->input('per_page', 15);
        $results = $query->with($this->relations)->paginate($perPage);

        return response()->json($results);
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorizeAdmin();

        $data = $this->validateRequest($request);
        $resource = ($this->modelClass)::create($data);

        return response()->json([
            'success' => true,
            'data' => $resource,
            'message' => 'Created successfully.',
        ], 201);
    }

    public function show($id): JsonResponse
    {
        $resource = ($this->modelClass)::with($this->relations)->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $resource,
        ]);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $this->authorizeAdmin();

        $resource = ($this->modelClass)::findOrFail($id);
        $data = $this->validateRequest($request, true, $resource);
        $resource->update($data);

        return response()->json([
            'success' => true,
            'data' => $resource,
            'message' => 'Updated successfully.',
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $this->authorizeAdmin();

        $resource = ($this->modelClass)::findOrFail($id);
        $resource->delete();

        return response()->json([
            'success' => true,
            'message' => 'Deleted successfully.',
        ]);
    }

    public function toggle($id): JsonResponse
    {
        $this->authorizeAdmin();

        $resource = ($this->modelClass)::findOrFail($id);
        $resource->update(['enabled' => ! $resource->enabled]);

        return response()->json([
            'success' => true,
            'data' => $resource,
            'message' => $resource->enabled ? 'Enabled successfully.' : 'Disabled successfully.',
        ]);
    }

    protected function validateRequest(Request $request, bool $isUpdate = false, $resource = null): array
    {
        $rules = $this->validationRules;

        if ($isUpdate && $resource) {
            foreach ($rules as $key => $rule) {
                if (is_string($rule) && str_contains($rule, 'unique:')) {
                    $rules[$key] = preg_replace_callback('/unique:([^,]+),([^,]+)(,([^,]+))?/', function ($matches) use ($resource) {
                        $table = $matches[1];
                        $column = $matches[2];
                        return "unique:{$table},{$column},{$resource->getKey()}";
                    }, $rule);
                }
            }
        }

        return Validator::make($request->all(), $rules)->validate();
    }
}
