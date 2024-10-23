const {z} = require('zod');

const emailSchema = z.object({
    email: z
    .string({required_error: 'Email is required'})
    .trim()
    .min(7, {message: 'Email should be of atleast 7 chars'}),
});

const resetPassSchema = z.object({
    new_password: z
    .string({required_error: 'Please enter your new password'})
    .trim()
    .min(8, {message: 'Password must be of atleast 8 chars'})
    .max(1024, {message: 'Password cannot be more than 1024 chars'}),

    confirm_password: z
    .string({required_error: 'Please repeat your new password'})
    .trim()
    .min(8, {message: 'Password must be of atleast 8 chars'})
    .max(1024, {message: 'Password cannot be more than 1024 chars'}),
});

const passwordSchema = resetPassSchema.extend({
    password: z
    .string({required_error: 'Please enter your old password'})
    .trim(),
});

const loginSchema = z.object({
    email: z
    .string({required_error: 'Email is required'})
    .trim()
    .min(7, {message: 'Email should be of atleast 7 chars'}),

    password: z
    .string({required_error: 'Enter the password first'})
    .trim()
});

const signupSchema = loginSchema.extend({
    phone: z
    .number({required_error: 'Phone is required'})
    .min(1000000000, {message: 'Phone number should be of 10 numbers'})
    .max(9999999999, {message: 'Phone number should be of 10 numbers'}),
    
    countryCode: z
    .string({required_error: 'Please select country code'})
    .trim(),

    password: z
    .string({required_error: 'Enter the password first'})
    .trim()
    .min(8, {message: 'Password must be of atleast 8 chars'})
    .max(1024, {message: 'Password cannot be more than 1024 chars'}),

    username: z
    .string({required_error: 'Please provide username'})
    .trim()
    .min(3, {message: 'Username must be of atleast 3 chars'})
    .max(255, {message: 'Username cannot be more than 255 chars'})
});

module.exports = {
    loginSchema, 
    signupSchema, 
    resetPassSchema, 
    passwordSchema,
    emailSchema
}