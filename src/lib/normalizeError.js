export function normalizeError(error) {
  if (!error) return null;

  const rawMessage = error.message || (typeof error === 'string' ? error : '');
  const lowerMsg = rawMessage.toLowerCase();

  // 1. Supabase Auth Password Policy / Complexity errors
  if (
    lowerMsg.includes('password should contain at least one character of each') ||
    (lowerMsg.includes('password') && lowerMsg.includes('abcdefghijklmnopqrstuvwxyz'))
  ) {
    return new Error(
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*).'
    );
  }

  if (lowerMsg.includes('new password should be different')) {
    return new Error('New password must be different from your current password.');
  }

  if (lowerMsg.includes('password should be at least')) {
    return new Error('Password must be at least 6 characters long.');
  }

  if (lowerMsg.includes('password is too weak')) {
    return new Error('Password is too weak. Please use a mix of uppercase, lowercase, numbers, and symbols.');
  }

  // 2. Common Supabase Auth / Account errors
  if (lowerMsg.includes('user already registered') || lowerMsg.includes('user already exists')) {
    return new Error('An account with this email already exists. Please sign in instead.');
  }

  if (lowerMsg.includes('invalid login credentials')) {
    return new Error('Invalid email or password. Please check your credentials and try again.');
  }

  if (lowerMsg.includes('email not confirmed')) {
    return new Error('Please verify your email address before signing in.');
  }

  if (
    lowerMsg.includes('rate limit') ||
    lowerMsg.includes('over_email_send_rate_limit') ||
    lowerMsg.includes('only request this once every')
  ) {
    return new Error('Too many attempts. Please wait a moment before trying again.');
  }

  if (
    lowerMsg.includes('token has expired') ||
    lowerMsg.includes('token is invalid') ||
    lowerMsg.includes('otp expired')
  ) {
    return new Error('The reset or verification link has expired. Please request a new one.');
  }

  // 3. Postgres / Supabase DB Error codes
  switch (error.code) {
    case '23505': 
      return new Error('This record already exists or conflicts with an existing one.');
    case '23514': 
      return new Error('Some of the values entered are invalid.');
    case 'PGRST116': 
      return new Error('The requested record was not found.'); // empty .single()
    default:
      if (lowerMsg.includes('row-level security')) {
        return new Error('You do not have permission to do that.');
      }
      return error; // fall through for anything unexpected — don't hide real bugs during dev
  }
}
