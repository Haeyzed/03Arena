import { Head, Link, router, setLayoutProps } from '@inertiajs/react';
import { ArrowLeft, Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Pagination } from '@/components/pagination';
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
import customers from '@/routes/customers';
import type { PaginatedTransactions, TransactionFilters } from '@/types';

type CustomerTransactionsProps = {
    customer: {
        id: number;
        name: string;
    };
    filters: TransactionFilters;
    transactions: PaginatedTransactions;
};

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

function todayDateString(): string {
    const now = new Date();

    return [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, '0'),
        String(now.getDate()).padStart(2, '0'),
    ].join('-');
}

function filtersDifferFromDefault(filters: TransactionFilters): boolean {
    const today = todayDateString();

    return (
        filters.search !== '' ||
        filters.date_from !== today ||
        filters.date_to !== today
    );
}

function buildFilterQuery(
    customerId: number,
    filters: TransactionFilters,
): Record<string, string> {
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

function visitWithFilters(
    customerId: number,
    filters: TransactionFilters,
): void {
    router.get(
        customers.transactions.url(customerId, {
            query: buildFilterQuery(customerId, filters),
        }),
        {},
        {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        },
    );
}

function TransactionFiltersPanel({
    customerId,
    filters,
}: {
    customerId: number;
    filters: TransactionFilters;
}) {
    const [search, setSearch] = useState(filters.search);
    const [dateFrom, setDateFrom] = useState(filters.date_from);
    const [dateTo, setDateTo] = useState(filters.date_to);
    const isFirstSearchRender = useRef(true);

    useEffect(() => {
        if (isFirstSearchRender.current) {
            isFirstSearchRender.current = false;

            return;
        }

        const timeout = window.setTimeout(() => {
            visitWithFilters(customerId, {
                search,
                date_from: dateFrom,
                date_to: dateTo,
            });
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [search, customerId]);

    const hasActiveFilters = filtersDifferFromDefault(filters);

    return (
        <div className="flex flex-col gap-4">
            <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search reference, status, client…"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
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
                        onChange={(event) => setDateFrom(event.target.value)}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="date_to">To</Label>
                    <Input
                        id="date_to"
                        type="date"
                        value={dateTo}
                        min={dateFrom || undefined}
                        onChange={(event) => setDateTo(event.target.value)}
                    />
                </div>
                <Button
                    type="button"
                    variant="secondary"
                    onClick={() =>
                        visitWithFilters(customerId, {
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
                            const today = todayDateString();

                            setSearch('');
                            setDateFrom(today);
                            setDateTo(today);
                            visitWithFilters(customerId, {
                                search: '',
                                date_from: today,
                                date_to: today,
                            });
                        }}
                    >
                        <X />
                        Clear filters
                    </Button>
                )}
            </div>
        </div>
    );
}

export default function CustomerTransactions({
    customer,
    filters: initialFilters,
    transactions,
}: CustomerTransactionsProps) {
    useEffect(() => {
        setLayoutProps({
            breadcrumbs: [
                {
                    title: 'Customers',
                    href: customers.index(),
                },
                {
                    title: customer.name,
                    href: customers.transactions.url(customer.id),
                },
            ],
        });
    }, [customer.id, customer.name]);

    const hasActiveFilters = filtersDifferFromDefault(initialFilters);

    return (
        <>
            <Head title={`${customer.name} — Transactions`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div>
                    <Button variant="outline" size="sm" asChild>
                        <Link href={customers.index.url()}>
                            <ArrowLeft />
                            Back to customers
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{customer.name}</CardTitle>
                        <CardDescription>
                            Transactions where counterparty name matches this
                            customer exactly —{' '}
                            {transactions.total.toLocaleString()} records, page{' '}
                            {transactions.current_page} of{' '}
                            {transactions.last_page}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <TransactionFiltersPanel
                            key={`${initialFilters.search}-${initialFilters.date_from}-${initialFilters.date_to}`}
                            customerId={customer.id}
                            filters={initialFilters}
                        />

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
                                                : `No transactions found with counterparty name "${customer.name}".`}
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
                            <Pagination
                                links={transactions.links}
                                className="mt-4"
                            />
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
