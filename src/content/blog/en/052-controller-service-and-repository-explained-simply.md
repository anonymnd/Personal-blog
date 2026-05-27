---
title: "Give Controllers, Services and Repositories Clear Responsibilities"
description: "A deep dive into responsibility allocation using a warehouse dispatch scenario to separate HTTP translation, business orchestration, and persistence."
pubDate: 2026-10-07T03:48:00.000Z
translationKey: 052-controller-service-and-repository-explained-simply
seriesOrder: 12
locale: en
tags: ["spring-architecture","learning-series"]
draft: false
---

## The Logic of Layering

Layered architecture is often misunderstood as a set of rigid rules about where 'if' statements go. In reality, it is about managing the scope of authority. Each layer should only care about the concerns of its immediate neighbors. When these boundaries blur, the system becomes fragile: a change in the database schema might force a change in the API contract, or a business rule change might require updating five different controllers.

## Responsibility Allocation

### The Controller: The HTTP Translator
The controller is the entry point. Its sole responsibility is to translate the external world (HTTP) into the internal world (Java). It handles request binding, basic input validation (e.g., ensuring a field isn't null), and mapping the result of a business operation to an HTTP status code. It should not know *how* a shipment is dispatched, only *which* service to call and *what* to tell the client.

### The Service: The Orchestrator
The service layer is where the business process lives. It coordinates the flow of data between the controller and the repositories. It enforces domain invariants—rules that must always be true for the business to function. For example, "a shipment cannot be created if stock is zero" is a business invariant. The service orchestrates the sequence: check stock → select carrier → record shipment.

### The Repository: The Persistence Gateway
The repository is an abstraction over the data store. It should not contain business logic. Its job is to provide a way to retrieve or save entities. While it can handle query-specific logic (like finding a carrier by a specific status), it does not decide *if* a carrier is eligible for a specific order; that decision belongs in the service or the domain model.

## Worked Example: Warehouse Dispatch

Consider a scenario where a warehouse must dispatch an order. The process requires checking stock, selecting a carrier based on availability, and recording the shipment.

### The Implementation Trace

```java
// Illustrative: Domain Entity
public class Shipment {
    private Long id;
    private Long orderId;
    private String carrierName;
    // Getters, constructor
}

// Illustrative: Repository
public interface ShipmentRepository extends JpaRepository<Shipment, Long> {
    // Pure persistence: no business rules here
}

// Illustrative: Service
@Service
public class DispatchService {
    private final ShipmentRepository shipmentRepo;
    private final StockRepository stockRepo;
    private final CarrierRepository carrierRepo;

    public DispatchService(ShipmentRepository sr, StockRepository str, CarrierRepository cr) {
        this.shipmentRepo = sr;
        this.stockRepo = str;
        this.carrierRepo = cr;
    }

    @Transactional
    public Shipment dispatchOrder(Long orderId) {
        // 1. Domain Invariant: Stock must exist
        var stock = stockRepo.findByOrderId(orderId)
            .orElseThrow(() -> new IllegalStateException("No stock available for order"));

        if (stock.getQuantity() <= 0) {
            throw new IllegalStateException("Insufficient stock");
        }

        // 2. Business Decision: Choose eligible carrier
        var carrier = carrierRepo.findFirstAvailable()
            .orElseThrow(() -> new IllegalStateException("No carriers available"));

        // 3. Orchestration: Create and persist
        Shipment shipment = new Shipment(orderId, carrier.getName());
        return shipmentRepo.save(shipment);
    }
}

// Illustrative: Controller
@RestController
@RequestMapping("/dispatch")
public class DispatchController {
    private final DispatchService dispatchService;

    public DispatchController(DispatchService ds) {
        this.dispatchService = ds;
    }

    @PostMapping("/{orderId}")
    public ResponseEntity<ShipmentResponse> handleDispatch(@PathVariable Long orderId) {
        try {
            var shipment = dispatchService.dispatchOrder(orderId);
            return ResponseEntity.ok(new ShipmentResponse(shipment.getId(), "Dispatched"));
        } catch (IllegalStateException e) {
            // Translate business exception to HTTP 400/422
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
```

### Analysis of the Flow
1. **Controller**: Receives the `orderId` from the URL. It doesn't know about `StockRepository`. If the service throws an `IllegalStateException`, the controller decides that this means a `400 Bad Request` to the client.
2. **Service**: This is the "brain." It ensures the stock is checked before the carrier is picked. If we moved the stock check to the repository, the repository would suddenly need to know about the business definition of "available stock." If we moved it to the controller, we couldn't reuse the dispatch logic in a scheduled task or a message queue listener.
3. **Repository**: Simply executes `findByOrderId` or `save`. It doesn't care why the shipment is being saved; it only cares that the SQL is valid.

## Failure Cases and Misplacements

- **The "Fat Controller"**: Putting the `if (stock <= 0)` check in the controller. Result: If you add a second API endpoint for "Bulk Dispatch," you have to duplicate the stock check logic.
- **The "Anemic Service"**: The service just calls `repository.save(entity)`. Result: The controller is forced to handle the business logic, or the logic is leaked into the database via triggers, making the system impossible to test without a database.
- **The "Smart Repository"**: Adding a method `saveIfStockAvailable()`. Result: The repository now depends on the `Stock` table and business rules, violating the single responsibility principle.

## Focused Exercise

**Scenario**: You are adding a "Priority Shipping" feature. Only orders over $100 can use priority carriers. Where should this check live, and how does it affect the layers?

**Answer**:
1. **Controller**: No change, except perhaps accepting a `priority` flag in the request.
2. **Service**: The check `if (order.getTotal() < 100 && priorityRequested) throw ...` must live here. This is a business invariant.
3. **Repository**: No change. It still just fetches the order or saves the shipment. The repository should not know about the $100 threshold.

## Further reading

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)
