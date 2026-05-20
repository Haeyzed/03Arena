<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaction extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'reference_uuid',
        'client_name',
        'payment_method',
        'transaction_type',
        'status',
        'creation_date',
        'capture_date',
        'value_date',
        'currency',
        'net_amount',
        'gross_amount',
        'fee',
        'calc_fee',
        'counterparty_reference',
        'counterparty_name',
        'bank_name',
        'cross_border',
        'comments',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'creation_date' => 'datetime',
            'capture_date' => 'datetime',
            'value_date' => 'datetime',
            'net_amount' => 'decimal:2',
            'gross_amount' => 'decimal:2',
            'fee' => 'decimal:2',
            'calc_fee' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeFiltered(Builder $query, ?string $search, ?string $dateFrom, ?string $dateTo): Builder
    {
        if ($search !== null && $search !== '') {
            $query->where(function (Builder $inner) use ($search): void {
                $like = '%'.$search.'%';

                $inner->where('reference_uuid', 'like', $like)
                    ->orWhere('client_name', 'like', $like)
                    ->orWhere('payment_method', 'like', $like)
                    ->orWhere('transaction_type', 'like', $like)
                    ->orWhere('status', 'like', $like)
                    ->orWhere('currency', 'like', $like)
                    ->orWhere('counterparty_reference', 'like', $like)
                    ->orWhere('counterparty_name', 'like', $like)
                    ->orWhere('bank_name', 'like', $like)
                    ->orWhere('comments', 'like', $like);
            });
        }

        if ($dateFrom !== null && $dateFrom !== '') {
            $query->whereDate('creation_date', '>=', $dateFrom);
        }

        if ($dateTo !== null && $dateTo !== '') {
            $query->whereDate('creation_date', '<=', $dateTo);
        }

        return $query;
    }
}
