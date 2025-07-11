'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function ProfilePage() {
    const { updateUser } = useAuth();
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleUpdate = async () => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('auth-token');
            if (!token) throw new Error('You are not authenticated. Please login again.');

            const res = await fetch('/api/profile/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ name, password }),
            });

            const contentType = res.headers.get('content-type') || '';
            if (!contentType.includes('application/json')) {
                const html = await res.text();
                console.log('Unexpected HTML:', html);
                throw new Error('Server returned HTML instead of JSON');
            }

            const data = await res.json();
            if (!res.ok || !data.message) {
                throw new Error(data.error || 'Something went wrong');
            }

            setSuccess(data.message);
            setPassword('');
            updateUser({ name: data.user.name });

        } catch (err: any) {
            console.error('Update error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f9fbff] px-4">
            <Card className="w-full max-w-md shadow-lg rounded-2xl border border-gray-200">
                <CardHeader className="text-center space-y-2">
                    <div className="text-4xl">👤</div>
                    <CardTitle className="text-2xl font-semibold text-gray-800">
                        Update Profile
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Make changes to your profile information.
                    </p>
                </CardHeader>

                <CardContent className="space-y-5">
                    {success && (
                        <div className="flex items-center gap-2 text-green-600 text-sm">
                            <CheckCircle2 className="w-4 h-4" /> {success}
                        </div>
                    )}
                    {error && (
                        <div className="flex items-center gap-2 text-red-600 text-sm">
                            <AlertTriangle className="w-4 h-4" /> {error}
                        </div>
                    )}

                    <div className="space-y-1">
                        <Label htmlFor="name">🙍Name</Label>
                        <Input
                            id="name"
                            placeholder="Your full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="rounded-md h-10 text-base"
                        />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="password">New Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Leave empty to keep current password"
                            className="rounded-md h-10 text-base"
                        />
                    </div>

                    <Button
                        onClick={handleUpdate}
                        disabled={loading}
                        className="w-full h-11 text-base rounded-md bg-blue-600 hover:bg-blue-700 text-white shadow-md transition"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Updating...
                            </span>
                        ) : (
                            <span>Update Profile</span>
                        )}
                    </Button>


                    <div className="text-center pt-2 text-sm text-muted-foreground">
                        Want to go back? <a href="/dashboard" className="text-blue-600 hover:underline">Go to Dashboard</a>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
