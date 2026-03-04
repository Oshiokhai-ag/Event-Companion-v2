// src/screens/profile/BlockedUsersScreen.tsx
import React, { useState, useEffect } from 'react';
import { UserX, Shield } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/Button';

export const BlockedUsersScreen = () => {
  const { token } = useAuthStore();
  const [blockedUsers, setBlockedUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  const fetchBlockedUsers = async () => {
    try {
      const res = await fetch('/api/blocked-users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setBlockedUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (userId: string) => {
    if (!window.confirm('Unblock this user?')) return;
    await fetch(`/api/users/${userId}/unblock`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchBlockedUsers();
  };

  return (
    <div className="flex-1 bg-obsidian p-8 overflow-y-auto">
      <div className="space-y-6 pb-20">
        <div className="flex flex-row items-center gap-4 p-6 bg-sunstone/10 rounded-[2rem] border border-sunstone/20 mb-10">
          <Shield size={32} className="text-sunstone" />
          <div className="flex-1">
            <p className="font-bold text-alabaster">Privacy First</p>
            <p className="text-xs text-grey-mist mt-1">Blocked users cannot see your profile or events.</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-grey-mist">Loading...</div>
        ) : blockedUsers.length === 0 ? (
          <div className="text-center py-20 text-grey-mist opacity-50">
            <UserX size={48} className="mx-auto mb-4" />
            <p className="font-medium">No blocked users</p>
          </div>
        ) : (
          blockedUsers.map((user) => (
            <div key={user.id} className="flex items-center gap-5 p-4 bg-lava/30 rounded-[2rem] border border-white/5">
              <img src={user.profile_photo_url} className="w-14 h-14 rounded-2xl object-cover border border-white/10" referrerPolicy="no-referrer" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-alabaster truncate">{user.name}</p>
                <p className="text-xs text-grey-mist">{user.location_city}</p>
              </div>
              <Button variant="ghost" size="sm" className="text-sunstone font-bold" onClick={() => handleUnblock(user.id)}>Unblock</Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
