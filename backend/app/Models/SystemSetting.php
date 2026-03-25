<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SystemSetting extends Model
{
    use HasFactory;

    protected $primaryKey = 'setting_id';

    protected $fillable = ['setting_key', 'setting_value', 'setting_type'];

    public static function get(string $key, $default = null)
    {
        $s = static::where('setting_key', $key)->first();
        return $s ? $s->setting_value : $default;
    }

    public static function set(string $key, $value, string $type = 'string'): void
    {
        static::updateOrCreate(
            ['setting_key' => $key],
            ['setting_value' => $value ?? '', 'setting_type' => $type]
        );
    }
}
