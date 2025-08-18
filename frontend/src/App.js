import { Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";
import PatientHome from "./PatientHome";
import DoctorHome from "./DoctorHome";
import AdminHome from "./AdminHome";
import ManageUsers from "./ManageUsers";
import ManageAppointments from "./ManageAppointments";
import PatientApp from "./PatientApp";
import BookApp from "./BookApp";
import DoctorNoti from "./DoctorNoti";
import DoctorApp from "./DoctorApp";
import PatientNoti from "./PatientNoti";
function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/patient/home" element={<PatientHome />} />
            <Route path="/appointments" element={<PatientApp />} />
      <Route path="/doctor/home" element={<DoctorHome />} />
      <Route path="/admin/home" element={<AdminHome />} />
      <Route path="/admin" element={<AdminHome />} />
      <Route path="/admin/users" element={<ManageUsers />} />
      <Route path="/admin/appointments" element={<ManageAppointments />} />
   <Route path="/book-appointment" element={<BookApp />} />
      <Route path="/doctor/notifications" element={<DoctorNoti />} />
            <Route path="/doctor/appointments" element={<DoctorApp />} />
         <Route path="/patient-notifications" element={<PatientNoti />} />
    </Routes>
  );
}

export default App;
