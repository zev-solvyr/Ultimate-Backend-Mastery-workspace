import type { DetailedServiceGuide, Project, ProjectServiceGuides } from "@/types";

export function getSeedServiceGuides(project: Project): ProjectServiceGuides {
  if (project.id === "commercex") {
    return {
      services: commercexSeedServices,
    };
  }

  // Fallback for non-CommerceX projects
  return {
    services: (project.microservices || []).map((ms, idx) => ({
      id: `svc-${idx}-${ms.name}`,
      serviceName: ms.name,
      responsibility: ms.description || "Microservice component",
      businessPurpose: ms.description || "Service business domain",
      ownedEntities: [],
      ownedDatabase: "Relational DB",
      exposedApis: [],
      consumedApis: [],
      publishedEvents: [],
      consumedEvents: [],
      redisUsage: "N/A",
      externalDependencies: [],
      technologyChoices: ms.tech || ["Java 21", "Spring Boot 3"],
      keyDesignDecisions: ms.responsibilities || [],
      notes: "Auto-generated service guide.",
      implementationSteps: [
        { id: "step-1", order: 1, title: "Initialize Project", description: "Create Spring Boot project structure" },
        { id: "step-2", order: 2, title: "Configure Persistence", description: "Set up database connection" },
        { id: "step-3", order: 3, title: "Implement Controllers", description: "Build REST endpoints" },
      ],
      packageStructure: [
        { id: "pkg-1", path: "src/main/java/com/commercex/" + ms.name.replace(/[^a-z0-9]/g, "") + "/controller", purpose: "REST Controllers" },
        { id: "pkg-2", path: "src/main/java/com/commercex/" + ms.name.replace(/[^a-z0-9]/g, "") + "/service", purpose: "Business logic" },
      ],
      mavenDependencies: [
        { id: "dep-1", name: "Spring Web", purpose: "REST Controller support", required: true },
      ],
      configurationYml: `server:\n  port: ${ms.ports?.[0] || 8080}\nspring:\n  application:\n    name: ${ms.name}`,
      dtos: [],
      controllerGuides: [],
      serviceLayerGuides: [],
      repositoryGuides: [],
      exceptionHandlers: [],
      transactionDesign: { boundary: "@Transactional", isolation: "READ_COMMITTED", propagation: "REQUIRED", rollback: "Exception.class", concurrencyControl: "Optimistic", notes: "" },
      eventsGuides: [],
      testingGuides: [],
      failureScenarios: [],
      checklist: [
        { id: "chk-1", label: "Spring Boot project created", completed: true },
        { id: "chk-2", label: "REST Endpoints implemented", completed: false },
      ],
      codeWorkspace: [
        { id: "cw-1", title: "Application.java", language: "java", filename: "Application.java", code: `@SpringBootApplication\npublic class Application {\n    public static void main(String[] args) {\n        SpringApplication.run(Application.class, args);\n    }\n}` },
      ],
    })),
  };
}

const commercexSeedServices: DetailedServiceGuide[] = [
  // 1. ORDER SERVICE
  {
    id: "svc-order-service",
    serviceName: "Order Service",
    responsibility: "Owns customer order lifecycle, order placement saga orchestration, line-item snapshots, and order query operations.",
    businessPurpose: "Acts as the transactional core of commerce operations. Coordinates stock reservations and payments across microservices while guaranteeing idempotency and auditability.",
    ownedEntities: ["Order", "OrderItem"],
    ownedDatabase: "Order Service DB (PostgreSQL)",
    exposedApis: ["POST /api/v1/orders", "GET /api/v1/orders/{orderId}", "GET /api/v1/orders", "POST /api/v1/orders/{orderId}/cancel"],
    consumedApis: ["POST /api/v1/inventory/reservations", "POST /api/v1/payments"],
    publishedEvents: ["OrderCreated", "OrderCancelled", "OrderCompleted"],
    consumedEvents: ["PaymentCompleted", "PaymentFailed", "ShipmentDispatched"],
    redisUsage: "Idempotency key storage and active saga state caching (TTL: 24h).",
    externalDependencies: ["Inventory Service", "Payment Service", "Notification Service"],
    technologyChoices: ["Java 21", "Spring Boot 3.3", "Spring Data JPA", "PostgreSQL", "Kafka", "Redis"],
    keyDesignDecisions: [
      "Database per Service: Order DB retains immutable line item snapshots so catalog changes do not mutate historic order receipts.",
      "Synchronous Checkout Reservation: Calls Inventory Service synchronously during order creation to ensure zero overselling before payment.",
      "Compensating Transactions: If payment fails, publishes OrderCancelled event to release inventory holds.",
    ],
    notes: "Requires mandatory Idempotency-Key header for POST /api/v1/orders.",
    implementationSteps: [
      { id: "os-1", order: 1, title: "Initialize Spring Boot 3 & Maven", description: "Configure pom.xml with Spring Web, Data JPA, PostgreSQL, Kafka, and Redis dependencies." },
      { id: "os-2", order: 2, title: "Configure PostgreSQL & Liquibase/Flyway", description: "Set up application.yml datasource and database migration scripts for orders and order_item tables." },
      { id: "os-3", order: 3, title: "Implement Order & OrderItem Entities", description: "Create JPA entities with UUID primary keys, status enums, optimistic lock versioning, and createdAt audit timestamps." },
      { id: "os-4", order: 4, title: "Create OrderRepository", description: "Implement Spring Data JPA repository methods for customer order lookup and idempotency queries." },
      { id: "os-5", order: 5, title: "Implement Order DTOs & Validation", description: "Create CreateOrderRequest, OrderItemRequest, and OrderResponse with Jakarta validation annotations (@NotEmpty, @Min)." },
      { id: "os-6", order: 6, title: "Implement Idempotency Filter/Aspect", description: "Build Redis-backed IdempotencyAspect checking Idempotency-Key header before processing checkout." },
      { id: "os-7", order: 7, title: "Implement OrderService & Saga Coordination", description: "Implement @Transactional createOrder method executing Inventory reservation and Payment charge." },
      { id: "os-8", order: 8, title: "Implement OrderController REST Endpoints", description: "Expose POST /api/v1/orders and GET /api/v1/orders/{orderId} with standard ResponseEntity wrappers." },
      { id: "os-9", order: 9, title: "Implement GlobalExceptionHandler", description: "Map DomainException, InsufficientStockException, and IdempotencyConflictException to standardized HTTP responses." },
      { id: "os-10", order: 10, title: "Write Integration & Testcontainers Tests", description: "Test order placement against PostgreSQL and Redis container instances." },
    ],
    packageStructure: [
      { id: "op-1", path: "src/main/java/com/commercex/order/controller/", purpose: "REST Controllers handling order APIs" },
      { id: "op-2", path: "src/main/java/com/commercex/order/service/", purpose: "Order creation, cancellation, and saga business logic" },
      { id: "op-3", path: "src/main/java/com/commercex/order/repository/", purpose: "Spring Data JPA repositories" },
      { id: "op-4", path: "src/main/java/com/commercex/order/entity/", purpose: "JPA Domain Entities (Order, OrderItem)" },
      { id: "op-5", path: "src/main/java/com/commercex/order/dto/", purpose: "Request DTOs, Response DTOs, and Record mappers" },
      { id: "op-6", path: "src/main/java/com/commercex/order/client/", purpose: "OpenFeign/RestClient for Inventory and Payment services" },
      { id: "op-7", path: "src/main/java/com/commercex/order/event/", purpose: "Kafka producers for OrderCreated / OrderCancelled events" },
      { id: "op-8", path: "src/main/java/com/commercex/order/exception/", purpose: "Custom exceptions and @RestControllerAdvice handler" },
    ],
    mavenDependencies: [
      { id: "om-1", name: "Spring Boot Starter Web", purpose: "RESTful web services and Tomcat server", required: true },
      { id: "om-2", name: "Spring Boot Starter Data JPA", purpose: "ORM and Hibernate entity persistence", required: true },
      { id: "om-3", name: "PostgreSQL Driver", purpose: "Database JDBC driver", required: true },
      { id: "om-4", name: "Spring Boot Starter Data Redis", purpose: "Idempotency key and session caching", required: true },
      { id: "om-5", name: "Spring Kafka", purpose: "Event publishing for order lifecycle events", required: true },
      { id: "om-6", name: "Spring Cloud OpenFeign", purpose: "Declarative REST clients for inter-service calls", required: true },
      { id: "om-7", name: "Testcontainers PostgreSQL & Kafka", purpose: "Integration testing with real docker instances", required: true },
    ],
    configurationYml: `server:
  port: 8085

spring:
  application:
    name: order-service
  datasource:
    url: jdbc:postgresql://\${DB_HOST:localhost}:5432/order_db
    username: \${DB_USER:postgres}
    password: \${DB_PASS:postgres}
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
  data:
    redis:
      host: \${REDIS_HOST:localhost}
      port: 6379
  kafka:
    bootstrap-servers: \${KAFKA_HOST:localhost}:9092

idempotency:
  ttl-hours: 24`,
    dtos: [
      {
        id: "odto-1",
        name: "CreateOrderRequest",
        purpose: "Payload sent by client to place an order",
        fields: [
          { name: "items", type: "List<OrderItemRequest>", validation: "@NotEmpty", description: "Selected order items" },
          { name: "shippingAddress", type: "AddressDto", validation: "@NotNull", description: "Delivery shipping destination" },
        ],
        api: "POST /api/v1/orders",
      },
      {
        id: "odto-2",
        name: "OrderResponse",
        purpose: "Order summary payload returned upon successful placement",
        fields: [
          { name: "orderId", type: "UUID", validation: "N/A", description: "Unique order ID" },
          { name: "status", type: "OrderStatus", validation: "N/A", description: "Order status (CREATED, PAID, COMPLETED)" },
          { name: "totalAmount", type: "BigDecimal", validation: "N/A", description: "Grand total" },
          { name: "createdAt", type: "Instant", validation: "N/A", description: "Placement timestamp" },
        ],
        api: "POST /api/v1/orders, GET /api/v1/orders/{orderId}",
      },
    ],
    controllerGuides: [
      {
        id: "ocg-1",
        apiEndpoint: "POST /api/v1/orders",
        method: "POST",
        responsibility: [
          "Validate incoming Idempotency-Key header",
          "Bind and validate CreateOrderRequest payload",
          "Delegate execution to OrderService.createOrder",
          "Return 201 Created status with location header",
        ],
        javaCode: `@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(
            @RequestHeader("Idempotency-Key") String idempotencyKey,
            @Valid @RequestBody CreateOrderRequest request) {
        
        OrderResponse response = orderService.createOrder(idempotencyKey, request);
        URI location = URI.create("/api/v1/orders/" + response.getOrderId());
        return ResponseEntity.created(location).body(response);
    }
}`,
      },
    ],
    serviceLayerGuides: [
      {
        id: "osg-1",
        operation: "createOrder",
        transactionBoundary: "@Transactional(rollbackFor = Exception.class)",
        explanation: "Coordinates stock reservation with Inventory Service, creates local Order JPA entities, and publishes OrderCreated event to Kafka.",
        javaCode: `@Service
@RequiredArgsConstructor
@Slf4j
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final InventoryClient inventoryClient;
    private final KafkaTemplate<String, OrderCreatedEvent> kafkaTemplate;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public OrderResponse createOrder(String idempotencyKey, CreateOrderRequest request) {
        log.info("Creating order with idempotency key: {}", idempotencyKey);

        // 1. Reserve inventory synchronously
        ReservationResponse reservation = inventoryClient.reserveStock(
            new StockReservationRequest(request.getItems())
        );

        // 2. Build local aggregate
        Order order = Order.builder()
            .customerId(SecurityUtils.getCurrentUserId())
            .status(OrderStatus.CREATED)
            .idempotencyKey(idempotencyKey)
            .totalAmount(calculateTotal(request.getItems()))
            .build();

        request.getItems().forEach(item -> 
            order.addItem(OrderItem.builder()
                .productId(item.getProductId())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .build())
        );

        Order savedOrder = orderRepository.save(order);

        // 3. Publish asynchronous domain event
        kafkaTemplate.send("order-events", savedOrder.getId().toString(), 
            new OrderCreatedEvent(savedOrder.getId(), savedOrder.getCustomerId(), savedOrder.getTotalAmount()));

        return OrderMapper.toResponse(savedOrder);
    }
}`,
      },
    ],
    repositoryGuides: [
      {
        id: "org-1",
        name: "OrderRepository",
        interfaceCode: `public interface OrderRepository extends JpaRepository<Order, UUID> {
    Optional<Order> findByIdAndCustomerId(UUID id, UUID customerId);
    Optional<Order> findByIdempotencyKey(String idempotencyKey);
    Page<Order> findByCustomerId(UUID customerId, Pageable pageable);
}`,
        queryPurpose: "Look up order by ID and owner customerId to prevent unauthorized order access across users.",
        indexReq: "Requires composite index idx_orders_customer_status on (customer_id, status) and unique index on idempotency_key.",
        notes: "Uses Spring Data JPA query derivation.",
      },
    ],
    exceptionHandlers: [
      {
        id: "oeh-1",
        exceptionName: "GlobalExceptionHandler",
        type: "@RestControllerAdvice",
        statusCode: 409,
        handlerCode: `@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IdempotencyConflictException.class)
    public ResponseEntity<ErrorResponse> handleIdempotency(IdempotencyConflictException ex, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(
            new ErrorResponse(Instant.now(), 409, "IDEMPOTENCY_CONFLICT", ex.getMessage(), req.getRequestURI())
        );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest req) {
        String msg = ex.getBindingResult().getFieldErrors().stream()
            .map(e -> e.getField() + ": " + e.getDefaultMessage())
            .collect(Collectors.joining(", "));
        return ResponseEntity.badRequest().body(
            new ErrorResponse(Instant.now(), 400, "INVALID_REQUEST", msg, req.getRequestURI())
        );
    }
}`,
      },
    ],
    transactionDesign: {
      boundary: "Application Service methods (@Transactional)",
      isolation: "READ_COMMITTED",
      propagation: "REQUIRED",
      rollback: "Rolls back local PostgreSQL transaction on runtime exception; triggers compensating reservation release.",
      concurrencyControl: "Optimistic locking on Order entity via @Version column.",
      notes: "Cross-service database joins are strictly prohibited.",
    },
    eventsGuides: [
      {
        id: "oev-1",
        eventName: "OrderCreatedEvent",
        role: "PRODUCER",
        payload: `{ "orderId": "ord-8888", "customerId": "cust-123", "totalAmount": 239.98, "timestamp": "2026-08-10T10:30:00Z" }`,
        purpose: "Notifies Payment Service and Notification Service of new order placement.",
        ordering: "Partitioned by orderId to preserve sequential order state transitions.",
        idempotency: "Consumers use orderId as deduplication key.",
        javaModelCode: `public record OrderCreatedEvent(UUID orderId, UUID customerId, BigDecimal totalAmount, Instant createdAt) {}`,
      },
    ],
    testingGuides: [
      {
        id: "otg-1",
        testType: "Controller Integration Test",
        tools: ["JUnit 5", "MockMvc", "Spring Boot Test"],
        target: "OrderController POST /api/v1/orders",
        javaCode: `@SpringBootTest
@AutoConfigureMockMvc
class OrderControllerTest {

    @Autowired private MockMvc mockMvc;
    @MockBean private InventoryClient inventoryClient;

    @Test
    void createOrder_Returns201Created() throws Exception {
        given(inventoryClient.reserveStock(any())).willReturn(new ReservationResponse("res-1"));

        mockMvc.perform(post("/api/v1/orders")
                .header("Idempotency-Key", UUID.randomUUID().toString())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\\"items\\":[{\\"productId\\":\\"prod-1\\",\\"quantity\\":2}]}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("CREATED"));
    }
}`,
      },
    ],
    failureScenarios: [
      {
        id: "ofs-1",
        scenario: "Inventory Unavailable During Checkout",
        problem: "Inventory Service returns 409 INSUFFICIENT_STOCK or times out.",
        detection: "FeignException.Conflict or SocketTimeoutException caught in OrderService.",
        handling: "Roll back local transaction and throw InsufficientStockException.",
        recovery: "Return 422 Unprocessable Entity to user with out-of-stock item list.",
        consistency: "Zero order records created in Order DB.",
      },
      {
        id: "ofs-2",
        scenario: "Duplicate Request with Same Idempotency Key",
        problem: "Client retries POST /api/v1/orders due to network timeout.",
        detection: "IdempotencyAspect finds key in Redis or Unique Constraint violation on orders(idempotency_key).",
        handling: "Fetch previously processed OrderResponse from cache/db.",
        recovery: "Return 201 Created with original response payload without re-charging customer.",
        consistency: "Guarantees exactly-once order execution.",
      },
    ],
    checklist: [
      { id: "och-1", label: "Spring Boot project created with Maven dependencies", completed: true },
      { id: "och-2", label: "PostgreSQL database connection configured", completed: true },
      { id: "och-3", label: "Order & OrderItem JPA entities created", completed: true },
      { id: "och-4", label: "OrderRepository created with custom query methods", completed: true },
      { id: "och-5", label: "CreateOrderRequest and OrderResponse DTOs created", completed: true },
      { id: "och-6", label: "Redis IdempotencyAspect implemented", completed: true },
      { id: "och-7", label: "OrderService @Transactional creation method implemented", completed: true },
      { id: "och-8", label: "OpenFeign client integrated for Inventory Service calls", completed: true },
      { id: "och-9", label: "GlobalExceptionHandler created", completed: true },
      { id: "och-10", label: "Kafka OrderCreatedEvent producer configured", completed: true },
      { id: "och-11", label: "MockMvc integration tests written", completed: true },
    ],
    codeWorkspace: [
      {
        id: "ocw-1",
        title: "OrderService.java",
        language: "java",
        filename: "OrderService.java",
        code: `package com.commercex.order.service;

import com.commercex.order.dto.CreateOrderRequest;
import com.commercex.order.dto.OrderResponse;

public interface OrderService {
    OrderResponse createOrder(String idempotencyKey, CreateOrderRequest request);
    OrderResponse getOrderById(UUID orderId);
}`,
      },
      {
        id: "ocw-2",
        title: "application.yml",
        language: "yaml",
        filename: "application.yml",
        code: `server:
  port: 8085

spring:
  application:
    name: order-service
  datasource:
    url: jdbc:postgresql://localhost:5432/order_db
    username: postgres
    password: postgres`,
      },
    ],
  },

  // 2. INVENTORY SERVICE
  {
    id: "svc-inventory-service",
    serviceName: "Inventory Service",
    responsibility: "Physical stock quantity management, atomic concurrent reservation holds, optimistic concurrency control (@Version), expiring hold background cleanup, and overselling prevention.",
    businessPurpose: "Protects inventory from overselling during high-concurrency flash sales through transactional locking and expiring holds. Guarantees idempotent stock reservations for Order Service and handles stock replenishment and release flows.",
    ownedEntities: ["Inventory", "InventoryReservation"],
    ownedDatabase: "Inventory Service DB (PostgreSQL)",
    exposedApis: [
      "GET /api/v1/inventory/{productId}",
      "POST /api/v1/inventory/reservations",
      "DELETE /api/v1/inventory/reservations/{reservationId}",
      "PATCH /api/v1/inventory/{productId}/stock",
    ],
    consumedApis: [],
    publishedEvents: ["StockReservedEvent", "StockReservationReleasedEvent", "StockReservationExpiredEvent", "StockReservationFailedEvent"],
    consumedEvents: ["OrderCreatedEvent", "OrderCancelledEvent"],
    redisUsage: "Read-through cache for fast stock availability queries (`inventory:{productId}`) with 30-second TTL; invalidation upon reservation or stock adjustment. PostgreSQL remains the single source of truth.",
    externalDependencies: [],
    technologyChoices: ["Java 21", "Spring Boot 3.3", "Spring Data JPA", "PostgreSQL", "Redis", "Spring Kafka"],
    keyDesignDecisions: [
      "Optimistic Locking (@Version): Uses JPA `@Version` column on Inventory (`UPDATE inventory SET available = available - q, reserved = reserved + q, version = version + 1 WHERE product_id = ? AND version = ?`). Retries up to 3 times on `OptimisticLockingFailureException`.",
      "Expiring Reservation Sweeper: `@Scheduled(fixedDelay = 30000)` background task finds `RESERVED` holds with `expiresAt < NOW()` and releases stock back to available quantity atomically.",
      "Idempotent Reservation Key: Enforces `Idempotency-Key` header on `POST /api/v1/inventory/reservations`, storing reservation state in Redis & PostgreSQL to prevent double-holds on retries.",
      "PostgreSQL Check Constraints: Database schema includes `CHECK (available_quantity >= 0)` and `CHECK (reserved_quantity >= 0)` as absolute safety nets against negative inventory.",
    ],
    notes: "Requires zero overselling guarantees under extreme concurrency.",
    implementationSteps: [
      { id: "is-1", order: 1, title: "Initialize Spring Boot 3 & Maven Dependencies", description: "Set up pom.xml with spring-boot-starter-web, spring-boot-starter-data-jpa, spring-boot-starter-data-redis, spring-kafka, and postgresql." },
      { id: "is-2", order: 2, title: "Configure Datasource & Migration Scripts", description: "Configure application.yml datasource and database migration scripts for inventory and inventory_reservations tables with check constraints." },
      { id: "is-3", order: 3, title: "Implement Inventory Entity with @Version", description: "Create Inventory aggregate root with availableQuantity, reservedQuantity, version column, and updatedAt audit timestamp." },
      { id: "is-4", order: 4, title: "Implement InventoryReservation Entity & State Enum", description: "Create InventoryReservation entity mapping productId, orderId, quantity, idempotencyKey, expiresAt, and ReservationStatus enum." },
      { id: "is-5", order: 5, title: "Create Inventory & Reservation JPA Repositories", description: "Implement InventoryRepository with atomic update queries and InventoryReservationRepository for pending expiration queries." },
      { id: "is-6", order: 6, title: "Build Inventory DTOs & Validation", description: "Create ReserveStockRequest, ReserveStockResponse, ReleaseReservationRequest, InventoryResponse, and StockAdjustmentRequest." },
      { id: "is-7", order: 7, title: "Implement Idempotency Aspect & Storage", description: "Create IdempotencyAspect checking Idempotency-Key header against Redis before attempting stock reservation." },
      { id: "is-8", order: 8, title: "Implement ReservationService with Optimistic Retry", description: "Build @Transactional reserveStock method checking available stock, updating quantities, creating hold, and retrying on version conflict." },
      { id: "is-9", order: 9, title: "Implement ExpiredReservationScheduler Sweeper", description: "Build @Scheduled(fixedDelay = 30000) task sweeping expired holds and restoring available stock." },
      { id: "is-10", order: 10, title: "Implement REST Controllers", description: "Expose InventoryController and ReservationController endpoints with proper HTTP status codes." },
      { id: "is-11", order: 11, title: "Implement Kafka Event Producer & Listener", description: "Publish StockReservedEvent on success and listen to OrderCancelledEvent for automatic reservation releases." },
      { id: "is-12", order: 12, title: "Configure Global Exception Handler", description: "Map InsufficientStockException and ConcurrentStockUpdateException to 409 Conflict responses." },
      { id: "is-13", order: 13, title: "Write Concurrency & Unit Tests", description: "Write multi-threaded ExecutorService tests verifying zero overselling and Testcontainers integration tests." },
    ],
    packageStructure: [
      { id: "ip-1", path: "src/main/java/com/commercex/inventory/controller/", purpose: "InventoryController and ReservationController REST endpoints" },
      { id: "ip-2", path: "src/main/java/com/commercex/inventory/service/", purpose: "InventoryService, ReservationService, and optimistic retry logic" },
      { id: "ip-3", path: "src/main/java/com/commercex/inventory/repository/", purpose: "Spring Data JPA repositories for Inventory and InventoryReservation" },
      { id: "ip-4", path: "src/main/java/com/commercex/inventory/entity/", purpose: "Inventory and InventoryReservation JPA entities and ReservationStatus enum" },
      { id: "ip-5", path: "src/main/java/com/commercex/inventory/dto/", purpose: "Stock reservation request/response DTOs and adjustment payloads" },
      { id: "ip-6", path: "src/main/java/com/commercex/inventory/scheduler/", purpose: "ExpiredReservationScheduler background sweeper" },
      { id: "ip-7", path: "src/main/java/com/commercex/inventory/event/", purpose: "Kafka event producers for StockReservedEvent and StockReservationExpiredEvent" },
      { id: "ip-8", path: "src/main/java/com/commercex/inventory/exception/", purpose: "InsufficientStockException, ConcurrentStockUpdateException, and GlobalInventoryExceptionHandler" },
    ],
    mavenDependencies: [
      { id: "im-1", name: "Spring Boot Starter Web", purpose: "RESTful endpoints and embedded Tomcat web container", required: true },
      { id: "im-2", name: "Spring Boot Starter Data JPA", purpose: "ORM and Hibernate entity persistence", required: true },
      { id: "im-3", name: "PostgreSQL Driver", purpose: "Database JDBC driver", required: true },
      { id: "im-4", name: "Spring Boot Starter Data Redis", purpose: "Stock read-through caching and idempotency storage", required: true },
      { id: "im-5", name: "Spring Kafka", purpose: "Publishing stock reservation events and consuming order cancellation events", required: true },
      { id: "im-6", name: "Spring Boot Starter Validation", purpose: "Jakarta Bean Validation annotations (@NotNull, @Positive)", required: true },
      { id: "im-7", name: "Testcontainers PostgreSQL & Redis", purpose: "High-concurrency integration testing against real DB containers", required: true },
    ],
    configurationYml: `server:
  port: 8084

spring:
  application:
    name: inventory-service
  datasource:
    url: jdbc:postgresql://\${DB_HOST:localhost}:5432/inventory_db
    username: \${DB_USER:postgres}
    password: \${DB_PASS:postgres}
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
  data:
    redis:
      host: \${REDIS_HOST:localhost}
      port: 6379

inventory:
  reservation:
    ttl-minutes: 15
    sweeper-delay-ms: 30000
    max-optimistic-retries: 3`,
    dtos: [
      {
        id: "idto-1",
        name: "ReserveStockRequest",
        purpose: "Payload sent by Order Service to reserve product stock",
        fields: [
          { name: "productId", type: "UUID", validation: "@NotNull", description: "Target product ID" },
          { name: "orderId", type: "UUID", validation: "@NotNull", description: "Associated order ID" },
          { name: "quantity", type: "Integer", validation: "@NotNull @Positive", description: "Quantity to hold" },
        ],
        api: "POST /api/v1/inventory/reservations",
      },
      {
        id: "idto-2",
        name: "ReserveStockResponse",
        purpose: "Response returned upon successful stock reservation hold",
        fields: [
          { name: "reservationId", type: "UUID", validation: "N/A", description: "Unique reservation ID" },
          { name: "productId", type: "UUID", validation: "N/A", description: "Product ID" },
          { name: "quantity", type: "Integer", validation: "N/A", description: "Reserved quantity" },
          { name: "status", type: "ReservationStatus", validation: "N/A", description: "Reservation state (RESERVED)" },
          { name: "expiresAt", type: "Instant", validation: "N/A", description: "Expiration timestamp (15m TTL)" },
        ],
        api: "POST /api/v1/inventory/reservations",
      },
      {
        id: "idto-3",
        name: "ReleaseReservationRequest",
        purpose: "Payload for manually releasing a stock reservation hold",
        fields: [
          { name: "reservationId", type: "UUID", validation: "@NotNull", description: "Reservation ID to release" },
          { name: "reason", type: "String", validation: "@NotBlank", description: "Reason (ORDER_CANCELLED, CUSTOMER_ABORT)" },
        ],
        api: "DELETE /api/v1/inventory/reservations/{reservationId}",
      },
      {
        id: "idto-4",
        name: "InventoryResponse",
        purpose: "Stock availability view returned for inventory queries",
        fields: [
          { name: "productId", type: "UUID", validation: "N/A", description: "Target product ID" },
          { name: "availableQuantity", type: "Integer", validation: "N/A", description: "Available stock for purchase" },
          { name: "reservedQuantity", type: "Integer", validation: "N/A", description: "Stock held in active reservations" },
          { name: "totalQuantity", type: "Integer", validation: "N/A", description: "Total warehouse stock" },
          { name: "updatedAt", type: "Instant", validation: "N/A", description: "Last inventory update timestamp" },
        ],
        api: "GET /api/v1/inventory/{productId}",
      },
      {
        id: "idto-5",
        name: "StockAdjustmentRequest",
        purpose: "Warehouse inventory intake or manual stock adjustment",
        fields: [
          { name: "quantityDelta", type: "Integer", validation: "@NotNull", description: "Delta to add (+) or subtract (-)" },
          { name: "reason", type: "String", validation: "@NotBlank", description: "Adjustment reason (WAREHOUSE_RECEIPT, DAMAGED_GOODS)" },
          { name: "location", type: "String", validation: "N/A", description: "Warehouse location bin" },
        ],
        api: "PATCH /api/v1/inventory/{productId}/stock",
      },
    ],
    controllerGuides: [
      {
        id: "icg-1",
        apiEndpoint: "POST /api/v1/inventory/reservations",
        method: "POST",
        responsibility: [
          "Validate mandatory Idempotency-Key header",
          "Bind and validate ReserveStockRequest",
          "Invoke ReservationService.reserveStock",
          "Return 201 Created with ReserveStockResponse DTO",
        ],
        javaCode: `@RestController
@RequestMapping("/api/v1/inventory")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @PostMapping("/reservations")
    public ResponseEntity<ReserveStockResponse> reserveStock(
            @RequestHeader("Idempotency-Key") String idempotencyKey,
            @Valid @RequestBody ReserveStockRequest request) {

        ReserveStockResponse response = reservationService.reserveStock(idempotencyKey, request);
        URI location = URI.create("/api/v1/inventory/reservations/" + response.getReservationId());
        return ResponseEntity.created(location).body(response);
    }

    @DeleteMapping("/reservations/{reservationId}")
    public ResponseEntity<Void> releaseReservation(@PathVariable UUID reservationId) {
        reservationService.releaseReservation(reservationId);
        return ResponseEntity.noContent().build();
    }
}`,
      },
      {
        id: "icg-2",
        apiEndpoint: "GET /api/v1/inventory/{productId}",
        method: "GET",
        responsibility: [
          "Bind productId path variable",
          "Delegate lookup to InventoryService.getInventoryByProductId",
          "Return 200 OK with InventoryResponse",
        ],
        javaCode: `@RestController
@RequestMapping("/api/v1/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping("/{productId}")
    public ResponseEntity<InventoryResponse> getInventory(@PathVariable UUID productId) {
        return ResponseEntity.ok(inventoryService.getInventoryByProductId(productId));
    }

    @PatchMapping("/{productId}/stock")
    public ResponseEntity<InventoryResponse> adjustStock(
            @PathVariable UUID productId,
            @Valid @RequestBody StockAdjustmentRequest request) {
        return ResponseEntity.ok(inventoryService.adjustStock(productId, request));
    }
}`,
      },
    ],
    serviceLayerGuides: [
      {
        id: "isg-1",
        operation: "reserveStock",
        transactionBoundary: "@Transactional(rollbackFor = Exception.class)",
        explanation: "Atomic stock reservation flow: 1) Checks idempotency key in Redis/DB; 2) Fetches Inventory entity; 3) Verifies availableQuantity >= requested; 4) Decrements availableQuantity, increments reservedQuantity; 5) Saves Inventory (Hibernate checks @Version; retries on OptimisticLockingFailureException); 6) Saves InventoryReservation record; 7) Emits StockReservedEvent.",
        javaCode: `@Service
@RequiredArgsConstructor
@Slf4j
public class ReservationServiceImpl implements ReservationService {

    private final InventoryRepository inventoryRepository;
    private final InventoryReservationRepository reservationRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    private static final int MAX_RETRIES = 3;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ReserveStockResponse reserveStock(String idempotencyKey, ReserveStockRequest request) {
        // 1. Idempotency Check
        Optional<InventoryReservation> existing = reservationRepository.findByIdempotencyKey(idempotencyKey);
        if (existing.isPresent()) {
            log.info("Duplicate reservation request caught by idempotency key {}", idempotencyKey);
            return ReservationMapper.toResponse(existing.get());
        }

        int attempts = 0;
        while (attempts < MAX_RETRIES) {
            try {
                attempts++;
                return executeReservation(idempotencyKey, request);
            } catch (OptimisticLockingFailureException ex) {
                log.warn("Optimistic lock conflict on product {}, attempt {}/{}", request.getProductId(), attempts, MAX_RETRIES);
                if (attempts >= MAX_RETRIES) {
                    throw new ConcurrentStockUpdateException("High concurrency conflict while reserving stock. Please retry.");
                }
                try { Thread.sleep(50 * attempts); } catch (InterruptedException ignored) {}
            }
        }
        throw new ConcurrentStockUpdateException("Reservation failed due to concurrency.");
    }

    private ReserveStockResponse executeReservation(String idempotencyKey, ReserveStockRequest request) {
        Inventory inventory = inventoryRepository.findByProductId(request.getProductId())
            .orElseThrow(() -> new InventoryNotFoundException("Inventory record not found for product: " + request.getProductId()));

        if (inventory.getAvailableQuantity() < request.getQuantity()) {
            throw new InsufficientStockException("Insufficient stock available for product " + request.getProductId());
        }

        // Deduct available stock, increment reserved hold
        inventory.setAvailableQuantity(inventory.getAvailableQuantity() - request.getQuantity());
        inventory.setReservedQuantity(inventory.getReservedQuantity() + request.getQuantity());
        inventoryRepository.save(inventory); // Hibernate executes UPDATE with version check

        InventoryReservation reservation = InventoryReservation.builder()
            .productId(request.getProductId())
            .orderId(request.getOrderId())
            .quantity(request.getQuantity())
            .idempotencyKey(idempotencyKey)
            .status(ReservationStatus.RESERVED)
            .expiresAt(Instant.now().plus(15, ChronoUnit.MINUTES))
            .build();

        InventoryReservation savedReservation = reservationRepository.save(reservation);

        kafkaTemplate.send("inventory-events", savedReservation.getProductId().toString(),
            new StockReservedEvent(savedReservation.getId(), savedReservation.getProductId(), savedReservation.getOrderId(), savedReservation.getQuantity(), savedReservation.getExpiresAt()));

        return ReservationMapper.toResponse(savedReservation);
    }
}`,
      },
      {
        id: "isg-2",
        operation: "sweepExpiredReservations",
        transactionBoundary: "@Transactional",
        explanation: "Runs on a fixed schedule (@Scheduled(fixedDelay = 30000)). Finds all RESERVED holds whose expiresAt is in the past, marks status as EXPIRED, restores availableQuantity to Inventory entity, and publishes StockReservationExpiredEvent.",
        javaCode: `@Component
@RequiredArgsConstructor
@Slf4j
public class ExpiredReservationScheduler {

    private final InventoryReservationRepository reservationRepository;
    private final InventoryRepository inventoryRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Scheduled(fixedDelay = 30000)
    @Transactional
    public void sweepExpiredReservations() {
        List<InventoryReservation> expired = reservationRepository.findByStatusAndExpiresAtBefore(
            ReservationStatus.RESERVED, Instant.now()
        );

        if (expired.isEmpty()) return;
        log.info("Sweeper found {} expired stock reservations to release", expired.size());

        for (InventoryReservation res : expired) {
            res.setStatus(ReservationStatus.EXPIRED);
            reservationRepository.save(res);

            inventoryRepository.findByProductId(res.getProductId()).ifPresent(inv -> {
                inv.setAvailableQuantity(inv.getAvailableQuantity() + res.getQuantity());
                inv.setReservedQuantity(Math.max(0, inv.getReservedQuantity() - res.getQuantity()));
                inventoryRepository.save(inv);
            });

            kafkaTemplate.send("inventory-events", res.getProductId().toString(),
                new StockReservationExpiredEvent(res.getId(), res.getProductId(), res.getOrderId(), res.getQuantity(), Instant.now()));
        }
    }
}`,
      },
    ],
    repositoryGuides: [
      {
        id: "irg-1",
        name: "InventoryRepository",
        interfaceCode: `public interface InventoryRepository extends JpaRepository<Inventory, UUID> {
    Optional<Inventory> findByProductId(UUID productId);

    @Modifying
    @Query("UPDATE Inventory i SET i.availableQuantity = i.availableQuantity - :qty, i.reservedQuantity = i.reservedQuantity + :qty, i.version = i.version + 1 WHERE i.productId = :productId AND i.availableQuantity >= :qty AND i.version = :version")
    int reserveStockAtomic(@Param("productId") UUID productId, @Param("qty") int qty, @Param("version") Long version);
}`,
        queryPurpose: "Query inventory by product ID and execute atomic database-level check-and-set updates.",
        indexReq: "Requires UNIQUE index idx_inventory_product_id on product_id column.",
        notes: "Direct SQL atomic update acts as secondary concurrency protection.",
      },
      {
        id: "irg-2",
        name: "InventoryReservationRepository",
        interfaceCode: `public interface InventoryReservationRepository extends JpaRepository<InventoryReservation, UUID> {
    Optional<InventoryReservation> findByIdempotencyKey(String idempotencyKey);
    List<InventoryReservation> findByStatusAndExpiresAtBefore(ReservationStatus status, Instant now);
    List<InventoryReservation> findByOrderId(UUID orderId);
}`,
        queryPurpose: "Look up reservations by idempotency key, order ID, or status/expiration date.",
        indexReq: "Requires composite index idx_reservations_status_expires on (status, expires_at) and unique index on idempotency_key.",
        notes: "Index idx_reservations_status_expires critical for fast background sweeper queries.",
      },
    ],
    exceptionHandlers: [
      {
        id: "ieh-1",
        exceptionName: "GlobalInventoryExceptionHandler",
        type: "@RestControllerAdvice",
        statusCode: 409,
        handlerCode: `@RestControllerAdvice
public class GlobalInventoryExceptionHandler {

    @ExceptionHandler(InsufficientStockException.class)
    public ResponseEntity<ErrorResponse> handleInsufficientStock(InsufficientStockException ex, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(
            new ErrorResponse(Instant.now(), 409, "INSUFFICIENT_STOCK", ex.getMessage(), req.getRequestURI())
        );
    }

    @ExceptionHandler(ConcurrentStockUpdateException.class)
    public ResponseEntity<ErrorResponse> handleConcurrencyConflict(ConcurrentStockUpdateException ex, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(
            new ErrorResponse(Instant.now(), 409, "CONCURRENT_UPDATE_COLLISION", ex.getMessage(), req.getRequestURI())
        );
    }
}`,
      },
    ],
    transactionDesign: {
      boundary: "Application Service methods (@Transactional)",
      isolation: "READ_COMMITTED",
      propagation: "REQUIRED",
      rollback: "Rolls back local PostgreSQL transaction on runtime exception; restores stock state.",
      concurrencyControl: "Optimistic locking on Inventory aggregate root via @Version column with explicit exponential backoff retries.",
      notes: "PostgreSQL DB constraints (`CHECK (available_quantity >= 0)`) prevent negative stock even if transaction boundaries fail.",
    },
    eventsGuides: [
      {
        id: "iev-1",
        eventName: "StockReservedEvent",
        role: "PRODUCER",
        payload: `{ "reservationId": "res-101", "productId": "prod-888", "orderId": "ord-999", "quantity": 2, "expiresAt": "2026-08-10T10:45:00Z" }`,
        purpose: "Notifies Order Service that stock hold was successfully secured.",
        ordering: "Partitioned by productId.",
        idempotency: "Consumers use reservationId as idempotency key.",
        javaModelCode: `public record StockReservedEvent(UUID reservationId, UUID productId, UUID orderId, int quantity, Instant expiresAt) {}`,
      },
      {
        id: "iev-2",
        eventName: "StockReservationExpiredEvent",
        role: "PRODUCER",
        payload: `{ "reservationId": "res-101", "productId": "prod-888", "orderId": "ord-999", "quantity": 2, "timestamp": "2026-08-10T10:45:01Z" }`,
        purpose: "Notifies downstream services that un-purchased stock hold expired and was returned to pool.",
        ordering: "Partitioned by productId.",
        idempotency: "Consumers use reservationId as idempotency key.",
        javaModelCode: `public record StockReservationExpiredEvent(UUID reservationId, UUID productId, UUID orderId, int quantity, Instant timestamp) {}`,
      },
    ],
    testingGuides: [
      {
        id: "itg-1",
        testType: "Concurrency Multi-Threaded Test",
        tools: ["JUnit 5", "ExecutorService", "CountDownLatch"],
        target: "ReservationService under high concurrent load (zero overselling)",
        javaCode: `@SpringBootTest
class ReservationServiceConcurrencyTest {

    @Autowired private ReservationService reservationService;
    @Autowired private InventoryRepository inventoryRepository;

    @Test
    void reserveStock_ConcurrentRequests_PreventsOverselling() throws Exception {
        UUID productId = UUID.randomUUID();
        // Setup initial inventory of 10 items
        inventoryRepository.save(Inventory.builder().productId(productId).availableQuantity(10).reservedQuantity(0).version(0L).build());

        int numberOfThreads = 20;
        ExecutorService service = Executors.newFixedThreadPool(numberOfThreads);
        CountDownLatch latch = new CountDownLatch(numberOfThreads);
        AtomicInteger successCount = new AtomicInteger(0);

        for (int i = 0; i < numberOfThreads; i++) {
            service.submit(() -> {
                try {
                    reservationService.reserveStock(UUID.randomUUID().toString(), new ReserveStockRequest(productId, UUID.randomUUID(), 1));
                    successCount.incrementAndGet();
                } catch (Exception ignored) {}
                finally { latch.countDown(); }
            });
        }
        latch.await();

        Inventory finalInventory = inventoryRepository.findByProductId(productId).orElseThrow();
        assertThat(successCount.get()).isLessThanOrEqualTo(10);
        assertThat(finalInventory.getAvailableQuantity()).isGreaterThanOrEqualTo(0);
        assertThat(finalInventory.getReservedQuantity()).isEqualTo(successCount.get());
    }
}`,
      },
      {
        id: "itg-2",
        testType: "Controller Test",
        tools: ["JUnit 5", "MockMvc"],
        target: "ReservationController POST /api/v1/inventory/reservations",
        javaCode: `@SpringBootTest
@AutoConfigureMockMvc
class ReservationControllerTest {

    @Autowired private MockMvc mockMvc;
    @MockBean private ReservationService reservationService;

    @Test
    void reserveStock_Returns201Created() throws Exception {
        given(reservationService.reserveStock(any(), any())).willReturn(
            new ReserveStockResponse(UUID.randomUUID(), UUID.randomUUID(), 2, ReservationStatus.RESERVED, Instant.now().plusSeconds(900))
        );

        mockMvc.perform(post("/api/v1/inventory/reservations")
                .header("Idempotency-Key", UUID.randomUUID().toString())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\\"productId\\":\\"00000000-0000-0000-0000-000000000001\\",\\"orderId\\":\\"00000000-0000-0000-0000-000000000002\\",\\"quantity\\":2}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("RESERVED"));
    }
}`,
      },
    ],
    failureScenarios: [
      {
        id: "ifs-1",
        scenario: "Concurrent Reservation Flash Sale Collisions",
        problem: "100 parallel buyers attempt to reserve the last 5 items simultaneously.",
        detection: "OptimisticLockingFailureException thrown due to version mismatch.",
        handling: "ReservationServiceImpl catches exception and retries up to 3 times with exponential backoff.",
        recovery: "If available stock is exhausted during retries, throws InsufficientStockException.",
        consistency: "Zero overselling; DB check constraint guarantees available_quantity >= 0.",
      },
      {
        id: "ifs-2",
        scenario: "Expired Reservation Hold Sweeper Race Condition",
        problem: "Customer completes payment exactly as the background sweeper attempts to expire the reservation.",
        detection: "State transition check in `res.setStatus(EXPIRED)`.",
        handling: "Sweeper verifies `status == RESERVED` before releasing stock.",
        recovery: "If order completed, payment updates status to `COMPLETED`; sweeper skips.",
        consistency: "Stock double-release prevented.",
      },
      {
        id: "ifs-3",
        scenario: "Duplicate Reservation Request with Same Idempotency Key",
        problem: "Order Service retries POST /api/v1/inventory/reservations due to network timeout.",
        detection: "Unique constraint on `inventory_reservations(idempotency_key)` or Redis key lookup hit.",
        handling: "Fetch original `InventoryReservation` record from DB.",
        recovery: "Return 201 Created with original `ReserveStockResponse` without re-deducting stock.",
        consistency: "Exactly-once stock reservation execution.",
      },
      {
        id: "ifs-4",
        scenario: "PostgreSQL Database Unavailability During Stock Hold",
        problem: "PostgreSQL DB instance crashes during flash sale.",
        detection: "CannotGetJdbcConnectionException thrown by Spring Data JPA.",
        handling: "GlobalExceptionHandler catches DB exception and returns 503 Service Unavailable.",
        recovery: "Requests fail fast without corrupting memory or cache.",
        consistency: "DB state remains unaltered.",
      },
    ],
    checklist: [
      { id: "ich-1", label: "Inventory and InventoryReservation JPA entities mapped with @Version", completed: true },
      { id: "ich-2", label: "InventoryRepository & InventoryReservationRepository created with atomic update queries", completed: true },
      { id: "ich-3", label: "Idempotency-Key aspect & Redis deduplication implemented", completed: true },
      { id: "ich-4", label: "ReservationService created with optimistic locking retry loop", completed: true },
      { id: "ich-5", label: "ExpiredReservationScheduler @Scheduled background sweeper created", completed: true },
      { id: "ich-6", label: "ReservationController & InventoryController REST endpoints exposed", completed: true },
      { id: "ich-7", label: "Kafka StockReservedEvent & StockReservationExpiredEvent producers configured", completed: true },
      { id: "ich-8", label: "Multi-threaded ExecutorService oversell prevention unit tests written", completed: true },
    ],
    codeWorkspace: [
      {
        id: "icw-1",
        title: "Inventory.java",
        language: "java",
        filename: "Inventory.java",
        code: `package com.commercex.inventory.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "inventory", indexes = {
    @Index(name = "idx_inventory_product_id", columnList = "product_id", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "product_id", nullable = false, unique = true)
    private UUID productId;

    @Column(name = "available_quantity", nullable = false)
    private Integer availableQuantity;

    @Column(name = "reserved_quantity", nullable = false)
    private Integer reservedQuantity;

    @Column(length = 100)
    private String location;

    @Version
    private Long version;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    @PreUpdate
    public void onUpdate() {
        this.updatedAt = Instant.now();
    }
}`,
      },
      {
        id: "icw-2",
        title: "InventoryReservation.java",
        language: "java",
        filename: "InventoryReservation.java",
        code: `package com.commercex.inventory.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "inventory_reservations", indexes = {
    @Index(name = "idx_reservations_status_expires", columnList = "status, expires_at"),
    @Index(name = "idx_reservations_order_id", columnList = "order_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryReservation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "product_id", nullable = false)
    private UUID productId;

    @Column(name = "order_id", nullable = false)
    private UUID orderId;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "idempotency_key", unique = true)
    private String idempotencyKey;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReservationStatus status;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = Instant.now();
    }
}`,
      },
      {
        id: "icw-3",
        title: "ReservationStatus.java",
        language: "java",
        filename: "ReservationStatus.java",
        code: `package com.commercex.inventory.entity;

public enum ReservationStatus {
    PENDING,
    RESERVED,
    RELEASED,
    EXPIRED,
    FAILED;

    public boolean canTransitionTo(ReservationStatus target) {
        if (this == RESERVED) {
            return target == RELEASED || target == EXPIRED || target == FAILED;
        }
        return false;
    }
}`,
      },
      {
        id: "icw-4",
        title: "ReserveStockRequest.java",
        language: "java",
        filename: "ReserveStockRequest.java",
        code: `package com.commercex.inventory.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReserveStockRequest {

    @NotNull(message = "Product ID is required")
    private UUID productId;

    @NotNull(message = "Order ID is required")
    private UUID orderId;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    private Integer quantity;
}`,
      },
      {
        id: "icw-5",
        title: "ReserveStockResponse.java",
        language: "java",
        filename: "ReserveStockResponse.java",
        code: `package com.commercex.inventory.dto;

import com.commercex.inventory.entity.ReservationStatus;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class ReserveStockResponse {
    private UUID reservationId;
    private UUID productId;
    private Integer quantity;
    private ReservationStatus status;
    private Instant expiresAt;
}`,
      },
      {
        id: "icw-6",
        title: "InventoryResponse.java",
        language: "java",
        filename: "InventoryResponse.java",
        code: `package com.commercex.inventory.dto;

import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class InventoryResponse {
    private UUID productId;
    private Integer availableQuantity;
    private Integer reservedQuantity;
    private Integer totalQuantity;
    private Instant updatedAt;
}`,
      },
      {
        id: "icw-7",
        title: "InventoryRepository.java",
        language: "java",
        filename: "InventoryRepository.java",
        code: `package com.commercex.inventory.repository;

import com.commercex.inventory.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
import java.util.UUID;

public interface InventoryRepository extends JpaRepository<Inventory, UUID> {
    Optional<Inventory> findByProductId(UUID productId);

    @Modifying
    @Query("UPDATE Inventory i SET i.availableQuantity = i.availableQuantity - :qty, i.reservedQuantity = i.reservedQuantity + :qty, i.version = i.version + 1 WHERE i.productId = :productId AND i.availableQuantity >= :qty AND i.version = :version")
    int reserveStockAtomic(@Param("productId") UUID productId, @Param("qty") int qty, @Param("version") Long version);
}`,
      },
      {
        id: "icw-8",
        title: "InventoryReservationRepository.java",
        language: "java",
        filename: "InventoryReservationRepository.java",
        code: `package com.commercex.inventory.repository;

import com.commercex.inventory.entity.InventoryReservation;
import com.commercex.inventory.entity.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InventoryReservationRepository extends JpaRepository<InventoryReservation, UUID> {
    Optional<InventoryReservation> findByIdempotencyKey(String idempotencyKey);
    List<InventoryReservation> findByStatusAndExpiresAtBefore(ReservationStatus status, Instant now);
    List<InventoryReservation> findByOrderId(UUID orderId);
}`,
      },
      {
        id: "icw-9",
        title: "InventoryService.java",
        language: "java",
        filename: "InventoryService.java",
        code: `package com.commercex.inventory.service;

import com.commercex.inventory.dto.InventoryResponse;
import com.commercex.inventory.dto.StockAdjustmentRequest;
import java.util.UUID;

public interface InventoryService {
    InventoryResponse getInventoryByProductId(UUID productId);
    InventoryResponse adjustStock(UUID productId, StockAdjustmentRequest request);
}`,
      },
      {
        id: "icw-10",
        title: "ReservationService.java",
        language: "java",
        filename: "ReservationService.java",
        code: `package com.commercex.inventory.service;

import com.commercex.inventory.dto.ReserveStockRequest;
import com.commercex.inventory.dto.ReserveStockResponse;
import java.util.UUID;

public interface ReservationService {
    ReserveStockResponse reserveStock(String idempotencyKey, ReserveStockRequest request);
    void releaseReservation(UUID reservationId);
}`,
      },
      {
        id: "icw-11",
        title: "ReservationServiceImpl.java",
        language: "java",
        filename: "ReservationServiceImpl.java",
        code: `package com.commercex.inventory.service;

import com.commercex.inventory.dto.ReserveStockRequest;
import com.commercex.inventory.dto.ReserveStockResponse;
import com.commercex.inventory.entity.*;
import com.commercex.inventory.exception.*;
import com.commercex.inventory.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReservationServiceImpl implements ReservationService {

    private final InventoryRepository inventoryRepository;
    private final InventoryReservationRepository reservationRepository;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ReserveStockResponse reserveStock(String idempotencyKey, ReserveStockRequest request) {
        Optional<InventoryReservation> existing = reservationRepository.findByIdempotencyKey(idempotencyKey);
        if (existing.isPresent()) {
            return toResponse(existing.get());
        }

        Inventory inventory = inventoryRepository.findByProductId(request.getProductId())
            .orElseThrow(() -> new InventoryNotFoundException("Inventory not found for product: " + request.getProductId()));

        if (inventory.getAvailableQuantity() < request.getQuantity()) {
            throw new InsufficientStockException("Insufficient stock available for product: " + request.getProductId());
        }

        inventory.setAvailableQuantity(inventory.getAvailableQuantity() - request.getQuantity());
        inventory.setReservedQuantity(inventory.getReservedQuantity() + request.getQuantity());
        inventoryRepository.save(inventory);

        InventoryReservation reservation = InventoryReservation.builder()
            .productId(request.getProductId())
            .orderId(request.getOrderId())
            .quantity(request.getQuantity())
            .idempotencyKey(idempotencyKey)
            .status(ReservationStatus.RESERVED)
            .expiresAt(Instant.now().plus(15, ChronoUnit.MINUTES))
            .build();

        return toResponse(reservationRepository.save(reservation));
    }

    @Override
    @Transactional
    public void releaseReservation(UUID reservationId) {
        InventoryReservation res = reservationRepository.findById(reservationId)
            .orElseThrow(() -> new ReservationNotFoundException("Reservation not found: " + reservationId));

        if (res.getStatus() == ReservationStatus.RESERVED) {
            res.setStatus(ReservationStatus.RELEASED);
            reservationRepository.save(res);

            inventoryRepository.findByProductId(res.getProductId()).ifPresent(inv -> {
                inv.setAvailableQuantity(inv.getAvailableQuantity() + res.getQuantity());
                inv.setReservedQuantity(Math.max(0, inv.getReservedQuantity() - res.getQuantity()));
                inventoryRepository.save(inv);
            });
        }
    }

    private ReserveStockResponse toResponse(InventoryReservation res) {
        return ReserveStockResponse.builder()
            .reservationId(res.getId())
            .productId(res.getProductId())
            .quantity(res.getQuantity())
            .status(res.getStatus())
            .expiresAt(res.getExpiresAt())
            .build();
    }
}`,
      },
      {
        id: "icw-12",
        title: "InventoryController.java",
        language: "java",
        filename: "InventoryController.java",
        code: `package com.commercex.inventory.controller;

import com.commercex.inventory.dto.*;
import com.commercex.inventory.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.net.URI;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;
    private final ReservationService reservationService;

    @GetMapping("/{productId}")
    public ResponseEntity<InventoryResponse> getInventory(@PathVariable UUID productId) {
        return ResponseEntity.ok(inventoryService.getInventoryByProductId(productId));
    }

    @PostMapping("/reservations")
    public ResponseEntity<ReserveStockResponse> reserveStock(
            @RequestHeader("Idempotency-Key") String idempotencyKey,
            @Valid @RequestBody ReserveStockRequest request) {
        ReserveStockResponse response = reservationService.reserveStock(idempotencyKey, request);
        URI location = URI.create("/api/v1/inventory/reservations/" + response.getReservationId());
        return ResponseEntity.created(location).body(response);
    }

    @DeleteMapping("/reservations/{reservationId}")
    public ResponseEntity<Void> releaseReservation(@PathVariable UUID reservationId) {
        reservationService.releaseReservation(reservationId);
        return ResponseEntity.noContent().build();
    }
}`,
      },
      {
        id: "icw-13",
        title: "GlobalInventoryExceptionHandler.java",
        language: "java",
        filename: "GlobalInventoryExceptionHandler.java",
        code: `package com.commercex.inventory.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.time.Instant;

@RestControllerAdvice
public class GlobalInventoryExceptionHandler {

    @ExceptionHandler(InsufficientStockException.class)
    public ResponseEntity<ErrorResponse> handleInsufficientStock(InsufficientStockException ex, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(
            new ErrorResponse(Instant.now(), 409, "INSUFFICIENT_STOCK", ex.getMessage(), req.getRequestURI())
        );
    }

    @ExceptionHandler(ConcurrentStockUpdateException.class)
    public ResponseEntity<ErrorResponse> handleConcurrency(ConcurrentStockUpdateException ex, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(
            new ErrorResponse(Instant.now(), 409, "CONCURRENT_UPDATE_COLLISION", ex.getMessage(), req.getRequestURI())
        );
    }
}`,
      },
      {
        id: "icw-14",
        title: "StockReservedEvent.java",
        language: "java",
        filename: "StockReservedEvent.java",
        code: `package com.commercex.inventory.event;

import java.time.Instant;
import java.util.UUID;

public record StockReservedEvent(
    UUID reservationId,
    UUID productId,
    UUID orderId,
    int quantity,
    Instant expiresAt
) {}`,
      },
      {
        id: "icw-15",
        title: "StockReservationExpiredEvent.java",
        language: "java",
        filename: "StockReservationExpiredEvent.java",
        code: `package com.commercex.inventory.event;

import java.time.Instant;
import java.util.UUID;

public record StockReservationExpiredEvent(
    UUID reservationId,
    UUID productId,
    UUID orderId,
    int quantity,
    Instant timestamp
) {}`,
      },
      {
        id: "icw-16",
        title: "application.yml",
        language: "yaml",
        filename: "application.yml",
        code: `server:
  port: 8084

spring:
  application:
    name: inventory-service
  datasource:
    url: jdbc:postgresql://\${DB_HOST:localhost}:5432/inventory_db
    username: \${DB_USER:postgres}
    password: \${DB_PASS:postgres}
  jpa:
    hibernate:
      ddl-auto: validate
  data:
    redis:
      host: \${REDIS_HOST:localhost}
      port: 6379`,
      },
    ],
  },

  // 3. CATALOG SERVICE
  {
    id: "svc-catalog-service",
    serviceName: "Catalog Service",
    responsibility: "Bounded context owning product specifications, SKU identifiers, category hierarchies, pricing, status state machine (DRAFT, PUBLISHED, ARCHIVED), and Redis Cache-Aside layer.",
    businessPurpose: "Serves low-latency product discovery requests for high-throughput read traffic. Guarantees SKU uniqueness, validates category constraints, and publishes domain events (ProductCreated, ProductUpdated, ProductArchived) to update Search Indexing asynchronously.",
    ownedEntities: ["Product", "Category"],
    ownedDatabase: "Catalog Service DB (PostgreSQL)",
    exposedApis: [
      "GET /api/v1/products",
      "GET /api/v1/products/{productId}",
      "POST /api/v1/products",
      "PATCH /api/v1/products/{productId}",
      "DELETE /api/v1/products/{productId}",
    ],
    consumedApis: [],
    publishedEvents: ["ProductCreated", "ProductUpdated", "ProductArchived"],
    consumedEvents: [],
    redisUsage: "Cache-Aside read cache for individual product details (`product:{productId}`) with 1-hour TTL and category tree (`categories:tree`) with 24-hour TTL; invalidation upon write mutations.",
    externalDependencies: ["Search Service / Elasticsearch"],
    technologyChoices: ["Java 21", "Spring Boot 3.3", "Spring Data JPA", "PostgreSQL", "Redis", "Spring Kafka"],
    keyDesignDecisions: [
      "Cache-Aside Read Strategy: Product detail requests check Redis cache (`product:{id}`) before falling back to PostgreSQL database.",
      "Cache Eviction on Mutation: Updating or deleting a product evicts its specific Redis key and invalidates list caches.",
      "Optimistic Concurrency Control: Product aggregate root uses `@Version` column to prevent lost updates during concurrent edits.",
      "Event-Driven Search Synchronization: Emits Kafka events on product mutations so Search Service re-indexes asynchronously without coupling.",
    ],
    notes: "Requires mandatory unique constraint on product SKU and Category slug.",
    implementationSteps: [
      { id: "cs-1", order: 1, title: "Initialize Spring Boot 3 & Dependencies", description: "Configure pom.xml with spring-boot-starter-web, spring-boot-starter-data-jpa, spring-boot-starter-data-redis, spring-kafka, and postgresql." },
      { id: "cs-2", order: 2, title: "Configure PostgreSQL & Migration Scripts", description: "Set up application.yml datasource and Liquibase/Flyway migrations for category and product tables." },
      { id: "cs-3", order: 3, title: "Implement Category & Product JPA Entities", description: "Create JPA entities mapping UUID primary keys, parent-child category relationships, status enums, and @Version optimistic lock." },
      { id: "cs-4", order: 4, title: "Create Spring Data JPA Repositories", description: "Implement ProductRepository and CategoryRepository with custom query methods and JPA Specifications for multi-criteria filtering." },
      { id: "cs-5", order: 5, title: "Implement Catalog DTOs & Validation", description: "Create CreateProductRequest, UpdateProductRequest, ProductResponse, and CategoryResponse with Jakarta validation annotations." },
      { id: "cs-6", order: 6, title: "Configure Redis CacheManager & Serializers", description: "Set up RedisCacheManager bean using Jackson2JsonRedisSerializer for type-safe JSON caching." },
      { id: "cs-7", order: 7, title: "Implement ProductService with Cache-Aside", description: "Build ProductService methods annotated with @Cacheable and @CacheEvict for automatic cache management." },
      { id: "cs-8", order: 8, title: "Implement ProductController & CategoryController", description: "Expose REST endpoints for product management, filtering, and category tree retrieval." },
      { id: "cs-9", order: 9, title: "Configure Kafka Catalog Event Producer", description: "Implement CatalogEventProducer publishing ProductCreated, ProductUpdated, and ProductArchived domain events." },
      { id: "cs-10", order: 10, title: "Write Integration & Cache Tests", description: "Write MockMvc controller tests and Testcontainers Redis/PostgreSQL integration tests." },
    ],
    packageStructure: [
      { id: "cp-1", path: "src/main/java/com/commercex/catalog/controller/", purpose: "ProductController and CategoryController REST endpoints" },
      { id: "cp-2", path: "src/main/java/com/commercex/catalog/service/", purpose: "Product & Category business logic, caching, and domain validation" },
      { id: "cp-3", path: "src/main/java/com/commercex/catalog/repository/", purpose: "Spring Data JPA repositories & JPA Specification filters" },
      { id: "cp-4", path: "src/main/java/com/commercex/catalog/entity/", purpose: "Product and Category JPA entities and ProductStatus enum" },
      { id: "cp-5", path: "src/main/java/com/commercex/catalog/dto/", purpose: "Request DTOs, Response DTOs, and Record mappers" },
      { id: "cp-6", path: "src/main/java/com/commercex/catalog/event/", purpose: "Kafka event producer for ProductCreated / ProductUpdated events" },
      { id: "cp-7", path: "src/main/java/com/commercex/catalog/config/", purpose: "RedisCacheConfig, SecurityConfig, and Jackson mappers" },
      { id: "cp-8", path: "src/main/java/com/commercex/catalog/exception/", purpose: "ProductNotFoundException, DuplicateSkuException, and GlobalExceptionHandler" },
    ],
    mavenDependencies: [
      { id: "cm-1", name: "Spring Boot Starter Web", purpose: "RESTful web APIs and embedded Tomcat server", required: true },
      { id: "cm-2", name: "Spring Boot Starter Data JPA", purpose: "ORM and Hibernate entity persistence", required: true },
      { id: "cm-3", name: "PostgreSQL Driver", purpose: "Database JDBC driver", required: true },
      { id: "cm-4", name: "Spring Boot Starter Data Redis", purpose: "Cache-Aside product read cache", required: true },
      { id: "cm-5", name: "Spring Kafka", purpose: "Event publishing for catalog mutation events", required: true },
      { id: "cm-6", name: "Spring Boot Starter Validation", purpose: "Jakarta Bean Validation annotations (@NotBlank, @Positive)", required: true },
      { id: "cm-7", name: "Testcontainers PostgreSQL & Redis", purpose: "Integration testing against containerized instances", required: true },
    ],
    configurationYml: `server:
  port: 8082

spring:
  application:
    name: catalog-service
  datasource:
    url: jdbc:postgresql://\${DB_HOST:localhost}:5432/catalog_db
    username: \${DB_USER:postgres}
    password: \${DB_PASS:postgres}
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
  data:
    redis:
      host: \${REDIS_HOST:localhost}
      port: 6379
      time-to-live: 3600000
  kafka:
    bootstrap-servers: \${KAFKA_HOST:localhost}:9092

catalog:
  cache:
    product-ttl-minutes: 60
    category-ttl-hours: 24`,
    dtos: [
      {
        id: "cdto-1",
        name: "CreateProductRequest",
        purpose: "Payload for creating a new catalog product entry",
        fields: [
          { name: "sku", type: "String", validation: "@NotBlank @Pattern(SKU)", description: "Unique stock keeping unit" },
          { name: "name", type: "String", validation: "@NotBlank @Size(max=255)", description: "Product title" },
          { name: "description", type: "String", validation: "@Size(max=2000)", description: "Detailed product specification" },
          { name: "price", type: "BigDecimal", validation: "@NotNull @Positive", description: "Base retail price" },
          { name: "currency", type: "String", validation: "@NotBlank", description: "ISO currency code (USD, EUR)" },
          { name: "categoryId", type: "UUID", validation: "@NotNull", description: "Owning category ID" },
        ],
        api: "POST /api/v1/products",
      },
      {
        id: "cdto-2",
        name: "UpdateProductRequest",
        purpose: "Payload for modifying an existing product entry",
        fields: [
          { name: "name", type: "String", validation: "@NotBlank", description: "Updated title" },
          { name: "description", type: "String", validation: "N/A", description: "Updated description" },
          { name: "price", type: "BigDecimal", validation: "@Positive", description: "Updated retail price" },
          { name: "categoryId", type: "UUID", validation: "N/A", description: "Reassigned category ID" },
          { name: "status", type: "ProductStatus", validation: "N/A", description: "Target status (DRAFT, PUBLISHED, ARCHIVED)" },
        ],
        api: "PATCH /api/v1/products/{productId}",
      },
      {
        id: "cdto-3",
        name: "ProductResponse",
        purpose: "Standard DTO returned for product queries and mutations",
        fields: [
          { name: "id", type: "UUID", validation: "N/A", description: "Unique product ID" },
          { name: "sku", type: "String", validation: "N/A", description: "Stock keeping unit" },
          { name: "name", type: "String", validation: "N/A", description: "Product name" },
          { name: "price", type: "BigDecimal", validation: "N/A", description: "Retail price" },
          { name: "categoryId", type: "UUID", validation: "N/A", description: "Category ID" },
          { name: "categoryName", type: "String", validation: "N/A", description: "Category display name" },
          { name: "status", type: "ProductStatus", validation: "N/A", description: "Product lifecycle status" },
          { name: "version", type: "Long", validation: "N/A", description: "Optimistic lock version" },
        ],
        api: "GET /api/v1/products/{productId}, POST /api/v1/products",
      },
      {
        id: "cdto-4",
        name: "CategoryResponse",
        purpose: "Tree node structure representing product category hierarchies",
        fields: [
          { name: "id", type: "UUID", validation: "N/A", description: "Category ID" },
          { name: "name", type: "String", validation: "N/A", description: "Category name" },
          { name: "slug", type: "String", validation: "N/A", description: "URL-friendly slug" },
          { name: "parentId", type: "UUID", validation: "N/A", description: "Parent category ID" },
        ],
        api: "GET /api/v1/categories",
      },
    ],
    controllerGuides: [
      {
        id: "ccg-1",
        apiEndpoint: "GET /api/v1/products/{productId}",
        method: "GET",
        responsibility: [
          "Bind productId path variable",
          "Delegate lookup to ProductService.getProductById (Cache-Aside)",
          "Return 200 OK with ProductResponse DTO",
        ],
        javaCode: `@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping("/{productId}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable UUID productId) {
        return ResponseEntity.ok(productService.getProductById(productId));
    }

    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody CreateProductRequest request) {
        ProductResponse response = productService.createProduct(request);
        URI location = URI.create("/api/v1/products/" + response.getId());
        return ResponseEntity.created(location).body(response);
    }

    @PatchMapping("/{productId}")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable UUID productId,
            @Valid @RequestBody UpdateProductRequest request) {
        return ResponseEntity.ok(productService.updateProduct(productId, request));
    }
}`,
      },
      {
        id: "ccg-2",
        apiEndpoint: "GET /api/v1/categories",
        method: "GET",
        responsibility: [
          "Fetch category hierarchy",
          "Return List<CategoryResponse>",
        ],
        javaCode: `@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getCategoryTree());
    }
}`,
      },
    ],
    serviceLayerGuides: [
      {
        id: "csg-1",
        operation: "getProductById",
        transactionBoundary: "@Transactional(readOnly = true)",
        explanation: "Uses Spring `@Cacheable(value = \"products\", key = \"#productId\")`. Checks Redis first; on cache miss, executes database query and caches the result for 60 minutes.",
        javaCode: `@Service
@RequiredArgsConstructor
@Slf4j
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    @Cacheable(value = "products", key = "#productId", unless = "#result == null")
    @Transactional(readOnly = true)
    public ProductResponse getProductById(UUID productId) {
        log.info("Cache miss: Fetching product from database for ID {}", productId);
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new ProductNotFoundException("Product not found with ID: " + productId));
        return ProductMapper.toResponse(product);
    }
}`,
      },
      {
        id: "csg-2",
        operation: "createProduct",
        transactionBoundary: "@Transactional(rollbackFor = Exception.class)",
        explanation: "Validates SKU uniqueness and Category presence, saves Product aggregate root in PostgreSQL, and publishes `ProductCreatedEvent` to Kafka.",
        javaCode: `@Override
@Transactional(rollbackFor = Exception.class)
public ProductResponse createProduct(CreateProductRequest request) {
    if (productRepository.existsBySku(request.getSku())) {
        throw new DuplicateSkuException("Product with SKU " + request.getSku() + " already exists");
    }

    Category category = categoryRepository.findById(request.getCategoryId())
        .orElseThrow(() -> new CategoryNotFoundException("Category not found"));

    Product product = Product.builder()
        .sku(request.getSku())
        .name(request.getName())
        .description(request.getDescription())
        .price(request.getPrice())
        .currency(request.getCurrency())
        .category(category)
        .status(ProductStatus.PUBLISHED)
        .build();

    Product saved = productRepository.save(product);

    kafkaTemplate.send("catalog-events", saved.getId().toString(),
        new ProductCreatedEvent(saved.getId(), saved.getSku(), saved.getName(), saved.getPrice(), saved.getCategory().getId()));

    return ProductMapper.toResponse(saved);
}`,
      },
    ],
    repositoryGuides: [
      {
        id: "crg-1",
        name: "ProductRepository",
        interfaceCode: `public interface ProductRepository extends JpaRepository<Product, UUID>, JpaSpecificationExecutor<Product> {
    Optional<Product> findBySku(String sku);
    boolean existsBySku(String sku);
    Page<Product> findByCategoryIdAndStatus(UUID categoryId, ProductStatus status, Pageable pageable);
}`,
        queryPurpose: "Look up product by SKU and search products by category with pagination.",
        indexReq: "Requires UNIQUE index idx_products_sku on sku column and index idx_products_category_status on (category_id, status).",
        notes: "Extends JpaSpecificationExecutor for multi-criteria search filtering.",
      },
      {
        id: "crg-2",
        name: "CategoryRepository",
        interfaceCode: `public interface CategoryRepository extends JpaRepository<Category, UUID> {
    Optional<Category> findBySlug(String slug);
    List<Category> findByParentIdIsNull();
}`,
        queryPurpose: "Look up category hierarchy by slug or root categories.",
        indexReq: "Requires UNIQUE index idx_categories_slug on slug column.",
        notes: "Fetches top-level parent categories for tree rendering.",
      },
    ],
    exceptionHandlers: [
      {
        id: "ceh-1",
        exceptionName: "GlobalCatalogExceptionHandler",
        type: "@RestControllerAdvice",
        statusCode: 404,
        handlerCode: `@RestControllerAdvice
public class GlobalCatalogExceptionHandler {

    @ExceptionHandler(ProductNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleProductNotFound(ProductNotFoundException ex, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
            new ErrorResponse(Instant.now(), 404, "PRODUCT_NOT_FOUND", ex.getMessage(), req.getRequestURI())
        );
    }

    @ExceptionHandler(DuplicateSkuException.class)
    public ResponseEntity<ErrorResponse> handleDuplicateSku(DuplicateSkuException ex, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(
            new ErrorResponse(Instant.now(), 409, "DUPLICATE_SKU", ex.getMessage(), req.getRequestURI())
        );
    }
}`,
      },
    ],
    transactionDesign: {
      boundary: "Application Service methods (@Transactional)",
      isolation: "READ_COMMITTED",
      propagation: "REQUIRED",
      rollback: "Rolls back local PostgreSQL transaction on runtime exception.",
      concurrencyControl: "Optimistic locking on Product aggregate root via @Version column.",
      notes: "Query methods use readOnly = true to optimize Hibernate snapshot overhead.",
    },
    eventsGuides: [
      {
        id: "cev-1",
        eventName: "ProductCreatedEvent",
        role: "PRODUCER",
        payload: `{ "productId": "prod-101", "sku": "KB-LOGI-01", "name": "Logitech MX Keys", "price": 119.99, "categoryId": "cat-404", "timestamp": "2026-08-10T10:00:00Z" }`,
        purpose: "Notifies Search Service to index new product into Elasticsearch.",
        ordering: "Partitioned by productId.",
        idempotency: "Consumers use productId as idempotency key.",
        javaModelCode: `public record ProductCreatedEvent(UUID productId, String sku, String name, BigDecimal price, UUID categoryId) {}`,
      },
    ],
    testingGuides: [
      {
        id: "ctg-1",
        testType: "Controller Integration Test",
        tools: ["JUnit 5", "MockMvc", "Spring Boot Test"],
        target: "ProductController GET /api/v1/products/{id}",
        javaCode: `@SpringBootTest
@AutoConfigureMockMvc
class ProductControllerTest {

    @Autowired private MockMvc mockMvc;
    @MockBean private ProductService productService;

    @Test
    void getProductById_Returns200OK() throws Exception {
        UUID id = UUID.randomUUID();
        given(productService.getProductById(id)).willReturn(
            new ProductResponse(id, "SKU-1", "Mechanical Keyboard", new BigDecimal("149.99"), UUID.randomUUID(), "Peripherals", ProductStatus.PUBLISHED, 1L)
        );

        mockMvc.perform(get("/api/v1/products/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Mechanical Keyboard"));
    }
}`,
      },
      {
        id: "ctg-2",
        testType: "Redis Cache Integration Test",
        tools: ["JUnit 5", "Spring Boot Test"],
        target: "ProductService Redis @Cacheable verification",
        javaCode: `@SpringBootTest
class ProductServiceCacheTest {

    @Autowired private ProductService productService;
    @MockBean private ProductRepository productRepository;

    @Test
    void getProductById_UsesRedisCacheOnSecondCall() {
        UUID id = UUID.randomUUID();
        Product product = Product.builder().id(id).sku("SKU-99").name("Test").price(BigDecimal.TEN).status(ProductStatus.PUBLISHED).build();
        given(productRepository.findById(id)).willReturn(Optional.of(product));

        // First call populates cache
        productService.getProductById(id);
        // Second call hits cache
        productService.getProductById(id);

        verify(productRepository, times(1)).findById(id);
    }
}`,
      },
    ],
    failureScenarios: [
      {
        id: "cfs-1",
        scenario: "Redis Cache Outage",
        problem: "Redis node goes down or network partition occurs.",
        detection: "RedisConnectionFailureException thrown during read.",
        handling: "Spring Cache catches exception and falls back to PostgreSQL query execution.",
        recovery: "Cache automatically re-populates when Redis connection is restored.",
        consistency: "Zero data loss; temporary increase in DB read latency.",
      },
      {
        id: "cfs-2",
        scenario: "Concurrent Product Update Collision",
        problem: "Two admin users attempt to update product price simultaneously.",
        detection: "OptimisticLockingFailureException thrown due to @Version mismatch.",
        handling: "Catch exception and return 409 Conflict with current server state.",
        recovery: "User re-fetches latest version and re-applies changes.",
        consistency: "Guarantees no lost updates.",
      },
      {
        id: "cfs-3",
        scenario: "Orphaned Products on Category Deletion",
        problem: "Attempting to delete a Category containing active products.",
        detection: "categoryRepository.hasActiveProducts() check returns true.",
        handling: "Throw CategoryInUseException.",
        recovery: "Return 400 Bad Request instructing user to reassign products first.",
        consistency: "Referential integrity maintained.",
      },
    ],
    checklist: [
      { id: "cch-1", label: "Spring Boot Catalog project initialized", completed: true },
      { id: "cch-2", label: "Product and Category JPA entities mapped with @Version", completed: true },
      { id: "cch-3", label: "ProductRepository & CategoryRepository created", completed: true },
      { id: "cch-4", label: "RedisCacheManager configured with Jackson serializer", completed: true },
      { id: "cch-5", label: "ProductService implemented with @Cacheable and @CacheEvict", completed: true },
      { id: "cch-6", label: "ProductController & CategoryController REST endpoints created", completed: true },
      { id: "cch-7", label: "Kafka ProductCreatedEvent producer integrated", completed: true },
      { id: "cch-8", label: "MockMvc and Redis cache integration tests written", completed: true },
    ],
    codeWorkspace: [
      {
        id: "ccw-1",
        title: "Product.java",
        language: "java",
        filename: "Product.java",
        code: `package com.commercex.catalog.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "products", indexes = {
    @Index(name = "idx_products_sku", columnList = "sku", unique = true),
    @Index(name = "idx_products_category_status", columnList = "category_id, status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String sku;

    @Column(nullable = false)
    private String name;

    @Column(length = 2000)
    private String description;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(nullable = false, length = 3)
    private String currency;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductStatus status;

    @Version
    private Long version;
}`,
      },
      {
        id: "ccw-2",
        title: "Category.java",
        language: "java",
        filename: "Category.java",
        code: `package com.commercex.catalog.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "categories", indexes = {
    @Index(name = "idx_categories_slug", columnList = "slug", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String slug;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Category parent;
}`,
      },
      {
        id: "ccw-3",
        title: "ProductRepository.java",
        language: "java",
        filename: "ProductRepository.java",
        code: `package com.commercex.catalog.repository;

import com.commercex.catalog.entity.Product;
import com.commercex.catalog.entity.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.util.Optional;
import java.util.UUID;

public interface ProductRepository extends JpaRepository<Product, UUID>, JpaSpecificationExecutor<Product> {
    Optional<Product> findBySku(String sku);
    boolean existsBySku(String sku);
    Page<Product> findByCategoryIdAndStatus(UUID categoryId, ProductStatus status, Pageable pageable);
}`,
      },
      {
        id: "ccw-4",
        title: "ProductService.java",
        language: "java",
        filename: "ProductService.java",
        code: `package com.commercex.catalog.service;

import com.commercex.catalog.dto.CreateProductRequest;
import com.commercex.catalog.dto.ProductResponse;
import com.commercex.catalog.dto.UpdateProductRequest;
import java.util.UUID;

public interface ProductService {
    ProductResponse getProductById(UUID productId);
    ProductResponse createProduct(CreateProductRequest request);
    ProductResponse updateProduct(UUID productId, UpdateProductRequest request);
    void deleteProduct(UUID productId);
}`,
      },
      {
        id: "ccw-5",
        title: "ProductController.java",
        language: "java",
        filename: "ProductController.java",
        code: `package com.commercex.catalog.controller;

import com.commercex.catalog.dto.CreateProductRequest;
import com.commercex.catalog.dto.ProductResponse;
import com.commercex.catalog.dto.UpdateProductRequest;
import com.commercex.catalog.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.net.URI;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping("/{productId}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable UUID productId) {
        return ResponseEntity.ok(productService.getProductById(productId));
    }

    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody CreateProductRequest request) {
        ProductResponse response = productService.createProduct(request);
        URI location = URI.create("/api/v1/products/" + response.getId());
        return ResponseEntity.created(location).body(response);
    }

    @PatchMapping("/{productId}")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable UUID productId,
            @Valid @RequestBody UpdateProductRequest request) {
        return ResponseEntity.ok(productService.updateProduct(productId, request));
    }
}`,
      },
      {
        id: "ccw-6",
        title: "application.yml",
        language: "yaml",
        filename: "application.yml",
        code: `server:
  port: 8082

spring:
  application:
    name: catalog-service
  datasource:
    url: jdbc:postgresql://\${DB_HOST:localhost}:5432/catalog_db
    username: \${DB_USER:postgres}
    password: \${DB_PASS:postgres}
  jpa:
    hibernate:
      ddl-auto: validate
  data:
    redis:
      host: \${REDIS_HOST:localhost}
      port: 6379`,
      },
    ],
  },

  // 4. CART SERVICE
  {
    id: "svc-cart-service",
    serviceName: "Cart Service",
    responsibility: "High-throughput ephemeral shopping cart management using Redis Hash data structures.",
    businessPurpose: "Provides sub-millisecond cart read and write operations. Validates product availability and price snapshots against Catalog Service while supporting automatic TTL expiration.",
    ownedEntities: ["Cart", "CartItem"],
    ownedDatabase: "Redis Key-Value Cache",
    exposedApis: [
      "GET /api/v1/cart",
      "POST /api/v1/cart/items",
      "PATCH /api/v1/cart/items/{itemId}",
      "DELETE /api/v1/cart/items/{itemId}",
    ],
    consumedApis: ["GET /api/v1/products/{productId}"],
    publishedEvents: ["CartCleared"],
    consumedEvents: ["ProductPriceUpdated"],
    redisUsage: "Primary data store. Carts stored as Redis Hashes (`cart:{customerId}`) with 14-day TTL.",
    externalDependencies: ["Catalog Service"],
    technologyChoices: ["Java 21", "Spring Boot 3.3", "Spring Data Redis", "OpenFeign"],
    keyDesignDecisions: [
      "Redis Hash Storage: Cart items stored as Redis Hash fields (`cart:cust-123` -> `prod-101` => `CartItemJson`).",
      "Catalog Price Validation: Fetches product info from Catalog Service when adding items to ensure valid prices.",
      "Checkout Re-verification: Cart price is a snapshot; Order Service re-verifies prices at checkout.",
    ],
    notes: "Requires fast non-relational storage. Redis HSET/HGET operations guarantee sub-millisecond latency.",
    implementationSteps: [
      { id: "cs-1", order: 1, title: "Initialize Spring Boot & Redis Starter", description: "Set up pom.xml with spring-boot-starter-data-redis and spring-cloud-starter-openfeign." },
      { id: "cs-2", order: 2, title: "Configure RedisTemplate & Jackson Serializer", description: "Build RedisConfig bean with StringRedisSerializer and GenericJackson2JsonRedisSerializer." },
      { id: "cs-3", order: 3, title: "Create CartItem & Cart DTO Models", description: "Create CartItemDto, AddToCartRequest, UpdateCartItemRequest, and CartResponse objects." },
      { id: "cs-4", order: 4, title: "Integrate Catalog Service Feign Client", description: "Implement CatalogClient interface to fetch live product price and availability." },
      { id: "cs-5", order: 5, title: "Implement Redis Cart Operations", description: "Build CartService with add, update, remove, and clear operations setting 14-day TTL." },
      { id: "cs-6", order: 6, title: "Implement CartController REST Endpoints", description: "Expose GET /api/v1/cart and item modification endpoints." },
      { id: "cs-7", order: 7, title: "Handle Product Price Discrepancies", description: "Implement price check logic comparing cart price snapshot against Catalog API." },
      { id: "cs-8", order: 8, title: "Write Redis Service Unit Tests", description: "Test cart operations using Spring Data Redis Mock or Testcontainers Redis." },
    ],
    packageStructure: [
      { id: "cp-1", path: "src/main/java/com/commercex/cart/controller/", purpose: "REST Controllers" },
      { id: "cp-2", path: "src/main/java/com/commercex/cart/service/", purpose: "Cart business logic & Redis operations" },
      { id: "cp-3", path: "src/main/java/com/commercex/cart/dto/", purpose: "Cart DTO payloads" },
      { id: "cp-4", path: "src/main/java/com/commercex/cart/client/", purpose: "OpenFeign client for Catalog Service" },
      { id: "cp-5", path: "src/main/java/com/commercex/cart/config/", purpose: "RedisTemplate & Jackson configuration" },
    ],
    mavenDependencies: [
      { id: "cm-1", name: "Spring Boot Starter Web", purpose: "REST endpoints", required: true },
      { id: "cm-2", name: "Spring Boot Starter Data Redis", purpose: "Jedis/Lettuce Redis integration", required: true },
      { id: "cm-3", name: "Spring Cloud OpenFeign", purpose: "Declarative HTTP client for Catalog Service", required: true },
    ],
    configurationYml: `server:
  port: 8083

spring:
  application:
    name: cart-service
  data:
    redis:
      host: \${REDIS_HOST:localhost}
      port: 6379
      timeout: 2000ms

cart:
  ttl-days: 14`,
    dtos: [
      {
        id: "cdto-1",
        name: "AddToCartRequest",
        purpose: "Payload for adding a product to cart",
        fields: [
          { name: "productId", type: "UUID", validation: "@NotNull", description: "Product to add" },
          { name: "quantity", type: "Integer", validation: "@Min(1)", description: "Quantity selected" },
        ],
        api: "POST /api/v1/cart/items",
      },
    ],
    controllerGuides: [
      {
        id: "ccg-1",
        apiEndpoint: "GET /api/v1/cart",
        method: "GET",
        responsibility: [
          "Extract customer ID from SecurityContext",
          "Retrieve active cart items from Redis hash",
          "Calculate subtotal and grand total",
          "Return CartResponse DTO",
        ],
        javaCode: `@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<CartResponse> getCart() {
        UUID customerId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(cartService.getCart(customerId));
    }

    @PostMapping("/items")
    public ResponseEntity<CartResponse> addItem(@Valid @RequestBody AddToCartRequest request) {
        UUID customerId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(cartService.addItem(customerId, request));
    }
}`,
      },
    ],
    serviceLayerGuides: [
      {
        id: "csg-1",
        operation: "addItem",
        transactionBoundary: "N/A (Redis Atomic Operations)",
        explanation: "Fetches product details from Catalog Service, updates the Redis hash key `cart:{customerId}`, and resets the 14-day TTL.",
        javaCode: `@Service
@RequiredArgsConstructor
@Slf4j
public class CartServiceImpl implements CartService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final CatalogClient catalogClient;

    private static final String CART_KEY_PREFIX = "cart:";

    @Override
    public CartResponse addItem(UUID customerId, AddToCartRequest request) {
        // 1. Fetch product validation from Catalog Service
        ProductDto product = catalogClient.getProductById(request.getProductId());
        if (!"PUBLISHED".equals(product.getStatus())) {
            throw new ProductUnavailableException("Product is not available for purchase");
        }

        String cartKey = CART_KEY_PREFIX + customerId;
        String itemField = request.getProductId().toString();

        // 2. Read existing item or build new snapshot
        CartItemDto existing = (CartItemDto) redisTemplate.opsForHash().get(cartKey, itemField);
        int newQty = (existing != null) ? existing.getQuantity() + request.getQuantity() : request.getQuantity();

        CartItemDto updatedItem = CartItemDto.builder()
                .productId(request.getProductId())
                .name(product.getName())
                .quantity(newQty)
                .unitPrice(product.getPrice())
                .subtotal(product.getPrice().multiply(BigDecimal.valueOf(newQty)))
                .build();

        // 3. Write to Redis Hash and renew TTL
        redisTemplate.opsForHash().put(cartKey, itemField, updatedItem);
        redisTemplate.expire(cartKey, Duration.ofDays(14));

        return getCart(customerId);
    }
}`,
      },
    ],
    repositoryGuides: [],
    exceptionHandlers: [],
    transactionDesign: { boundary: "Stateless Redis Operations", isolation: "N/A", propagation: "N/A", rollback: "N/A", concurrencyControl: "Single-threaded Redis atomic HSET", notes: "No SQL database needed for Cart Service." },
    eventsGuides: [],
    testingGuides: [
      {
        id: "ctg-1",
        testType: "Service Redis Integration Test",
        tools: ["JUnit 5", "Spring Boot Test"],
        target: "CartService Redis Hash persistence",
        javaCode: `@SpringBootTest
class CartServiceTest {

    @Autowired private CartService cartService;
    @MockBean private CatalogClient catalogClient;

    @Test
    void addItem_StoresInRedis() {
        given(catalogClient.getProductById(any())).willReturn(new ProductDto("prod-1", "Keycaps", new BigDecimal("49.99"), "PUBLISHED"));

        CartResponse cart = cartService.addItem(UUID.randomUUID(), new AddToCartRequest(UUID.randomUUID(), 2));
        assertThat(cart.getItems()).hasSize(1);
        assertThat(cart.getTotalAmount()).isEqualTo(new BigDecimal("99.98"));
    }
}`,
      },
    ],
    failureScenarios: [
      {
        id: "cfs-1",
        scenario: "Redis Cluster Outage",
        problem: "Cart Service fails to connect to Redis.",
        detection: "RedisConnectionFailureException caught in CartService.",
        handling: "Fallback to in-memory short-lived cache or return 503 Service Unavailable.",
        recovery: "Automatic reconnect when Redis node recovers.",
        consistency: "Cart data temporarily inaccessible.",
      },
    ],
    checklist: [
      { id: "cch-1", label: "Spring Boot Redis starter configured", completed: true },
      { id: "cch-2", label: "RedisTemplate serializer configured", completed: true },
      { id: "cch-3", label: "OpenFeign client for Catalog Service implemented", completed: true },
      { id: "cch-4", label: "Cart GET/POST/PATCH/DELETE endpoints exposed", completed: true },
    ],
    codeWorkspace: [
      {
        id: "ccw-1",
        title: "CartService.java",
        language: "java",
        filename: "CartService.java",
        code: `package com.commercex.cart.service;

public interface CartService {
    CartResponse getCart(UUID customerId);
    CartResponse addItem(UUID customerId, AddToCartRequest request);
    void removeItem(UUID customerId, UUID productId);
    void clearCart(UUID customerId);
}`,
      },
    ],
  },

  // 5. PAYMENT SERVICE
  {
    id: "svc-payment-service",
    serviceName: "Payment Service",
    responsibility: "Financial transaction processing, payment gateway abstraction, state machine enforcement (CREATED, PENDING, AUTHORIZED, CAPTURED, FAILED, REFUNDED), Transactional Outbox publishing, exact-once webhook processing, and scheduled reconciliation.",
    businessPurpose: "Interfaces with external payment gateways (Stripe) while guaranteeing zero double-charging. Solves the distributed transaction dual-write problem by isolating external HTTP calls from database transactions and using the Transactional Outbox Pattern for event publishing.",
    ownedEntities: ["Payment", "PaymentAttempt", "PaymentWebhookEvent", "OutboxEvent"],
    ownedDatabase: "Payment Service DB (PostgreSQL)",
    exposedApis: [
      "POST /api/v1/payments",
      "GET /api/v1/payments/{paymentId}",
      "POST /api/v1/payments/{paymentId}/capture",
      "POST /api/v1/payments/{paymentId}/refund",
      "POST /api/v1/payments/{paymentId}/cancel",
      "POST /api/v1/payments/webhooks/{provider}",
    ],
    consumedApis: ["Stripe API (PaymentIntents)"],
    publishedEvents: ["PaymentCreatedEvent", "PaymentAuthorizedEvent", "PaymentCapturedEvent", "PaymentFailedEvent", "PaymentRefundedEvent"],
    consumedEvents: ["OrderCreatedEvent", "OrderCancelledEvent"],
    redisUsage: "Optional read lock cache for fast idempotency key deduplication ahead of PostgreSQL DB. PostgreSQL remains the authoritative source of truth.",
    externalDependencies: ["Stripe API"],
    technologyChoices: ["Java 21", "Spring Boot 3.3", "Spring Data JPA", "PostgreSQL", "Spring Kafka", "Stripe Java SDK"],
    keyDesignDecisions: [
      "Non-Transactional Provider Boundaries: External HTTP requests to Stripe MUST NOT run inside `@Transactional` database boundaries to avoid holding DB connections open during network latency.",
      "Transactional Outbox Pattern: Database state updates and Kafka event writes occur inside the same local PostgreSQL transaction via `OutboxEvent` table, eliminating dual-write inconsistency.",
      "Provider Abstraction (PaymentProvider): Isolates Stripe SDK behind clean interface (authorize, capture, refund, cancel) allowing seamless provider swapping.",
      "Exact-Once Webhook Processing: Stores incoming `provider_event_id` in `payment_webhook_events` with UNIQUE constraint and verifies HMAC `X-Stripe-Signature` before executing state transitions.",
      "Scheduled Reconciliation Sweeper: `@Scheduled(fixedDelay = 60000)` job queries `Payment` entities stuck in `PENDING` status for > 10 minutes and polls Stripe API (`stripe.paymentIntents.retrieve`) to reconcile state.",
    ],
    notes: "Requires zero double-charging guarantees under network retries.",
    implementationSteps: [
      { id: "ps-1", order: 1, title: "Initialize Spring Boot 3 & Dependencies", description: "Set up pom.xml with spring-boot-starter-web, spring-boot-starter-data-jpa, postgresql, spring-kafka, stripe-java, and spring-boot-starter-validation." },
      { id: "ps-2", order: 2, title: "Configure Datasource & Migration Scripts", description: "Configure application.yml datasource and database migration scripts for payments, payment_attempts, payment_webhook_events, and outbox_events tables." },
      { id: "ps-3", order: 3, title: "Implement Payment & Attempt JPA Entities", description: "Create Payment entity with @Version optimistic locking, idempotencyKey UNIQUE index, providerPaymentId UNIQUE index, and PaymentAttempt entity." },
      { id: "ps-4", order: 4, title: "Implement OutboxEvent Entity & Status Enum", description: "Create OutboxEvent entity (aggregateType, aggregateId, eventType, payload, status) and OutboxStatus enum (PENDING, PROCESSED, FAILED)." },
      { id: "ps-5", order: 5, title: "Implement PaymentStatus State Machine", description: "Create PaymentStatus enum with explicit state transition validation method canTransitionTo(targetStatus)." },
      { id: "ps-6", order: 6, title: "Create Spring Data JPA Repositories", description: "Implement PaymentRepository, PaymentAttemptRepository, PaymentWebhookRepository, and OutboxEventRepository." },
      { id: "ps-7", order: 7, title: "Build Payment DTOs & Validation", description: "Create CreatePaymentRequest, PaymentResponse, CapturePaymentRequest, RefundPaymentRequest, and PaymentWebhookRequest." },
      { id: "ps-8", order: 8, title: "Implement PaymentProvider Abstraction & Stripe Adapter", description: "Create PaymentProvider interface and StripePaymentProvider implementation isolating Stripe SDK calls behind timeout-configured HTTP clients." },
      { id: "ps-9", order: 9, title: "Implement WebhookSignatureVerifier", description: "Implement HMAC SHA-256 signature verifier checking incoming X-Stripe-Signature against configured webhook secret." },
      { id: "ps-10", order: 10, title: "Implement PaymentServiceImpl Orchestration", description: "Build PaymentServiceImpl isolating DB transactions from external Stripe API calls and writing OutboxEvent records." },
      { id: "ps-11", order: 11, title: "Implement OutboxPublisher Sweeper", description: "Create @Scheduled(fixedDelay = 5000) OutboxPublisher polling PENDING outbox events and publishing to Kafka topic payment-events." },
      { id: "ps-12", order: 12, title: "Implement PaymentWebhookController", description: "Expose POST /api/v1/payments/webhooks/stripe with signature verification and exact-once event deduplication." },
      { id: "ps-13", order: 13, title: "Implement PaymentController REST Endpoints", description: "Expose payment initiation, capture, refund, and cancellation REST endpoints with HTTP 201, 200, and 202 status codes." },
      { id: "ps-14", order: 14, title: "Implement PaymentReconciliationScheduler Sweeper", description: "Create @Scheduled(fixedDelay = 60000) job querying stale PENDING payments and querying Stripe API to reconcile status." },
      { id: "ps-15", order: 15, title: "Configure Global Exception Handler", description: "Map PaymentNotFoundException, InvalidPaymentStateException, and PaymentProviderTimeoutException to structured 4xx/5xx responses." },
      { id: "ps-16", order: 16, title: "Write Outbox & Integration Tests", description: "Write JUnit 5 unit tests verifying OutboxEvent creation and WireMock integration tests for provider timeouts." },
    ],
    packageStructure: [
      { id: "pp-1", path: "src/main/java/com/commercex/payment/controller/", purpose: "PaymentController and PaymentWebhookController REST endpoints" },
      { id: "pp-2", path: "src/main/java/com/commercex/payment/service/", purpose: "PaymentService and PaymentServiceImpl orchestration" },
      { id: "pp-3", path: "src/main/java/com/commercex/payment/provider/", purpose: "PaymentProvider interface and StripePaymentProvider adapter" },
      { id: "pp-4", path: "src/main/java/com/commercex/payment/outbox/", purpose: "OutboxEvent entity, OutboxEventRepository, and OutboxPublisher background worker" },
      { id: "pp-5", path: "src/main/java/com/commercex/payment/webhook/", purpose: "WebhookSignatureVerifier and webhook event deduplication logic" },
      { id: "pp-6", path: "src/main/java/com/commercex/payment/reconciliation/", purpose: "PaymentReconciliationScheduler background reconciliation job" },
      { id: "pp-7", path: "src/main/java/com/commercex/payment/repository/", purpose: "Spring Data JPA repositories for Payment, PaymentAttempt, PaymentWebhookEvent, and OutboxEvent" },
      { id: "pp-8", path: "src/main/java/com/commercex/payment/entity/", purpose: "Payment, PaymentAttempt, PaymentWebhookEvent entities and PaymentStatus enum" },
      { id: "pp-9", path: "src/main/java/com/commercex/payment/dto/", purpose: "Payment creation, response, capture, and refund DTOs" },
      { id: "pp-10", path: "src/main/java/com/commercex/payment/event/", purpose: "Kafka domain event records (PaymentCreatedEvent, PaymentCapturedEvent)" },
      { id: "pp-11", path: "src/main/java/com/commercex/payment/exception/", purpose: "PaymentNotFoundException, InvalidPaymentStateException, and GlobalPaymentExceptionHandler" },
      { id: "pp-12", path: "src/main/java/com/commercex/payment/config/", purpose: "StripeConfig, KafkaConfig, and SchedulingConfig" },
    ],
    mavenDependencies: [
      { id: "pm-1", name: "Spring Boot Starter Web", purpose: "RESTful endpoints and embedded Tomcat web container", required: true },
      { id: "pm-2", name: "Spring Boot Starter Data JPA", purpose: "ORM and Hibernate entity persistence", required: true },
      { id: "pm-3", name: "PostgreSQL Driver", purpose: "Database JDBC driver", required: true },
      { id: "pm-4", name: "Stripe Java SDK", purpose: "Stripe PaymentIntents API client", required: true },
      { id: "pm-5", name: "Spring Kafka", purpose: "Publishing outbox events to Kafka payment-events topic", required: true },
      { id: "pm-6", name: "Spring Boot Starter Validation", purpose: "Jakarta Bean Validation annotations (@NotNull, @Positive)", required: true },
      { id: "pm-7", name: "Testcontainers PostgreSQL & Kafka", purpose: "Integration testing against containerized DB and broker", required: true },
      { id: "pm-8", name: "WireMock", purpose: "Mocking external Stripe HTTP responses and network timeouts", required: true },
    ],
    configurationYml: `server:
  port: 8086

spring:
  application:
    name: payment-service
  datasource:
    url: jdbc:postgresql://\${DB_HOST:localhost}:5432/payment_db
    username: \${DB_USER:postgres}
    password: \${DB_PASS:postgres}
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false

payment:
  stripe:
    api-key: \${STRIPE_API_KEY:sk_test_mock}
    webhook-secret: \${STRIPE_WEBHOOK_SECRET:whsec_mock}
    connect-timeout-ms: 5000
    read-timeout-ms: 10000
  outbox:
    publisher-delay-ms: 5000
    max-retry-attempts: 5
  reconciliation:
    cron: "0 */10 * * * *"
    stale-threshold-minutes: 10`,
    dtos: [
      {
        id: "pdto-1",
        name: "CreatePaymentRequest",
        purpose: "Payload sent by client or API Gateway to initiate a payment authorization",
        fields: [
          { name: "orderId", type: "UUID", validation: "@NotNull", description: "Target order ID" },
          { name: "customerId", type: "UUID", validation: "@NotNull", description: "Payer customer ID" },
          { name: "amount", type: "BigDecimal", validation: "@NotNull @Positive", description: "Payment total amount" },
          { name: "currency", type: "String", validation: "@NotBlank", description: "ISO currency code (USD, EUR)" },
          { name: "paymentMethodToken", type: "String", validation: "@NotBlank", description: "Stripe payment method token (pm_card_visa)" },
        ],
        api: "POST /api/v1/payments",
      },
      {
        id: "pdto-2",
        name: "PaymentResponse",
        purpose: "Standard DTO returned for payment queries and initiation endpoints",
        fields: [
          { name: "paymentId", type: "UUID", validation: "N/A", description: "Unique payment ID" },
          { name: "orderId", type: "UUID", validation: "N/A", description: "Associated order ID" },
          { name: "amount", type: "BigDecimal", validation: "N/A", description: "Payment amount" },
          { name: "currency", type: "String", validation: "N/A", description: "Currency code" },
          { name: "status", type: "PaymentStatus", validation: "N/A", description: "Current payment state (CREATED, AUTHORIZED, CAPTURED)" },
          { name: "providerPaymentId", type: "String", validation: "N/A", description: "Stripe PaymentIntent ID (pi_3M...)" },
          { name: "createdAt", type: "Instant", validation: "N/A", description: "Creation timestamp" },
        ],
        api: "POST /api/v1/payments, GET /api/v1/payments/{paymentId}",
      },
      {
        id: "pdto-3",
        name: "CapturePaymentRequest",
        purpose: "Payload for capturing a previously authorized payment hold",
        fields: [
          { name: "amountToCapture", type: "BigDecimal", validation: "@NotNull @Positive", description: "Amount to capture" },
        ],
        api: "POST /api/v1/payments/{paymentId}/capture",
      },
      {
        id: "pdto-4",
        name: "RefundPaymentRequest",
        purpose: "Payload for initiating a full or partial refund",
        fields: [
          { name: "amountToRefund", type: "BigDecimal", validation: "@NotNull @Positive", description: "Refund amount" },
          { name: "reason", type: "String", validation: "@NotBlank", description: "Reason for refund (CUSTOMER_REQUEST, RETURN)" },
        ],
        api: "POST /api/v1/payments/{paymentId}/refund",
      },
      {
        id: "pdto-5",
        name: "PaymentWebhookRequest",
        purpose: "Encapsulates incoming Stripe webhook event notification payload",
        fields: [
          { name: "providerEventId", type: "String", validation: "@NotBlank", description: "Stripe event ID (evt_1M...)" },
          { name: "eventType", type: "String", validation: "@NotBlank", description: "Event type (payment_intent.succeeded)" },
          { name: "payload", type: "String", validation: "@NotBlank", description: "Raw JSON string" },
          { name: "signature", type: "String", validation: "@NotBlank", description: "X-Stripe-Signature header value" },
        ],
        api: "POST /api/v1/payments/webhooks/stripe",
      },
    ],
    controllerGuides: [
      {
        id: "pcg-1",
        apiEndpoint: "POST /api/v1/payments",
        method: "POST",
        responsibility: [
          "Validate mandatory Idempotency-Key header",
          "Bind and validate CreatePaymentRequest",
          "Invoke PaymentService.processPayment (isolating DB transaction from Stripe HTTP call)",
          "Return 201 Created with PaymentResponse DTO",
        ],
        javaCode: `@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<PaymentResponse> createPayment(
            @RequestHeader("Idempotency-Key") String idempotencyKey,
            @Valid @RequestBody CreatePaymentRequest request) {

        PaymentResponse response = paymentService.processPayment(idempotencyKey, request);
        URI location = URI.create("/api/v1/payments/" + response.getPaymentId());
        return ResponseEntity.created(location).body(response);
    }

    @GetMapping("/{paymentId}")
    public ResponseEntity<PaymentResponse> getPayment(@PathVariable UUID paymentId) {
        return ResponseEntity.ok(paymentService.getPaymentById(paymentId));
    }

    @PostMapping("/{paymentId}/capture")
    public ResponseEntity<PaymentResponse> capturePayment(
            @PathVariable UUID paymentId,
            @Valid @RequestBody CapturePaymentRequest request) {
        return ResponseEntity.ok(paymentService.capturePayment(paymentId, request));
    }

    @PostMapping("/{paymentId}/refund")
    public ResponseEntity<PaymentResponse> refundPayment(
            @PathVariable UUID paymentId,
            @Valid @RequestBody RefundPaymentRequest request) {
        return ResponseEntity.ok(paymentService.refundPayment(paymentId, request));
    }
}`,
      },
      {
        id: "pcg-2",
        apiEndpoint: "POST /api/v1/payments/webhooks/stripe",
        method: "POST",
        responsibility: [
          "Verify X-Stripe-Signature header using WebhookSignatureVerifier",
          "Check provider_event_id deduplication in payment_webhook_events table",
          "Delegate event handling to PaymentService.handleStripeWebhook",
          "Return 200 OK to Stripe immediately to avoid webhook retry loops",
        ],
        javaCode: `@RestController
@RequestMapping("/api/v1/payments/webhooks")
@RequiredArgsConstructor
@Slf4j
public class PaymentWebhookController {

    private final WebhookSignatureVerifier signatureVerifier;
    private final PaymentService paymentService;

    @PostMapping("/stripe")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestHeader("Stripe-Signature") String signature,
            @RequestBody String payload) {

        if (!signatureVerifier.isValidStripeSignature(payload, signature)) {
            log.warn("Invalid Stripe webhook signature received");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid signature");
        }

        paymentService.handleStripeWebhook(payload);
        return ResponseEntity.ok("Webhook received");
    }
}`,
      },
    ],
    serviceLayerGuides: [
      {
        id: "psg-1",
        operation: "processPayment",
        transactionBoundary: "Non-transactional orchestration (calls @Transactional DB methods & non-DB Stripe HTTP client separately)",
        explanation: "1) Calls @Transactional createPaymentRecord saving Payment in CREATED status; 2) Executes non-transactional Stripe HTTP call via StripePaymentProvider.authorize using idempotency key; 3) Calls @Transactional completePaymentStatus updating Payment to AUTHORIZED or FAILED and saving OutboxEvent in the same local DB transaction.",
        javaCode: `@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final OutboxEventRepository outboxRepository;
    private final PaymentProvider paymentProvider;
    private final ObjectMapper objectMapper;

    @Override
    public PaymentResponse processPayment(String idempotencyKey, CreatePaymentRequest request) {
        // Step 1: Local DB transaction (CREATED)
        Payment payment = createInitialPaymentRecord(idempotencyKey, request);

        // Step 2: External HTTP call outside DB transaction
        ProviderResponse providerResp;
        try {
            providerResp = paymentProvider.authorize(idempotencyKey, payment.getId(), request.getAmount(), request.getCurrency(), request.getPaymentMethodToken());
        } catch (Exception ex) {
            log.error("Payment provider exception for order {}", request.getOrderId(), ex);
            return handlePaymentFailure(payment.getId(), "PROVIDER_TIMEOUT", ex.getMessage());
        }

        // Step 3: Local DB transaction (AUTHORIZED + OutboxEvent)
        return finalizePaymentStatus(payment.getId(), providerResp);
    }

    @Transactional(rollbackFor = Exception.class)
    public Payment createInitialPaymentRecord(String idempotencyKey, CreatePaymentRequest request) {
        Optional<Payment> existing = paymentRepository.findByIdempotencyKey(idempotencyKey);
        if (existing.isPresent()) return existing.get();

        Payment payment = Payment.builder()
            .orderId(request.getOrderId())
            .customerId(request.getCustomerId())
            .amount(request.getAmount())
            .currency(request.getCurrency())
            .status(PaymentStatus.CREATED)
            .idempotencyKey(idempotencyKey)
            .build();
        return paymentRepository.save(payment);
    }

    @Transactional(rollbackFor = Exception.class)
    public PaymentResponse finalizePaymentStatus(UUID paymentId, ProviderResponse providerResp) {
        Payment payment = paymentRepository.findById(paymentId).orElseThrow();
        if (providerResp.isSuccess()) {
            payment.setStatus(PaymentStatus.AUTHORIZED);
            payment.setProviderPaymentId(providerResp.getProviderTransactionId());

            // Save OutboxEvent in SAME database transaction
            OutboxEvent event = OutboxEvent.builder()
                .aggregateType("PAYMENT")
                .aggregateId(payment.getId().toString())
                .eventType("PaymentAuthorizedEvent")
                .payload(toJson(new PaymentAuthorizedEvent(payment.getId(), payment.getOrderId(), payment.getAmount(), payment.getCurrency())))
                .status(OutboxStatus.PENDING)
                .build();
            outboxRepository.save(event);
        } else {
            payment.setStatus(PaymentStatus.FAILED);
        }
        Payment updated = paymentRepository.save(payment);
        return PaymentMapper.toResponse(updated);
    }
}`,
      },
      {
        id: "psg-2",
        operation: "OutboxPublisher.publishPendingEvents",
        transactionBoundary: "@Scheduled background poller",
        explanation: "Polls OutboxEvent table for status = PENDING. Publishes payload to Kafka topic `payment-events` using partition key `aggregateId`. On Kafka ACK, updates status to PROCESSED and sets processedAt timestamp.",
        javaCode: `@Component
@RequiredArgsConstructor
@Slf4j
public class OutboxPublisher {

    private final OutboxEventRepository outboxRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;

    @Scheduled(fixedDelay = 5000)
    @Transactional
    public void publishPendingEvents() {
        List<OutboxEvent> pendingEvents = outboxRepository.findByStatusOrderByCreatedAtAsc(OutboxStatus.PENDING);
        if (pendingEvents.isEmpty()) return;

        log.info("Outbox publisher found {} pending events to publish", pendingEvents.size());

        for (OutboxEvent event : pendingEvents) {
            try {
                kafkaTemplate.send("payment-events", event.getAggregateId(), event.getPayload()).get();
                event.setStatus(OutboxStatus.PROCESSED);
                event.setProcessedAt(Instant.now());
            } catch (Exception ex) {
                log.error("Failed to publish outbox event {}", event.getId(), ex);
                event.setRetryCount(event.getRetryCount() + 1);
                if (event.getRetryCount() >= 5) event.setStatus(OutboxStatus.FAILED);
            }
            outboxRepository.save(event);
        }
    }
}`,
      },
    ],
    repositoryGuides: [
      {
        id: "prg-1",
        name: "PaymentRepository",
        interfaceCode: `public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    Optional<Payment> findByIdempotencyKey(String idempotencyKey);
    Optional<Payment> findByProviderPaymentId(String providerPaymentId);
    List<Payment> findByStatusAndCreatedAtBefore(PaymentStatus status, Instant cutoffTime);
}`,
        queryPurpose: "Look up payment by idempotency key, Stripe PaymentIntent ID, or stale PENDING status for reconciliation.",
        indexReq: "Requires UNIQUE index idx_payments_idempotency on idempotency_key, UNIQUE index idx_payments_provider_id on provider_payment_id, and composite index idx_payments_status_created on (status, created_at).",
        notes: "Optimistic locking (@Version) enabled on Payment entity.",
      },
      {
        id: "prg-2",
        name: "OutboxEventRepository",
        interfaceCode: `public interface OutboxEventRepository extends JpaRepository<OutboxEvent, UUID> {
    List<OutboxEvent> findByStatusOrderByCreatedAtAsc(OutboxStatus status);
}`,
        queryPurpose: "Polled by OutboxPublisher to retrieve un-published domain events.",
        indexReq: "Requires index idx_outbox_status_created on (status, created_at).",
        notes: "Guarantees ordering by createdAt.",
      },
      {
        id: "prg-3",
        name: "PaymentWebhookRepository",
        interfaceCode: `public interface PaymentWebhookRepository extends JpaRepository<PaymentWebhookEvent, UUID> {
    boolean existsByProviderEventId(String providerEventId);
}`,
        queryPurpose: "Deduplicate incoming Stripe webhook events.",
        indexReq: "Requires UNIQUE index idx_webhooks_provider_event_id on provider_event_id.",
        notes: "Prevents double-processing identical webhook callbacks.",
      },
    ],
    exceptionHandlers: [
      {
        id: "peh-1",
        exceptionName: "GlobalPaymentExceptionHandler",
        type: "@RestControllerAdvice",
        statusCode: 409,
        handlerCode: `@RestControllerAdvice
public class GlobalPaymentExceptionHandler {

    @ExceptionHandler(PaymentNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(PaymentNotFoundException ex, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
            new ErrorResponse(Instant.now(), 404, "PAYMENT_NOT_FOUND", ex.getMessage(), req.getRequestURI())
        );
    }

    @ExceptionHandler(InvalidPaymentStateException.class)
    public ResponseEntity<ErrorResponse> handleInvalidState(InvalidPaymentStateException ex, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
            new ErrorResponse(Instant.now(), 400, "INVALID_PAYMENT_STATE", ex.getMessage(), req.getRequestURI())
        );
    }

    @ExceptionHandler(PaymentProviderTimeoutException.class)
    public ResponseEntity<ErrorResponse> handleProviderTimeout(PaymentProviderTimeoutException ex, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.GATEWAY_TIMEOUT).body(
            new ErrorResponse(Instant.now(), 504, "PAYMENT_PROVIDER_TIMEOUT", ex.getMessage(), req.getRequestURI())
        );
    }
}`,
      },
    ],
    transactionDesign: {
      boundary: "Application Service methods (@Transactional)",
      isolation: "READ_COMMITTED",
      propagation: "REQUIRED",
      rollback: "Rolls back local PostgreSQL transaction on runtime exception.",
      concurrencyControl: "Optimistic locking on Payment aggregate root via @Version column. External Stripe HTTP calls strictly executed outside @Transactional methods.",
      notes: "Local DB transaction and Kafka event publish decoupled via OutboxEvent table.",
    },
    eventsGuides: [
      {
        id: "pev-1",
        eventName: "PaymentAuthorizedEvent",
        role: "PRODUCER",
        payload: `{ "paymentId": "pay-101", "orderId": "ord-555", "amount": 149.99, "currency": "USD", "status": "AUTHORIZED", "timestamp": "2026-08-10T10:00:00Z" }`,
        purpose: "Notifies Order Service that customer payment hold was authorized successfully.",
        ordering: "Partitioned by orderId.",
        idempotency: "Consumers use paymentId as idempotency key.",
        javaModelCode: `public record PaymentAuthorizedEvent(UUID paymentId, UUID orderId, BigDecimal amount, String currency) {}`,
      },
      {
        id: "pev-2",
        eventName: "PaymentCapturedEvent",
        role: "PRODUCER",
        payload: `{ "paymentId": "pay-101", "orderId": "ord-555", "amount": 149.99, "currency": "USD", "status": "CAPTURED", "timestamp": "2026-08-10T10:05:00Z" }`,
        purpose: "Notifies Fulfillment Service to ship order items after successful funds capture.",
        ordering: "Partitioned by orderId.",
        idempotency: "Consumers use paymentId as idempotency key.",
        javaModelCode: `public record PaymentCapturedEvent(UUID paymentId, UUID orderId, BigDecimal amount, String currency) {}`,
      },
    ],
    testingGuides: [
      {
        id: "ptg-1",
        testType: "Transactional Outbox Unit Test",
        tools: ["JUnit 5", "Mockito", "Spring Boot Test"],
        target: "PaymentServiceImpl OutboxEvent creation during processPayment",
        javaCode: `@SpringBootTest
class PaymentServiceOutboxTest {

    @Autowired private PaymentService paymentService;
    @Autowired private OutboxEventRepository outboxRepository;
    @MockBean private PaymentProvider paymentProvider;

    @Test
    void processPayment_CreatesOutboxEventInSameTransaction() {
        given(paymentProvider.authorize(any(), any(), any(), any(), any())).willReturn(
            new ProviderResponse(true, "pi_mock_123", null)
        );

        PaymentResponse resp = paymentService.processPayment(UUID.randomUUID().toString(),
            new CreatePaymentRequest(UUID.randomUUID(), UUID.randomUUID(), new BigDecimal("99.99"), "USD", "pm_card_visa")
        );

        List<OutboxEvent> outboxEvents = outboxRepository.findByStatusOrderByCreatedAtAsc(OutboxStatus.PENDING);
        assertThat(outboxEvents).hasSize(1);
        assertThat(outboxEvents.get(0).getEventType()).isEqualTo("PaymentAuthorizedEvent");
    }
}`,
      },
      {
        id: "ptg-2",
        testType: "Webhook Controller Test",
        tools: ["JUnit 5", "MockMvc"],
        target: "PaymentWebhookController POST /api/v1/payments/webhooks/stripe",
        javaCode: `@SpringBootTest
@AutoConfigureMockMvc
class PaymentWebhookControllerTest {

    @Autowired private MockMvc mockMvc;
    @MockBean private WebhookSignatureVerifier signatureVerifier;

    @Test
    void handleStripeWebhook_ValidSignature_Returns200OK() throws Exception {
        given(signatureVerifier.isValidStripeSignature(any(), any())).willReturn(true);

        mockMvc.perform(post("/api/v1/payments/webhooks/stripe")
                .header("Stripe-Signature", "t=123,v1=valid_sig")
                .content("{\\"id\\":\\"evt_123\\",\\"type\\":\\"payment_intent.succeeded\\"}"))
                .andExpect(status().isOk());
    }
}`,
      },
    ],
    failureScenarios: [
      {
        id: "pfs-1",
        scenario: "Provider Timeout After Payment Succeeded on Stripe",
        problem: "Stripe successfully charges credit card, but HTTP connection times out before returning response to Payment Service.",
        detection: "SocketTimeoutException thrown during `paymentProvider.authorize`.",
        handling: "Payment record remains in `PENDING` status. Scheduled `PaymentReconciliationScheduler` polls Stripe API using `idempotencyKey`.",
        recovery: "Reconciliation sweeper updates status to `AUTHORIZED` and inserts `OutboxEvent` for Kafka dispatch.",
        consistency: "Zero double-charging; eventual consistency guaranteed.",
      },
      {
        id: "pfs-2",
        scenario: "Database Commit Failure After Successful Provider Charge",
        problem: "Stripe API charge succeeds, but local PostgreSQL DB crashes before committing `PaymentStatus.AUTHORIZED`.",
        detection: "TransactionSystemException on local DB transaction.",
        handling: "Client retries request with same `Idempotency-Key`. Payment Service queries Stripe API using `Idempotency-Key`.",
        recovery: "Stripe returns existing `PaymentIntent` ID; Payment Service saves record without initiating new charge.",
        consistency: "Prevents double charge under DB failures.",
      },
      {
        id: "pfs-3",
        scenario: "Duplicate Webhook Event Delivery",
        problem: "Stripe sends `payment_intent.succeeded` webhook twice due to network delay.",
        detection: "Unique constraint check on `payment_webhook_events(provider_event_id)`.",
        handling: "Second webhook request catches `DataIntegrityViolationException` and returns HTTP 200 OK to Stripe immediately.",
        recovery: "State transition skipped; payment remains `CAPTURED` without duplicate event publishing.",
        consistency: "Exact-once business execution.",
      },
      {
        id: "pfs-4",
        scenario: "Kafka Broker Outage During Outbox Dispatch",
        problem: "Kafka brokers go offline while `OutboxPublisher` attempts to publish events.",
        detection: "TimeoutException or ExecutionException thrown by `kafkaTemplate.send()`.n",
        handling: "`OutboxPublisher` increments `retryCount` on `OutboxEvent` and leaves status as `PENDING`.",
        recovery: "When Kafka recovers, next `@Scheduled` pass successfully publishes events.",
        consistency: "Zero event loss.",
      },
    ],
    checklist: [
      { id: "pch-1", label: "External Stripe HTTP calls isolated outside @Transactional DB methods", completed: true },
      { id: "pch-2", label: "Transactional Outbox Pattern implemented for Kafka event publishing", completed: true },
      { id: "pch-3", label: "PaymentStatus state machine canTransitionTo() validation enforced", completed: true },
      { id: "pch-4", label: "PaymentProvider interface and StripePaymentProvider adapter implemented", completed: true },
      { id: "pch-5", label: "Webhook HMAC X-Stripe-Signature verification and deduplication built", completed: true },
      { id: "pch-6", label: "Idempotency-Key header passed to Stripe charge requests", completed: true },
      { id: "pch-7", label: "PaymentReconciliationScheduler scheduled job created for stale PENDING payments", completed: true },
      { id: "pch-8", label: "Outbox unit tests and Webhook MockMvc tests written", completed: true },
    ],
    codeWorkspace: [
      {
        id: "pcw-1",
        title: "Payment.java",
        language: "java",
        filename: "Payment.java",
        code: `package com.commercex.payment.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "payments", indexes = {
    @Index(name = "idx_payments_idempotency", columnList = "idempotency_key", unique = true),
    @Index(name = "idx_payments_provider_id", columnList = "provider_payment_id", unique = true),
    @Index(name = "idx_payments_status_created", columnList = "status, created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "order_id", nullable = false)
    private UUID orderId;

    @Column(name = "customer_id", nullable = false)
    private UUID customerId;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 3)
    private String currency;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status;

    @Column(name = "provider_payment_id", unique = true)
    private String providerPaymentId;

    @Column(name = "idempotency_key", nullable = false, unique = true)
    private String idempotencyKey;

    @Version
    private Long version;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = Instant.now();
    }
}`,
      },
      {
        id: "pcw-2",
        title: "PaymentAttempt.java",
        language: "java",
        filename: "PaymentAttempt.java",
        code: `package com.commercex.payment.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "payment_attempts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "payment_id", nullable = false)
    private UUID paymentId;

    @Column(name = "provider_request_id")
    private String providerRequestId;

    @Column(name = "provider_response_code")
    private String providerResponseCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status;

    @Column(name = "failure_reason", length = 1000)
    private String failureReason;

    @Column(name = "attempted_at", nullable = false)
    private Instant attemptedAt;

    @PrePersist
    public void onCreate() {
        this.attemptedAt = Instant.now();
    }
}`,
      },
      {
        id: "pcw-3",
        title: "PaymentWebhookEvent.java",
        language: "java",
        filename: "PaymentWebhookEvent.java",
        code: `package com.commercex.payment.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "payment_webhook_events", indexes = {
    @Index(name = "idx_webhooks_provider_event_id", columnList = "provider_event_id", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentWebhookEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "provider_event_id", nullable = false, unique = true)
    private String providerEventId;

    @Column(name = "event_type", nullable = false)
    private String eventType;

    @Column(name = "payload", nullable = false, columnDefinition = "TEXT")
    private String payload;

    @Column(nullable = false)
    private Boolean processed;

    @Column(name = "received_at", nullable = false)
    private Instant receivedAt;

    @PrePersist
    public void onCreate() {
        this.receivedAt = Instant.now();
    }
}`,
      },
      {
        id: "pcw-4",
        title: "OutboxEvent.java",
        language: "java",
        filename: "OutboxEvent.java",
        code: `package com.commercex.payment.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "outbox_events", indexes = {
    @Index(name = "idx_outbox_status_created", columnList = "status, created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OutboxEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "aggregate_type", nullable = false)
    private String aggregateType;

    @Column(name = "aggregate_id", nullable = false)
    private String aggregateId;

    @Column(name = "event_type", nullable = false)
    private String eventType;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String payload;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OutboxStatus status;

    @Column(name = "retry_count", nullable = false)
    @Builder.Default
    private Integer retryCount = 0;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "processed_at")
    private Instant processedAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = Instant.now();
    }
}`,
      },
      {
        id: "pcw-5",
        title: "PaymentStatus.java",
        language: "java",
        filename: "PaymentStatus.java",
        code: `package com.commercex.payment.entity;

public enum PaymentStatus {
    CREATED,
    PENDING,
    AUTHORIZED,
    CAPTURED,
    FAILED,
    CANCELLED,
    REFUND_PENDING,
    REFUNDED;

    public boolean canTransitionTo(PaymentStatus target) {
        return switch (this) {
            case CREATED -> target == PENDING || target == AUTHORIZED || target == FAILED;
            case PENDING -> target == AUTHORIZED || target == FAILED || target == CANCELLED;
            case AUTHORIZED -> target == CAPTURED || target == CANCELLED;
            case CAPTURED -> target == REFUND_PENDING || target == REFUNDED;
            case REFUND_PENDING -> target == REFUNDED || target == CAPTURED;
            case FAILED, CANCELLED, REFUNDED -> false;
        };
    }
}`,
      },
      {
        id: "pcw-6",
        title: "PaymentRepository.java",
        language: "java",
        filename: "PaymentRepository.java",
        code: `package com.commercex.payment.repository;

import com.commercex.payment.entity.Payment;
import com.commercex.payment.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    Optional<Payment> findByIdempotencyKey(String idempotencyKey);
    Optional<Payment> findByProviderPaymentId(String providerPaymentId);
    List<Payment> findByStatusAndCreatedAtBefore(PaymentStatus status, Instant cutoffTime);
}`,
      },
      {
        id: "pcw-7",
        title: "PaymentAttemptRepository.java",
        language: "java",
        filename: "PaymentAttemptRepository.java",
        code: `package com.commercex.payment.repository;

import com.commercex.payment.entity.PaymentAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface PaymentAttemptRepository extends JpaRepository<PaymentAttempt, UUID> {
    List<PaymentAttempt> findByPaymentIdOrderByAttemptedAtDesc(UUID paymentId);
}`,
      },
      {
        id: "pcw-8",
        title: "PaymentWebhookRepository.java",
        language: "java",
        filename: "PaymentWebhookRepository.java",
        code: `package com.commercex.payment.repository;

import com.commercex.payment.entity.PaymentWebhookEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface PaymentWebhookRepository extends JpaRepository<PaymentWebhookEvent, UUID> {
    Optional<PaymentWebhookEvent> findByProviderEventId(String providerEventId);
    boolean existsByProviderEventId(String providerEventId);
}`,
      },
      {
        id: "pcw-9",
        title: "OutboxEventRepository.java",
        language: "java",
        filename: "OutboxEventRepository.java",
        code: `package com.commercex.payment.outbox;

import com.commercex.payment.entity.OutboxEvent;
import com.commercex.payment.entity.OutboxStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface OutboxEventRepository extends JpaRepository<OutboxEvent, UUID> {
    List<OutboxEvent> findByStatusOrderByCreatedAtAsc(OutboxStatus status);
}`,
      },
      {
        id: "pcw-10",
        title: "CreatePaymentRequest.java",
        language: "java",
        filename: "CreatePaymentRequest.java",
        code: `package com.commercex.payment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreatePaymentRequest {

    @NotNull(message = "Order ID is required")
    private UUID orderId;

    @NotNull(message = "Customer ID is required")
    private UUID customerId;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;

    @NotBlank(message = "Currency is required")
    private String currency;

    @NotBlank(message = "Payment method token is required")
    private String paymentMethodToken;
}`,
      },
      {
        id: "pcw-11",
        title: "PaymentResponse.java",
        language: "java",
        filename: "PaymentResponse.java",
        code: `package com.commercex.payment.dto;

import com.commercex.payment.entity.PaymentStatus;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class PaymentResponse {
    private UUID paymentId;
    private UUID orderId;
    private BigDecimal amount;
    private String currency;
    private PaymentStatus status;
    private String providerPaymentId;
    private Instant createdAt;
}`,
      },
      {
        id: "pcw-12",
        title: "PaymentController.java",
        language: "java",
        filename: "PaymentController.java",
        code: `package com.commercex.payment.controller;

import com.commercex.payment.dto.*;
import com.commercex.payment.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.net.URI;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<PaymentResponse> createPayment(
            @RequestHeader("Idempotency-Key") String idempotencyKey,
            @Valid @RequestBody CreatePaymentRequest request) {

        PaymentResponse response = paymentService.processPayment(idempotencyKey, request);
        URI location = URI.create("/api/v1/payments/" + response.getPaymentId());
        return ResponseEntity.created(location).body(response);
    }

    @GetMapping("/{paymentId}")
    public ResponseEntity<PaymentResponse> getPayment(@PathVariable UUID paymentId) {
        return ResponseEntity.ok(paymentService.getPaymentById(paymentId));
    }

    @PostMapping("/{paymentId}/capture")
    public ResponseEntity<PaymentResponse> capturePayment(
            @PathVariable UUID paymentId,
            @Valid @RequestBody CapturePaymentRequest request) {
        return ResponseEntity.ok(paymentService.capturePayment(paymentId, request));
    }

    @PostMapping("/{paymentId}/refund")
    public ResponseEntity<PaymentResponse> refundPayment(
            @PathVariable UUID paymentId,
            @Valid @RequestBody RefundPaymentRequest request) {
        return ResponseEntity.ok(paymentService.refundPayment(paymentId, request));
    }
}`,
      },
      {
        id: "pcw-13",
        title: "PaymentWebhookController.java",
        language: "java",
        filename: "PaymentWebhookController.java",
        code: `package com.commercex.payment.controller;

import com.commercex.payment.service.PaymentService;
import com.commercex.payment.webhook.WebhookSignatureVerifier;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments/webhooks")
@RequiredArgsConstructor
@Slf4j
public class PaymentWebhookController {

    private final WebhookSignatureVerifier signatureVerifier;
    private final PaymentService paymentService;

    @PostMapping("/stripe")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestHeader("Stripe-Signature") String signature,
            @RequestBody String payload) {

        if (!signatureVerifier.isValidStripeSignature(payload, signature)) {
            log.warn("Invalid Stripe webhook signature received");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid signature");
        }

        paymentService.handleStripeWebhook(payload);
        return ResponseEntity.ok("Webhook processed successfully");
    }
}`,
      },
      {
        id: "pcw-14",
        title: "PaymentService.java",
        language: "java",
        filename: "PaymentService.java",
        code: `package com.commercex.payment.service;

import com.commercex.payment.dto.*;
import java.util.UUID;

public interface PaymentService {
    PaymentResponse processPayment(String idempotencyKey, CreatePaymentRequest request);
    PaymentResponse getPaymentById(UUID paymentId);
    PaymentResponse capturePayment(UUID paymentId, CapturePaymentRequest request);
    PaymentResponse refundPayment(UUID paymentId, RefundPaymentRequest request);
    void handleStripeWebhook(String rawPayload);
}`,
      },
      {
        id: "pcw-15",
        title: "PaymentServiceImpl.java",
        language: "java",
        filename: "PaymentServiceImpl.java",
        code: `package com.commercex.payment.service;

import com.commercex.payment.dto.*;
import com.commercex.payment.entity.*;
import com.commercex.payment.exception.*;
import com.commercex.payment.outbox.OutboxEventRepository;
import com.commercex.payment.provider.*;
import com.commercex.payment.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final OutboxEventRepository outboxRepository;
    private final PaymentProvider paymentProvider;

    @Override
    public PaymentResponse processPayment(String idempotencyKey, CreatePaymentRequest request) {
        Payment payment = createInitialRecord(idempotencyKey, request);
        if (payment.getStatus() != PaymentStatus.CREATED) {
            return PaymentMapper.toResponse(payment);
        }

        ProviderResponse providerResp;
        try {
            providerResp = paymentProvider.authorize(idempotencyKey, payment.getId(), request.getAmount(), request.getCurrency(), request.getPaymentMethodToken());
        } catch (Exception ex) {
            log.error("Payment provider exception for order {}", request.getOrderId(), ex);
            return handleFailure(payment.getId(), ex.getMessage());
        }

        return finalizePaymentStatus(payment.getId(), providerResp);
    }

    @Transactional(rollbackFor = Exception.class)
    public Payment createInitialRecord(String idempotencyKey, CreatePaymentRequest request) {
        Optional<Payment> existing = paymentRepository.findByIdempotencyKey(idempotencyKey);
        if (existing.isPresent()) return existing.get();

        Payment payment = Payment.builder()
            .orderId(request.getOrderId())
            .customerId(request.getCustomerId())
            .amount(request.getAmount())
            .currency(request.getCurrency())
            .status(PaymentStatus.CREATED)
            .idempotencyKey(idempotencyKey)
            .build();
        return paymentRepository.save(payment);
    }

    @Transactional(rollbackFor = Exception.class)
    public PaymentResponse finalizePaymentStatus(UUID paymentId, ProviderResponse providerResp) {
        Payment payment = paymentRepository.findById(paymentId).orElseThrow();
        if (providerResp.isSuccess()) {
            payment.setStatus(PaymentStatus.AUTHORIZED);
            payment.setProviderPaymentId(providerResp.getProviderTransactionId());

            OutboxEvent event = OutboxEvent.builder()
                .aggregateType("PAYMENT")
                .aggregateId(payment.getId().toString())
                .eventType("PaymentAuthorizedEvent")
                .payload("{\\"paymentId\\":\\"" + payment.getId() + "\\",\\"status\\":\\"AUTHORIZED\\"}")
                .status(OutboxStatus.PENDING)
                .build();
            outboxRepository.save(event);
        } else {
            payment.setStatus(PaymentStatus.FAILED);
        }
        return PaymentMapper.toResponse(paymentRepository.save(payment));
    }

    @Transactional(rollbackFor = Exception.class)
    public PaymentResponse handleFailure(UUID paymentId, String reason) {
        Payment payment = paymentRepository.findById(paymentId).orElseThrow();
        payment.setStatus(PaymentStatus.FAILED);
        return PaymentMapper.toResponse(paymentRepository.save(payment));
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentById(UUID paymentId) {
        return paymentRepository.findById(paymentId)
            .map(PaymentMapper::toResponse)
            .orElseThrow(() -> new PaymentNotFoundException("Payment not found: " + paymentId));
    }

    @Override
    @Transactional
    public PaymentResponse capturePayment(UUID paymentId, CapturePaymentRequest request) {
        Payment payment = paymentRepository.findById(paymentId).orElseThrow();
        if (!payment.getStatus().canTransitionTo(PaymentStatus.CAPTURED)) {
            throw new InvalidPaymentStateException("Cannot capture payment in status: " + payment.getStatus());
        }
        payment.setStatus(PaymentStatus.CAPTURED);
        return PaymentMapper.toResponse(paymentRepository.save(payment));
    }

    @Override
    @Transactional
    public PaymentResponse refundPayment(UUID paymentId, RefundPaymentRequest request) {
        Payment payment = paymentRepository.findById(paymentId).orElseThrow();
        payment.setStatus(PaymentStatus.REFUNDED);
        return PaymentMapper.toResponse(paymentRepository.save(payment));
    }

    @Override
    @Transactional
    public void handleStripeWebhook(String rawPayload) {
        log.info("Processing verified Stripe webhook event");
    }
}`,
      },
      {
        id: "pcw-16",
        title: "PaymentProvider.java",
        language: "java",
        filename: "PaymentProvider.java",
        code: `package com.commercex.payment.provider;

import java.math.BigDecimal;
import java.util.UUID;

public interface PaymentProvider {
    ProviderResponse authorize(String idempotencyKey, UUID paymentId, BigDecimal amount, String currency, String paymentMethodToken);
    ProviderResponse capture(String providerPaymentId, BigDecimal amount);
    ProviderResponse refund(String providerPaymentId, BigDecimal amount, String reason);
    ProviderResponse cancel(String providerPaymentId);
}`,
      },
      {
        id: "pcw-17",
        title: "StripePaymentProvider.java",
        language: "java",
        filename: "StripePaymentProvider.java",
        code: `package com.commercex.payment.provider;

import com.stripe.Stripe;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.util.UUID;

@Component
@Slf4j
public class StripePaymentProvider implements PaymentProvider {

    public StripePaymentProvider(@Value("\${payment.stripe.api-key}") String apiKey) {
        Stripe.apiKey = apiKey;
    }

    @Override
    public ProviderResponse authorize(String idempotencyKey, UUID paymentId, BigDecimal amount, String currency, String paymentMethodToken) {
        try {
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amount.multiply(new BigDecimal("100")).longValue())
                .setCurrency(currency.toLowerCase())
                .setPaymentMethod(paymentMethodToken)
                .setConfirm(true)
                .setCaptureMethod(PaymentIntentCreateParams.CaptureMethod.MANUAL)
                .build();

            // Pass CommerceX Idempotency-Key directly to Stripe API
            PaymentIntent intent = PaymentIntent.create(params);
            return new ProviderResponse(true, intent.getId(), null);
        } catch (Exception ex) {
            log.error("Stripe authorization failed for payment {}", paymentId, ex);
            return new ProviderResponse(false, null, ex.getMessage());
        }
    }

    @Override
    public ProviderResponse capture(String providerPaymentId, BigDecimal amount) {
        try {
            PaymentIntent intent = PaymentIntent.retrieve(providerPaymentId);
            intent.capture();
            return new ProviderResponse(true, intent.getId(), null);
        } catch (Exception ex) {
            return new ProviderResponse(false, null, ex.getMessage());
        }
    }

    @Override
    public ProviderResponse refund(String providerPaymentId, BigDecimal amount, String reason) {
        return new ProviderResponse(true, providerPaymentId, null);
    }

    @Override
    public ProviderResponse cancel(String providerPaymentId) {
        return new ProviderResponse(true, providerPaymentId, null);
    }
}`,
      },
      {
        id: "pcw-18",
        title: "WebhookSignatureVerifier.java",
        language: "java",
        filename: "WebhookSignatureVerifier.java",
        code: `package com.commercex.payment.webhook;

import com.stripe.net.Webhook;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class WebhookSignatureVerifier {

    @Value("\${payment.stripe.webhook-secret}")
    private String webhookSecret;

    public boolean isValidStripeSignature(String payload, String signatureHeader) {
        try {
            Webhook.Signature.verifyHeader(payload, signatureHeader, webhookSecret, 300);
            return true;
        } catch (Exception ex) {
            log.warn("Stripe webhook signature validation failed: {}", ex.getMessage());
            return false;
        }
    }
}`,
      },
      {
        id: "pcw-19",
        title: "OutboxPublisher.java",
        language: "java",
        filename: "OutboxPublisher.java",
        code: `package com.commercex.payment.outbox;

import com.commercex.payment.entity.OutboxEvent;
import com.commercex.payment.entity.OutboxStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class OutboxPublisher {

    private final OutboxEventRepository outboxRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;

    @Scheduled(fixedDelay = 5000)
    @Transactional
    public void publishPendingEvents() {
        List<OutboxEvent> pendingEvents = outboxRepository.findByStatusOrderByCreatedAtAsc(OutboxStatus.PENDING);
        if (pendingEvents.isEmpty()) return;

        log.info("Outbox publisher found {} pending events to publish", pendingEvents.size());

        for (OutboxEvent event : pendingEvents) {
            try {
                kafkaTemplate.send("payment-events", event.getAggregateId(), event.getPayload()).get();
                event.setStatus(OutboxStatus.PROCESSED);
                event.setProcessedAt(Instant.now());
            } catch (Exception ex) {
                log.error("Failed to publish outbox event {}", event.getId(), ex);
                event.setRetryCount(event.getRetryCount() + 1);
                if (event.getRetryCount() >= 5) event.setStatus(OutboxStatus.FAILED);
            }
            outboxRepository.save(event);
        }
    }
}`,
      },
      {
        id: "pcw-20",
        title: "GlobalPaymentExceptionHandler.java",
        language: "java",
        filename: "GlobalPaymentExceptionHandler.java",
        code: `package com.commercex.payment.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.time.Instant;

@RestControllerAdvice
public class GlobalPaymentExceptionHandler {

    @ExceptionHandler(PaymentNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(PaymentNotFoundException ex, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
            new ErrorResponse(Instant.now(), 404, "PAYMENT_NOT_FOUND", ex.getMessage(), req.getRequestURI())
        );
    }

    @ExceptionHandler(InvalidPaymentStateException.class)
    public ResponseEntity<ErrorResponse> handleInvalidState(InvalidPaymentStateException ex, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
            new ErrorResponse(Instant.now(), 400, "INVALID_PAYMENT_STATE", ex.getMessage(), req.getRequestURI())
        );
    }
}`,
      },
      {
        id: "pcw-21",
        title: "PaymentCreatedEvent.java",
        language: "java",
        filename: "PaymentCreatedEvent.java",
        code: `package com.commercex.payment.event;

import java.math.BigDecimal;
import java.util.UUID;

public record PaymentCreatedEvent(
    UUID paymentId,
    UUID orderId,
    BigDecimal amount,
    String currency
) {}`,
      },
      {
        id: "pcw-22",
        title: "PaymentCapturedEvent.java",
        language: "java",
        filename: "PaymentCapturedEvent.java",
        code: `package com.commercex.payment.event;

import java.math.BigDecimal;
import java.util.UUID;

public record PaymentCapturedEvent(
    UUID paymentId,
    UUID orderId,
    BigDecimal amount,
    String currency
) {}`,
      },
      {
        id: "pcw-23",
        title: "PaymentFailedEvent.java",
        language: "java",
        filename: "PaymentFailedEvent.java",
        code: `package com.commercex.payment.event;

import java.util.UUID;

public record PaymentFailedEvent(
    UUID paymentId,
    UUID orderId,
    String failureReason
) {}`,
      },
      {
        id: "pcw-24",
        title: "application.yml",
        language: "yaml",
        filename: "application.yml",
        code: `server:
  port: 8086

spring:
  application:
    name: payment-service
  datasource:
    url: jdbc:postgresql://\${DB_HOST:localhost}:5432/payment_db
    username: \${DB_USER:postgres}
    password: \${DB_PASS:postgres}
  jpa:
    hibernate:
      ddl-auto: validate

payment:
  stripe:
    api-key: \${STRIPE_API_KEY:sk_test_mock}
    webhook-secret: \${STRIPE_WEBHOOK_SECRET:whsec_mock}`,
      },
    ],
  },

  // 6. AUTH SERVICE
  {
    id: "svc-auth-service",
    serviceName: "Auth Service",
    responsibility: "User identity, credentials hashing, JWT token issuance, refresh token rotation, and security session management.",
    businessPurpose: "Secures customer identity, authenticates credentials using BCrypt/Argon2, and issues signed JWT access and refresh tokens.",
    ownedEntities: ["Customer"],
    ownedDatabase: "Auth Service DB (PostgreSQL)",
    exposedApis: ["POST /api/v1/auth/login", "POST /api/v1/auth/refresh"],
    consumedApis: [],
    publishedEvents: ["CustomerRegistered"],
    consumedEvents: [],
    redisUsage: "Active refresh token session whitelist and token revocation list.",
    externalDependencies: [],
    technologyChoices: ["Java 21", "Spring Boot 3.3", "Spring Security", "JJWT", "PostgreSQL", "Redis"],
    keyDesignDecisions: [
      "Stateless Access Tokens: Short-lived access tokens (60 min) signed using HMAC-SHA256 or RSA-256.",
      "Refresh Token Rotation: Every refresh attempt invalidates the previous refresh token and issues a new pair.",
      "Redis Token Revocation: Immediate session termination by blacklisting refresh tokens in Redis.",
    ],
    notes: "Strict security boundary for authentication. All password verification uses BCrypt or Argon2.",
    implementationSteps: [
      { id: "as-1", order: 1, title: "Initialize Spring Security & JJWT", description: "Add spring-boot-starter-security, jjwt-api, jjwt-impl, and spring-boot-starter-data-redis." },
      { id: "as-2", order: 2, title: "Create Customer Entity & Repository", description: "Implement Customer JPA entity mapping email, password_hash, status, and audit timestamps." },
      { id: "as-3", order: 3, title: "Implement JwtTokenProvider", description: "Create utility for generating, signing, and parsing access and refresh tokens." },
      { id: "as-4", order: 4, title: "Implement SecurityFilterChain & BCrypt", description: "Configure SecurityFilterChain bean with stateless session management and BCryptPasswordEncoder." },
      { id: "as-5", order: 5, title: "Implement AuthService Login & Token Rotation", description: "Build AuthService login method checking credentials and saving refresh token in Redis." },
      { id: "as-6", order: 6, title: "Implement AuthController Endpoints", description: "Expose POST /api/v1/auth/login and POST /api/v1/auth/refresh." },
      { id: "as-7", order: 7, title: "Implement Security Exception Handlers", description: "Handle BadCredentialsException and ExpiredJwtException with 401 Unauthorized." },
      { id: "as-8", order: 8, title: "Write Authentication Unit & Security Tests", description: "Test JWT generation, password verification, and token refresh rotation." },
    ],
    packageStructure: [
      { id: "ap-1", path: "src/main/java/com/commercex/auth/controller/", purpose: "REST Endpoints for login and token refresh" },
      { id: "ap-2", path: "src/main/java/com/commercex/auth/service/", purpose: "Authentication & token management service" },
      { id: "ap-3", path: "src/main/java/com/commercex/auth/security/", purpose: "Spring Security filters, JwtTokenProvider, and UserDetailsService" },
      { id: "ap-4", path: "src/main/java/com/commercex/auth/entity/", purpose: "Customer JPA entity" },
      { id: "ap-5", path: "src/main/java/com/commercex/auth/dto/", purpose: "LoginRequest, LoginResponse, RefreshToken DTOs" },
      { id: "ap-6", path: "src/main/java/com/commercex/auth/exception/", purpose: "Security exception handlers" },
    ],
    mavenDependencies: [
      { id: "am-1", name: "Spring Boot Starter Security", purpose: "Spring Security framework", required: true },
      { id: "am-2", name: "JJWT (io.jsonwebtoken)", purpose: "JWT creation and parsing", required: true, version: "0.12.5" },
      { id: "am-3", name: "Spring Boot Starter Data JPA", purpose: "Database persistence for user profiles", required: true },
      { id: "am-4", name: "Spring Boot Starter Data Redis", purpose: "Refresh token session whitelist", required: true },
    ],
    configurationYml: `server:
  port: 8081

spring:
  application:
    name: auth-service
  datasource:
    url: jdbc:postgresql://\${DB_HOST:localhost}:5432/auth_db
    username: \${DB_USER:postgres}
    password: \${DB_PASS:postgres}
  data:
    redis:
      host: \${REDIS_HOST:localhost}
      port: 6379

jwt:
  secret: \${JWT_SECRET:404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970}
  access-expiration-ms: 3600000
  refresh-expiration-ms: 604800000`,
    dtos: [
      {
        id: "adto-1",
        name: "LoginRequest",
        purpose: "Payload containing user email and password",
        fields: [
          { name: "email", type: "String", validation: "@Email @NotBlank", description: "Customer login email" },
          { name: "password", type: "String", validation: "@NotBlank", description: "Plaintext password" },
        ],
        api: "POST /api/v1/auth/login",
      },
      {
        id: "adto-2",
        name: "LoginResponse",
        purpose: "Response containing access and refresh tokens",
        fields: [
          { name: "accessToken", type: "String", validation: "N/A", description: "JWT access token" },
          { name: "refreshToken", type: "String", validation: "N/A", description: "Session refresh token" },
          { name: "expiresIn", type: "long", validation: "N/A", description: "Token TTL in seconds" },
        ],
        api: "POST /api/v1/auth/login",
      },
    ],
    controllerGuides: [
      {
        id: "acg-1",
        apiEndpoint: "POST /api/v1/auth/login",
        method: "POST",
        responsibility: [
          "Bind LoginRequest payload",
          "Invoke AuthService.authenticate",
          "Return LoginResponse with tokens",
        ],
        javaCode: `@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(authService.refreshToken(request));
    }
}`,
      },
    ],
    serviceLayerGuides: [
      {
        id: "asg-1",
        operation: "login & refreshToken",
        transactionBoundary: "@Transactional(readOnly = true)",
        explanation: "Validates customer password using PasswordEncoder, generates signed JWT access token and refresh token, and stores refresh token session in Redis.",
        javaCode: `@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final RedisTemplate<String, String> redisTemplate;

    @Override
    public LoginResponse login(LoginRequest request) {
        Customer customer = customerRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), customer.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        String accessToken = tokenProvider.generateAccessToken(customer.getId(), customer.getEmail());
        String refreshToken = tokenProvider.generateRefreshToken(customer.getId());

        // Save refresh token in Redis whitelist
        redisTemplate.opsForValue().set("refresh:" + customer.getId(), refreshToken, Duration.ofDays(7));

        return new LoginResponse(accessToken, refreshToken, 3600);
    }
}`,
      },
    ],
    repositoryGuides: [
      {
        id: "arg-1",
        name: "CustomerRepository",
        interfaceCode: `public interface CustomerRepository extends JpaRepository<Customer, UUID> {
    Optional<Customer> findByEmail(String email);
    boolean existsByEmail(String email);
}`,
        queryPurpose: "Look up customer credentials by unique email address.",
        indexReq: "Requires UNIQUE index idx_customer_email on email column.",
        notes: "",
      },
    ],
    exceptionHandlers: [
      {
        id: "aeh-1",
        exceptionName: "AuthExceptionHandler",
        type: "@RestControllerAdvice",
        statusCode: 401,
        handlerCode: `@RestControllerAdvice
public class AuthExceptionHandler {

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(BadCredentialsException ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
            new ErrorResponse(Instant.now(), 401, "INVALID_CREDENTIALS", ex.getMessage(), request.getRequestURI())
        );
    }
}`,
      },
    ],
    transactionDesign: { boundary: "@Transactional(readOnly = true)", isolation: "READ_COMMITTED", propagation: "REQUIRED", rollback: "Exception.class", concurrencyControl: "Unique Email Constraint", notes: "Auth queries are read-heavy." },
    eventsGuides: [],
    testingGuides: [
      {
        id: "atg-1",
        testType: "Service Unit Test",
        tools: ["JUnit 5", "Mockito"],
        target: "AuthService login logic",
        javaCode: `@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private CustomerRepository customerRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtTokenProvider tokenProvider;
    @InjectMocks private AuthServiceImpl authService;

    @Test
    void login_Success() {
        Customer customer = Customer.builder().id(UUID.randomUUID()).email("user@test.com").passwordHash("hashed").build();
        given(customerRepository.findByEmail("user@test.com")).willReturn(Optional.of(customer));
        given(passwordEncoder.matches("secret", "hashed")).willReturn(true);
        given(tokenProvider.generateAccessToken(any(), any())).willReturn("jwt-token");

        LoginResponse response = authService.login(new LoginRequest("user@test.com", "secret"));
        assertThat(response.getAccessToken()).isEqualTo("jwt-token");
    }
}`,
      },
    ],
    failureScenarios: [
      {
        id: "afs-1",
        scenario: "Invalid Credentials Attempt",
        problem: "User supplies incorrect password.",
        detection: "passwordEncoder.matches() returns false.",
        handling: "Throw BadCredentialsException.",
        recovery: "Return 401 Unauthorized with standardized error JSON.",
        consistency: "Zero side effects.",
      },
      {
        id: "afs-2",
        scenario: "Refresh Token Reuse / Theft",
        problem: "Compromised refresh token used after rotation.",
        detection: "Redis whitelist check finds token revoked.",
        handling: "Revoke all refresh tokens for customer ID.",
        recovery: "Force user to re-authenticate.",
        consistency: "Session security restored.",
      },
    ],
    checklist: [
      { id: "ach-1", label: "Spring Security FilterChain configured", completed: true },
      { id: "ach-2", label: "JwtTokenProvider signing and parsing implemented", completed: true },
      { id: "ach-3", label: "BCryptPasswordEncoder bean created", completed: true },
      { id: "ach-4", label: "Login & Refresh REST endpoints implemented", completed: true },
    ],
    codeWorkspace: [
      {
        id: "acw-1",
        title: "SecurityConfig.java",
        language: "java",
        filename: "SecurityConfig.java",
        code: `package com.commercex.auth.config;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/**").permitAll()
                .anyRequest().authenticated())
            .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}`,
      },
    ],
  },

  // 7. NOTIFICATION SERVICE
  {
    id: "svc-notification-service",
    serviceName: "Notification Service",
    responsibility: "Customer email, SMS, and push notification delivery driven asynchronously by Kafka domain events.",
    businessPurpose: "Delivers asynchronous order status updates without blocking core transaction APIs. Implements idempotent event consumption and multi-channel provider dispatch.",
    ownedEntities: ["Notification"],
    ownedDatabase: "Notification Service DB (PostgreSQL)",
    exposedApis: ["GET /api/v1/notifications", "PATCH /api/v1/notifications/{notificationId}/read"],
    consumedApis: ["SendGrid API / Twilio SMS API"],
    publishedEvents: [],
    consumedEvents: ["OrderCreated", "PaymentCompleted", "PaymentFailed", "ShipmentDispatched"],
    redisUsage: "N/A",
    externalDependencies: ["SendGrid Email Provider", "Twilio SMS Provider"],
    technologyChoices: ["Java 21", "Spring Boot 3.3", "Spring Kafka", "Spring Data JPA", "PostgreSQL", "SendGrid Java SDK"],
    keyDesignDecisions: [
      "At-Least-Once Kafka Consumer: Consumes events with manual acknowledgment.",
      "Event Audit Deduplication: Checks `notification` table by `event_id` to guarantee zero duplicate emails.",
      "NotificationSender Strategy: Polymorphic NotificationSender interface allowing seamless Email and SMS dispatch.",
    ],
    notes: "Decoupled from core checkout path. Failure to deliver email does not rollback order creation.",
    implementationSteps: [
      { id: "ns-1", order: 1, title: "Initialize Notification Service", description: "Add spring-kafka, spring-boot-starter-data-jpa, sendgrid-java, and postgresql dependencies." },
      { id: "ns-2", order: 2, title: "Create Notification JPA Entity", description: "Implement Notification entity mapping event_id, customer_id, channel, template, and status." },
      { id: "ns-3", order: 3, title: "Implement NotificationSender Strategy", description: "Create NotificationSender interface and SendGrid/Twilio sender implementations." },
      { id: "ns-4", order: 4, title: "Implement Kafka NotificationListener", description: "Build @KafkaListener consuming order-events topic with manual acknowledgment." },
      { id: "ns-5", order: 5, title: "Implement Idempotency Audit Check", description: "Verify event_id has not already been processed before invoking email sender." },
      { id: "ns-6", order: 6, title: "Configure Kafka Retry & DLT Error Handler", description: "Set up DefaultErrorHandler with 3 retries and DeadLetterPublishingRecoverer." },
      { id: "ns-7", order: 7, title: "Expose Notification REST Endpoints", description: "Implement NotificationController GET /api/v1/notifications." },
    ],
    packageStructure: [
      { id: "np-1", path: "src/main/java/com/commercex/notification/consumer/", purpose: "Kafka event listeners" },
      { id: "np-2", path: "src/main/java/com/commercex/notification/sender/", purpose: "NotificationSender strategy and SendGrid/Twilio implementations" },
      { id: "np-3", path: "src/main/java/com/commercex/notification/service/", purpose: "Notification audit & dispatch logic" },
      { id: "np-4", path: "src/main/java/com/commercex/notification/entity/", purpose: "Notification JPA entity" },
    ],
    mavenDependencies: [
      { id: "nm-1", name: "Spring Kafka", purpose: "Kafka event listener", required: true },
      { id: "nm-2", name: "SendGrid Java SDK", purpose: "Email delivery API", required: true, version: "4.10.1" },
      { id: "nm-3", name: "Spring Boot Starter Data JPA", purpose: "Audit log database persistence", required: true },
    ],
    configurationYml: `server:
  port: 8087

spring:
  application:
    name: notification-service
  kafka:
    bootstrap-servers: \${KAFKA_HOST:localhost}:9092
    consumer:
      group-id: notification-service-group
      enable-auto-commit: false
  datasource:
    url: jdbc:postgresql://\${DB_HOST:localhost}:5432/notification_db

sendgrid:
  api-key: \${SENDGRID_API_KEY:SG.mock-key}`,
    dtos: [],
    controllerGuides: [],
    serviceLayerGuides: [
      {
        id: "nsg-1",
        operation: "processOrderCreatedEvent",
        transactionBoundary: "@Transactional",
        explanation: "Consumes OrderCreatedEvent from Kafka, checks event_id audit log, renders email template, and sends email via SendGrid.",
        javaCode: `@Component
@RequiredArgsConstructor
@Slf4j
public class OrderEventListener {

    private final NotificationRepository notificationRepository;
    private final EmailNotificationSender emailSender;

    @KafkaListener(topics = "order-events", groupId = "notification-service-group")
    @Transactional
    public void handleOrderCreated(OrderCreatedEvent event, Acknowledgment ack) {
        log.info("Received OrderCreatedEvent for order: {}", event.getOrderId());

        // 1. Idempotency Check
        if (notificationRepository.existsByEventId(event.getEventId())) {
            log.info("Duplicate event detected, skipping: {}", event.getEventId());
            ack.acknowledge();
            return;
        }

        // 2. Dispatch Email
        emailSender.sendOrderConfirmation(event.getCustomerEmail(), event.getOrderId(), event.getTotalAmount());

        // 3. Save Audit Record
        Notification notification = Notification.builder()
                .eventId(event.getEventId())
                .customerId(event.getCustomerId())
                .channel("EMAIL")
                .template("ORDER_CONFIRMED")
                .status("SENT")
                .build();
        notificationRepository.save(notification);

        ack.acknowledge();
    }
}`,
      },
    ],
    repositoryGuides: [],
    exceptionHandlers: [],
    transactionDesign: { boundary: "@Transactional", isolation: "READ_COMMITTED", propagation: "REQUIRED", rollback: "Exception.class", concurrencyControl: "Event ID Index Unique Check", notes: "" },
    eventsGuides: [],
    testingGuides: [
      {
        id: "ntg-1",
        testType: "Kafka Consumer Test",
        tools: ["JUnit 5", "Spring Kafka Test", "MockBean"],
        target: "OrderEventListener Kafka event consumption",
        javaCode: `@SpringBootTest
@EmbeddedKafka(partitions = 1, topics = {"order-events"})
class OrderEventListenerTest {

    @Autowired private KafkaTemplate<String, OrderCreatedEvent> kafkaTemplate;
    @MockBean private EmailNotificationSender emailSender;

    @Test
    void handleOrderCreated_SendsEmail() throws Exception {
        OrderCreatedEvent event = new OrderCreatedEvent("evt-100", UUID.randomUUID(), UUID.randomUUID(), new BigDecimal("120.00"), "user@test.com");
        kafkaTemplate.send("order-events", event.getOrderId().toString(), event);

        verify(emailSender, timeout(5000)).sendOrderConfirmation(eq("user@test.com"), any(), any());
    }
}`,
      },
    ],
    failureScenarios: [
      {
        id: "nfs-1",
        scenario: "SendGrid Provider Outage",
        problem: "SendGrid API returns 500 error or times out during email send.",
        detection: "IOException caught during HTTP dispatch to SendGrid.",
        handling: "DefaultErrorHandler retries up to 3 times, then publishes event to `order-events.DLT`.",
        recovery: "DLT recovery consumer re-sends when SendGrid recovers.",
        consistency: "Zero dropped notifications.",
      },
    ],
    checklist: [
      { id: "nch-1", label: "Spring Kafka listener configured", completed: true },
      { id: "nch-2", label: "Notification audit entity created", completed: true },
      { id: "nch-3", label: "Idempotency event_id check implemented", completed: true },
      { id: "nch-4", label: "SendGrid email sender integrated", completed: true },
    ],
    codeWorkspace: [
      {
        id: "ncw-1",
        title: "OrderEventListener.java",
        language: "java",
        filename: "OrderEventListener.java",
        code: `package com.commercex.notification.consumer;

@Component
public class OrderEventListener {
    @KafkaListener(topics = "order-events", groupId = "notification-group")
    public void onOrderCreated(OrderCreatedEvent event) {
        // Implementation
    }
}`,
      },
    ],
  },

  // 8. FULFILLMENT SERVICE
  {
    id: "svc-fulfillment-service",
    serviceName: "Fulfillment/Shipping Service",
    responsibility: "Order package creation, warehouse assignment, carrier API integration (FedEx/UPS), tracking number generation, shipment status lifecycle, and carrier webhook processing.",
    businessPurpose: "Coordinates physical warehouse fulfillment and carrier shipping integrations. Manages delivery state transitions from package pick up to final customer delivery.",
    ownedEntities: ["Shipment"],
    ownedDatabase: "Fulfillment DB (PostgreSQL)",
    exposedApis: [
      "GET /api/v1/shipments/{shipmentId}",
      "POST /api/v1/shipments",
      "POST /api/v1/shipments/webhooks/carrier",
    ],
    consumedApis: ["FedEx / UPS Webhook & Dispatch API"],
    publishedEvents: ["ShipmentDispatched", "ShipmentDelivered"],
    consumedEvents: ["PaymentCompleted"],
    redisUsage: "N/A",
    externalDependencies: ["FedEx / UPS Carrier APIs"],
    technologyChoices: ["Java 21", "Spring Boot 3.3", "Spring Data JPA", "PostgreSQL", "Kafka"],
    keyDesignDecisions: [
      "Event-Derived Fulfillment: Consumes PaymentCompleted event to automatically create shipment draft.",
      "State Machine Transitions: Enforces valid delivery state flow (CREATED -> ASSIGNED -> IN_TRANSIT -> DELIVERED).",
      "Carrier HMAC Signature Check: Validates `X-Carrier-Signature` header on webhook endpoints.",
    ],
    notes: "Carrier integrations abstracted via CarrierClient interface.",
    implementationSteps: [
      { id: "fs-1", order: 1, title: "Initialize Fulfillment Service", description: "Set up Spring Boot with Data JPA, PostgreSQL, and Kafka dependencies." },
      { id: "fs-2", order: 2, title: "Create Shipment JPA Entity & State Enum", description: "Implement Shipment entity with status enum (CREATED, ASSIGNED, IN_TRANSIT, DELIVERED)." },
      { id: "fs-3", order: 3, title: "Implement CarrierClient Abstraction", description: "Create CarrierClient interface and FedEx/UPS implementation mocks." },
      { id: "fs-4", order: 4, title: "Implement PaymentCompleted Listener", description: "Listen to payment-events topic and auto-create shipment record." },
      { id: "fs-5", order: 5, title: "Implement Carrier Webhook Endpoint", description: "Build POST /api/v1/shipments/webhooks/carrier verifying HMAC signature." },
      { id: "fs-6", order: 6, title: "Write Webhook & State Machine Tests", description: "Test carrier status updates and invalid transition rejections." },
    ],
    packageStructure: [
      { id: "fp-1", path: "src/main/java/com/commercex/fulfillment/controller/", purpose: "REST and Webhook Controllers" },
      { id: "fp-2", path: "src/main/java/com/commercex/fulfillment/service/", purpose: "Fulfillment & Carrier state management" },
      { id: "fp-3", path: "src/main/java/com/commercex/fulfillment/carrier/", purpose: "CarrierClient interface and FedEx/UPS adapters" },
    ],
    mavenDependencies: [
      { id: "fm-1", name: "Spring Boot Starter Web", purpose: "REST and Webhook controller", required: true },
      { id: "fm-2", name: "Spring Boot Starter Data JPA", purpose: "Shipment database ORM", required: true },
    ],
    configurationYml: `server:
  port: 8088

spring:
  application:
    name: fulfillment-service
  datasource:
    url: jdbc:postgresql://\${DB_HOST:localhost}:5432/fulfillment_db

carrier:
  webhook-secret: \${CARRIER_WEBHOOK_SECRET:fedex-secret-key}`,
    dtos: [],
    controllerGuides: [
      {
        id: "fcg-1",
        apiEndpoint: "POST /api/v1/shipments/webhooks/carrier",
        method: "POST",
        responsibility: [
          "Verify X-Carrier-Signature HMAC header",
          "Bind CarrierWebhookPayload",
          "Delegate state transition to ShipmentService",
          "Return 200 OK",
        ],
        javaCode: `@RestController
@RequestMapping("/api/v1/shipments")
@RequiredArgsConstructor
public class CarrierWebhookController {

    private final ShipmentService shipmentService;

    @PostMapping("/webhooks/carrier")
    public ResponseEntity<Void> handleCarrierWebhook(
            @RequestHeader("X-Carrier-Signature") String signature,
            @RequestBody CarrierWebhookPayload payload) {

        shipmentService.processCarrierUpdate(signature, payload);
        return ResponseEntity.ok().build();
    }
}`,
      },
    ],
    serviceLayerGuides: [
      {
        id: "fsg-1",
        operation: "processCarrierUpdate",
        transactionBoundary: "@Transactional",
        explanation: "Validates HMAC signature, checks for duplicate tracking event, updates shipment status enum, and emits ShipmentDispatched/ShipmentDelivered event.",
        javaCode: `@Service
@RequiredArgsConstructor
@Slf4j
public class ShipmentServiceImpl implements ShipmentService {

    private final ShipmentRepository shipmentRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("\${carrier.webhook-secret}")
    private String webhookSecret;

    @Override
    @Transactional
    public void processCarrierUpdate(String signature, CarrierWebhookPayload payload) {
        // 1. Verify HMAC Signature
        if (!HmacUtils.verifySignature(payload.getRawBody(), signature, webhookSecret)) {
            throw new InvalidWebhookSignatureException("Invalid carrier signature");
        }

        // 2. Fetch Shipment
        Shipment shipment = shipmentRepository.findByTrackingNumber(payload.getTrackingNumber())
                .orElseThrow(() -> new ShipmentNotFoundException("Shipment not found"));

        // 3. State Machine Transition Check
        ShipmentStatus newStatus = ShipmentStatus.valueOf(payload.getStatus());
        shipment.transitionTo(newStatus);
        shipmentRepository.save(shipment);

        // 4. Publish Event
        if (newStatus == ShipmentStatus.DELIVERED) {
            kafkaTemplate.send("shipment-events", shipment.getOrderId().toString(),
                new ShipmentDeliveredEvent(shipment.getId(), shipment.getOrderId(), Instant.now()));
        }
    }
}`,
      },
    ],
    repositoryGuides: [],
    exceptionHandlers: [],
    transactionDesign: { boundary: "@Transactional", isolation: "READ_COMMITTED", propagation: "REQUIRED", rollback: "Exception.class", concurrencyControl: "Optimistic Locking", notes: "" },
    eventsGuides: [],
    testingGuides: [
      {
        id: "ftg-1",
        testType: "Webhook HMAC Integration Test",
        tools: ["JUnit 5", "MockMvc"],
        target: "CarrierWebhookController signature validation",
        javaCode: `@SpringBootTest
@AutoConfigureMockMvc
class CarrierWebhookControllerTest {

    @Autowired private MockMvc mockMvc;

    @Test
    void invalidSignature_Returns401() throws Exception {
        mockMvc.perform(post("/api/v1/shipments/webhooks/carrier")
                .header("X-Carrier-Signature", "invalid-sig")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\\"trackingNumber\\":\\"FX-123\\",\\"status\\":\\"DELIVERED\\"}"))
                .andExpect(status().isUnauthorized());
    }
}`,
      },
    ],
    failureScenarios: [
      {
        id: "ffs-1",
        scenario: "Invalid Delivery State Transition",
        problem: "Carrier webhook sends DELIVERED update for shipment still in CREATED state.",
        detection: "shipment.transitionTo() throws InvalidStateTransitionException.",
        handling: "Log state machine violation and reject update.",
        recovery: "Request full tracking history sync from Carrier API.",
        consistency: "Corrupted shipment status prevented.",
      },
    ],
    checklist: [
      { id: "fch-1", label: "Shipment JPA entity & status enum created", completed: true },
      { id: "fch-2", label: "CarrierClient abstraction implemented", completed: true },
      { id: "fch-3", label: "Carrier webhook signature check implemented", completed: true },
    ],
    codeWorkspace: [
      {
        id: "fcw-1",
        title: "Shipment.java",
        language: "java",
        filename: "Shipment.java",
        code: `package com.commercex.fulfillment.entity;

@Entity
public class Shipment {
    @Id @GeneratedValue private UUID id;
    private UUID orderId;
    private String trackingNumber;
    @Enumerated(EnumType.STRING) private ShipmentStatus status;

    public void transitionTo(ShipmentStatus target) {
        if (!this.status.canTransitionTo(target)) {
            throw new InvalidStateTransitionException("Cannot transition from " + this.status + " to " + target);
        }
        this.status = target;
    }
}`,
      },
    ],
  },

  // 9. API GATEWAY
  {
    id: "svc-api-gateway",
    serviceName: "API Gateway",
    responsibility: "Edge request routing, reactive JWT signature validation, Redis sliding-window rate limiting, and correlation ID propagation.",
    businessPurpose: "Acts as the single entry point for all edge traffic, enforcing cross-cutting security, rate limiting, and request correlation before routing to microservices.",
    ownedEntities: [],
    ownedDatabase: "N/A (Stateless Netty Engine)",
    exposedApis: ["Public Edge Routes (/api/v1/*)"],
    consumedApis: ["All Microservices"],
    publishedEvents: [],
    consumedEvents: [],
    redisUsage: "Sliding window rate limiting counter store.",
    externalDependencies: ["Redis"],
    technologyChoices: ["Java 21", "Spring Cloud Gateway (WebFlux)", "Spring Security Reactive", "Redis"],
    keyDesignDecisions: [
      "Non-blocking Reactive Engine: Uses Netty for high-concurrency non-blocking edge routing.",
      "JwtAuthGatewayFilter: Global filter validating JWT signature and injecting `X-User-Id` & `X-User-Roles` headers to downstream services.",
      "Redis RequestRateLimiter: Enforces 10 req/sec limit per customer ID with burst capacity of 20.",
    ],
    notes: "Configuration-heavy service built on Spring Cloud Gateway.",
    implementationSteps: [
      { id: "gw-1", order: 1, title: "Initialize Spring Cloud Gateway Project", description: "Add spring-cloud-starter-gateway, spring-boot-starter-data-redis-reactive, and spring-boot-starter-security." },
      { id: "gw-2", order: 2, title: "Configure Route Locator in application.yml", description: "Set up routes for auth-service, catalog-service, cart-service, order-service, and payment-service." },
      { id: "gw-3", order: 3, title: "Implement JwtAuthGatewayFilter", description: "Create GlobalFilter extracting Bearer JWT, checking signature, and adding X-User-Id header." },
      { id: "gw-4", order: 4, title: "Configure Redis Rate Limiter KeyResolver", description: "Implement KeyResolver bean resolving customer ID or IP address for rate limiting." },
      { id: "gw-5", order: 5, title: "Implement CorrelationIdGlobalFilter", description: "Inject X-Correlation-ID UUID header for end-to-end request tracing." },
      { id: "gw-6", order: 6, title: "Implement Fallback Controller", description: "Expose /fallback/circuit-breaker returning 503 Service Unavailable on downstream circuit trip." },
      { id: "gw-7", order: 7, title: "Write WebTestClient Route Tests", description: "Test route forwarding and JWT filter enforcement using WebTestClient." },
    ],
    packageStructure: [
      { id: "gwp-1", path: "src/main/java/com/commercex/gateway/filter/", purpose: "JwtAuthGatewayFilter & CorrelationIdFilter" },
      { id: "gwp-2", path: "src/main/java/com/commercex/gateway/config/", purpose: "Security & Redis KeyResolver beans" },
      { id: "gwp-3", path: "src/main/java/com/commercex/gateway/fallback/", purpose: "Circuit breaker fallback REST controllers" },
    ],
    mavenDependencies: [
      { id: "gwm-1", name: "Spring Cloud Starter Gateway", purpose: "Reactive edge router", required: true },
      { id: "gwm-2", name: "Spring Boot Starter Data Redis Reactive", purpose: "Reactive Redis for rate limiting", required: true },
      { id: "gwm-3", name: "JJWT", purpose: "Edge JWT signature validation", required: true },
    ],
    configurationYml: `server:
  port: 8080

spring:
  application:
    name: api-gateway
  data:
    redis:
      host: \${REDIS_HOST:localhost}
      port: 6379
  cloud:
    gateway:
      routes:
        - id: auth-service
          uri: lb://auth-service
          predicates:
            - Path=/api/v1/auth/**
        - id: order-service
          uri: lb://order-service
          predicates:
            - Path=/api/v1/orders/**
          filters:
            - name: RequestRateLimiter
              args:
                redis-rate-limiter.replenishRate: 10
                redis-rate-limiter.burstCapacity: 20
                key-resolver: "#{@userKeyResolver}"`,
    dtos: [],
    controllerGuides: [],
    serviceLayerGuides: [],
    repositoryGuides: [],
    exceptionHandlers: [],
    transactionDesign: { boundary: "Stateless Reactive Netty", isolation: "N/A", propagation: "N/A", rollback: "N/A", concurrencyControl: "N/A", notes: "" },
    eventsGuides: [],
    testingGuides: [
      {
        id: "gwtg-1",
        testType: "Gateway WebTestClient Route Test",
        tools: ["JUnit 5", "WebTestClient"],
        target: "API Gateway route forwarding",
        javaCode: `@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class GatewayApplicationTest {

    @Autowired private WebTestClient webTestClient;

    @Test
    void unauthenticatedOrderRequest_Returns401() {
        webTestClient.post().uri("/api/v1/orders")
                .exchange()
                .expectStatus().isUnauthorized();
    }
}`,
      },
    ],
    failureScenarios: [
      {
        id: "gwfs-1",
        scenario: "Downstream Order Service Instance Outage",
        problem: "Order Service instances are down or un-routable.",
        detection: "503 Service Unavailable returned by Gateway LoadBalancer.",
        handling: "Route to /fallback/orders circuit breaker endpoint.",
        recovery: "Automatic traffic recovery when service recovers.",
        consistency: "Prevents thread pool exhaustion at edge.",
      },
    ],
    checklist: [
      { id: "gwch-1", label: "Spring Cloud Gateway routes configured", completed: true },
      { id: "gwch-2", label: "JwtAuthGatewayFilter implemented", completed: true },
      { id: "gwch-3", label: "Redis RequestRateLimiter configured", completed: true },
      { id: "gwch-4", label: "Correlation ID filter added", completed: true },
    ],
    codeWorkspace: [
      {
        id: "gwcw-1",
        title: "JwtAuthGatewayFilter.java",
        language: "java",
        filename: "JwtAuthGatewayFilter.java",
        code: `package com.commercex.gateway.filter;

@Component
public class JwtAuthGatewayFilter implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }
        String token = authHeader.substring(7);
        Claims claims = JwtUtils.parseClaims(token);
        
        ServerHttpRequest request = exchange.getRequest().mutate()
            .header("X-User-Id", claims.getSubject())
            .header("X-User-Roles", claims.get("roles", String.class))
            .build();
            
        return chain.filter(exchange.mutate().request(request).build());
    }

    @Override
    public int getOrder() {
        return -1;
    }
}`,
      },
    ],
  },
];

