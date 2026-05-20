import { Form, Head, router } from '@inertiajs/react';
import { Eye, Pencil, Plus, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import CustomerController from '@/actions/App/Http/Controllers/CustomerController';
import InputError from '@/components/input-error';
import { Pagination } from '@/components/pagination';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
import type { CustomerRecord, PaginatedCustomers } from '@/types';

type CustomersIndexProps = {
    customers: PaginatedCustomers;
};

function openDialog(callback: () => void): void {
    window.setTimeout(callback, 0);
}

export default function CustomersIndex({ customers: paginated }: CustomersIndexProps) {
    const [createOpen, setCreateOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<CustomerRecord | null>(
        null,
    );
    const [editName, setEditName] = useState('');
    const [deletingCustomer, setDeletingCustomer] = useState<CustomerRecord | null>(
        null,
    );

    return (
        <>
            <Head title="Customers" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <Card>
                    <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="size-5" />
                                Customers
                            </CardTitle>
                            <CardDescription>
                                {paginated.total.toLocaleString()} customers —
                                page {paginated.current_page} of{' '}
                                {paginated.last_page}
                            </CardDescription>
                        </div>
                        <Button
                            type="button"
                            onClick={() => setCreateOpen(true)}
                        >
                            <Plus />
                            Add customer
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginated.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={3}
                                            className="h-24 text-center text-muted-foreground"
                                        >
                                            No customers yet. Add your first
                                            customer.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginated.data.map((customer) => (
                                        <TableRow key={customer.id}>
                                            <TableCell className="font-medium">
                                                {customer.name}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(
                                                    customer.created_at,
                                                ).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            router.visit(
                                                                customers.transactions.url(
                                                                    customer.id,
                                                                ),
                                                            )
                                                        }
                                                    >
                                                        <Eye />
                                                        View transactions
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            openDialog(() => {
                                                                setEditingCustomer(
                                                                    customer,
                                                                );
                                                                setEditName(
                                                                    customer.name,
                                                                );
                                                            })
                                                        }
                                                    >
                                                        <Pencil />
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            openDialog(() =>
                                                                setDeletingCustomer(
                                                                    customer,
                                                                ),
                                                            )
                                                        }
                                                    >
                                                        <Trash2 />
                                                        Delete
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {paginated.last_page > 1 && (
                            <Pagination
                                links={paginated.links}
                                className="mt-4"
                            />
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent
                    onOpenAutoFocus={(event) => event.preventDefault()}
                >
                    <DialogHeader>
                        <DialogTitle>Add customer</DialogTitle>
                        <DialogDescription>
                            Enter the customer name. It must match the
                            counterparty name on transactions exactly.
                        </DialogDescription>
                    </DialogHeader>
                    <Form
                        {...CustomerController.store.form()}
                        onSuccess={() => setCreateOpen(false)}
                        className="space-y-4"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="create_name">Name</Label>
                                    <Input
                                        id="create_name"
                                        name="name"
                                        required
                                        autoFocus
                                        placeholder="Customer name"
                                    />
                                    <InputError message={errors.name} />
                                </div>
                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setCreateOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Saving…' : 'Save'}
                                    </Button>
                                </DialogFooter>
                            </>
                        )}
                    </Form>
                </DialogContent>
            </Dialog>

            {editingCustomer && (
                <Dialog
                    open
                    onOpenChange={(open) => {
                        if (!open) {
                            setEditingCustomer(null);
                        }
                    }}
                >
                    <DialogContent
                        onOpenAutoFocus={(event) => event.preventDefault()}
                    >
                        <DialogHeader>
                            <DialogTitle>Edit customer</DialogTitle>
                            <DialogDescription>
                                Update the customer name.
                            </DialogDescription>
                        </DialogHeader>
                        <Form
                            key={editingCustomer.id}
                            {...CustomerController.update.form(
                                editingCustomer.id,
                            )}
                            onSuccess={() => setEditingCustomer(null)}
                            className="space-y-4"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit_name">Name</Label>
                                        <Input
                                            id="edit_name"
                                            name="name"
                                            value={editName}
                                            onChange={(event) =>
                                                setEditName(event.target.value)
                                            }
                                            required
                                            autoFocus
                                        />
                                        <InputError message={errors.name} />
                                    </div>
                                    <DialogFooter>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                                setEditingCustomer(null)
                                            }
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                        >
                                            {processing
                                                ? 'Saving…'
                                                : 'Update'}
                                        </Button>
                                    </DialogFooter>
                                </>
                            )}
                        </Form>
                    </DialogContent>
                </Dialog>
            )}

            {deletingCustomer && (
                <Dialog
                    open
                    onOpenChange={(open) => {
                        if (!open) {
                            setDeletingCustomer(null);
                        }
                    }}
                >
                    <DialogContent
                        onOpenAutoFocus={(event) => event.preventDefault()}
                    >
                        <DialogHeader>
                            <DialogTitle>Delete customer</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete{' '}
                                <span className="font-medium text-foreground">
                                    {deletingCustomer.name}
                                </span>
                                ? This will not delete any transactions.
                            </DialogDescription>
                        </DialogHeader>
                        <Form
                            key={deletingCustomer.id}
                            {...CustomerController.destroy.form(
                                deletingCustomer.id,
                            )}
                            onSuccess={() => setDeletingCustomer(null)}
                        >
                            {({ processing }) => (
                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            setDeletingCustomer(null)
                                        }
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="destructive"
                                        disabled={processing}
                                    >
                                        {processing
                                            ? 'Deleting…'
                                            : 'Delete'}
                                    </Button>
                                </DialogFooter>
                            )}
                        </Form>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}

CustomersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Customers',
            href: customers.index(),
        },
    ],
};
