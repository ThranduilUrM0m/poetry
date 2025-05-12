'use client';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store';
import { subscribeSubscriber, selectIsLoading, clearSubscriberState } from '@/slices/subscriberSlice';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { useLoading } from '@/context/LoadingContext';
import AnimatedWrapper from '@/components/ui/AnimatedWrapper.client';
import FormField from '@/components/ui/FormField';
import SubmitModal from '@/components/ui/SubmitModal';
import { AtSign } from 'lucide-react';

interface FormData {
    email: string;
}

const validationSchema = Yup.object().shape({
    email: Yup.string()
        .required('Email is required')
        .matches(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/, 'Invalid email format'),
});

export default function Newsletter() {
    const { isLoaded } = useLoading();
    const dispatch = useDispatch<AppDispatch>();
    const isLoading = useSelector(selectIsLoading);
    const [isSubmitOpen, setIsSubmitOpen] = useState(false);
    const [submitHeader, setSubmitHeader] = useState('');
    const [submitMessage, setSubmitMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [formReset, setFormReset] = useState(false);

    const {
        control,
        handleSubmit,
        setValue,
        formState: { errors },
        clearErrors,
        reset,
    } = useForm<FormData>({
        resolver: yupResolver(validationSchema),
        defaultValues: { email: '' },
    });

    const handleClearEmail = () => {
        setValue('email', '');
        clearErrors('email');
    };

    const onSubmit = async (data: FormData) => {
        try {
            await dispatch(subscribeSubscriber(data.email)).unwrap();
            reset(); // Reset React Hook Form state
            setFormReset(true); // Trigger FormField reset
            setTimeout(() => setFormReset(false), 100); // Reset trigger
            dispatch(clearSubscriberState());
            setSubmitHeader('You are officially In.');
            setSubmitMessage('You will never miss on our news!\nWe promise not to spam you.');
            setIsSuccess(true);
            setIsSubmitOpen(true);
        } catch (error) {
            setSubmitHeader('We are sorry!');
            setSubmitMessage(`Something went wrong: ${error as string}`);
            setIsSuccess(false);
            setIsSubmitOpen(true);
        }
    };

    return (
        <AnimatedWrapper
            as="div"
            className="newsletter"
            from={{ transform: 'translateX(100%)', opacity: 0 }} // Initial state
            to={{
                transform: isLoaded ? 'translateX(0%)' : 'translateX(100%)',
                opacity: isLoaded ? 1 : 0,
            }}
            config={{ mass: 1, tension: 210, friction: 20 }} // Adjusted spring configuration
            delay={200} // Delay in milliseconds
        >
            {/* The focus state for the Floating label is not worknig perfect, maybe after i submit the email it stays focused but it never changes back */}
            <form className="_form" onSubmit={handleSubmit(onSubmit)}>
                <div className="_row">
                    <FormField
                        label="Email"
                        name="email"
                        type="email"
                        control={control}
                        error={errors.email?.message}
                        rules={{ required: 'Email is required' }}
                        onClear={handleClearEmail}
                        icon={<AtSign />}
                        immediateSync={true}
                        forceReset={formReset}
                    />
                </div>
                <div className="_row">
                    <button
                        type="submit"
                        className="_button"
                        id="_buttonNewsletter"
                        disabled={isLoading}
                    >
                        {/* The sequential effect is still a mystery and the background effect is not reversing with ease */}
                        <AnimatedWrapper
                            as="span"
                            className="buttonBackground"
                            hover={{
                                from: { clipPath: 'inset(0 100% 0 0)' },
                                to: { clipPath: 'inset(0 0 0 0)' },
                            }}
                            config={{ mass: 1, tension: 170, friction: 26 }}
                            parentHoverSelector="#_buttonNewsletter"
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
                                parentHoverSelector="#_buttonNewsletter" // <-- Updated parent hover selector
                                onRest={() => {
                                    // Trigger the next animation after this one completes
                                    document
                                        .querySelector('.borderRight')
                                        ?.dispatchEvent(new Event('startAnimation'));
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
                                parentHoverSelector="#_buttonNewsletter" // <-- Updated parent hover selector
                                onRest={() => {
                                    // Trigger the next animation after this one completes
                                    document
                                        .querySelector('.borderBottom')
                                        ?.dispatchEvent(new Event('startAnimation'));
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
                                parentHoverSelector="#_buttonNewsletter" // <-- Updated parent hover selector
                                onRest={() => {
                                    // Trigger the next animation after this one completes
                                    document
                                        .querySelector('.borderLeft')
                                        ?.dispatchEvent(new Event('startAnimation'));
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
                                parentHoverSelector="#_buttonNewsletter" // <-- Updated parent hover selector
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
                            parentHoverSelector="#_buttonNewsletter"
                        >
                            {isLoading ? 'Subscribing...' : 'Subscribe'}
                            <b className="__dot">.</b>
                        </AnimatedWrapper>
                    </button>
                </div>
            </form>
            <SubmitModal
                isSubmitOpen={isSubmitOpen}
                onSubmitClose={() => {
                    setIsSubmitOpen(false);
                    dispatch(clearSubscriberState());
                }}
                header={submitHeader}
                message={submitMessage}
                isSuccess={isSuccess}
            />
        </AnimatedWrapper>
    );
}
