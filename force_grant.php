<?php
use Illuminate\Support\Facades\DB;
use App\Modules\Core\Models\Role;
use App\Modules\Core\Models\Permission;

echo "Inserting permissions to admin role...\n";

$adminRoleId = Role::where('name', 'admin')->value('id');
if (!$adminRoleId) {
    echo "Admin role not found\n";
    exit;
}

$permissionIds = Permission::pluck('id')->toArray();
$inserts = [];
foreach ($permissionIds as $pid) {
    $inserts[] = [
        'permission_id' => $pid,
        'role_id' => $adminRoleId
    ];
}

try {
    DB::table('role_has_permissions')->insertOrIgnore($inserts);
    echo "Done inserting role_has_permissions\n";
} catch (\Exception $e) {
    echo "Error inserting role_has_permissions: " . $e->getMessage() . "\n";
}

$adminUserId = DB::table('users')->where('email', 'admin@example.com')->value('id');
if ($adminUserId) {
    try {
        DB::table('model_has_roles')->insertOrIgnore([
            'role_id' => $adminRoleId,
            'model_type' => 'App\\Modules\\Core\\Models\\User',
            'model_id' => $adminUserId
        ]);
        echo "Done inserting model_has_roles\n";
    } catch (\Exception $e) {
        echo "Error inserting model_has_roles: " . $e->getMessage() . "\n";
    }
}
