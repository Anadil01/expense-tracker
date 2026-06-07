import LoginPageClient from './LoginPageClient';

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;

  return (
    <LoginPageClient
      authError={params?.error || ''}
      callbackUrl={params?.callbackUrl || '/dashboard'}
    />
  );
}
