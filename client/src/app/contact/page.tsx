'use client';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store';
import { config } from '@react-spring/web';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { useLoading } from '@/context/LoadingContext';
import AnimatedWrapper from '@/components/ui/AnimatedWrapper.client';
import FormField from '@/components/ui/FormField';
import SubmitModal from '@/components/ui/SubmitModal';
import { AtSign, User, Phone, MessageSquare } from 'lucide-react';
import { FaFacebookF, FaInstagram, FaXTwitter, FaWhatsapp } from 'react-icons/fa6';
import SectionObserver from '@/components/SectionObserver';
import {
    sendContactEmail,
    selectIsLoading,
    selectError,
    selectSuccessMessage,
    clearContactState,
} from '@/slices/contactSlice';
import { useMedia } from 'react-use';

const contactMeItems = [
    {
        label: 'DM me on Instagram',
        href: 'https://www.instagram.com/boutaleblcoder',
        icon: FaInstagram,
    },
    {
        label: 'Connect with me on Facebook',
        href: 'https://fb.me/boutaleblcoder',
        icon: FaFacebookF,
    },
    { label: 'Follow me on X', href: 'https://www.behance.net/boutaleblcoder', icon: FaXTwitter }, // Using X (Twitter) icon for Behance
];

interface FormData {
    email: string;
    phone: string;
    firstname: string;
    lastname: string;
    message: string;
}

const validationSchema = Yup.object().shape({
    email: Yup.string()
        .required('Email is required')
        .matches(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/, 'Invalid email format'),
    firstname: Yup.string()
        .default('')
        .required('Please provide a valid first name.')
        .test(
            'min-length',
            'Must be at least 2 characters.',
            (value) => !!value && value.length >= 2
        )
        .matches(/^[a-zA-Z\s]*$/i, 'No numbers or symbols.'),
    lastname: Yup.string()
        .default('')
        .required('Please provide a valid last name.')
        .test(
            'min-length',
            'Must be at least 2 characters.',
            (value) => !!value && value.length >= 2
        )
        .matches(/^[a-zA-Z\s]*$/i, 'No numbers or symbols.'),
    phone: Yup.string()
        .default('')
        .required('Phone number missing.')
        .matches(
            /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/,
            'No letters or symbols.'
        ),
    message: Yup.string().default('').required('Please provide a message.'),
});

export default function ContactPage() {
    const isSm = useMedia('(min-width: 640px)');

    // Redux state selectors (restore these)
    const dispatch = useDispatch<AppDispatch>();
    const isLoading = useSelector(selectIsLoading);
    const error = useSelector(selectError);
    const successMessage = useSelector(selectSuccessMessage);
    const { isLoaded } = useLoading();

    // Add ready state for animations
    const [isReady, setIsReady] = useState(false);
    const [isSubmitOpen, setIsSubmitOpen] = useState(false);
    const [submitHeader, setSubmitHeader] = useState('');
    const [submitMessage, setSubmitMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [formReset, setFormReset] = useState(false);

    // Smooth configuration for animations
    const smoothConfig = { mass: 1, tension: 170, friction: 26 };

    // Ready state after loading
    useEffect(() => {
        if (isLoaded) {
            const timer = setTimeout(() => setIsReady(true), 100);
            return () => clearTimeout(timer);
        }
    }, [isLoaded]);

    const {
        control,
        handleSubmit,
        setValue,
        setError,
        formState: { errors },
        clearErrors,
        reset,
    } = useForm<FormData>({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            email: '',
            phone: '',
            firstname: '',
            lastname: '',
            message: '',
        },
    });

    const handleClearField = (fieldName: keyof FormData) => {
        setValue(fieldName, '');
        clearErrors(fieldName);
    };

    const onSubmit = async (data: FormData) => {
        try {
            await dispatch(sendContactEmail(data)).unwrap();
            // Reset all form fields and form state
            reset({
                email: '',
                phone: '',
                firstname: '',
                lastname: '',
                message: ''
            });
            setFormReset(true); // Trigger FormField reset
            setTimeout(() => setFormReset(false), 100); // Reset trigger
            dispatch(clearContactState());
            setSubmitHeader('Thank you for reaching out!');
            setSubmitMessage(successMessage || 'Your message has been sent successfully!');
            setIsSuccess(true);
            setIsSubmitOpen(true);
        } catch (error) {
            if (error instanceof Error) {
                setError('email', { type: 'manual', message: error.message });
            }
            setSubmitHeader("We're sorry!");
            setSubmitMessage(error as string);
            setIsSuccess(false);
            setIsSubmitOpen(true);
        }
    };

    // Error handling effect
    useEffect(() => {
        if (error) {
            setSubmitHeader("We're sorry!");
            setSubmitMessage(error);
            setIsSuccess(false);
            setIsSubmitOpen(true);
        }
    }, [error]);

    return (
        <main className="contact">
            <SectionObserver theme="dark">
                <section className={`contact__section-1 ${!isSm && '!h-full !pb-0'}`}>
                    <AnimatedWrapper
                        as="div"
                        className="_formContainer"
                        from={{ transform: 'translateX(100%)', opacity: 0 }} // Initial state
                        to={{
                            transform: isReady ? 'translateX(0%)' : 'translateX(100%)',
                            opacity: isReady ? 1 : 0,
                        }}
                        config={{ mass: 1, tension: 210, friction: 20 }} // Adjusted spring configuration
                        delay={200} // Delay in milliseconds
                    >
                        <div className="_formContainer_corps">
                            <AnimatedWrapper
                                as="div"
                                className="_formContainer_corps-left"
                                from={{ transform: 'translateX(-100%)', opacity: 0 }} // Initial state
                                to={{
                                    transform: isLoaded ? 'translateX(0%)' : 'translateX(-100%)',
                                    opacity: isLoaded ? 1 : 0,
                                }}
                                config={{ mass: 1, tension: 210, friction: 20 }} // Adjusted spring configuration
                                delay={200} // Delay in milliseconds
                            >
                                {/* The focus state for the Floating label is not working perfect, maybe after I submit the email it stays focused but it never changes back */}
                                <form className="_form" onSubmit={handleSubmit(onSubmit)}>
                                    <div className="_row __header">
                                        <h2>Reach out to me</h2>
                                        <p>
                                            It would be my great pleasure to read what you have to
                                            say about my work
                                        </p>
                                    </div>
                                    <div className="_row">
                                        <FormField
                                            label="First Name"
                                            name="firstname"
                                            type="text"
                                            control={control}
                                            error={errors.firstname?.message}
                                            rules={{ required: 'First Name is required' }}
                                            onClear={() => handleClearField('firstname')}
                                            icon={<User />}
                                            immediateSync={false} // Add this to prevent unnecessary Redux updates
                                            forceReset={formReset}
                                        />
                                        <FormField
                                            label="Last Name"
                                            name="lastname"
                                            type="text"
                                            control={control}
                                            error={errors.lastname?.message}
                                            rules={{ required: 'Last Name is required' }}
                                            onClear={() => handleClearField('lastname')}
                                            icon={<User />}
                                            forceReset={formReset}
                                        />
                                    </div>
                                    <div className="_row">
                                        <FormField
                                            label="Email"
                                            name="email"
                                            type="email"
                                            control={control}
                                            error={errors.email?.message}
                                            rules={{ required: 'Email is required' }}
                                            onClear={() => handleClearField('email')}
                                            icon={<AtSign />}
                                            immediateSync={true}
                                            forceReset={formReset}
                                        />
                                        <FormField
                                            label="Phone"
                                            name="phone"
                                            type="text"
                                            control={control}
                                            error={errors.phone?.message}
                                            rules={{ required: 'Phone is required' }}
                                            onClear={() => handleClearField('phone')}
                                            icon={<Phone />}
                                            forceReset={formReset}
                                        />
                                    </div>
                                    <div className="_row __textarea">
                                        <FormField
                                            label="Message"
                                            name="message"
                                            type="textarea"
                                            control={control}
                                            error={errors.message?.message}
                                            rules={{ required: 'Message is required' }}
                                            onClear={() => handleClearField('message')}
                                            icon={<MessageSquare />}
                                            forceReset={formReset}
                                        />
                                    </div>
                                    <div className="_row">
                                        <button
                                            type="submit"
                                            className="_button"
                                            id="_buttonContact"
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
                                                parentHoverSelector="#_buttonContact"
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
                                                    parentHoverSelector="#_buttonContact" // <-- Updated parent hover selector
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
                                                    parentHoverSelector="#_buttonContact" // <-- Updated parent hover selector
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
                                                    parentHoverSelector="#_buttonContact" // <-- Updated parent hover selector
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
                                                    parentHoverSelector="#_buttonContact" // <-- Updated parent hover selector
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
                                                parentHoverSelector="#_buttonContact"
                                            >
                                                {isLoading ? 'Submitting...' : 'Submit'}
                                                <b className="__dot">.</b>
                                            </AnimatedWrapper>
                                        </button>
                                    </div>
                                </form>
                            </AnimatedWrapper>

                            <AnimatedWrapper
                                as="div"
                                className="_formContainer_corps-right"
                                from={{ transform: 'translateX(100%)', opacity: 0 }} // Initial state
                                to={{
                                    transform: isLoaded ? 'translateX(0%)' : 'translateX(100%)',
                                    opacity: isLoaded ? 1 : 0,
                                }}
                                config={{ mass: 1, tension: 210, friction: 20 }} // Adjusted spring configuration
                                delay={200} // Delay in milliseconds
                            >
                                <div className="__group">
                                    <h3>Chat with me</h3>
                                    <p>Get in contact and let&apos;s talk about Poetry</p>
                                    <AnimatedWrapper
                                        as="ul"
                                        className="__ul-contactMe"
                                        from={{ opacity: 0 }}
                                        to={{ opacity: isLoaded ? 1 : 0 }}
                                        config={smoothConfig}
                                    >
                                        {contactMeItems.map((item) => (
                                            <AnimatedWrapper
                                                as="li"
                                                key={item.href}
                                                hover={{
                                                    from: { transform: 'translateX(0vh)' },
                                                    to: { transform: 'translateX(0.5vh)' },
                                                }}
                                                click={{
                                                    from: { scale: 1 },
                                                    to: { scale: 0.9 },
                                                }}
                                                config={config.wobbly}
                                            >
                                                <Link href={item.href}>
                                                    <item.icon />
                                                    <u>{item.label}</u>
                                                </Link>
                                            </AnimatedWrapper>
                                        ))}
                                    </AnimatedWrapper>
                                </div>

                                <div className="__group">
                                    <h3>Contact me</h3>
                                    <p>Connect with me on WhatsApp for work-related matters.</p>
                                    <AnimatedWrapper
                                        as="ul"
                                        className="__ul-contactMe"
                                        from={{ opacity: 0 }}
                                        to={{ opacity: isLoaded ? 1 : 0 }}
                                        config={smoothConfig}
                                    >
                                        <AnimatedWrapper
                                            as="li"
                                            key=""
                                            hover={{
                                                from: { transform: 'translateX(0vh)' },
                                                to: { transform: 'translateX(0.5vh)' },
                                            }}
                                            click={{
                                                from: { scale: 1 },
                                                to: { scale: 0.9 },
                                            }}
                                            config={config.wobbly}
                                        >
                                            <Link href="">
                                                <FaWhatsapp />
                                                <u>+212 6 54 52 84 92</u>
                                            </Link>
                                        </AnimatedWrapper>
                                    </AnimatedWrapper>
                                </div>
                            </AnimatedWrapper>
                        </div>

                        <SubmitModal
                            isSubmitOpen={isSubmitOpen}
                            onSubmitClose={() => {
                                setIsSubmitOpen(false);
                                dispatch(clearContactState());
                                reset(); // Reset form when modal closes
                            }}
                            header={submitHeader}
                            message={submitMessage}
                            isSuccess={isSuccess}
                        />
                    </AnimatedWrapper>
                </section>
            </SectionObserver>

            <SectionObserver theme="light">
                <section className="contact__section-4"></section>
            </SectionObserver>
        </main>
    );
}
