<?php
namespace App\Modules\Core\Models;

echo "--- Admin User State ---\n";
$user = User::where('email', 'admin@example.com')->first();

if (!$user) {
    echo "Admin user not found!\n";
    exit;
}

echo "User ID: " . $user->id . "\n";
echo "Roles: " . json_encode($user->roles->pluck('name')) . "\n";
echo "Direct Permissions: " . json_encode($user->permissions->pluck('name')) . "\n";
echo "All Permissions: " . json_encode($user->getAllPermissions()->pluck('name')) . "\n";

echo "\n--- Admin Role State ---\n";
$role = Role::where('name', 'admin')->first();
if ($role) {
    echo "Role ID: " . $role->id . "\n";
    echo "Role Permissions: " . json_encode($role->permissions->pluck('name')) . "\n";
} else {
    echo "Admin role not found!\n";
}

echo "\n--- System Permissions ---\n";
$perms = Permission::all();
echo "Total permissions available: " . $perms->count() . "\n";
