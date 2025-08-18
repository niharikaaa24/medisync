
package com.medisync.medisync.service;

import com.medisync.medisync.entity.Appointment;
import com.medisync.medisync.entity.User; // Import User entity
import com.medisync.medisync.repository.AppointmentRepo;
import com.medisync.medisync.repository.UserRepo; // Import UserRepo if directly used, otherwise rely on UserService
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AppointmentService {

    private static final Logger logger = LoggerFactory.getLogger(AppointmentService.class);

    @Autowired
    private AppointmentRepo appointmentRepo;

    @Autowired
    private UserService userService; // Autowire UserService to find users by username


    public Appointment saveApp(Appointment appointment) {
        logger.info("Saving appointment for patient ID: {} with doctor ID: {}", appointment.getPatientId(), appointment.getDoctorId());
        Appointment savedAppointment = appointmentRepo.save(appointment);
        logger.info("Appointment saved with ID: {}", savedAppointment.getId());
        return savedAppointment;
    }

    public List<Appointment> findAllApp() {
        logger.info("Fetching all appointments.");
        List<Appointment> appointments = appointmentRepo.findAll();
        logger.info("Total appointments found: {}", appointments.size());
        return appointments;
    }

    public Optional<Appointment> findAppById(String id) {
        logger.info("Fetching appointment by ID: {}", id);
        Optional<Appointment> appointment = appointmentRepo.findById(id);
        if (appointment.isPresent()) {
            logger.info("Appointment found with ID: {}", id);
        } else {
            logger.warn("Appointment not found with ID: {}", id);
        }
        return appointment;
    }

    public void deleteAppById(String id) {
        logger.info("Deleting appointment by ID: {}", id);
        appointmentRepo.deleteById(id);
        logger.info("Appointment deleted successfully.");
    }


    public List<Appointment> getAppointmentsForPatient(String username) {
        logger.info("Fetching appointments for patient: {}", username);

        Optional<User> userOptional = userService.findByUsername(username);

        if (userOptional.isPresent()) {
            User user = userOptional.get(); // Get the actual User object
            List<Appointment> appointments = appointmentRepo.findByPatientId(user.getId()); // Use user.getId()
            logger.info("Found {} appointments for patient: {}", appointments.size(), username);
            return appointments;
        } else {
            logger.warn("Patient user not found for username: {}", username);
            return List.of(); // Return empty list if user not found
        }
    }


    public List<Appointment> getAppointmentsForDoctor(String username) {
        logger.info("Fetching appointments for doctor: {}", username);

        Optional<User> userOptional = userService.findByUsername(username);

        if (userOptional.isPresent()) {
            User user = userOptional.get(); // Get the actual User object
            List<Appointment> appointments = appointmentRepo.findByDoctorId(user.getId()); // Use user.getId()
            logger.info("Found {} appointments for doctor: {}", appointments.size(), username);
            return appointments;
        } else {
            logger.warn("Doctor user not found for username: {}", username);
            return List.of();
        }
    }
}
