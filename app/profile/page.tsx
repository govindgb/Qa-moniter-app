'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle2, AlertTriangle, UploadCloud } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Loader } from "@/components/ui/loader";

export default function ProfilePage() {
    const { updateUser, user } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProfileImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const getInitials = (fullName: string) => {
        if (!fullName) return '';
        const names = fullName.trim().split(' ');
        const initials = names.map(n => n[0]).join('');
        return initials.slice(0, 2); // e.g., AC
      };
      

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
                body: JSON.stringify({ name, email }), // add image upload logic separately if needed
            });

            const contentType = res.headers.get('content-type') || '';
            if (!contentType.includes('application/json')) {
                throw new Error('Server returned HTML instead of JSON');
            }

            const data = await res.json();
            if (!res.ok || !data.message) {
                throw new Error(data.error || 'Something went wrong');
            }

            setSuccess(data.message);
            updateUser({
                name: data.user.name,
                email: data.user.email,
                _id: '',
                role: 'admin',
                isActive: true
            });
        } catch (err: any) {
            console.error('Update error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
                <Loader size="lg" text="Loading..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 px-4">
            <Card className="w-full max-w-2xl rounded-2xl border border-gray-200 shadow-md">
                <CardHeader className="text-center space-y-3">
                    <CardTitle className="text-2xl font-semibold text-gray-800">Update Profile</CardTitle>
                    <p className="text-sm text-muted-foreground">Upload your image and update personal details.</p>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Success/Error messages */}
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

                    {/* Image Upload Preview */}
                    <div className="flex flex-col items-center space-y-2">
                        <div className="w-24 h-24 rounded-full border overflow-hidden">
                            {preview ? (
                                <img
                                    src={preview}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xl font-semibold text-gray-700 uppercase">
                                    {getInitials(name)}
                                </div>
                            )}

                        </div>
                       
                    </div>

                    {/* Name */}
                    <div className="space-y-1">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            placeholder="Enter your full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="rounded-md h-10 text-base"
                        />
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="rounded-md h-10 text-base"
                        />
                    </div>

                    {/* Save Button */}
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
                            <span>Save Changes</span>
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
