'use client';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, selectToken, selectAuthIsLoading, setToken } from '@/slices/authSlice';
import { AppDispatch } from '@/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AnimatedWrapper from '@/components/ui/AnimatedWrapper';
import { useLoading } from '@/context/LoadingContext';
import SectionObserver from '@/components/SectionObserver';
import { AtSign, RectangleEllipsis } from 'lucide-react';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import SubmitModal from '@/components/ui/SubmitModal';
import FormField from '@/components/ui/FormField';

interface FormData {
    login: string; // Can be either email or username.
    password: string;
}

const validationSchema = Yup.object().shape({
    login: Yup.string()
        .required('Please provide a valid email or username.')
        .matches(
            /^(?:[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}|[a-zA-Z0-9_]{3,20})$/i,
            'No numbers or symbols.'
        ),
    password: Yup.string()
        .required('Password missing.')
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()])[a-zA-Z\d!@#$%^&*()]{8,}$/,
            'Password must contain at least 1 upper and 1 lowercase letter, 1 number and 1 symbol.'
        ),
}) as Yup.ObjectSchema<FormData>;

export default function LoginPage() {
    // Access the Redux dispatch function.
    const dispatch = useDispatch<AppDispatch>();
    // Get NextJS router instance.
    const router = useRouter();
    // Select auth state from Redux.
    const token = useSelector(selectToken);
    const isLoading = useSelector(selectAuthIsLoading);
    // Ready Loading
    const { isLoaded } = useLoading();
    const [isReady, setIsReady] = useState(false);
    const [isSubmitOpen, setIsSubmitOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form setup
    const {
        control,
        handleSubmit,
        setValue,
        formState: { errors },
        clearErrors,
    } = useForm<FormData>({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            login: '', // Can be either email or username.
            password: '',
        },
    });

    // Ready state after article has loaded
    useEffect(() => {
        if (isLoaded && !isLoading) {
            const timer = setTimeout(() => setIsReady(true), 100);
            return () => clearTimeout(timer);
        }
    }, [isLoaded, isLoading]);

    const handleClearField = (fieldName: keyof FormData) => {
        setValue(fieldName, '');
        clearErrors(fieldName);
    };

    // Form submission handler.
    const onSubmit: SubmitHandler<FormData> = async (data) => {
        try {
            setError(null);
            const resultAction = await dispatch(loginUser(data));
            
            if (loginUser.fulfilled.match(resultAction)) {
                router.push('/dashboard');
            } else {
                // Set specific error messages based on the error
                const errorMessage = resultAction.payload as string;
                let userFriendlyMessage = 'An unknown error occurred';

                if (errorMessage.includes('not found')) {
                    userFriendlyMessage = 'User not found. Please check your email/username.';
                } else if (errorMessage.includes('password does not match')) {
                    userFriendlyMessage = 'Incorrect password. Please try again.';
                } else if (errorMessage.includes('hash is missing')) {
                    userFriendlyMessage = 'Account setup incomplete. Please contact support.';
                }

                setError(userFriendlyMessage);
                setIsSubmitOpen(true);
            }
        } catch (err) {
            console.error(err);
            setError('Unable to connect to the server. Please try again later.');
            setIsSubmitOpen(true);
        }
    };

    // Check for existing token on mount
    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        if (savedToken && !token) {
            dispatch(setToken(savedToken));
        }
    }, []);

    // If a session token already exists, redirect to the dashboard.
    useEffect(() => {
        if (token) {
            router.push('/dashboard');
        }
    }, [token, router]);

    return (
        <main className="login">
            <SectionObserver theme="light">
                <section className="login__section-1">
                    <AnimatedWrapper
                        as="div"
                        className="_card"
                        from={{ transform: 'translateY(-100%)', opacity: 0 }}
                        to={isReady ? { transform: 'translateY(0)', opacity: 1 } : undefined}
                        config={{ mass: 1, tension: 170, friction: 26 }}
                        delay={1000}
                    >
                        <div className="_cardHeader">
                            <h3>
                                Login<b className="pink_dot">.</b>
                            </h3>
                        </div>
                        <div className="_cardBody">
                            <form onSubmit={handleSubmit(onSubmit)} className="_form">
                                <div className="_row">
                                    <FormField
                                        label="Email or Username"
                                        name="login"
                                        type="text"
                                        control={control}
                                        error={errors.login?.message}
                                        rules={{
                                            required: 'Email is required',
                                        }}
                                        onClear={() => handleClearField('login')}
                                        icon={<AtSign />}
                                    />
                                </div>
                                <div className="_row">
                                    <FormField
                                        label="Password"
                                        name="password"
                                        type="password"
                                        control={control}
                                        error={errors.password?.message}
                                        rules={{
                                            required: 'Password is required',
                                        }}
                                        onClear={() => handleClearField('login')}
                                        icon={<RectangleEllipsis />}
                                    />
                                </div>
                                <div className="_row">
                                    <button
                                        type="submit"
                                        className="_button __flex1"
                                        id="_buttonComment"
                                        disabled={isLoading}
                                    >
                                        {/* The sequential effect is still a mystery and the background effect is not reversing with ease */}
                                        <AnimatedWrapper
                                            as="span"
                                            className="buttonBackground"
                                            hover={{
                                                from: {
                                                    clipPath: 'inset(0 100% 0 0)',
                                                },
                                                to: {
                                                    clipPath: 'inset(0 0 0 0)',
                                                },
                                            }}
                                            config={{
                                                mass: 1,
                                                tension: 170,
                                                friction: 26,
                                            }}
                                            parentHoverSelector="#_buttonComment"
                                        ></AnimatedWrapper>
                                        <div className="buttonBorders">
                                            {/* Top border: animate width */}
                                            <AnimatedWrapper
                                                as="div"
                                                className="borderTop"
                                                hover={{
                                                    from: { width: '0%' },
                                                    to: { width: '100%' },
                                                    delay: 0,
                                                }}
                                                parentHoverSelector="#_buttonComment" // <-- Updated parent hover selector
                                                onRest={() => {
                                                    // Trigger the next animation after this one completes
                                                    document
                                                        .querySelector('.borderRight')
                                                        ?.dispatchEvent(
                                                            new Event('startAnimation')
                                                        );
                                                }}
                                            />
                                            {/* Right border: animate height */}
                                            <AnimatedWrapper
                                                as="div"
                                                className="borderRight"
                                                hover={{
                                                    from: { height: '0%' },
                                                    to: { height: '100%' },
                                                    delay: 0, // Start immediately after the previous animation
                                                }}
                                                parentHoverSelector="#_buttonComment" // <-- Updated parent hover selector
                                                onRest={() => {
                                                    // Trigger the next animation after this one completes
                                                    document
                                                        .querySelector('.borderBottom')
                                                        ?.dispatchEvent(
                                                            new Event('startAnimation')
                                                        );
                                                }}
                                            />
                                            {/* Bottom border: animate width */}
                                            <AnimatedWrapper
                                                as="div"
                                                className="borderBottom"
                                                hover={{
                                                    from: { width: '0%' },
                                                    to: { width: '100%' },
                                                    delay: 0, // Start immediately after the previous animation
                                                }}
                                                parentHoverSelector="#_buttonComment" // <-- Updated parent hover selector
                                                onRest={() => {
                                                    // Trigger the next animation after this one completes
                                                    document
                                                        .querySelector('.borderLeft')
                                                        ?.dispatchEvent(
                                                            new Event('startAnimation')
                                                        );
                                                }}
                                            />
                                            {/* Left border: animate height */}
                                            <AnimatedWrapper
                                                as="div"
                                                className="borderLeft"
                                                hover={{
                                                    from: { height: '0%' },
                                                    to: { height: '100%' },
                                                    delay: 0, // Start immediately after the previous animation
                                                }}
                                                parentHoverSelector="#_buttonComment" // <-- Updated parent hover selector
                                            />
                                        </div>
                                        <AnimatedWrapper
                                            as="span"
                                            className="buttonContent"
                                            hover={{
                                                from: {
                                                    color: 'rgb(var(--text)/1)',
                                                },
                                                to: {
                                                    color: 'rgb(var(--white)/1)',
                                                },
                                            }}
                                            config={{
                                                mass: 1,
                                                tension: 170,
                                                friction: 26,
                                            }}
                                            parentHoverSelector="#_buttonComment"
                                        >
                                            {isLoading ? 'Loading...' : 'Login'}
                                            <b className="__dot">.</b>
                                        </AnimatedWrapper>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </AnimatedWrapper>
                </section>
            </SectionObserver>

            <SubmitModal
                isSubmitOpen={isSubmitOpen}
                onSubmitClose={() => setIsSubmitOpen(false)}
                header="Authentication Failed"
                message={error || ''}
                isSuccess={false}
            />
        </main>
    );
}
