export type TransactionRecord = {
    id: number;
    reference_uuid: string;
    client_name: string | null;
    payment_method: string | null;
    transaction_type: string | null;
    status: string | null;
    creation_date: string | null;
    currency: string | null;
    net_amount: string | null;
    gross_amount: string | null;
    fee: string | null;
    counterparty_name: string | null;
};

export type TransactionSummary = {
    totalCount: number;
    totalNet: number;
    totalFees: number;
    totalInbound: number;
    totalOutbound: number;
};

export type ChartPoint = {
    date: string;
    total: number;
};

export type StatusBreakdown = {
    status: string;
    count: number;
};

export type TransactionFilters = {
    search: string;
    date_from: string;
    date_to: string;
};

export type PaginatedTransactions = {
    data: TransactionRecord[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
};
