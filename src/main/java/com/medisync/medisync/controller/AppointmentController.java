
package com.medisync.medisync.controller;

import com.medisync.medisync.entity.Appointment;
import com.medisync.medisync.service.AppointmentService;
import com.medisync.medisync.service.NotificationService;
import com.medisync.medisync.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.FieldError;
import com.medisync.medisync.entity.User;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;


@RestController
@RequestMapping("/appointment")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserService userService;



    @CrossOrigin(origins = "http://localhost:3000")
    @GetMapping("/all")
    public ResponseEntity getAllApp()
    {
        List<Appointment> appointments= appointmentService.findAllApp();

        if(appointments!=null) {
            return new ResponseEntity(appointments, HttpStatus.ACCEPTED);
        }
        else
            return new ResponseEntity(HttpStatus.NOT_FOUND);

    }

    @CrossOrigin(origins = "http://localhost:3000")
    @GetMapping("/{id}")
    public ResponseEntity<Optional<Appointment>> getAppById(@PathVariable String id)
    {
        try
        {
            Optional<Appointment> appointment= appointmentService.findAppById(id);
            return new ResponseEntity<>(appointment, HttpStatus.ACCEPTED);
        }
        catch(Exception e)
        {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @CrossOrigin(origins = "http://localhost:3000")
    @GetMapping("/patient")
    public ResponseEntity<List<Appointment>> getPatientAppointments() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        return ResponseEntity.ok(appointmentService.getAppointmentsForPatient(username));
    }

    @CrossOrigin(origins = "http://localhost:3000")
    @GetMapping("/doctor")
    public ResponseEntity<List<Appointment>> getDoctorAppointments() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        return ResponseEntity.ok(appointmentService.getAppointmentsForDoctor(username));
    }

    @PostMapping
    public ResponseEntity<?> createApp(@Valid @RequestBody Appointment appointment) {
        try {
            appointmentService.saveApp(appointment);

            String patientId = appointment.getPatientId();
            String doctorId = appointment.getDoctorId();
            String appointmentDateTime = appointment.getAppointmentDate() + " at " + appointment.getAppointmentTime();

            String doctorName = userService.findUserById(doctorId)
                    .map(User::getUsername)
                    .orElse("Unknown Doctor");

            String patientName = userService.findUserById(patientId)
                    .map(User::getUsername)
                    .orElse("Unknown Patient");

            notificationService.sendNotification(patientId,
                    "Your appointment with Doctor " + doctorName +
                            " is booked for " + appointmentDateTime + " (Status: " + appointment.getStatus() + ").");

            notificationService.sendNotification(doctorId,
                    "You have a new appointment with Patient " + patientName +
                            " on " + appointmentDateTime + " (Status: " + appointment.getStatus() + ").");

            System.out.println("Notifications sent for new appointment: Patient " + patientId + ", Doctor " + doctorId);

            return new ResponseEntity<>(HttpStatus.CREATED);
        } catch (Exception e) {
            System.err.println("Error creating appointment: " + e.getMessage());
            return new ResponseEntity<>("Error creating appointment: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity deleteApp(@PathVariable String id)
    {
        try
        {
            Optional<Appointment> appointmentToDeleteOpt = appointmentService.findAppById(id);
            if (appointmentToDeleteOpt.isPresent()) {
                Appointment appointmentToDelete = appointmentToDeleteOpt.get();
                appointmentService.deleteAppById(id);

                String patientId = appointmentToDelete.getPatientId();
                String doctorId = appointmentToDelete.getDoctorId();
                String appointmentDateTime = appointmentToDelete.getAppointmentDate() + " at " + appointmentToDelete.getAppointmentTime();

                if (notificationService != null && userService != null) {
                    notificationService.sendNotification(patientId, "Your appointment with Doctor " +
                            userService.findUserById(doctorId).orElse(null) +
                            " on " + appointmentDateTime + " has been CANCELLED.");

                    notificationService.sendNotification(doctorId, "The appointment with Patient " +
                            userService.findUserById(patientId).orElse(null) +
                            " on " + appointmentDateTime + " has been CANCELLED.");

                    System.out.println("Notifications sent for deleted appointment: Patient " + patientId + ", Doctor " + doctorId);
                } else {
                    System.err.println("NotificationService or UserService is null. Cannot send notification for deleted appointment.");
                }
            } else {
                return new ResponseEntity(HttpStatus.NOT_FOUND);
            }
            return new ResponseEntity(HttpStatus.OK);
        }
        catch(Exception e)
        {
            System.err.println("Error deleting appointment: " + e.getMessage());
            return new ResponseEntity(HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Appointment> updateAppointment(@PathVariable String id, @RequestBody Appointment updatedAppointment) {
        Optional<Appointment> existingAppointmentOpt = appointmentService.findAppById(id);

        if (existingAppointmentOpt.isPresent()) {
            Appointment existingAppointment = existingAppointmentOpt.get();

            String oldStatus = existingAppointment.getStatus().name();
            String oldAppointmentDateTime = existingAppointment.getAppointmentDate() + " at " + existingAppointment.getAppointmentTime();

            if (updatedAppointment.getAppointmentDate() != null && !updatedAppointment.getAppointmentDate().isBlank()) {
                existingAppointment.setAppointmentDate(updatedAppointment.getAppointmentDate());
            }
            if (updatedAppointment.getAppointmentTime() != null && !updatedAppointment.getAppointmentTime().isBlank()) {
                existingAppointment.setAppointmentTime(updatedAppointment.getAppointmentTime());
            }
            if (updatedAppointment.getReason() != null && !updatedAppointment.getReason().isBlank()) {
                existingAppointment.setReason(updatedAppointment.getReason());
            }
            if (updatedAppointment.getStatus() != null) {
                existingAppointment.setStatus(updatedAppointment.getStatus());
            }
            if (updatedAppointment.getDoctorId() != null && !updatedAppointment.getDoctorId().isBlank()) {
                existingAppointment.setDoctorId(updatedAppointment.getDoctorId());
            }
            if (updatedAppointment.getPatientId() != null && !updatedAppointment.getPatientId().isBlank()) {
                existingAppointment.setPatientId(updatedAppointment.getPatientId());
            }

            Appointment savedAppointment = appointmentService.saveApp(existingAppointment);

            String patientId = savedAppointment.getPatientId();
            String doctorId = savedAppointment.getDoctorId();
            String newAppointmentDateTime = savedAppointment.getAppointmentDate() + " at " + savedAppointment.getAppointmentTime();
            String newStatus = savedAppointment.getStatus().name();

            if (notificationService != null && userService != null) {

                notificationService.sendNotification(patientId,
                        "Your appointment with Doctor " + userService.findUserById(doctorId).orElse(null) +
                                " has been updated. Old details: " + oldAppointmentDateTime + " (Status: " + oldStatus +
                                "). New details: " + newAppointmentDateTime + " (Status: " + newStatus + ").");

                notificationService.sendNotification(doctorId,
                        "The appointment with Patient " + userService.findUserById(patientId).orElse(null) +
                                " has been updated. Old details: " + oldAppointmentDateTime + " (Status: " + oldStatus +
                                "). New details: " + newAppointmentDateTime + " (Status: " + newStatus + ").");

                System.out.println("Notifications sent for updated appointment: Patient " + patientId + ", Doctor " + doctorId);
            } else {
                System.err.println("NotificationService or UserService is null. Cannot send notification for updated appointment.");
            }

            return new ResponseEntity<>(savedAppointment, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Map<String, String> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return errors;
    }
}
