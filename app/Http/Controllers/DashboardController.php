<?php

namespace App\Http\Controllers;

use App\Exports\TransactionsTemplateExport;
use App\Http\Requests\ImportTransactionsRequest;
use App\Imports\TransactionsImport;
use App\Models\Transaction;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $userId = $request->user()->id;

        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
        ]);

        $search = $filters['search'] ?? null;
        $dateFrom = isset($filters['date_from']) ? (string) $filters['date_from'] : null;
        $dateTo = isset($filters['date_to']) ? (string) $filters['date_to'] : null;

        $baseQuery = fn (): Builder => Transaction::query()
            ->where('user_id', $userId)
            ->filtered($search, $dateFrom, $dateTo);

        $transactions = $baseQuery()
            ->orderByDesc('creation_date')
            ->orderByDesc('id')
            ->paginate(15)
            ->withQueryString();

        $summary = $baseQuery()
            ->selectRaw('COUNT(*) as total_count')
            ->selectRaw('COALESCE(SUM(net_amount), 0) as total_net')
            ->selectRaw('COALESCE(SUM(fee), 0) as total_fees')
            ->selectRaw("COALESCE(SUM(CASE WHEN net_amount > 0 THEN net_amount ELSE 0 END), 0) as total_inbound")
            ->selectRaw("COALESCE(SUM(CASE WHEN net_amount < 0 THEN ABS(net_amount) ELSE 0 END), 0) as total_outbound")
            ->first();

        $chartData = $baseQuery()
            ->whereNotNull('creation_date')
            ->selectRaw('DATE(creation_date) as date')
            ->selectRaw('COALESCE(SUM(net_amount), 0) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->limit(30)
            ->get()
            ->map(fn ($row) => [
                'date' => $row->date,
                'total' => (float) $row->total,
            ]);

        $statusBreakdown = $baseQuery()
            ->select('status')
            ->selectRaw('COUNT(*) as count')
            ->groupBy('status')
            ->orderByDesc('count')
            ->get()
            ->map(fn ($row) => [
                'status' => $row->status ?? 'Unknown',
                'count' => (int) $row->count,
            ]);

        return Inertia::render('dashboard', [
            'transactions' => $transactions,
            'filters' => [
                'search' => $search ?? '',
                'date_from' => $dateFrom ?? '',
                'date_to' => $dateTo ?? '',
            ],
            'summary' => [
                'totalCount' => (int) ($summary->total_count ?? 0),
                'totalNet' => (float) ($summary->total_net ?? 0),
                'totalFees' => (float) ($summary->total_fees ?? 0),
                'totalInbound' => (float) ($summary->total_inbound ?? 0),
                'totalOutbound' => (float) ($summary->total_outbound ?? 0),
            ],
            'chartData' => $chartData,
            'statusBreakdown' => $statusBreakdown,
        ]);
    }

    public function import(ImportTransactionsRequest $request): RedirectResponse
    {
        Excel::import(
            new TransactionsImport($request->user()->id),
            $request->file('file'),
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Transactions imported successfully.'),
        ]);

        return to_route('dashboard');
    }

    public function downloadTemplate(): BinaryFileResponse
    {
        return Excel::download(
            new TransactionsTemplateExport,
            'transactions-import-template.xlsx',
        );
    }
}
