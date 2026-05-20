<?php

use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Models\Customer;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::bind('customer', function (string $value) {
        return Customer::query()
            ->where('user_id', auth()->id())
            ->whereKey($value)
            ->firstOrFail();
    });

    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('dashboard/template', [DashboardController::class, 'downloadTemplate'])->name('dashboard.template');
    Route::post('dashboard/import', [DashboardController::class, 'import'])->name('dashboard.import');

    Route::get('customers', [CustomerController::class, 'index'])->name('customers.index');
    Route::post('customers', [CustomerController::class, 'store'])->name('customers.store');
    Route::patch('customers/{customer}', [CustomerController::class, 'update'])->name('customers.update');
    Route::delete('customers/{customer}', [CustomerController::class, 'destroy'])->name('customers.destroy');
    Route::get('customers/{customer}/transactions', [CustomerController::class, 'transactions'])->name('customers.transactions');
});

require __DIR__.'/settings.php';
