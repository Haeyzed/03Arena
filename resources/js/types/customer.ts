export type CustomerRecord = {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
};

export type PaginatedCustomers = {
    data: CustomerRecord[];
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
