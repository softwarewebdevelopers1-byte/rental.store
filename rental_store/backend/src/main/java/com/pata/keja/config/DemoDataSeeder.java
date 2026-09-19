package com.pata.keja.config;

import java.time.Instant;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import com.pata.keja.enums.MembershipStatus;
import com.pata.keja.enums.RoomStatus;
import com.pata.keja.enums.VerificationStatus;
import com.pata.keja.models.Admin;
import com.pata.keja.models.Caretaker;
import com.pata.keja.models.Hostel;
import com.pata.keja.models.Landlord;
import com.pata.keja.models.MarketAgent;
import com.pata.keja.models.Room;
import com.pata.keja.models.Student;
import com.pata.keja.models.User;
import com.pata.keja.repository.HostelRepository;
import com.pata.keja.repository.RoomRepository;
import com.pata.keja.repository.UserRepository;

@Configuration
public class DemoDataSeeder {

    @Bean
    CommandLineRunner seedDemoData(
            UserRepository users,
            HostelRepository hostels,
            RoomRepository rooms,
            PasswordEncoder passwordEncoder,
            PlatformTransactionManager transactionManager) {
        TransactionTemplate transaction = new TransactionTemplate(transactionManager);
        return args -> transaction.executeWithoutResult(status ->
                seed(users, hostels, rooms, passwordEncoder));
    }

    void seed(
            UserRepository users,
            HostelRepository hostels,
            RoomRepository rooms,
            PasswordEncoder passwordEncoder) {
        String password = passwordEncoder.encode("password");
        Admin admin = getOrCreate(users, "admin@example.com", "Demo Admin", password, Admin.class);
        Landlord landlord = getOrCreate(users, "landlord@example.com", "Demo Landlord", password, Landlord.class);
        Caretaker caretaker = getOrCreate(users, "caretaker@example.com", "Demo Caretaker", password, Caretaker.class);
        MarketAgent agent = getOrCreate(users, "agent@example.com", "Demo Agent", password, MarketAgent.class);
        Student student = getOrCreate(users, "student@example.com", "Demo Student", password, Student.class);

        landlord.setVerificationStatus(VerificationStatus.APPROVED);
        users.saveAll(List.of(admin, landlord, caretaker, agent, student));

        Hostel hostel = hostels.findByCodeIgnoreCase("PATA-DEMO")
                .orElseGet(() -> {
                    Hostel created = new Hostel();
                    created.setLandlord(landlord);
                    created.setName("Pata Keja Demo Hostel");
                    created.setCode("PATA-DEMO");
                    created.setLocation("Kilimani, Nairobi");
                    created.setDescription("Demo hostel available on first run.");
                    created.setImages(List.of());
                    return hostels.save(created);
                });

        caretaker.assign(hostel);
        users.save(caretaker);

        List<Room> hostelRooms = rooms.findAllByHostelId(hostel.getId());
        if (hostelRooms.isEmpty()) {
            Room first = room(hostel, "A-01", 8500);
            Room second = room(hostel, "A-02", 8500);
            Room third = room(hostel, "A-03", 9000);
            hostelRooms = rooms.saveAll(List.of(first, second, third));
        }

        Room occupied = hostelRooms.get(0);
        occupied.setStatus(RoomStatus.BOOKED);
        occupied.setTenant(student);
        student.setHostel(hostel);
        student.setRoom(occupied);
        student.setMembershipStatus(MembershipStatus.ACTIVE);
        student.setActivatedAt(Instant.now());
        users.save(student);
        rooms.save(occupied);
    }

    private static Room room(Hostel hostel, String number, long price) {
        Room room = new Room();
        room.setHostel(hostel);
        room.setNumber(number);
        room.setPrice(price);
        room.setStatus(RoomStatus.VACANT);
        return room;
    }

    @SuppressWarnings("unchecked")
    private static <T extends User> T getOrCreate(
            UserRepository users,
            String email,
            String name,
            String password,
            Class<T> type) {
        User existing = users.findByEmailIgnoreCase(email).orElse(null);
        if (existing != null) {
            existing.setActive(true);
            if (existing.getPasswordHash() == null) {
                existing.setPasswordHash(password);
            }
            return (T) existing;
        }
        try {
            T user = type.getDeclaredConstructor().newInstance();
            user.setName(name);
            user.setEmail(email);
            user.setPasswordHash(password);
            user.setActive(true);
            return user;
        } catch (ReflectiveOperationException e) {
            throw new IllegalStateException("Unable to create demo " + type.getSimpleName(), e);
        }
    }
}
