'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { useLoading } from '@/context/LoadingContext';
import AnimatedWrapper from '@/components/ui/AnimatedWrapper';
import FormField from '@/components/ui/FormField';
import { AtSign } from 'lucide-react';

const newsletterVariants = {
    initial: { x: '100%', opacity: 0 },
    animate: {
        x: '0%',
        opacity: 1,
        transition: { type: 'spring', stiffness: 100, damping: 20, mass: 1, delay: 0.2 },
    },
};

interface FormData {
    email: string;
}

const validationSchema = Yup.object().shape({
    email: Yup.string()
        .required('Email is required')
        .matches(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/, 'Invalid email format'),
});

const Newsletter: React.FC = () => {
    const { isLoaded } = useLoading();

    const {
        control,
        handleSubmit,
        setValue,
        formState: { errors },
        clearErrors,
    } = useForm<FormData>({
        resolver: yupResolver(validationSchema),
        defaultValues: { email: '' },
    });

    const handleClearEmail = () => {
        setValue('email', '');
        clearErrors('email');
    };

    const onSubmit = (data: FormData) => {
        console.log('Form Submitted:', data);
    };

    return (
        <AnimatedWrapper
            as="div"
            className="newsletter"
            variants={newsletterVariants}
            initial="initial"
            animate={isLoaded ? 'animate' : 'initial'}
        >
            <form className="_form" onSubmit={handleSubmit(onSubmit)}>
                <FormField
                    label="Email"
                    name="email"
                    type="email"
                    control={control}
                    error={errors.email?.message}
                    rules={{ required: 'Email is required' }}
                    onClear={handleClearEmail}
                    icon={<AtSign />}
                />
                <Link href={`/blog`} className="_button">
                    <div className="buttonBorders">
                        <div className="borderTop"></div>
                        <div className="borderRight"></div>
                        <div className="borderBottom"></div>
                        <div className="borderLeft"></div>
                    </div>
                    <span>
                        Submit
                        <b className="pink_dot">.</b>
                    </span>
                </Link>
            </form>
        </AnimatedWrapper>
    );
};

export default Newsletter;
