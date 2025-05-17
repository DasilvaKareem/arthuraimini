'use client';

import { useStoreAnonymousUser } from '@/lib/user-hooks';

export default function AuthStatus() {
  // This hook will automatically store the user in Firestore
  const { user, loading } = useStoreAnonymousUser();

  if (loading) {
    return <div className="text-sm text-gray-500">Loading auth...</div>;
  }

  if (!user) {
    return <div className="text-sm text-red-500">Not authenticated</div>;
  }

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="font-bold text-lg mb-2">Authentication Status</h3>
      <div className="space-y-1 text-sm">
        <p>
          <span className="font-semibold">User ID:</span> {user.uid}
        </p>
        <p>
          <span className="font-semibold">Is Anonymous:</span>{' '}
          {user.isAnonymous ? 'Yes' : 'No'}
        </p>
        <p className="text-xs italic">
          This anonymous user ID is stored in Firestore
        </p>
      </div>
    </div>
  );
} 