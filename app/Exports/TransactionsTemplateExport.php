<?php

namespace App\Exports;

use App\Support\TransactionSpreadsheet;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;

class TransactionsTemplateExport implements FromArray, WithHeadings
{
    public function headings(): array
    {
        return TransactionSpreadsheet::HEADINGS;
    }

    public function array(): array
    {
        return [];
    }
}
