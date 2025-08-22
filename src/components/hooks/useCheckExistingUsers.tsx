import { useEffect, useState } from "react";
import { supabase } from "@/lib/superbaseClient";

export const useCheckUserExists = (email: string) => {
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setIsExistingUser(false);
        return;
      }

      setChecking(true);

      const { data, error } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (error) {
        console.error("Error checking user:", error.message);
        setIsExistingUser(false);
      } else {
        setIsExistingUser(!!data);
      }

      setChecking(false);
    };

    checkUser();
  }, [email]);

  return { isExistingUser, checking };
};
 