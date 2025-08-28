
import React, { useState, useRef } from 'react';
import { useAuthStore } from '../../../lib/authStore';
import Input from '../../ui/Input';
import Button from '../../ui/Button';

const ProfileSettings: React.FC = () => {
    const { user, updateProfile, becomeSeller } = useAuthStore();
    const [name, setName] = useState(user?.name || '');
    const [profilePic, setProfilePic] = useState<string | null>(user?.profilePicture || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePic(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateProfile(name, profilePic ?? undefined);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>
            <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
                <div className="flex items-center space-x-4">
                    <div className="relative h-24 w-24 rounded-full bg-[hsl(var(--secondary))] flex items-center justify-center font-bold text-3xl overflow-hidden">
                        {profilePic ? (
                            <img src={profilePic} alt="Profile" className="h-full w-full object-cover" />
                        ) : (
                            name.charAt(0)
                        )}
                    </div>
                    <div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />
                        <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()}>
                            Upload Picture
                        </Button>
                        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2">PNG, JPG, GIF up to 10MB.</p>
                    </div>
                </div>
                <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                    <Input id="email" value={user?.email || ''} disabled className="bg-[hsl(var(--muted))] cursor-not-allowed" />
                </div>
                <Button type="submit">Save Changes</Button>
            </form>

            {user?.role === 'user' && (
                <div className="mt-12 pt-6 border-t border-[hsl(var(--border))] max-w-lg">
                    <h3 className="text-lg font-semibold">Become a Seller</h3>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2 mb-4">
                        Want to sell your amazing products on NaxStore? Upgrade your account to a seller profile.
                    </p>
                    <Button variant="secondary" onClick={becomeSeller}>
                        Start Selling
                    </Button>
                </div>
            )}
        </div>
    );
};

export default ProfileSettings;
