<?php

namespace App\Imports;

use App\Models\Customer;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use PhpOffice\PhpSpreadsheet\Shared\Date as ExcelDate;

class TransactionsImport implements ToCollection, WithHeadingRow
{
    public int $customersCreated = 0;

    public function __construct(
        private readonly int $userId,
    ) {}

    public function headingRow(): int
    {
        return 1;
    }

    public function collection(Collection $rows): void
    {
        $counterpartyNames = collect();

        foreach ($rows as $row) {
            $data = $row instanceof Collection ? $row->toArray() : (array) $row;

            $referenceUuid = $this->stringValue($data, ['reference_uuid']);

            if ($referenceUuid === null) {
                continue;
            }

            $counterpartyName = $this->stringValue($data, [
                'name',
                'counterparty_name',
            ]);

            if ($counterpartyName !== null) {
                $counterpartyNames->push($counterpartyName);
            }

            Transaction::query()->updateOrCreate(
                [
                    'user_id' => $this->userId,
                    'reference_uuid' => $referenceUuid,
                ],
                [
                    'user_id' => $this->userId,
                    'client_name' => $this->stringValue($data, ['client_name']),
                    'payment_method' => $this->stringValue($data, ['payment_method']),
                    'transaction_type' => $this->stringValue($data, ['transaction_type']),
                    'status' => $this->stringValue($data, ['status']),
                    'creation_date' => $this->dateValue($data, ['creation_date']),
                    'capture_date' => $this->dateValue($data, ['capture_date']),
                    'value_date' => $this->dateValue($data, ['value_date']),
                    'currency' => $this->stringValue($data, ['currency']),
                    'net_amount' => $this->amountValue($data, ['net_amount']),
                    'gross_amount' => $this->amountValue($data, ['gross_amount']),
                    'fee' => $this->amountValue($data, ['fee']),
                    'calc_fee' => $this->amountValue($data, ['calc_fee']),
                    'counterparty_reference' => $this->stringValue($data, ['reference']),
                    'counterparty_name' => $counterpartyName,
                    'bank_name' => $this->stringValue($data, ['bank_name']),
                    'cross_border' => $this->stringValue($data, ['cross_border']),
                    'comments' => $this->stringValue($data, ['comments']),
                ],
            );
        }

        $this->syncCustomersFromCounterpartyNames($counterpartyNames->unique()->values());
    }

    /**
     * @param  Collection<int, string>  $counterpartyNames
     */
    private function syncCustomersFromCounterpartyNames(Collection $counterpartyNames): void
    {
        foreach ($counterpartyNames as $name) {
            $customer = Customer::query()->firstOrCreate(
                [
                    'user_id' => $this->userId,
                    'name' => $name,
                ],
            );

            if ($customer->wasRecentlyCreated) {
                $this->customersCreated++;
            }
        }
    }

    /**
     * @param  array<string, mixed>  $data
     * @param  list<string>  $keys
     */
    private function stringValue(array $data, array $keys): ?string
    {
        foreach ($keys as $key) {
            $value = $data[$key] ?? null;

            if ($value !== null && $value !== '') {
                return trim((string) $value);
            }
        }

        return null;
    }

    /**
     * @param  array<string, mixed>  $data
     * @param  list<string>  $keys
     */
    private function amountValue(array $data, array $keys): ?float
    {
        foreach ($keys as $key) {
            $value = $data[$key] ?? null;

            if ($value === null || $value === '') {
                continue;
            }

            if (is_numeric($value)) {
                return (float) $value;
            }

            $normalized = str_replace([',', ' '], '', (string) $value);

            if (is_numeric($normalized)) {
                return (float) $normalized;
            }
        }

        return null;
    }

    /**
     * @param  array<string, mixed>  $data
     * @param  list<string>  $keys
     */
    private function dateValue(array $data, array $keys): ?Carbon
    {
        foreach ($keys as $key) {
            $value = $data[$key] ?? null;

            if ($value === null || $value === '') {
                continue;
            }

            if ($value instanceof Carbon) {
                return $value;
            }

            if ($value instanceof \DateTimeInterface) {
                return Carbon::instance($value);
            }

            if (is_numeric($value)) {
                try {
                    return Carbon::instance(
                        ExcelDate::excelToDateTimeObject((float) $value),
                    );
                } catch (\Throwable) {
                    continue;
                }
            }

            $stringValue = trim((string) $value);
            $cleaned = preg_replace('/\s*UTC[+-]\d+$/', '', $stringValue) ?? $stringValue;

            foreach (['d/m/Y, H:i', 'd/m/Y H:i', 'Y-m-d H:i:s', 'd/m/Y'] as $format) {
                try {
                    return Carbon::createFromFormat($format, trim($cleaned));
                } catch (\Throwable) {
                    continue;
                }
            }

            try {
                return Carbon::parse($cleaned);
            } catch (\Throwable) {
                continue;
            }
        }

        return null;
    }
}
