<?php
namespace App\Modules\Core\Models;

echo "Starting permission sync...\n";
try {
    $user = User::where('email', 'admin@example.com')->first();
    if (!$user) {
        echo "Admin user not found!\n";
        exit;
    }
    
    $permissions = Permission::all();
    echo "Found " . $permissions->count() . " permissions.\n";
    
    // Assign directly to user instead of role to avoid duplicate role permission issues
    // syncPermissions array of IDs
    $user->syncPermissions($permissions->pluck('id')->toArray());
    
    echo "Successfully synced all permissions to admin@example.com!\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
