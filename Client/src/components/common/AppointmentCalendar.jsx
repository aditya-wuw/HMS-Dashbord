import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format } from 'date-fns';
import { FaCalendarAlt, FaClock, FaUserMd, FaClipboardList } from 'react-icons/fa';

const AppointmentCalendar = ({ appointments = [] }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dateAppointments, setDateAppointments] = useState([]);
  
  const formatDateString = (date) => {
    return format(new Date(date), 'yyyy-MM-dd');
  };
  
  useEffect(() => {
    const appointmentsOnDate = appointments.filter(appointment => {
      return formatDateString(appointment.date) === formatDateString(selectedDate);
    });
    
    setDateAppointments(appointmentsOnDate);
  }, [selectedDate, appointments]);
  
  const hasAppointments = (date) => {
    const dateStr = formatDateString(date);
    return appointments.some(appointment => formatDateString(appointment.date) === dateStr);
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'Scheduled': return 'bg-blue-500';
      case 'Confirmed': return 'bg-green-500';
      case 'Completed': return 'bg-green-700';
      case 'Cancelled': return 'bg-red-500';
      case 'No-Show': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };
  
  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;
    
    const dateAppointments = appointments.filter(appointment => 
      formatDateString(appointment.date) === formatDateString(date)
    );
    
    if (dateAppointments.length === 0) return null;
    
    return (
      <div className="flex justify-center mt-1">
        {dateAppointments.length > 3 ? (
          <>
            <div className="h-2 w-2 bg-blue-500 rounded-full mx-0.5"></div>
            <div className="h-2 w-2 bg-blue-500 rounded-full mx-0.5"></div>
            <div className="h-2 w-2 bg-blue-500 rounded-full mx-0.5"></div>
          </>
        ) : (
          dateAppointments.map((appointment, index) => (
            <div 
              key={index} 
              className={`h-2 w-2 ${getStatusColor(appointment.status)} rounded-full mx-0.5`}
            ></div>
          ))
        )}
      </div>
    );
  };
  
  const tileClassName = ({ date, view }) => {
    if (view !== 'month') return '';
    
    return hasAppointments(date) ? 'has-appointments' : '';
  };
  
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4 text-blue-800 flex items-center">
          <FaCalendarAlt className="mr-2" /> Appointment Calendar
        </h3>
        <div className="calendar-container">
          <Calendar 
            onChange={setSelectedDate}
            value={selectedDate}
            tileContent={tileContent}
            tileClassName={tileClassName}
            className="w-full border-none"
          />
        </div>
      </div>
      <div className="flex-1 md:min-w-210">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-2 text-blue-800">
            Appointments for {format(selectedDate, 'MMMM d, yyyy')}
          </h3>
          
          {dateAppointments.length === 0 ? (
            <div className="text-gray-500 flex items-center justify-center h-64 text-center">
              <p>No appointments scheduled for this date</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 xs:scrollbar-hide">
              {dateAppointments.map((appointment) => (
                <div key={appointment._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between">
                    <h4 className="font-medium text-gray-800">{appointment.purpose || 'General Checkup'}</h4>
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      appointment.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                      appointment.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                      appointment.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      appointment.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                      appointment.status === 'No-Show' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {appointment.status}
                    </span>
                  </div>
                  
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <FaClock className="mr-2 text-blue-500" />
                      <span>{appointment.time || 'Not specified'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FaUserMd className="mr-2 text-blue-500" />
                      <span>Dr. {appointment.doctor?.name || 'Not assigned'}</span>
                    </div>
                    {appointment.notes && (
                      <div className="flex items-start text-sm text-gray-600">
                        <FaClipboardList className="mr-2 text-blue-500 mt-1" />
                        <span>{appointment.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentCalendar; 