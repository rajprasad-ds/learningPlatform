import { createClient } from '@/lib/supabase/server'

export default async function DebugRolePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return <div className="p-8">Not logged in</div>
    }

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    return (
        <div className="p-8 max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">RBAC Debugger</h1>

            <div className="bg-gray-100 p-4 rounded-lg space-y-2">
                <h2 className="font-bold">Auth User</h2>
                <pre className="text-xs overflow-auto">{JSON.stringify(user, null, 2)}</pre>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg space-y-2">
                <h2 className="font-bold">Profile (DB)</h2>
                {error ? (
                    <div className="text-red-500">Error fetching profile: {error.message}</div>
                ) : (
                    <pre className="text-xs overflow-auto">{JSON.stringify(profile, null, 2)}</pre>
                )}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
                <h2 className="font-bold text-blue-900">Diagnosis</h2>
                <p>
                    <strong>Expected Role:</strong> teacher<br />
                    <strong>Actual Role:</strong> {profile?.role || 'undefined'}
                </p>
            </div>
        </div>
    )
}
