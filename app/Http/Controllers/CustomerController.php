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
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'with_transactions' => ['nullable', 'boolean'],
            'transactions_on' => ['nullable', 'date'],
        ]);

        $userId = $request->user()->id;
        $search = $filters['search'] ?? null;
        $withTransactions = $request->boolean('with_transactions');
        $transactionsOn = ($filters['transactions_on'] ?? '') !== ''
            ? (string) $filters['transactions_on']
            : now()->toDateString();

        $customers = Customer::query()
            ->where('user_id', $userId)
            ->when($search, fn ($query) => $query->where('name', 'like', '%'.$search.'%'))
            ->when($withTransactions, function ($query) use ($userId, $transactionsOn): void {
                $query->whereExists(function ($subQuery) use ($userId, $transactionsOn): void {
                    $subQuery->selectRaw('1')
                        ->from('transactions')
                        ->whereColumn('transactions.counterparty_name', 'customers.name')
                        ->where('transactions.user_id', $userId)
                        ->whereDate('transactions.creation_date', $transactionsOn);
                });
            })
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('customers/index', [
            'customers' => $customers,
            'filters' => [
                'search' => $search ?? '',
                'with_transactions' => $withTransactions,
                'transactions_on' => $transactionsOn,
            ],
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

        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
        ]);

        $today = now()->toDateString();

        $search = $filters['search'] ?? null;
        $dateFrom = ($filters['date_from'] ?? '') !== ''
            ? (string) $filters['date_from']
            : $today;
        $dateTo = ($filters['date_to'] ?? '') !== ''
            ? (string) $filters['date_to']
            : $today;

        $transactions = Transaction::query()
            ->where('user_id', $request->user()->id)
            ->matchingCustomerName($customer->name)
            ->filtered($search, $dateFrom, $dateTo)
            ->orderByDesc('creation_date')
            ->orderByDesc('id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('customers/transactions', [
            'customer' => $customer->only(['id', 'name']),
            'filters' => [
                'search' => $search ?? '',
                'date_from' => $dateFrom ?? '',
                'date_to' => $dateTo ?? '',
            ],
            'transactions' => $transactions,
        ]);
    }
}
