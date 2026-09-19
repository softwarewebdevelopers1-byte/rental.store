package com.pata.keja.service.impl;

import com.pata.keja.enums.NotificationKind;
import com.pata.keja.enums.OrderStatus;
import com.pata.keja.dto.order.*;
import com.pata.keja.models.*;
import com.pata.keja.exception.AccessDeniedException;
import com.pata.keja.exception.ConflictException;
import com.pata.keja.exception.NotFoundException;
import com.pata.keja.mapper.OrderMapper;
import com.pata.keja.repository.*;
import com.pata.keja.service.NotificationService;
import com.pata.keja.service.OrderService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepo;
    private final ProductRepository productRepo;
    private final PackRepository packRepo;
    private final StudentRepository studentRepo;
    private final OrderMapper orderMapper;
    private final NotificationService notificationService;

    public OrderServiceImpl(OrderRepository orderRepo,
            ProductRepository productRepo,
            PackRepository packRepo,
            StudentRepository studentRepo,
            OrderMapper orderMapper,
            NotificationService notificationService) {
        this.orderRepo = orderRepo;
        this.productRepo = productRepo;
        this.packRepo = packRepo;
        this.studentRepo = studentRepo;
        this.orderMapper = orderMapper;
        this.notificationService = notificationService;
    }

    @Override
    public OrderResponse create(String studentId, CreateOrderRequest req) {
        Student student = studentRepo.findById(studentId)
                .orElseThrow(() -> new NotFoundException("Student not found"));

        // Resolve and snapshot items. All items must belong to the same agent.
        List<OrderItem> items = new ArrayList<>();
        String agentId = null;

        for (OrderItemRequest it : req.items()) {
            if ("PRODUCT".equalsIgnoreCase(it.kind())) {
                Product p = productRepo.findByIdWithAgent(it.refId())
                        .orElseThrow(() -> new NotFoundException("Product not found: " + it.refId()));
                if (!p.isActive()) {
                    throw new ConflictException("Product is no longer available: " + p.getName());
                }
                if (agentId == null)
                    agentId = p.getAgent().getId();
                else if (!agentId.equals(p.getAgent().getId())) {
                    throw new ConflictException("All items in an order must come from one agent");
                }
                items.add(new OrderItem(OrderItem.Kind.PRODUCT, p.getId(), p.getName(), p.getPrice(), it.quantity()));
            } else if ("PACK".equalsIgnoreCase(it.kind())) {
                Pack pk = packRepo.findByIdWithItems(it.refId())
                        .orElseThrow(() -> new NotFoundException("Pack not found: " + it.refId()));
                if (!pk.isActive()) {
                    throw new ConflictException("Pack is no longer available: " + pk.getName());
                }
                if (agentId == null)
                    agentId = pk.getAgent().getId();
                else if (!agentId.equals(pk.getAgent().getId())) {
                    throw new ConflictException("All items in an order must come from one agent");
                }
                items.add(new OrderItem(OrderItem.Kind.PACK, pk.getId(), pk.getName(), pk.getPrice(), it.quantity()));
            } else {
                throw new ConflictException("Unknown item kind: " + it.kind());
            }
        }

        MarketAgent agent = items.isEmpty() ? null
                : (items.get(0).getKind() == OrderItem.Kind.PRODUCT
                        ? productRepo.findById(items.get(0).getRefId()).get().getAgent()
                        : packRepo.findById(items.get(0).getRefId()).get().getAgent());

        long total = items.stream().mapToLong(OrderItem::lineTotal).sum();

        Order order = new Order();
        order.setStudent(student);
        order.setAgent(agent);
        order.setItems(items);
        order.setTotal(total);
        order.setStatus(OrderStatus.PAID); // prototype: assume paid at checkout
        order.addTimelineEntry(OrderStatus.PENDING_PAYMENT, "Order placed");
        order.addTimelineEntry(OrderStatus.PAID, "Payment confirmed");
        orderRepo.save(order);

        notificationService.emit(
                agent.getId(),
                NotificationKind.ORDER,
                "New order received",
                items.size() + " item(s) · KES " + total,
                "/agent/orders/" + order.getId());
        return orderMapper.toResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderSummaryResponse> listForStudent(String studentId, Pageable pageable) {
        return orderRepo.findAllByStudentId(studentId, pageable).map(orderMapper::toSummary);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderSummaryResponse> listForAgent(String agentId, OrderStatus filter, Pageable pageable) {
        Page<Order> page = filter == null
                ? orderRepo.findAllByAgentId(agentId, pageable)
                : orderRepo.findAllByAgentIdAndStatus(agentId, filter, pageable);
        return page.map(orderMapper::toSummary);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderSummaryResponse> listAll(Pageable pageable) {
        return orderRepo.findAll(pageable).map(orderMapper::toSummary);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getById(String orderId, String viewerId) {
        Order order = orderRepo.findByIdWithDetails(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found"));
        requireViewer(order, viewerId);
        return orderMapper.toResponse(order);
    }

    @Override
    public OrderResponse updateStatus(String orderId, String requesterId, OrderStatusUpdateRequest req) {
        Order order = orderRepo.findByIdWithDetails(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found"));

        if (!order.getAgent().getId().equals(requesterId)) {
            throw new AccessDeniedException("Only the selling agent can update order status");
        }
        guardTransition(order.getStatus(), req.status());
        order.setStatus(req.status());
        order.addTimelineEntry(req.status(), req.note());

        notificationService.emit(
                order.getStudent().getId(),
                NotificationKind.ORDER,
                "Order update",
                "Your order is now " + req.status().name().replace("_", " ").toLowerCase(),
                "/student/orders/" + order.getId());
        return orderMapper.toResponse(order);
    }

    @Override
    public OrderResponse confirmReceived(String orderId, String studentId) {
        Order order = orderRepo.findByIdWithDetails(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found"));

        if (!order.getStudent().getId().equals(studentId)) {
            throw new AccessDeniedException("Only the buying student can confirm receipt");
        }
        guardTransition(order.getStatus(), OrderStatus.RECEIVED);
        order.setStatus(OrderStatus.RECEIVED);
        order.addTimelineEntry(OrderStatus.RECEIVED, "Confirmed received by student");

        notificationService.emit(
                order.getAgent().getId(),
                NotificationKind.ORDER,
                "Order received",
                "Student confirmed receipt of order #" + order.getId().substring(0, 6),
                "/agent/orders/" + order.getId());
        return orderMapper.toResponse(order);
    }

    // ---------- helpers ----------

    private void requireViewer(Order order, String viewerId) {
        if (!order.getStudent().getId().equals(viewerId)
                && !order.getAgent().getId().equals(viewerId)) {
            throw new AccessDeniedException("You do not have access to this order");
        }
    }

    /**
     * Only the following transitions are legal:
     * PENDING_PAYMENT -> PAID | CANCELLED
     * PAID -> PREPARING | CANCELLED
     * PREPARING -> READY
     * READY -> OUT_FOR_DELIVERY
     * OUT_FOR_DELIVERY-> DELIVERED
     * DELIVERED -> RECEIVED | CONFLICT
     * RECEIVED -> CONFLICT
     * CONFLICT -> RESOLVED
     */
    private void guardTransition(OrderStatus from, OrderStatus to) {
        Set<OrderStatus> allowed = switch (from) {
            case PENDING_PAYMENT -> Set.of(OrderStatus.PAID, OrderStatus.CANCELLED);
            case PAID -> Set.of(OrderStatus.PREPARING, OrderStatus.CANCELLED);
            case PREPARING -> Set.of(OrderStatus.READY);
            case READY -> Set.of(OrderStatus.OUT_FOR_DELIVERY);
            case OUT_FOR_DELIVERY -> Set.of(OrderStatus.DELIVERED);
            case DELIVERED -> Set.of(OrderStatus.RECEIVED, OrderStatus.CONFLICT);
            case RECEIVED -> Set.of(OrderStatus.CONFLICT);
            case CONFLICT -> Set.of(OrderStatus.RESOLVED);
            default -> Set.of();
        };
        if (!allowed.contains(to)) {
            throw new ConflictException("Cannot transition from " + from + " to " + to);
        }
    }
}
