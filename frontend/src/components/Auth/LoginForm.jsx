import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@hooks/useAuth';
import Input from '@components/Common/Input';
import Button from '@components/Common/Button';
import { IoMailOutline, IoLockClosedOutline } from 'react-icons/io5';

const LoginForm = () => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    await login(data.email, data.password);
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Input
        label="Email"
        type="email"
        icon={IoMailOutline}
        register={register}
        name="email"
        error={errors.email?.message}
        required
        rules={{
          required: 'Email is required',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Invalid email address'
          }
        }}
      />

      <Input
        label="Password"
        type="password"
        icon={IoLockClosedOutline}
        register={register}
        name="password"
        error={errors.password?.message}
        required
        rules={{
          required: 'Password is required',
          minLength: {
            value: 6,
            message: 'Password must be at least 6 characters'
          }
        }}
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        isLoading={isLoading}
      >
        Sign In
      </Button>
    </form>
  );
};

export default LoginForm;