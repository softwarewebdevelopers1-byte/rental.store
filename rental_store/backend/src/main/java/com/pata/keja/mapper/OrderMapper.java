package com.pata.keja.mapper;

import com.pata.keja.dto.order.OrderItemResponse;
import com.pata.keja.dto.order.OrderResponse;
import com.pata.keja.dto.order.OrderSummaryResponse;
import com.pata.keja.dto.order.OrderTimelineEntryResponse;
import com.pata.keja.models.*;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;

@Component
public class OrderMapper {

    public OrderSummaryResponse toSummary(Order o) {
        List<String> names = o.getItems().stream().map(OrderItem::getName).toList();
        Student s = o.getStudent();
        return new OrderSummaryResponse(
                o.getId(),
                o.getStatus(),
                o.getTotal(),
                o.getItems().size(),
                names,
                s.getId(),
                s.getName(),
                o.getAgent().getId(),
                o.getAgent().getName(),
                o.getCreatedAt(),
                o.getUpdatedAt());
    }

    public OrderResponse toResponse(Order o) {
        Student s = o.getStudent();

        List<OrderItemResponse> items = o.getItems().stream()
                .map(i -> new OrderItemResponse(
                        i.getKind().name(),
                        i.getRefId(),
                        i.getName(),
                        i.getUnitPrice(),
                        i.getQuantity(),
                        i.lineTotal()))
                .toList();

        List<OrderTimelineEntryResponse> timeline = o.getTimeline().stream()
                .sorted(Comparator.comparing(OrderTimelineEntry::getAt))
                .map(e -> new OrderTimelineEntryResponse(e.getStatus(), e.getAt(), e.getNote()))
                .toList();

        return new OrderResponse(
                o.getId(),
                o.getStatus(),
                o.getTotal(),
                s.getId(),
                s.getName(),
                s.getEmail(),
                o.getAgent().getId(),
                o.getAgent().getName(),
                items,
                timeline,
                o.getCreatedAt(),
                o.getUpdatedAt());
    }
}
