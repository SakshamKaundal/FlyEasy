'use client'

import { useState } from "react"
import BookingForm from "./BookingForm"
import Bookings from "../components/animations/bookingsAnimation"

const User=()=>{
    const [showBookings , setShowBookings] = useState<boolean>(false)
    setInterval(()=>{setShowBookings(true)}, 3000)
    return(
     <>
     {showBookings ? <BookingForm /> : <Bookings />}
     </>
    )
}
export default User