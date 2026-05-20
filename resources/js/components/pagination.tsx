import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginationProps = {
    links: PaginationLink[];
    className?: string;
};

export function Pagination({ links, className }: PaginationProps) {
    const pageLinks = links.filter(
        (link) =>
            !link.label.includes('Previous') &&
            !link.label.includes('Next') &&
            !link.label.includes('&laquo;') &&
            !link.label.includes('&raquo;'),
    );

    const previous = links.find(
        (link) =>
            link.label.includes('Previous') || link.label.includes('&laquo;'),
    );
    const next = links.find(
        (link) => link.label.includes('Next') || link.label.includes('&raquo;'),
    );

    return (
        <div
            className={cn(
                'flex flex-wrap items-center justify-between gap-2',
                className,
            )}
        >
            <div className="flex gap-2">
                {previous?.url ? (
                    <Button variant="outline" size="sm" asChild>
                        <Link href={previous.url} preserveScroll>
                            Previous
                        </Link>
                    </Button>
                ) : (
                    <Button variant="outline" size="sm" disabled>
                        Previous
                    </Button>
                )}
                {next?.url ? (
                    <Button variant="outline" size="sm" asChild>
                        <Link href={next.url} preserveScroll>
                            Next
                        </Link>
                    </Button>
                ) : (
                    <Button variant="outline" size="sm" disabled>
                        Next
                    </Button>
                )}
            </div>

            <div className="flex flex-wrap gap-1">
                {pageLinks.map((link) =>
                    link.url ? (
                        <Button
                            key={link.label}
                            variant={link.active ? 'default' : 'outline'}
                            size="sm"
                            asChild
                        >
                            <Link
                                href={link.url}
                                preserveScroll
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        </Button>
                    ) : (
                        <Button
                            key={link.label}
                            variant={link.active ? 'default' : 'outline'}
                            size="sm"
                            disabled
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ),
                )}
            </div>
        </div>
    );
}
