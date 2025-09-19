package com.medisync.medisync.service;

import com.medisync.medisync.entity.Appointment;
import com.medisync.medisync.entity.User;
import com.medisync.medisync.repository.AppointmentRepo;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
@Slf4j
public class AppointmentService {

    private final AppointmentRepo appointmentRepo;
    private final UserService userService;
    private final NotificationService notificationService;

    @CachePut(value = "appointments", key = "#result.id")
    @CacheEvict(value = "allAppointments", allEntries = true)
    @Transactional
    public Appointment saveApp(Appointment appointment) {
        log.info("Saving appointment for patient ID: {} with doctor ID: {}", appointment.getPatientId(), appointment.getDoctorId());

        Appointment savedAppointment = appointmentRepo.save(appointment);
        log.info("Appointment saved with ID: {}", savedAppointment.getId());

        String patientMessage = "Your appointment with " + getDoctorName(savedAppointment.getDoctorId()) + " has been booked for " + savedAppointment.getAppointmentDate();
        notificationService.sendNotification(savedAppointment.getPatientId(), patientMessage);

        String doctorMessage = "A new appointment has been booked with patient " + getPatientName(savedAppointment.getPatientId()) + " on " + savedAppointment.getAppointmentDate();
        notificationService.sendNotification(savedAppointment.getDoctorId(), doctorMessage);

        return savedAppointment;
    }

    @Cacheable(value = "allAppointments", key = "'all'")
    public List<Appointment> findAllApp() {
        log.info("Fetching all appointments.");
        List<Appointment> appointments = appointmentRepo.findAll();
        log.info("Total appointments found: {}", appointments.size());
        return appointments;
    }

    @Cacheable(value = "appointments", key = "#id")
    public Optional<Appointment> findAppById(String id) {
        log.info("Fetching appointment by ID: {}", id);
        Optional<Appointment> appointment = appointmentRepo.findById(id);
        if (appointment.isPresent()) {
            log.info("Appointment found with ID: {}", id);
        } else {
            log.warn("Appointment not found with ID: {}", id);
        }
        return appointment;
    }

    @CacheEvict(value = {"appointments", "allAppointments"}, allEntries = true)
    public void deleteAppById(String id) {
        log.info("Deleting appointment by ID: {}", id);
        appointmentRepo.deleteById(id);
        log.info("Appointment deleted successfully.");
    }

    @Cacheable(value = "patientAppointments", key = "#username")
    public List<Appointment> getAppointmentsForPatient(String username) {
        log.info("Fetching appointments for patient: {}", username);
        Optional<User> userOptional = userService.findByUsername(username);

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            List<Appointment> appointments = appointmentRepo.findByPatientId(user.getId());
            log.info("Found {} appointments for patient: {}", appointments.size(), username);
            return appointments;
        } else {
            log.warn("Patient user not found for username: {}", username);
            return List.of();
        }
    }

    @Cacheable(value = "doctorAppointments", key = "#username")
    public List<Appointment> getAppointmentsForDoctor(String username) {
        log.info("Fetching appointments for doctor: {}", username);
        Optional<User> userOptional = userService.findByUsername(username);

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            List<Appointment> appointments = appointmentRepo.findByDoctorId(user.getId());
            log.info("Found {} appointments for doctor: {}", appointments.size(), username);
            return appointments;
        } else {
            log.warn("Doctor user not found for username: {}", username);
            return List.of();
        }
    }

    private String getDoctorName(String doctorId) {
        return userService.findUserById(doctorId)
                .map(User::getUsername)
                .orElse("Doctor");
    }

    private String getPatientName(String patientId) {
        return userService.findUserById(patientId)
                .map(User::getUsername)
                .orElse("Patient");
    }
}