import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import customers from '@/routes/customers';
import type { PaginatedTransactions } from '@/types';

type CustomerTransactionsProps = {
    customer: {
        id: number;
        name: string;
    };
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

export default function CustomerTransactions({
    customer,
    transactions,
}: CustomerTransactionsProps) {
    return (
        <>
            <Head title={`${customer.name} — Transactions`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div>
                    <Button variant="outline" size="sm" asChild>
                        <Link href={customers.index()}>
                            <ArrowLeft />
                            Back to customers
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{customer.name}</CardTitle>
                        <CardDescription>
                            Transactions where this name appears as client or
                            counterparty — {transactions.total.toLocaleString()}{' '}
                            records, page {transactions.current_page} of{' '}
                            {transactions.last_page}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
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
                                            No transactions found for this
                                            customer name.
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

CustomerTransactions.layout = {
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
};
