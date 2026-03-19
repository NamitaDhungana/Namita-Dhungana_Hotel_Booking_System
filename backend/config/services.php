<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
        'scheme' => 'https',
    ],

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'khalti' => [
        'secret_key'   => env('KHALTI_SECRET_KEY'),
        'initiate_url' => env('KHALTI_INITIATE_URL', 'https://a.khalti.com/api/v2/epayment/initiate/'),
        'lookup_url'   => env('KHALTI_LOOKUP_URL', 'https://a.khalti.com/api/v2/epayment/lookup/'),
        'return_url'   => env('KHALTI_RETURN_URL', env('APP_URL') . '/api/payments/khalti/verify'),
    ],

];
