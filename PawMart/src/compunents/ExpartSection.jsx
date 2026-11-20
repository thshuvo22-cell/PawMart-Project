
import React, { useState } from 'react';
import MyContainer from './MyContainer';

import eimg1 from '../assets/exp1.avif';
import eimg4 from '../assets/exp4.jpg';
import eimg3 from '../assets/exp3.jpg';

import auth from '../firebase/firebase.config';

const BACKEND_URL = 'https://pawmart-backend-tav8.onrender.com';

const doctors = [
  {
    id: 1,
    name: 'Dr. Alisa Snow',
    specialty: 'Winter Dermatology & Paw Care',
    experience: '3 Years Experience',
    image: eimg1,
  },
  {
    id: 2,
    name: 'Dr. Ryan Miller',
    specialty: 'Pet Health & Preventive Care',
    experience: '8 Years Experience',
    image: eimg4,
  },
  {
    id: 3,
    name: 'Maya Wilson',
    specialty: 'Pet Training & Pet Care',
    experience: '10 Years Experience',
    image: eimg3,
  },
];

const ExpartSection = () => {
  const [loadingDoctor, setLoadingDoctor] = useState('');
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState('');

  const handleBooking = async (doctor) => {
    const user = auth.currentUser;

    if (!user || !user.email) {
      setError('Please login to book an appointment.');
      return;
    }

    setLoadingDoctor(doctor.name);
    setError('');

    try {
      const response = await fetch(`${BACKEND_URL}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctorName: doctor.name,
          doctorSpecialty: doctor.specialty,
          customerEmail: user.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Appointment booking failed.');
      }

      setBooking(data.appointment);
    } catch (err) {
      console.error('Booking error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoadingDoctor('');
    }
  };

  const formattedDate = booking?.appointmentDate
    ? new Date(`${booking.appointmentDate}T12:00:00+06:00`)
        .toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          timeZone: 'Asia/Dhaka',
        })
    : '';

  return (
    <div className="mb-10 mt-10">
      <div className="text-center text-3xl font-semibold text-white mb-10">
        <h1 className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent font-semibold">
          Meet Our Pet Heroes
        </h1>
      </div>

      <MyContainer className="grid grid-cols-1 lg:grid-cols-3 w-full gap-5 p-6 lg:p-0">

        {doctors.map((doctor) => (
          <div
            key={doctor.id}
            className="card card-side bg-base-100 shadow-sm w-full lg:w-100 h-50"
          >
            <figure>
              <img
                className="w-60 h-full object-cover"
                src={doctor.image}
                alt={doctor.name}
              />
            </figure>

            <div className="card-body">
              <h2 className="card-title">{doctor.name}</h2>

              <p>{doctor.specialty}</p>

              <p>{doctor.experience}</p>

              <div className="card-actions justify-end">
                <button
                  onClick={() => handleBooking(doctor)}
                  disabled={loadingDoctor === doctor.name}
                  className="
                    btn btn-primary
                    w-full sm:w-auto
                    text-sm sm:text-base
                    px-4 sm:px-6
                    transition-all duration-200
                    hover:scale-105
                    disabled:opacity-60
                  "
                >
                  {loadingDoctor === doctor.name
                    ? 'Booking...'
                    : 'Book Appointment'}
                </button>
              </div>
            </div>
          </div>
        ))}

      </MyContainer>

      {error && (
        <div className="max-w-xl mx-auto mt-5 px-4">
          <div className="alert alert-error">
            <span>{error}</span>
            <button
              className="btn btn-sm"
              onClick={() => setError('')}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {booking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-base-100 text-base-content rounded-2xl shadow-2xl p-6 md:p-8 max-w-md w-full text-center">

            <div className="text-5xl mb-4">🐾</div>

            <h2 className="text-2xl font-bold text-success mb-3">
              Appointment Confirmed!
            </h2>

            <p className="mb-4">
              Your appointment has been booked successfully.
            </p>

            <div className="bg-base-200 rounded-xl p-4 text-left space-y-3 mb-5">
              <p>
                <strong>Doctor:</strong> {booking.doctorName}
              </p>

              <p>
                <strong>Appointment Date:</strong> {formattedDate}
              </p>

              <p>
                <strong>Visiting Hours:</strong> 10:00 AM - 5:00 PM
              </p>
            </div>

            <p className="text-sm mb-5">
              Please visit us tomorrow between 10:00 AM and 5:00 PM.
              Thank you for choosing PawMart!
            </p>

            <button
              onClick={() => setBooking(null)}
              className="btn btn-primary w-full"
            >
              Done
            </button>

          </div>
        </div>
      )}
    </div>
  );
};

export default ExpartSection;
