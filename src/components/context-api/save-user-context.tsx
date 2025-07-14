import { createContext, useContext } from "react";

export interface UserInformation {
  id: string;
  name: string;
  email: string;
}

type UserContextType = {
  user: UserInformation | null;
  setUser: (user: UserInformation) => void;
  isRoundTrip: boolean;
  setIsRoundTrip: (value: boolean) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUserInformation = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserInformation must be used within a UserContext.Provider");
  }
  return context;
};

export default UserContext;
