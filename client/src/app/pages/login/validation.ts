import * as yup from 'yup';

export const loginSchema = yup.object({
  identifier: yup
    .string()
    .required('Username or email is required')
    .min(3, 'Must be at least 3 characters'),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Must be at least 6 characters'),
});

export type LoginFormData = yup.InferType<typeof loginSchema>;
