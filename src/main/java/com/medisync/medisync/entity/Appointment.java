package com.medisync.medisync.entity;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern; // Needed for @Pattern annotation
import lombok.Data; // For @Data annotation (getters, setters, etc.)
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;


@Document(collection = "appointments")
@Data
public class Appointment {

    @Id
    private String id;

    @NotBlank(message = "Patient Id is required")
    private String patientId;

    @NotBlank(message = "Doctor Id is required")
    private String doctorId;

    @NotBlank(message = "Reason must be provided")
    private String reason;

    @NotNull(message = "Status must be provided")
    private Status status; // This refers to your Status enum

    @NotBlank(message = "Appointment date is required")
    @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$", message = "Date must be in format yyyy-MM-dd")
    private String appointmentDate; // Changed to String as per your commented out lines

    @NotBlank(message = "Appointment time is required")
    @Pattern(regexp = "^([01]?[0-9]|2[0-3]):[0-5][0-9]$", message = "Time must be in format HH:mm")
    private String appointmentTime; // Changed to String as per your commented out lines



    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getPatientId() { return patientId; }
    public void setPatientId(String patientId) { this.patientId = patientId; }

    public String getDoctorId() { return doctorId; }
    public void setDoctorId(String doctorId) { this.doctorId = doctorId; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public String getAppointmentDate() { return appointmentDate; }
    public void setAppointmentDate(String appointmentDate) { this.appointmentDate = appointmentDate; }

    public String getAppointmentTime() { return appointmentTime; }
    public void setAppointmentTime(String appointmentTime) { this.appointmentTime = appointmentTime; }

}