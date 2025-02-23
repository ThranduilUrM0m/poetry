'use client';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch } from 'react-redux';
import { LoginFormData, loginSchema } from './validation';
import { setCredentials, clearCredentials } from '@/app/slices/authSlice';
import FloatingInput from '../../components/ui/FormField';

export default function LoginPage() {
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
  });

  const formValues = watch();

  const handleClear = (field: keyof LoginFormData) => {
    setValue(field, '');
    dispatch(clearCredentials());
  };

  const onSubmit = (data: LoginFormData) => {
    console.log(data);
    // Handle form submission
  };

  const handleInputChange = (field: 'identifier' | 'password', value: string) => {
    setValue(field, value);
    dispatch(setCredentials({ field, value }));
  };

  return (
    <main className='login'>
      <section className='login__section-1'>
        <div className='login__section-1-left'>
          <div className='login__card'>
            <div className='login__card-header'>
              <h3>Login</h3>
            </div>
            <div className='login__card-body'>
              <form onSubmit={handleSubmit(onSubmit)} className="form">
                <div className='form__row'>
                  <FloatingInput
                    {...register('identifier')}
                    label="Username or Email"
                    error={errors.identifier?.message}
                    value={formValues.identifier}
                    onChange={(e) => handleInputChange('identifier', e.target.value)}
                    onClear={() => handleClear('identifier')}
                  />
                </div>
                <div className='form__row'>
                  <FloatingInput
                    {...register('password')}
                    type="password"
                    label="Password"
                    error={errors.password?.message}
                    value={formValues.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    onClear={() => handleClear('password')}
                  />
                </div>
                <div className='form__row'>
                  <button type="submit" className='login__submit-btn'>
                    Login
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className='login__section-1-right'>
          <div className='login__card'>
            <div className='login__card-header'>
              <h2>Welcome Back!</h2>
            </div>
            <div className='login__card-body'>
              <p>Enter your personal details to continue your journey with us</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
