import { Form, Head, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import {
    ArrowDownLeft,
    ArrowUpRight,
    Download,
    FileSpreadsheet,
    Receipt,
    Search,
    Wallet,
    X,
} from 'lucide-react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import DashboardController from '@/actions/App/Http/Controllers/DashboardController';
import { Pagination } from '@/components/pagination';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { dashboard } from '@/routes';
import type {
    ChartPoint,
    PaginatedTransactions,
    StatusBreakdown,
    TransactionFilters,
    TransactionSummary,
} from '@/types';

type DashboardProps = {
    transactions: PaginatedTransactions;
    filters: TransactionFilters;
    summary: TransactionSummary;
    chartData: ChartPoint[];
    statusBreakdown: StatusBreakdown[];
};

function buildFilterQuery(filters: TransactionFilters): Record<string, string> {
    const query: Record<string, string> = {};

    if (filters.search.trim() !== '') {
        query.search = filters.search.trim();
    }

    if (filters.date_from !== '') {
        query.date_from = filters.date_from;
    }

    if (filters.date_to !== '') {
        query.date_to = filters.date_to;
    }

    return query;
}

function visitWithFilters(filters: TransactionFilters): void {
    router.get(DashboardController.index.url({ query: buildFilterQuery(filters) }), {}, {
        preserveState: true,
        preserveScroll: true,
        replace: true,
    });
}

const currencyFormatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
});

function formatAmount(value: string | number | null): string {
    if (value === null || value === '') {
        return '—';
    }

    return currencyFormatter.format(Number(value));
}

function formatDate(value: string | null): string {
    if (!value) {
        return '—';
    }

    return new Date(value).toLocaleString();
}

function statusVariant(
    status: string | null,
): 'default' | 'secondary' | 'destructive' | 'outline' {
    const normalized = status?.toLowerCase() ?? '';

    if (normalized.includes('declined') || normalized.includes('failed')) {
        return 'destructive';
    }

    if (normalized.includes('settled') || normalized.includes('captured')) {
        return 'default';
    }

    return 'secondary';
}

export default function Dashboard({
    transactions,
    filters: initialFilters,
    summary,
    chartData,
    statusBreakdown,
}: DashboardProps) {
    const [search, setSearch] = useState(initialFilters.search);
    const [dateFrom, setDateFrom] = useState(initialFilters.date_from);
    const [dateTo, setDateTo] = useState(initialFilters.date_to);
    const isFirstSearchRender = useRef(true);

    useEffect(() => {
        setSearch(initialFilters.search);
        setDateFrom(initialFilters.date_from);
        setDateTo(initialFilters.date_to);
    }, [initialFilters]);

    useEffect(() => {
        if (isFirstSearchRender.current) {
            isFirstSearchRender.current = false;

            return;
        }

        const timeout = window.setTimeout(() => {
            visitWithFilters({
                search,
                date_from: dateFrom,
                date_to: dateTo,
            });
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [search]);

    const hasActiveFilters =
        initialFilters.search !== '' ||
        initialFilters.date_from !== '' ||
        initialFilters.date_to !== '';

    const chartLabels = chartData.map((point) =>
        new Date(point.date).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
        }),
    );

    const chartSeries = chartData.map((point, index) => ({
        label: chartLabels[index],
        total: point.total,
    }));

    return (
        <>
            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileSpreadsheet className="size-5" />
                            Import transactions
                        </CardTitle>
                        <CardDescription>
                            Use the template below — headers must be in row 1.
                            Do not rename columns.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button variant="outline" asChild>
                            <a
                                href={DashboardController.downloadTemplate.url()}
                            >
                                <Download />
                                Download template
                            </a>
                        </Button>
                        <Form
                            action={DashboardController.import.url()}
                            method="post"
                            encType="multipart/form-data"
                            className="flex flex-col gap-4 sm:flex-row sm:items-end"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid flex-1 gap-2">
                                        <Label htmlFor="file">
                                            Excel file (.xlsx)
                                        </Label>
                                        <Input
                                            id="file"
                                            name="file"
                                            type="file"
                                            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                            required
                                        />
                                        <InputError message={errors.file} />
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                    >
                                        {processing
                                            ? 'Importing…'
                                            : 'Upload & import'}
                                    </Button>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Total transactions</CardDescription>
                            <CardTitle className="flex items-center gap-2 text-2xl">
                                <Receipt className="size-5 text-muted-foreground" />
                                {summary.totalCount.toLocaleString()}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Net balance</CardDescription>
                            <CardTitle className="flex items-center gap-2 text-2xl">
                                <Wallet className="size-5 text-muted-foreground" />
                                {formatAmount(summary.totalNet)}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Inbound</CardDescription>
                            <CardTitle className="flex items-center gap-2 text-2xl text-emerald-600 dark:text-emerald-400">
                                <ArrowDownLeft className="size-5" />
                                {formatAmount(summary.totalInbound)}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Outbound</CardDescription>
                            <CardTitle className="flex items-center gap-2 text-2xl text-rose-600 dark:text-rose-400">
                                <ArrowUpRight className="size-5" />
                                {formatAmount(summary.totalOutbound)}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Net amount by day</CardTitle>
                            <CardDescription>
                                Daily net totals from imported transactions
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="h-72">
                            {chartSeries.length === 0 ? (
                                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                                    Import a spreadsheet to see the chart.
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartSeries}>
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            className="stroke-border"
                                        />
                                        <XAxis
                                            dataKey="label"
                                            tick={{ fontSize: 12 }}
                                        />
                                        <YAxis tick={{ fontSize: 12 }} />
                                        <Tooltip
                                            formatter={(value) =>
                                                formatAmount(
                                                    Number(value ?? 0),
                                                )
                                            }
                                        />
                                        <Bar
                                            dataKey="total"
                                            fill="hsl(var(--primary))"
                                            radius={[4, 4, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>By status</CardTitle>
                            <CardDescription>
                                Transaction count per status
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {statusBreakdown.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    No data yet.
                                </p>
                            ) : (
                                statusBreakdown.map((item) => (
                                    <div
                                        key={item.status}
                                        className="flex items-center justify-between gap-2"
                                    >
                                        <Badge
                                            variant={statusVariant(item.status)}
                                        >
                                            {item.status}
                                        </Badge>
                                        <span className="text-sm font-medium">
                                            {item.count}
                                        </span>
                                    </div>
                                ))
                            )}
                            <div className="border-t pt-3 text-sm text-muted-foreground">
                                Total fees:{' '}
                                <span className="font-medium text-foreground">
                                    {formatAmount(summary.totalFees)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Transactions</CardTitle>
                        <CardDescription>
                            {transactions.total.toLocaleString()} records —
                            page {transactions.current_page} of{' '}
                            {transactions.last_page}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col gap-4">
                            <div className="relative">
                                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search reference, client, status, counterparty…"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    className="pl-9"
                                />
                            </div>
                            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
                                <div className="grid gap-2">
                                    <Label htmlFor="date_from">From</Label>
                                    <Input
                                        id="date_from"
                                        type="date"
                                        value={dateFrom}
                                        onChange={(event) =>
                                            setDateFrom(event.target.value)
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="date_to">To</Label>
                                    <Input
                                        id="date_to"
                                        type="date"
                                        value={dateTo}
                                        min={dateFrom || undefined}
                                        onChange={(event) =>
                                            setDateTo(event.target.value)
                                        }
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() =>
                                        visitWithFilters({
                                            search,
                                            date_from: dateFrom,
                                            date_to: dateTo,
                                        })
                                    }
                                >
                                    Apply dates
                                </Button>
                                {hasActiveFilters && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setSearch('');
                                            setDateFrom('');
                                            setDateTo('');
                                            visitWithFilters({
                                                search: '',
                                                date_from: '',
                                                date_to: '',
                                            });
                                        }}
                                    >
                                        <X />
                                        Clear filters
                                    </Button>
                                )}
                            </div>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Reference</TableHead>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">
                                        Net
                                    </TableHead>
                                    <TableHead>Counterparty</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="h-24 text-center text-muted-foreground"
                                        >
                                            {hasActiveFilters
                                                ? 'No transactions match your filters.'
                                                : 'No transactions yet. Upload an Excel file to get started.'}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    transactions.data.map((transaction) => (
                                        <TableRow key={transaction.id}>
                                            <TableCell className="max-w-[140px] truncate font-mono text-xs">
                                                {transaction.reference_uuid}
                                            </TableCell>
                                            <TableCell className="max-w-[160px] truncate">
                                                {transaction.client_name ??
                                                    '—'}
                                            </TableCell>
                                            <TableCell className="max-w-[140px] truncate">
                                                {transaction.transaction_type ??
                                                    '—'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={statusVariant(
                                                        transaction.status,
                                                    )}
                                                >
                                                    {transaction.status ??
                                                        '—'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(
                                                    transaction.creation_date,
                                                )}
                                            </TableCell>
                                            <TableCell
                                                className={`text-right font-medium ${
                                                    Number(
                                                        transaction.net_amount,
                                                    ) < 0
                                                        ? 'text-rose-600 dark:text-rose-400'
                                                        : 'text-emerald-600 dark:text-emerald-400'
                                                }`}
                                            >
                                                {formatAmount(
                                                    transaction.net_amount,
                                                )}
                                            </TableCell>
                                            <TableCell className="max-w-[160px] truncate">
                                                {transaction.counterparty_name ??
                                                    '—'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {transactions.last_page > 1 && (
                            <Pagination links={transactions.links} />
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
