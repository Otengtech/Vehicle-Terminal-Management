import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@api/auth';
import { useAuth } from '@hooks/useAuth';
import Card, { CardHeader, CardBody } from '@components/Common/Card';
import Input from '@components/Common/Input';
import Button from '@components/Common/Button';
import Spinner from '@components/Common/Spinner';
import { IoPersonOutline, IoMailOutline, IoLockClosedOutline } from 'react-icons/io5';
import toast from 'react-hot-toast';
import { isStrongPassword } from '@utils/validators';

const Profile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const profileForm = useForm({
    defaultValues: {
      fullName: user?.fullName || '',
      email: user?.email || ''
    }
  });

  const passwordForm = useForm();

  const updateProfileMutation = useMutation({
    mutationFn: (data) => authApi.updateProfile(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries(['auth']);
      toast.success('Profile updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data) => authApi.changePassword(data),
    onSuccess: () => {
      toast.success('Password changed successfully');
      setShowPasswordForm(false);
      passwordForm.reset();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
  });

  const onProfileSubmit = (data) => {
    updateProfileMutation.mutate(data);
  };

  const onPasswordSubmit = (data) => {
    const passwordValidation = isStrongPassword(data.newPassword);
    if (!passwordValidation.isValid) {
      const errors = Object.values(passwordValidation.errors).filter(Boolean);
      toast.error(errors.join(', '));
      return;
    }

    if (data.newPassword !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    changePasswordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword 
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Information</h2>
        </CardHeader>
        <CardBody>
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                icon={IoPersonOutline}
                register={profileForm.register}
                name="fullName"
                error={profileForm.formState.errors.fullName?.message}
                rules={{ required: 'Full name is required' }}
              />
              <Input
                label="Email"
                type="email"
                icon={IoMailOutline}
                register={profileForm.register}
                name="email"
                error={profileForm.formState.errors.email?.message}
                rules={{ 
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Invalid email address'
                  }
                }}
              />
            </div>

            <div className="flex justify-end">
              <Button 
                type="submit" 
                variant="primary"
                isLoading={updateProfileMutation.isPending}
              >
                Update Profile
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {/* Role Information */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Account Information</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Role</p>
              <p className="text-lg font-medium text-gray-900 dark:text-white">{user?.role}</p>
            </div>
            {user?.terminalId && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Assigned Terminal</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {typeof user.terminalId === 'object' ? user.terminalId.name : user.terminalId}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Account Status</p>
              <p className="text-lg font-medium text-success-600">{user?.status || 'Active'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Member Since</p>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Security</h2>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => setShowPasswordForm(!showPasswordForm)}
            >
              {showPasswordForm ? 'Cancel' : 'Change Password'}
            </Button>
          </div>
        </CardHeader>
        {showPasswordForm && (
          <CardBody>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
              <Input
                label="Current Password"
                type="password"
                icon={IoLockClosedOutline}
                register={passwordForm.register}
                name="currentPassword"
                required
              />

              <Input
                label="New Password"
                type="password"
                icon={IoLockClosedOutline}
                register={passwordForm.register}
                name="newPassword"
                required
              />

              <Input
                label="Confirm New Password"
                type="password"
                icon={IoLockClosedOutline}
                register={passwordForm.register}
                name="confirmPassword"
                required
              />

              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  variant="primary"
                  isLoading={changePasswordMutation.isPending}
                >
                  Change your Password
                </Button>
              </div>
            </form>
          </CardBody>
        )}
      </Card>
    </div>
  );
};

export default Profile;