<?php

namespace App\Support;

class TransactionSpreadsheet
{
    /**
     * Column headers for row 1 of the import template (must match the Excel file exactly).
     *
     * @var list<string>
     */
    public const HEADINGS = [
        'Reference UUID',
        'Client name',
        'Payment method',
        'Transaction type',
        'Status',
        'Creation date',
        'Capture date',
        'Value date',
        'Currency',
        'Net amount',
        'Gross amount',
        'Fee',
        'Calc fee',
        'Reference',
        'Name',
        'Bank Name',
        'Cross Border',
        'Comments',
    ];
}
