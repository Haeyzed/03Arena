<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCustomerRequest;
use App\Http\Requests\UpdateCustomerRequest;
use App\Models\Customer;
use App\Models\Transaction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    public function index(Request $request): Response
    {
        $customers = Customer::query()
            ->where('user_id', $request->user()->id)
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('customers/index', [
            'customers' => $customers,
        ]);
    }

    public function store(StoreCustomerRequest $request): RedirectResponse
    {
        Customer::query()->create([
            'user_id' => $request->user()->id,
            'name' => $request->validated('name'),
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Customer created.'),
        ]);

        return to_route('customers.index');
    }

    public function update(UpdateCustomerRequest $request, Customer $customer): RedirectResponse
    {
        $customer->update($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Customer updated.'),
        ]);

        return to_route('customers.index');
    }

    public function destroy(Request $request, Customer $customer): RedirectResponse
    {
        if ($customer->user_id !== $request->user()->id) {
            abort(403);
        }

        $customer->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Customer deleted.'),
        ]);

        return to_route('customers.index');
    }

    public function transactions(Request $request, Customer $customer): Response
    {
        if ($customer->user_id !== $request->user()->id) {
            abort(403);
        }

        $transactions = Transaction::query()
            ->where('user_id', $request->user()->id)
            ->matchingCustomerName($customer->name)
            ->orderByDesc('creation_date')
            ->orderByDesc('id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('customers/transactions', [
            'customer' => $customer->only(['id', 'name']),
            'transactions' => $transactions,
        ]);
    }
}
