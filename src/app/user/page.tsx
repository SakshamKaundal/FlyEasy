'use client'

import { useState, useEffect } from "react"
import BookingForm from "./BookingForm"
import Bookings from "../components/animations/bookingsAnimation"

const User = () => {
    const [showBookings, setShowBookings] = useState<boolean>(false)
    
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowBookings(true)
        }, 3000)
        
      
        return () => clearTimeout(timer)
    }, []) 
    
    return (
        <>
            {showBookings ? <BookingForm /> : <Bookings />}
        </>
    )
}

export default User