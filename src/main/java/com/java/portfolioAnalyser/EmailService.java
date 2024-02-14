package com.java.portfolioAnalyser;

import java.util.Properties;

import org.springframework.context.annotation.Bean;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Component;

/** Email Service for sending emails. */
@Component
public class EmailService {
    /**
     * Creates a javamailsender to send emails.
     * @return JavaMailSender object
     */
    @Bean
    public static JavaMailSender getJavaMailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost("smtp.gmail.com");
        mailSender.setPort(587);

        mailSender.setUsername("bryan2chong@gmail.com");
        mailSender.setPassword("mhuvdpcplhbvwben");

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.debug", "true");

        return mailSender;
    }

    /**
     * Sends an email wih a new password to the user.
     * if the user has forgotten their password
     *
     * @param recipientEmail recipient email address
     * @param newPassword    new passord that was auto generated
     * @return Boolean indicating if the email sending was successful
     */
    public static boolean
        sendPasswordEmail(String recipientEmail, String newPassword) {
        // Create a simple email message
        // this needs to be changed in final product to connect with springboot
        JavaMailSender javaMailSender = getJavaMailSender();
        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setFrom("bryan2chong@gmail.com");
        mailMessage.setTo(recipientEmail);
        mailMessage.setSubject("Password Reset");
        mailMessage.setText("Your new password is: " + newPassword);

        // Error happens in this zone
        try {
            // Send the email
            javaMailSender.send(mailMessage);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
        // Error happens in this zone
    }
}
