import { z } from 'zod';

export const signUpSchema = z.object({
	name: z.string().trim().min(1, 'Name is required').max(100, 'Name is too long'),
	username: z
		.string()
		.trim()
		.min(3, 'Username must be at least 3 characters')
		.max(30, 'Username must be at most 30 characters')
		.regex(/^[a-zA-Z0-9_]+$/, 'Letters, numbers, and underscores only'),
	email: z.email('Enter a valid email address'),
	password: z
		.string()
		.min(8, 'Password must be at least 8 characters')
		.max(128, 'Password is too long')
});

export const signInSchema = z.object({
	email: z.email('Enter a valid email address'),
	password: z.string().min(1, 'Password is required')
});

export const forgotPasswordSchema = z.object({
	email: z.email('Enter a valid email address')
});

export const resetPasswordSchema = z
	.object({
		password: z
			.string()
			.min(8, 'Password must be at least 8 characters')
			.max(128, 'Password is too long'),
		confirmPassword: z.string()
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword']
	});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
