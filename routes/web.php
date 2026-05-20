<?php

use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('dashboard/template', [DashboardController::class, 'downloadTemplate'])->name('dashboard.template');
    Route::post('dashboard/import', [DashboardController::class, 'import'])->name('dashboard.import');
});

require __DIR__.'/settings.php';
