'use client'
import { useEffect, useState } from "react"
import Dashboard from "./adminPage";
import { useRouter } from "next/navigation";

const Page = () => {
    const [authorized, setAuthorized] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [mounted, setMounted] = useState<boolean>(false);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return; 
        
        const checkLocalStorage = () => {
            const isAdmin = localStorage.getItem('admin');
            console.log("📦 Raw localStorage value:", isAdmin);
            
            const isAuthorized = isAdmin === 'true';
            console.log("✅ Final authorized state:", isAuthorized);
            
            setAuthorized(isAuthorized);
            setLoading(false);
        };
        
        checkLocalStorage();
    }, [mounted]);

    useEffect(() => {
        if (!loading && !authorized) {
            console.log("🚫 Not authorized, redirecting...");
            router.push('/unauthorized');
        }
    }, [loading, authorized, router]);

    if (!mounted || loading) {
        return <div>Loading...</div>;
    }

    if (!authorized) {
        return <div>Redirecting to unauthorized...</div>;
    }

    console.log("✅ Authorized! Showing dashboard");
    return <Dashboard />;
}

export default Page;