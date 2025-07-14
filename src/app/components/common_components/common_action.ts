'use server'


import { cookies } from "next/headers";

export const LogoutFunction = async () => {
  const cookieStore = await cookies();

  cookieStore.set({
    name: 'token',
    value: '',
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 0,
  });

  return { message: 'Logged out' };
};