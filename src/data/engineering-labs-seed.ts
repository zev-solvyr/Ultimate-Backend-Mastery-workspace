import type { EngineeringLab } from "@/types";

export const defaultEngineeringLabs: Record<string, EngineeringLab> = {
  // =========================================================================
  // LAB 1: DISTRIBUTED RATE LIMITER
  // =========================================================================
  "rate-limiter": {
    id: "rate-limiter",
    title: "Distributed Rate Limiter",
    shortDescription: "Design and build a horizontally scalable API rate-limiting system using Redis.",
    problemStatement: "High-volume API clients and scraper bots can exhaust backend thread pools and database connections. Building a single-instance rate limiter fails when multiple application instances run behind a load balancer. Design a distributed, low-latency rate-limiting engine using Redis that executes atomic decisions, prevents race conditions, and handles Redis latency without crashing backend APIs.",
    interviewRelevance: "★★★★★ (Sliding Window Logs, Atomic Lua Scripts, Redis Fail-Open, Concurrency)",
    relevanceRating: 5,
    difficulty: "Advanced",
    estimatedScope: "2 - 3 Days",
    primarySkills: ["Redis", "Distributed Systems", "Atomic Operations", "TTL", "API Protection", "Concurrency", "Scaling"],
    overview: "Design a distributed API rate limiter that operates consistently across multiple application nodes behind a load balancer without race conditions or database locks.",
    requirements: {
      business: [
        "Protect downstream backend microservices and databases from API traffic spikes and scraper bots.",
        "Support granular tier-based rate limits for authenticated users, IP addresses, and specific API endpoints.",
        "Enforce fair API resource allocation across multi-tenant clients.",
      ],
      functional: [
        "Support per-user rate limits (e.g., 100 requests/minute for FREE tier, 1,000 for PRO tier).",
        "Support per-IP rate limits for unauthenticated public endpoints.",
        "Support endpoint-specific override limits (e.g., 5 requests/minute on /api/v1/auth/login).",
        "Return HTTP 429 Too Many Requests with standard Retry-After and X-RateLimit-* response headers.",
        "Execute sliding-window log or sliding-window counter decision logic atomically in Redis via Lua scripts.",
      ],
      nonFunctional: [
        "Latency: Rate-limiting evaluation must add < 2ms p99 overhead to incoming API requests.",
        "Throughput: Handle up to 20,000 evaluations per second on a single Redis node.",
        "Resilience: Fail-open circuit breaker policy allowing traffic if Redis becomes unreachable, preventing total system outage.",
        "Accuracy: Zero race conditions during concurrent requests from the same user across multiple application instances.",
      ],
    },
    technologies: [
      { category: "Backend", technology: "Java 21 + Spring Cloud Gateway / WebFlux", where: "API Gateway edge filter", why: "Provides non-blocking reactive filter execution before routing to internal services." },
      { category: "Datastore", technology: "Redis (Standalone / Cluster)", where: "Sliding-window counters & atomic locks", why: "In-memory data structures with sub-millisecond atomic Lua execution." },
      { category: "Resilience", technology: "Resilience4j", where: "Gateway circuit breaker", why: "Enforces fail-open fallback if Redis ping latency exceeds 10ms." },
      { category: "Observability", technology: "Prometheus + Grafana", where: "Rate limit metric exporter", why: "Tracks rate limit rejection rates (HTTP 429) and Redis latency." },
    ],
    architecture: {
      overview: "Edge Gateway filter intercepts incoming HTTP requests, computes client rate-limiting keys, and executes an atomic Redis Lua script to determine acceptance.",
      components: [
        { name: "API Gateway Filter", responsibility: "Extracts client IP / JWT user ID, resolves policy, and calls Redis", why: "Centralized edge enforcement" },
        { name: "Redis Key-Value Cluster", responsibility: "Stores sliding-window timestamps and atomic request counters with TTL", why: "In-memory atomic storage" },
        { name: "Policy Configuration Store", responsibility: "Externalized rate-limit policies reloaded dynamically without service restart", why: "Dynamic policy management" },
        { name: "Fall-Open Circuit Breaker", responsibility: "Bypasses rate-limiter check if Redis connection drops or times out", why: "High-availability protection" },
      ],
      communication: ["Client -> API Gateway (HTTP)", "API Gateway -> Redis (Jedis / Lettuce via EVAL Lua script)"],
      keyDecisions: [
        { decision: "Sliding Window Log via Redis Sorted Sets (ZSET)", reason: "Accurately counts requests across overlapping time windows without boundary burst spikes", tradeOff: "Slightly higher Redis memory utilization compared to Fixed Window" },
        { decision: "Fail-Open Fallback Policy", reason: "Prevents a Redis cluster failure from bringing down all business API endpoints", tradeOff: "Temporarily allows excess traffic during Redis outages" },
      ],
    },
    modules: [
      { name: "Request Identity Resolver", purpose: "Extracts rate-limiting key (IP, API Key, or User ID) from HTTP headers.", responsibilities: ["Resolve IP for public routes", "Extract JWT sub/tenantId for auth routes"], designConcerns: ["X-Forwarded-For spoofing prevention behind reverse proxies"] },
      { name: "Redis Rate Limit Evaluator", purpose: "Executes atomic Lua script to evaluate and record request timestamps.", responsibilities: ["Execute ZREMRANGEBYSCORE and ZCARD in one roundtrip", "Set key TTL"], designConcerns: ["Sub-millisecond Lua script execution"] },
      { name: "HTTP 429 Header Filter", purpose: "Injects X-RateLimit-Limit, X-RateLimit-Remaining, and Retry-After headers.", responsibilities: ["Calculate remaining tokens and retry delay seconds"], designConcerns: ["Standard RFC 6585 compliance"] },
    ],
    dataDesign: {
      databases: [
        {
          name: "Redis Rate Limit Store",
          type: "Redis In-Memory Key-Value",
          purpose: "Sliding window timestamp logs stored in Redis Sorted Sets.",
          tables: [
            {
              name: "ratelimit:{key}:{windowSeconds}",
              purpose: "Sorted set storing request epoch timestamps as member & score",
              primaryKey: "ratelimit:{key}",
              columns: ["member: UUID/epochMs", "score: double (epochMs)"],
              indexes: ["ZREMRANGEBYSCORE", "ZADD", "ZCARD"],
            },
          ],
        },
      ],
    },
    apiDesign: {
      apis: [
        { method: "GET / POST", path: "/api/v1/*", purpose: "Protected API routes fronted by rate-limiter filter", requestFields: ["X-API-Key / Authorization / IP"], response: "200 OK / 429 Too Many Requests", errors: ["429 TOO_MANY_REQUESTS"] },
      ],
    },
    eventDesign: {
      events: [
        { name: "RateLimitExceededEvent", producer: "API Gateway", consumers: ["Security Analytics"], payload: ["key", "clientIp", "limit", "timestamp"], impact: "Triggers IP block if 429 threshold is abused repeatedly." },
      ],
    },
    securityReliability: {
      security: ["Sanitize X-Forwarded-For headers to prevent client IP spoofing.", "Obfuscate internal user IDs in rate-limit Redis keys using SHA-256 hashes."],
      reliability: ["Fail-open circuit breaker with 10ms timeout.", "Expiring Redis key TTLs to prevent memory leaks from abandoned keys."],
      observability: ["Export rate_limit_hits_total and rate_limit_rejections_total counters to Prometheus."],
    },
    engineeringChallenges: [
      { challenge: "Concurrent requests from the same user hit two different API Gateway instances at the exact same millisecond.", expectedDesignConcern: "Prevent race conditions without distributed locks.", mitigationStrategy: "Execute atomic Redis Lua script (EVAL) performing timestamp insertion and count check in a single atomic thread." },
      { challenge: "Redis cluster becomes unresponsive or suffers high network latency.", expectedDesignConcern: "Avoid blocking application threads during backend API calls.", mitigationStrategy: "Implement Resilience4j circuit breaker with a 10ms execution timeout that fails open." },
      { challenge: "Burst of traffic occurs right at the boundary of a fixed time window.", expectedDesignConcern: "Fixed window counter allows 2x limit across window boundaries.", mitigationStrategy: "Use Sliding Window Log algorithm in Redis Sorted Sets to evaluate rolling windows." },
    ],
    buildPlan: [
      { phaseNumber: 1, title: "Phase 1 — Policy & Request Identity Resolution", goal: "Define rate limit policies and request identity resolver.", whatToBuild: ["RequestKeyResolver interface", "IP and JWT extractor filters", "RateLimitPolicy configuration beans"], engineeringDecision: "Sanitize X-Forwarded-For headers behind proxies.", expectedOutcome: "Identifies request keys accurately." },
      { phaseNumber: 2, title: "Phase 2 — Redis Key Strategy & Atomic Lua Scripting", goal: "Design atomic sliding window Lua script.", whatToBuild: ["Sliding window Lua script", "Jedis/Lettuce ScriptExecutor", "TTL auto-expiration logic"], engineeringDecision: "Execute ZREMRANGEBYSCORE and ZCARD in a single Lua invocation.", expectedOutcome: "Sub-millisecond atomic evaluation." },
      { phaseNumber: 3, title: "Phase 3 — Gateway Filter Integration", goal: "Enforce HTTP 429 and response headers.", whatToBuild: ["RateLimitingGatewayFilter", "Header injector for X-RateLimit-*", "HTTP 429 response renderer"], engineeringDecision: "Return standard RFC 6585 headers.", expectedOutcome: "Gateway blocks excess requests." },
      { phaseNumber: 4, title: "Phase 4 — Fail-Open Circuit Breaker", goal: "Protect API availability during Redis outages.", whatToBuild: ["Resilience4j CircuitBreaker fallback", "Fail-open exception handler", "Redis health check metric"], engineeringDecision: "Fail open rather than failing closed to preserve core uptime.", expectedOutcome: "APIs remain accessible if Redis fails." },
      { phaseNumber: 5, title: "Phase 5 — Prometheus Telemetry & Gatling Load Testing", goal: "Validate performance under 20,000 req/sec load.", whatToBuild: ["Micrometer metrics for 429s and Redis latency", "Gatling load test script", "Grafana rate-limiting dashboard"], engineeringDecision: "Track p99 latency under concurrency.", expectedOutcome: "Verified sub-2ms evaluation overhead." },
    ],
    interviewDiscussion: {
      elevatorPitch: "This lab is a distributed rate limiter built using Redis and atomic Lua scripts. It enforces sliding-window rate limits across multi-tenant API clients with sub-2ms overhead while utilizing fail-open circuit breakers to prevent API outages during Redis network degradation.",
      prompts: [
        { topic: "Concurrency", question: "Why did you use a Redis Lua script instead of multiple Redis commands (ZADD, ZCARD, EXPIRE)?", discussionPoints: ["Redis executes Lua scripts atomically in a single thread", "Eliminates race conditions between checking count and adding timestamp", "Reduces network roundtrips from 3 to 1"] },
        { topic: "Algorithm Comparison", question: "Compare Token Bucket vs Sliding Window Log vs Leaky Bucket algorithms.", discussionPoints: ["Token Bucket: Good for bursts, low memory", "Sliding Window Log: Precise, prevents boundary spikes, higher memory", "Leaky Bucket: Smooths traffic, introduces queuing delay"] },
        { topic: "Failure Handling", question: "What happens when your Redis cluster fails completely?", discussionPoints: ["Discuss fail-open vs fail-closed security trade-offs", "Explain Resilience4j 10ms timeout fallback", "Detail logging security alerts while allowing legitimate API traffic"] },
      ],
    },
  },

  // =========================================================================
  // LAB 2: INVENTORY RESERVATION SYSTEM
  // =========================================================================
  "inventory-reservation": {
    id: "inventory-reservation",
    title: "Inventory Reservation System",
    shortDescription: "Build a high-concurrency stock reservation engine with optimistic locking and expiring holds.",
    problemStatement: "During flash sales, thousands of customers attempt to checkout the last remaining units of stock simultaneously. Standard database updates without locking cause overselling, while naive pessimistic row locking causes thread pool starvation. Build a high-throughput inventory reservation engine using PostgreSQL optimistic locking, expiring holds, idempotency guards, and event publishing.",
    interviewRelevance: "★★★★★ (Optimistic Locking, DB Check Constraints, Idempotency, Expiring Sweeper, Outbox)",
    relevanceRating: 5,
    difficulty: "Advanced",
    estimatedScope: "3 - 4 Days",
    primarySkills: ["PostgreSQL", "Spring Boot", "Transactions", "Optimistic Locking", "Race Conditions", "Idempotency", "Expiring Holds", "Kafka"],
    overview: "Design an atomic inventory reservation engine that prevents overselling during high-concurrency flash sales, enforces expiring stock holds, and emits domain events for payment capture.",
    requirements: {
      business: [
        "Guarantee zero overselling during flash sale checkout surges.",
        "Automatically release reserved stock back to available inventory if payment is not completed within 15 minutes.",
        "Provide exact-once reservation guarantees for retried API checkout attempts.",
      ],
      functional: [
        "Reserve stock for line items atomically using Optimistic Concurrency Control (@Version).",
        "Enforce PostgreSQL check constraint (available_quantity >= 0) at database level.",
        "Maintain an expiring holds table with a background sweeper releasing unpaid reservations.",
        "Enforce mandatory Idempotency-Key headers on reservation API calls.",
        "Publish StockReservedEvent and StockReservationExpiredEvent to Kafka.",
      ],
      nonFunctional: [
        "Consistency: Strong ACID consistency per warehouse stock record; eventual consistency for expired hold releases.",
        "Throughput: Handle 500 reservation attempts/sec on single-node PostgreSQL setup.",
        "Resilience: Recover gracefully from optimistic lock version collisions without corrupting stock totals.",
      ],
    },
    technologies: [
      { category: "Backend", technology: "Java 21 + Spring Boot 3.3", where: "Inventory service runtime", why: "Spring Data JPA @Version support and declarative @Transactional management." },
      { category: "Database", technology: "PostgreSQL", where: "Inventory & Holds DB", why: "ACID guarantees, row-level locking, and CHECK (available_quantity >= 0) constraints." },
      { category: "Messaging", technology: "Apache Kafka", where: "Domain event propagation", why: "Asynchronous notification of stock reservations and expirations." },
    ],
    architecture: {
      overview: "Spring Boot Inventory Service handles checkout reservation calls with Optimistic Locking, updates PostgreSQL atomic holds, and publishes Kafka outbox events.",
      components: [
        { name: "Reservation Controller", responsibility: "Enforces Idempotency-Key header and handles API requests", why: "Edge validation" },
        { name: "Stock Lock Engine", responsibility: "Executes optimistic lock stock deductions and inserts reservation hold rows", why: "Concurrency control" },
        { name: "Expiring Hold Sweeper", responsibility: "Scheduled background job releasing reservations older than 15 minutes", why: "Inventory recovery" },
        { name: "Transactional Outbox Publisher", responsibility: "Reliably dispatches StockReservedEvent to Kafka", why: "Zero message loss" },
      ],
      communication: ["Order Service -> Inventory Service (REST)", "Inventory Service -> Kafka (StockReservedEvent)"],
      keyDecisions: [
        { decision: "Optimistic Locking (@Version) over Pessimistic Locking (FOR UPDATE)", reason: "Prevents database thread starvation during high-concurrency read/write surges", tradeOff: "Requires application-level retry handling on version collision" },
        { decision: "PostgreSQL CHECK (available_quantity >= 0) Constraint", reason: "Hard safety barrier preventing negative stock even if application code fails", tradeOff: "Requires catching DataIntegrityViolationException" },
      ],
    },
    modules: [
      { name: "Reservation Coordinator", purpose: "Manages atomic reservation workflow.", responsibilities: ["Deduct available stock", "Create InventoryReservation row"], designConcerns: ["Deadlock avoidance on multi-item checkouts"] },
      { name: "Idempotency Manager", purpose: "Prevents duplicate reservations.", responsibilities: ["Check unique idempotency key index in PostgreSQL"], designConcerns: ["Fast key lookup"] },
      { name: "Expiring Hold Sweeper", purpose: "Reclaims unpaid stock.", responsibilities: ["Find expired reservations and update stock"], designConcerns: ["Batch update size to prevent DB lock escalation"] },
    ],
    dataDesign: {
      databases: [
        {
          name: "Inventory DB",
          type: "PostgreSQL",
          purpose: "Stores physical stock counts and reservation holds.",
          tables: [
            { name: "inventory", purpose: "Stock levels per SKU", primaryKey: "product_id", columns: ["product_id: UUID", "available_quantity: INT", "reserved_quantity: INT", "version: BIGINT"], indexes: ["idx_inventory_product"] },
            { name: "inventory_reservation", purpose: "Expiring stock holds", primaryKey: "id", columns: ["id: UUID", "product_id: UUID", "order_id: UUID", "quantity: INT", "status: VARCHAR", "expires_at: TIMESTAMP"], indexes: ["idx_res_expires_status"] },
          ],
        },
      ],
    },
    apiDesign: {
      apis: [
        { method: "POST", path: "/api/v1/inventory/reservations", purpose: "Reserve stock for order", requestFields: ["orderId", "productId", "quantity"], response: "{ reservationId, expiresAt, status: 'RESERVED' }", errors: ["409 INSUFFICIENT_STOCK", "409 CONCURRENT_UPDATE"] },
      ],
    },
    eventDesign: {
      events: [
        { name: "StockReservedEvent", producer: "Inventory Service", consumers: ["Order Service", "Payment Service"], payload: ["reservationId", "orderId", "productId", "quantity"], impact: "Proceeds with payment authorization." },
      ],
    },
    securityReliability: {
      security: ["Service-to-service mTLS authentication."],
      reliability: ["Optimistic locking retry loop (up to 3 retries on ObjectOptimisticLockingFailureException).", "Database check constraints on non-negative quantities."],
      observability: ["Export stock_reservations_total and expired_holds_released_total metrics to Prometheus."],
    },
    engineeringChallenges: [
      { challenge: "Two customers attempt to reserve the last unit of a product simultaneously.", expectedDesignConcern: "Prevent stock from becoming negative while maintaining acceptable throughput.", mitigationStrategy: "Combine JPA @Version optimistic locking with PostgreSQL CHECK (available_quantity >= 0) constraint." },
      { challenge: "Client retries the same reservation request due to a network timeout.", expectedDesignConcern: "Prevent duplicate stock deductions through idempotency.", mitigationStrategy: "Store reservation requests in a table with a unique idempotency_key constraint." },
      { challenge: "Reservation expires while payment is actively completing.", expectedDesignConcern: "Define state transition and consistency behavior for race conditions between payment and sweeper.", mitigationStrategy: "Use atomic state transition (RESERVED -> CONFIRMED) and verify status before sweeper releases hold." },
    ],
    buildPlan: [
      { phaseNumber: 1, title: "Phase 1 — Domain Model & DB Schema", goal: "Define inventory tables and check constraints.", whatToBuild: ["Inventory and InventoryReservation entities", "Flyway migration scripts with CHECK constraints"], engineeringDecision: "Enforce available_quantity >= 0 at DB level.", expectedOutcome: "Schema created with hard safety constraints." },
      { phaseNumber: 2, title: "Phase 2 — Optimistic Concurrency Control Engine", goal: "Implement atomic stock deduction.", whatToBuild: ["JPA @Version configuration", "Stock deduction method with retry wrapper"], engineeringDecision: "Retry up to 3 times on optimistic lock failure.", expectedOutcome: "Atomic stock deductions under concurrency." },
      { phaseNumber: 3, title: "Phase 3 — Idempotent Reservation API", goal: "Prevent duplicate reservations under network retries.", whatToBuild: ["Reservation REST controller", "Idempotency key repository"], engineeringDecision: "Use unique index on idempotency_key.", expectedOutcome: "Retried calls return original reservation response." },
      { phaseNumber: 4, title: "Phase 4 — Expiring Hold Sweeper", goal: "Reclaim stock from unpaid abandoned holds.", whatToBuild: ["@Scheduled background sweeper", "Batch hold release query"], engineeringDecision: "Process expired holds in batches of 100 to avoid lock escalation.", expectedOutcome: "Abandoned stock automatically reclaimed." },
      { phaseNumber: 5, title: "Phase 5 — Kafka Outbox Event Publishing", goal: "Publish StockReservedEvent reliably.", whatToBuild: ["Outbox event table and listener", "Kafka publisher worker"], engineeringDecision: "Use Transactional Outbox pattern.", expectedOutcome: "Zero event loss during DB transactions." },
      { phaseNumber: 6, title: "Phase 6 — High Concurrency Stress Testing", goal: "Verify zero overselling under 500 concurrent users.", whatToBuild: ["JMeter / Gatling concurrency test", "Collision metrics exporter"], engineeringDecision: "Assert final stock count never falls below zero.", expectedOutcome: "100% accurate stock counts under load." },
    ],
    interviewDiscussion: {
      elevatorPitch: "This lab is a high-concurrency inventory reservation engine built with Spring Boot and PostgreSQL. It enforces zero overselling using optimistic locking (@Version) and database check constraints, while reclaiming abandoned stock via 15-minute expiring holds.",
      prompts: [
        { topic: "Locking Strategies", question: "Why choose Optimistic Locking over Pessimistic SELECT FOR UPDATE for flash sales?", discussionPoints: ["Pessimistic locking holds DB connections open while waiting for row locks", "Optimistic locking fails fast and retries in memory, preserving connection pool availability", "Check constraints provide a absolute safety backstop"] },
        { topic: "Expiring Holds", question: "How do you handle the race condition where a payment succeeds at the exact millisecond the 15-minute hold sweeper runs?", discussionPoints: ["Use conditional SQL update (UPDATE inventory_reservation SET status='CONFIRMED' WHERE status='RESERVED')", "Sweeper checks status='RESERVED' AND expires_at < NOW()", "DB row lock prevents simultaneous state modification"] },
      ],
    },
  },

  // =========================================================================
  // LAB 3: NOTIFICATION PLATFORM
  // =========================================================================
  "notification-platform": {
    id: "notification-platform",
    title: "Notification Platform",
    shortDescription: "Build a multi-channel notification engine with Kafka consumer groups, DLTs, and provider retries.",
    problemStatement: "Modern microservice platforms generate thousands of asynchronous events (order confirmations, shipping updates, security alerts) that require multi-channel dispatch (Email, SMS, Push). Third-party providers suffer rate limits, network outages, and duplicate event redeliveries. Design a resilient event-driven notification platform that processes Kafka event streams with idempotent consumers, exponential backoff retries, and Dead Letter Topics.",
    interviewRelevance: "★★★★☆ (Kafka Consumer Groups, Deduplication, DLT, Exponential Backoff, Provider Isolation)",
    relevanceRating: 4,
    difficulty: "Intermediate",
    estimatedScope: "2 - 3 Days",
    primarySkills: ["Kafka", "Event-Driven Architecture", "Consumer Groups", "Retry", "Dead Letter Topics", "Idempotent Consumers", "Email/SMS Providers", "Failure Recovery"],
    overview: "Build a resilient, high-throughput notification routing engine that consumes Kafka domain events, dispatches multi-channel email/SMS messages via third-party providers, and isolates provider failures.",
    requirements: {
      business: [
        "Reliably deliver transactional customer notifications via Email and SMS.",
        "Prevent duplicate notification sends when Kafka rebalances consumer groups.",
        "Ensure third-party provider outages do not block core event stream ingestion.",
      ],
      functional: [
        "Consume domain events (OrderCreated, ShipmentDispatched) from Kafka topics.",
        "Render personalized notification templates using Thymeleaf or Mustache.",
        "Dispatch messages to external providers (SendGrid, Twilio) with rate-limit compliance.",
        "Deduplicate inbound events using a persistent notification delivery audit log.",
        "Route failed events to a Dead Letter Topic (DLT) after 3 exponential backoff retries.",
      ],
      nonFunctional: [
        "Throughput: Process 2,000 notifications per second across multi-partition Kafka topics.",
        "Resilience: Provider rate limits (HTTP 429) or timeouts (504) must trigger non-blocking retries.",
        "Auditability: Maintain delivery status history (PENDING, SENT, FAILED, DLT) for every event.",
      ],
    },
    technologies: [
      { category: "Backend", technology: "Java 21 + Spring Boot 3.3", where: "Kafka Consumer microservice", why: "Spring Kafka listener container support and retry template abstractions." },
      { category: "Messaging", technology: "Apache Kafka", where: "Event bus & Dead Letter Topics", why: "Partitioned consumer groups for parallel event processing." },
      { category: "Database", technology: "PostgreSQL", where: "Notification audit log & deduplication DB", why: "Unique event_id indexing to guarantee idempotency." },
      { category: "External Providers", technology: "SendGrid / Twilio SDKs", where: "Email & SMS delivery", why: "Industry-standard delivery provider APIs." },
    ],
    architecture: {
      overview: "Kafka Consumer Groups consume domain events, verify uniqueness against PostgreSQL audit table, render templates, and dispatch to external provider APIs with DLT fallback.",
      components: [
        { name: "Kafka Event Listener", responsibility: "Consumes messages from domain topics with manual ACK mode", why: "Reliable stream consumption" },
        { name: "Idempotency Auditor", responsibility: "Checks PostgreSQL notification_log table for event_id uniqueness", why: "Prevents duplicate sends" },
        { name: "Template Engine", responsibility: "Populates HTML/text email templates with event payload data", why: "Personalization" },
        { name: "Provider Dispatcher & DLT Router", responsibility: "Calls SendGrid/Twilio with Resilience4j retries and routes to DLT on failure", why: "Fault isolation" },
      ],
      communication: ["Kafka -> Notification Service (Consumer)", "Notification Service -> External APIs (HTTP REST)"],
      keyDecisions: [
        { decision: "Manual Immediate Acknowledgment Mode in Kafka Listener", reason: "Prevents offset auto-commit before external notification send is confirmed or queued in outbox", tradeOff: "Requires explicit acknowledgment handling in code" },
        { decision: "Partitioning Kafka Topics by Customer ID", reason: "Guarantees sequential order of notifications for a specific customer", tradeOff: "Hotspot potential if a single customer generates massive events" },
      ],
    },
    modules: [
      { name: "Kafka Consumer Container", purpose: "Reads domain event records.", responsibilities: ["Extract event payload and correlation ID"], designConcerns: ["Handling consumer group rebalance gracefully"] },
      { name: "Deduplication Store", purpose: "Verifies event delivery status.", responsibilities: ["Query and insert notification_log records"], designConcerns: ["High-index write throughput"] },
      { name: "Retry & DLT Handler", purpose: "Manages delivery failures.", responsibilities: ["Execute exponential backoff retries and publish to DLT"], designConcerns: ["Preventing blocking main consumer thread"] },
    ],
    dataDesign: {
      databases: [
        {
          name: "Notification DB",
          type: "PostgreSQL",
          purpose: "Audits notification delivery attempts and deduplication records.",
          tables: [
            { name: "notification_log", purpose: "Record of sent notifications", primaryKey: "id", columns: ["id: UUID", "event_id: VARCHAR", "customer_id: UUID", "channel: VARCHAR", "status: VARCHAR", "created_at: TIMESTAMP"], indexes: ["idx_notification_event_id"] },
          ],
        },
      ],
    },
    apiDesign: {
      apis: [
        { method: "GET", path: "/api/v1/notifications/history", purpose: "Query delivery log for customer", requestFields: ["customerId", "page"], response: "{ content: [ { eventId, channel, status, createdAt } ] }", errors: ["401 UNAUTHORIZED"] },
      ],
    },
    eventDesign: {
      events: [
        { name: "NotificationFailedDLTEvent", producer: "Notification Service", consumers: ["Operations Alerting"], payload: ["eventId", "reason", "retryCount"], impact: "Triggers PagerDuty operational alert for investigation." },
      ],
    },
    securityReliability: {
      security: ["Mask sensitive customer PII (phone numbers, emails) in application log files."],
      reliability: ["Exponential backoff retries (1s, 2s, 4s) before routing to DLT.", "Deduplication index on event_id."],
      observability: ["Prometheus counters for notifications_sent_total and notifications_dlt_total."],
    },
    engineeringChallenges: [
      { challenge: "Kafka rebalances consumer partitions during heavy deployment, causing duplicate record processing.", expectedDesignConcern: "Prevent sending duplicate emails/SMS to customers.", mitigationStrategy: "Store event_id with a UNIQUE constraint in PostgreSQL notification_log table before executing external API call." },
      { challenge: "Third-party email provider (SendGrid) rate-limits API calls with HTTP 429.", expectedDesignConcern: "Isolate provider rate limits from crashing consumer threads.", mitigationStrategy: "Wrap provider calls in a non-blocking retry template and route persistent 429 failures to a delayed retry Kafka queue." },
      { challenge: "A poisonous message with missing fields causes template rendering exceptions.", expectedDesignConcern: "Prevent poisonous messages from blocking the entire Kafka topic partition.", mitigationStrategy: "Catch deserialization and template exceptions immediately and forward record to DLT without retrying." },
    ],
    buildPlan: [
      { phaseNumber: 1, title: "Phase 1 — Kafka Listener & Consumer Setup", goal: "Set up multi-partition Kafka consumer container.", whatToBuild: ["Spring Kafka ConcurrentKafkaListenerContainerFactory", "Manual ACK handler", "Event DTO models"], engineeringDecision: "Configure MANUAL_IMMEDIATE ack mode.", expectedOutcome: "Consumes records without auto-committing offsets." },
      { phaseNumber: 2, title: "Phase 2 — Persistent Deduplication Engine", goal: "Prevent duplicate sends across consumer nodes.", whatToBuild: ["NotificationLog entity and unique index", "Deduplication check method"], engineeringDecision: "Use PostgreSQL unique index on event_id.", expectedOutcome: "Duplicate Kafka records ignored safely." },
      { phaseNumber: 3, title: "Phase 3 — Multi-Channel Provider Adapters", goal: "Integrate SendGrid and Twilio APIs.", whatToBuild: ["NotificationProvider interface", "EmailProvider and SmsProvider beans", "Thymeleaf template renderer"], engineeringDecision: "Externalize API keys in configuration properties.", expectedOutcome: "Renders and dispatches multi-channel messages." },
      { phaseNumber: 4, title: "Phase 4 — Exponential Backoff Retry & DLT Pipeline", goal: "Isolate transient API failures.", whatToBuild: ["DefaultErrorHandler with ExponentialBackoff", "Dead Letter Topic publisher", "DLT listener log"], engineeringDecision: "Retry 3 times before publishing to DLT.", expectedOutcome: "Failed messages routed safely to DLT." },
      { phaseNumber: 5, title: "Phase 5 — Metrics & Operational Alerting", goal: "Monitor delivery success and DLT rates.", whatToBuild: ["Micrometer metrics exporter", "Grafana notification dashboard", "DLT alert threshold configuration"], engineeringDecision: "Alert if DLT rate exceeds 1% of total volume.", expectedOutcome: "Real-time visibility into notification health." },
    ],
    interviewDiscussion: {
      elevatorPitch: "This lab is an event-driven notification engine built with Spring Kafka and PostgreSQL. It guarantees idempotent multi-channel delivery (Email/SMS) by deduplicating event IDs in PostgreSQL and isolates third-party provider failures using exponential backoff retries and Dead Letter Topics.",
      prompts: [
        { topic: "Idempotent Consumers", question: "Why isn't Kafka's exactly-once processing (EOS) sufficient to prevent duplicate emails?", discussionPoints: ["Kafka EOS only applies to Kafka-to-Kafka transactions", "Calling external HTTP APIs (SendGrid/Twilio) is outside Kafka's transaction boundary", "Application-level deduplication via a persistent database index is mandatory"] },
        { topic: "Dead Letter Topics", question: "How do you handle inspection and replay of messages routed to a DLT?", discussionPoints: ["Store original payload and exception stack trace in DLT record headers", "Expose admin REST endpoint to inspect and re-inject DLT messages back to primary topic", "Fix underlying bug before triggering replay"] },
      ],
    },
  },

  // =========================================================================
  // LAB 4: PAYMENT PROCESSING WORKFLOW
  // =========================================================================
  "payment-workflow": {
    id: "payment-workflow",
    title: "Payment Processing Workflow",
    shortDescription: "Design an audit-ready payment state machine with idempotency, outbox events, and webhooks.",
    problemStatement: "Financial transactions require zero tolerance for double-charging, lost events, or unhandled payment states. Synchronous HTTP calls to third-party payment gateways (Stripe/PayPal) can hang or time out, while asynchronous webhook callbacks can arrive out of order. Build a production-grade payment state machine with client idempotency keys, Transactional Outbox pattern, HMAC webhook verification, and background reconciliation.",
    interviewRelevance: "★★★★★ (Payment State Machine, Transactional Outbox, Idempotency Keys, HMAC Webhooks, Reconciliation)",
    relevanceRating: 5,
    difficulty: "Expert",
    estimatedScope: "4 - 5 Days",
    primarySkills: ["Payment State Machine", "Idempotency", "Webhooks", "Transactional Outbox", "Kafka", "External Provider Failure", "Reconciliation", "Retry", "Saga"],
    overview: "Design an audit-ready payment processing pipeline that integrates external payment gateways safely without remote HTTP calls inside database transactions, prevents double-charging, and handles asynchronous webhook callbacks.",
    requirements: {
      business: [
        "Process customer payments with strict zero double-charging guarantees.",
        "Maintain a complete, immutable audit trail of every payment state transition.",
        "Reconcile pending payment states automatically if webhook delivery fails.",
      ],
      functional: [
        "Manage Payment State Machine (INITIATED -> AUTHORIZED -> CAPTURED -> FAILED / REFUNDED).",
        "Enforce mandatory Idempotency-Key headers on payment submission endpoints.",
        "Execute external gateway calls OUTSIDE local database @Transactional methods.",
        "Publish payment state domain events reliably using the Transactional Outbox Pattern.",
        "Verify HMAC SHA-256 signatures on inbound provider webhooks.",
        "Execute background reconciliation sweeper querying Stripe API for hung PENDING payments.",
      ],
      nonFunctional: [
        "Consistency: Strong ACID transactions for payment status updates.",
        "Security: Zero plaintext credit card storage (PCI-DSS compliance via payment method tokens).",
        "Resilience: Survived network disconnections during gateway API calls without state corruption.",
      ],
    },
    technologies: [
      { category: "Backend", technology: "Java 21 + Spring Boot 3.3", why: "Spring StateMachine or explicit enum state transition engine." },
      { category: "Database", technology: "PostgreSQL", why: "ACID isolation, unique idempotency constraints, and outbox event table." },
      { category: "Messaging", technology: "Apache Kafka", why: "Decoupled asynchronous notification of payment captures to Order and Fulfillment services." },
      { category: "Payment Gateway", technology: "Stripe API SDK", why: "External payment intent authorization and capture adapter." },
    ],
    architecture: {
      overview: "Payment Service manages payment state transitions in PostgreSQL, delegates external API calls to Stripe without wrapping in DB transactions, and publishes Outbox events to Kafka.",
      components: [
        { name: "Payment Controller", responsibility: "Validates idempotency keys and initiates payment intents", why: "Idempotent API entry" },
        { name: "Payment State Machine", responsibility: "Validates allowed state transitions (e.g. INITIATED -> AUTHORIZED)", why: "Domain state integrity" },
        { name: "Outbox Publisher Worker", responsibility: "Polls outbox_event table and dispatches PaymentCapturedEvent to Kafka", why: "Zero event loss" },
        { name: "Webhook Handler & Verifier", responsibility: "Validates HMAC signatures and updates payment state asynchronously", why: "Asynchronous provider callbacks" },
        { name: "Reconciliation Sweeper", responsibility: "Polls Stripe API for payments stuck in PENDING status > 10 minutes", why: "State recovery" },
      ],
      communication: ["Client -> Payment Service (REST)", "Payment Service -> Stripe API (HTTP SDK)", "Payment Service -> Kafka (Outbox Event)"],
      keyDecisions: [
        { decision: "Executing Gateway HTTP Calls Outside @Transactional Methods", reason: "Prevents remote network latency from holding database connections open and exhausting connection pools", tradeOff: "Requires explicit state reconciliation if app crashes after HTTP call but before DB update" },
        { decision: "HMAC SHA-256 Webhook Signature Verification", reason: "Guarantees inbound webhook calls originated from Stripe and were not forged", tradeOff: "Requires storing webhook signing secrets securely" },
      ],
    },
    modules: [
      { name: "Payment State Engine", purpose: "Enforces valid status transitions.", responsibilities: ["Validate state transitions", "Audit transition history"], designConcerns: ["State locking"] },
      { name: "Outbox Event Manager", purpose: "Guarantees event publishing.", responsibilities: ["Write event to outbox_event table in same DB transaction"], designConcerns: ["Transactional consistency"] },
      { name: "Reconciliation Job", purpose: "Recovers hung payments.", responsibilities: ["Query Stripe API and update status"], designConcerns: ["Rate limiting Stripe API queries"] },
    ],
    dataDesign: {
      databases: [
        {
          name: "Payment DB",
          type: "PostgreSQL",
          purpose: "Payment intent records, idempotency keys, and outbox events.",
          tables: [
            { name: "payment", purpose: "Payment records", primaryKey: "id", columns: ["id: UUID", "order_id: UUID", "idempotency_key: VARCHAR", "amount: DECIMAL(15,2)", "status: VARCHAR", "provider_payment_id: VARCHAR"], indexes: ["idx_payment_idempotency", "idx_payment_status"] },
            { name: "outbox_event", purpose: "Transactional outbox events", primaryKey: "id", columns: ["id: UUID", "aggregate_type: VARCHAR", "payload: TEXT", "status: VARCHAR"], indexes: ["idx_outbox_status"] },
          ],
        },
      ],
    },
    apiDesign: {
      apis: [
        { method: "POST", path: "/api/v1/payments", purpose: "Create and authorize payment intent", requestFields: ["orderId", "amount", "currency", "paymentMethodToken"], response: "{ paymentId, status: 'AUTHORIZED', providerPaymentId }", errors: ["402 CARD_DECLINED", "409 IDEMPOTENCY_CONFLICT"] },
        { method: "POST", path: "/api/v1/payments/webhooks/stripe", purpose: "Handle Stripe webhook events", requestFields: ["X-Stripe-Signature", "payload"], response: "{ received: true }", errors: ["401 INVALID_SIGNATURE"] },
      ],
    },
    eventDesign: {
      events: [
        { name: "PaymentCapturedEvent", producer: "Payment Service", consumers: ["Order Service", "Fulfillment Service"], payload: ["paymentId", "orderId", "amount", "providerPaymentId"], impact: "Marks order as PAID and triggers shipment." },
      ],
    },
    securityReliability: {
      security: ["Use Stripe payment tokens; zero raw PCI data stored.", "HMAC SHA-256 webhook signature verification."],
      reliability: ["Transactional Outbox pattern for event publishing.", "Background reconciliation sweeper for hung payments."],
      observability: ["Prometheus metrics for payment_authorized_total and payment_failed_total."],
    },
    engineeringChallenges: [
      { challenge: "A user submits a payment request, but their mobile network drops while the Stripe API call is executing.", expectedDesignConcern: "Prevent double-charging when the client retries the request.", mitigationStrategy: "Enforce unique idempotency_key in PostgreSQL and pass the key directly to Stripe PaymentIntent creation." },
      { challenge: "The database commits a payment status update to AUTHORIZED, but the server crashes before sending the event to Kafka.", expectedDesignConcern: "Eliminate dual-write inconsistencies between PostgreSQL and Kafka.", mitigationStrategy: "Use Transactional Outbox Pattern to insert OutboxEvent in the same database transaction." },
      { challenge: "Stripe sends a webhook callback indicating payment success, but network delays cause it to arrive 20 minutes late.", expectedDesignConcern: "Handle out-of-order webhook delivery safely.", mitigationStrategy: "Check current payment status in DB before processing webhook; ignore webhooks if status is already CAPTURED or REFUNDED." },
    ],
    buildPlan: [
      { phaseNumber: 1, title: "Phase 1 — Payment State Machine & Domain Model", goal: "Define payment entities and state transitions.", whatToBuild: ["Payment entity and PaymentStatus enum", "State transition validator engine", "Flyway DB migration"], engineeringDecision: "Model explicit state transition rules.", expectedOutcome: "Enforces valid status movements." },
      { phaseNumber: 2, title: "Phase 2 — Idempotence Layer", goal: "Prevent double-charging under network retries.", whatToBuild: ["IdempotencyKey filter & repository", "Unique index enforcement"], engineeringDecision: "Return original response for duplicate idempotency keys.", expectedOutcome: "Retried API calls safely return existing payment." },
      { phaseNumber: 3, title: "Phase 3 — External Gateway Integration", goal: "Integrate Stripe SDK without DB transaction leaks.", whatToBuild: ["StripePaymentAdapter bean", "Non-transactional service boundaries"], engineeringDecision: "Execute Stripe API calls outside @Transactional methods.", expectedOutcome: "Prevents DB pool exhaustion during HTTP latency." },
      { phaseNumber: 4, title: "Phase 4 — Transactional Outbox Pattern", goal: "Guarantee zero event loss.", whatToBuild: ["OutboxEvent entity & repository", "Scheduled OutboxPublisher worker", "Kafka event publisher"], engineeringDecision: "Write outbox event in same DB transaction as payment status.", expectedOutcome: "Guaranteed event publishing to Kafka." },
      { phaseNumber: 5, title: "Phase 5 — Webhook HMAC Signature Handler", goal: "Process Stripe asynchronous callbacks.", whatToBuild: ["Webhook REST controller", "HMAC SHA-256 signature verifier", "Deduplication index"], engineeringDecision: "Reject webhooks with invalid signatures immediately.", expectedOutcome: "Secure asynchronous webhook processing." },
      { phaseNumber: 6, title: "Phase 6 — Reconciliation Sweeper", goal: "Recover payments stuck in PENDING status.", whatToBuild: ["@Scheduled background reconciliation job", "Stripe API status query worker"], engineeringDecision: "Query Stripe API for PENDING payments older than 10 minutes.", expectedOutcome: "Automatic self-healing of hung payment states." },
      { phaseNumber: 7, title: "Phase 7 — Fault Injection & Stress Testing", goal: "Verify resilience against network drops and duplicate webhooks.", whatToBuild: ["Simulated network delay test", "Duplicate webhook injection script"], engineeringDecision: "Assert zero double-charges and 100% outbox event delivery.", expectedOutcome: "Audit-proof payment processing." },
    ],
    interviewDiscussion: {
      elevatorPitch: "This lab is an audit-ready payment processing workflow built with Spring Boot, PostgreSQL, and Stripe. It prevents double-charging via client idempotency keys, eliminates dual-write loss using the Transactional Outbox pattern, and self-heals using a background reconciliation sweeper.",
      prompts: [
        { topic: "Database Transaction Boundaries", question: "Why shouldn't you wrap external Stripe API calls inside Spring's @Transactional annotation?", discussionPoints: ["Remote HTTP calls take 200ms - 5000ms", "Holding a DB transaction open holds a database connection from the HikariCP pool", "100 slow Stripe API calls will exhaust a 100-connection pool and crash all application endpoints"] },
        { topic: "Dual-Write Problem", question: "How does the Transactional Outbox pattern solve dual-write inconsistencies between PostgreSQL and Kafka?", discussionPoints: ["Writing to DB and publishing to Kafka in one method can fail if Kafka is down", "Outbox pattern writes event to outbox_event table in the SAME local DB transaction", "OutboxPublisher worker polls outbox table and dispatches to Kafka with at-least-once semantics"] },
      ],
    },
  },

  // =========================================================================
  // LAB 5: URL SHORTENER
  // =========================================================================
  "url-shortener": {
    id: "url-shortener",
    title: "URL Shortener",
    shortDescription: "Build a high-throughput, read-heavy URL shortener with Base62 encoding and Redis Cache-Aside.",
    problemStatement: "URL shorteners (like Bitly) handle extreme read-to-write ratios (100:1) with strict sub-10ms redirection latency targets. Design a scalable URL shortener using Base62 encoding, unique short code generation, Redis Cache-Aside read caching, and click analytics tracking.",
    interviewRelevance: "★★★★☆ (Base62 Encoding, Cache-Aside, Read-Heavy Scaling, Unique Constraints, HTTP Redirects)",
    relevanceRating: 4,
    difficulty: "Intermediate",
    estimatedScope: "1 - 2 Days",
    primarySkills: ["REST APIs", "PostgreSQL", "Redis", "Hash/Key Generation", "Caching", "Read-Heavy Architecture", "Unique Constraints", "Scaling"],
    overview: "Build a high-throughput, read-heavy URL shortener service capable of generating unique 7-character short codes and redirecting users with sub-10ms latency using Redis Cache-Aside.",
    requirements: {
      business: [
        "Shorten long URLs into compact 7-character short links.",
        "Deliver sub-10ms redirection latency for popular viral links.",
        "Track click count analytics and access timestamps.",
      ],
      functional: [
        "Encode internal auto-increment IDs or UUID hashes into Base62 strings (a-z, A-Z, 0-9).",
        "Serve HTTP 302 Found or HTTP 301 Moved Permanently redirects.",
        "Cache short-code to long-URL mappings in Redis using the Cache-Aside pattern.",
        "Enforce database unique constraint on short_code column.",
        "Asynchronously increment click counts using Redis atomic INCR.",
      ],
      nonFunctional: [
        "Latency: p99 < 10ms for cached short link redirects.",
        "Throughput: Handle 10,000 read requests/sec.",
        "Storage: Support 100 million shortened URL records.",
      ],
    },
    technologies: [
      { category: "Backend", technology: "Java 21 + Spring Boot 3.3", why: "REST controllers and RedisTemplate integration." },
      { category: "Database", technology: "PostgreSQL", why: "Persistent relational storage with unique index on short_code." },
      { category: "Cache", technology: "Redis", why: "Sub-millisecond read caching for short-code lookup." },
    ],
    architecture: {
      overview: "Client submits short link to API Gateway, which checks Redis Cache-Aside; on cache hit, returns HTTP 302 redirect immediately; on cache miss, queries PostgreSQL and populates Redis.",
      components: [
        { name: "Redirect Controller", responsibility: "Resolves short code and returns HTTP 302 Location header", why: "Fast redirection" },
        { name: "Base62 Encoder", responsibility: "Converts auto-increment sequence ID to 7-char Base62 string", why: "Unique code generation" },
        { name: "Redis Cache-Aside Layer", responsibility: "Caches short_code -> long_url key-value mappings", why: "Sub-10ms latency" },
        { name: "Async Analytics Worker", responsibility: "Increments click counters in Redis and flushes to PostgreSQL", why: "Non-blocking analytics" },
      ],
      communication: ["Client -> Shortener Service (HTTP GET /{shortCode})", "Shortener Service -> Redis (GET)", "Shortener Service -> PostgreSQL (SELECT on miss)"],
      keyDecisions: [
        { decision: "HTTP 302 Found vs HTTP 301 Moved Permanently", reason: "HTTP 302 forces browser to call shortener server every time, allowing accurate click analytics tracking", tradeOff: "Higher server load compared to browser-cached HTTP 301" },
        { decision: "Base62 Encoding over Random Hash Slicing", reason: "Base62 conversion of a unique 64-bit ID guarantees zero collisions", tradeOff: "Short codes are sequential unless ID sequence is obfuscated/countered" },
      ],
    },
    modules: [
      { name: "Base62 Service", purpose: "Encodes and decodes Base62 strings.", responsibilities: ["Convert Long to Base62 string"], designConcerns: ["62-character alphabet lookup"] },
      { name: "Cache Manager", purpose: "Manages Redis short URL cache.", responsibilities: ["Get/Put short_code keys"], designConcerns: ["TTL expiration strategy"] },
    ],
    dataDesign: {
      databases: [
        {
          name: "URL Shortener DB",
          type: "PostgreSQL",
          purpose: "Stores long URL mappings and click counts.",
          tables: [
            { name: "shortened_url", purpose: "URL mappings", primaryKey: "id", columns: ["id: BIGINT", "short_code: VARCHAR(10)", "long_url: TEXT", "click_count: BIGINT", "created_at: TIMESTAMP"], indexes: ["idx_short_code"] },
          ],
        },
      ],
    },
    apiDesign: {
      apis: [
        { method: "POST", path: "/api/v1/shorten", purpose: "Create short URL", requestFields: ["longUrl"], response: "{ shortCode, shortUrl, longUrl }", errors: ["400 INVALID_URL"] },
        { method: "GET", path: "/{shortCode}", purpose: "Redirect to long URL", requestFields: ["shortCode"], response: "302 Found (Location: longUrl)", errors: ["404 NOT_FOUND"] },
      ],
    },
    eventDesign: {
      events: [
        { name: "UrlClickedEvent", producer: "Shortener Service", consumers: ["Analytics Engine"], payload: ["shortCode", "userAgent", "timestamp"], impact: "Tracks geo and device analytics." },
      ],
    },
    securityReliability: {
      security: ["Validate long URL format and block malicious internal IP redirects (SSRF protection)."],
      reliability: ["Redis Cache-Aside read fallbacks to PostgreSQL on cache miss."],
      observability: ["Prometheus metrics for redirect_requests_total and cache_hit_ratio."],
    },
    engineeringChallenges: [
      { challenge: "High volume of read traffic causes database connection pool exhaustion on popular links.", expectedDesignConcern: "Maintain sub-10ms response time for viral links.", mitigationStrategy: "Populate Redis Cache-Aside with long TTL (e.g. 7 days) and LRU eviction policy." },
      { challenge: "Two requests attempt to create a short code for different URLs using the same generated code.", expectedDesignConcern: "Prevent duplicate short code assignments.", mitigationStrategy: "Base62 encode a unique DB sequence ID or use atomic Redis INCR to guarantee unique IDs before encoding." },
    ],
    buildPlan: [
      { phaseNumber: 1, title: "Phase 1 — Base62 Encoding & Entity Schema", goal: "Implement Base62 codec and PostgreSQL schema.", whatToBuild: ["Base62Encoder utility", "ShortenedUrl JPA entity", "Unique index on short_code"], engineeringDecision: "Use 62-character alphabet (0-9, a-z, A-Z).", expectedOutcome: "Guaranteed unique short code generation." },
      { phaseNumber: 2, title: "Phase 2 — REST Shorten & Redirect Controllers", goal: "Build core shortener and HTTP 302 redirect endpoint.", whatToBuild: ["Shorten URL POST endpoint", "GET /{shortCode} redirect controller"], engineeringDecision: "Return HTTP 302 Found to allow click analytics tracking.", expectedOutcome: "Functional shortener and redirection." },
      { phaseNumber: 3, title: "Phase 3 — Redis Cache-Aside Layer", goal: "Achieve sub-10ms redirect latency.", whatToBuild: ["Redis Cache-Aside lookups", "Cache eviction on update"], engineeringDecision: "Store short_code -> long_url in Redis String keys.", expectedOutcome: "Sub-10ms read response time on cache hit." },
      { phaseNumber: 4, title: "Phase 4 — Click Analytics & Metric Exporter", goal: "Track link clicks asynchronously.", whatToBuild: ["Redis INCR click counter worker", "Batch DB update flusher"], engineeringDecision: "Flush click counts to PostgreSQL in background batch jobs.", expectedOutcome: "Non-blocking click analytics tracking." },
      { phaseNumber: 5, title: "Phase 5 — Read-Heavy Gatling Benchmark", goal: "Validate 10,000 req/sec throughput.", whatToBuild: ["Gatling simulation script", "Grafana latency dashboard"], engineeringDecision: "Assert p99 latency < 10ms.", expectedOutcome: "Verified read-heavy scalability." },
    ],
    interviewDiscussion: {
      elevatorPitch: "This lab is a high-throughput URL shortener service built with Spring Boot, PostgreSQL, and Redis. It generates unique 7-character short links via Base62 encoding and delivers sub-10ms HTTP 302 redirects using Redis Cache-Aside caching.",
      prompts: [
        { topic: "HTTP Status Codes", question: "Why choose HTTP 302 Found instead of HTTP 301 Moved Permanently for URL redirects?", discussionPoints: ["HTTP 301 allows browser to cache redirect locally, bypassing server on future clicks", "HTTP 302 forces browser to hit shortener server, allowing accurate click analytics", "302 is preferred when click counts and tracking are business requirements"] },
        { topic: "Collision Avoidance", question: "How do you guarantee short code uniqueness at scale?", discussionPoints: ["Base62 encoding a unique 64-bit auto-increment sequence ID guarantees 0 collisions", "Hashing approaches (MD5/SHA-256) require truncation and collision retry loops", "Database UNIQUE constraint acts as absolute safety guard"] },
      ],
    },
  },

  // =========================================================================
  // LAB 6: DISTRIBUTED JOB / TASK PROCESSING SYSTEM
  // =========================================================================
  "job-processing": {
    id: "job-processing",
    title: "Distributed Job / Task Processing System",
    shortDescription: "Build an asynchronous background job processing engine with worker heartbeats and DLQs.",
    problemStatement: "Long-running background tasks (PDF generation, data exports, video encoding) cannot be executed synchronously inside web request threads. Worker nodes processing background jobs can crash mid-execution, experience network partitions, or become overwhelmed by sudden job bursts. Design a distributed background job processing engine with worker pool heartbeats, backpressure controls, Dead Letter Queues, and automatic job recovery.",
    interviewRelevance: "★★★★★ (Worker Pools, Heartbeat Recovery, Backpressure, DLQ, Idempotency, Scheduling)",
    relevanceRating: 5,
    difficulty: "Advanced",
    estimatedScope: "3 - 4 Days",
    primarySkills: ["Kafka or RabbitMQ", "Worker Architecture", "Job States", "Retry", "Dead Letter Queue", "Scheduling", "Backpressure", "Idempotency", "Worker Failure Recovery"],
    overview: "Design a distributed background job execution platform that schedules asynchronous tasks, manages worker node heartbeats, handles backpressure, and retries failed jobs idempotently.",
    requirements: {
      business: [
        "Offload heavy background tasks from web APIs to scalable worker pools.",
        "Guarantee job execution even if individual worker nodes crash mid-job.",
        "Isolate failing or malformed job payloads to a Dead Letter Queue (DLQ).",
      ],
      functional: [
        "Manage Job State Machine (SUBMITTED -> IN_PROGRESS -> COMPLETED / FAILED -> DLQ).",
        "Workers periodically send heartbeat pings to Redis to maintain active lease.",
        "Re-queue IN_PROGRESS jobs if worker heartbeat expires (> 30 seconds).",
        "Enforce thread pool backpressure using Bounded Queues and CallerRunsPolicy.",
        "Route jobs to Dead Letter Queue (DLQ) after 3 failed execution attempts.",
      ],
      nonFunctional: [
        "Scalability: Support horizontal worker node scaling based on queue depth.",
        "Reliability: Zero job loss during worker pod restarts or crashes.",
        "Concurrency: Thread pool backpressure preventing OutOfMemory errors.",
      ],
    },
    technologies: [
      { category: "Backend", technology: "Java 21 + Spring Boot 3.3", why: "ThreadPoolTaskExecutor and scheduled background workers." },
      { category: "Message Broker", technology: "RabbitMQ / Kafka", why: "Work queue distribution and Dead Letter Exchanges." },
      { category: "State & Heartbeat Store", technology: "Redis", why: "Sub-second TTL worker heartbeat tracking and job state locks." },
      { category: "Database", technology: "PostgreSQL", why: "Persistent job execution history and audit logs." },
    ],
    architecture: {
      overview: "API submits jobs to RabbitMQ work queue; worker nodes pull jobs, execute tasks within ThreadPoolExecutor, update Redis heartbeats, and persist completion status in PostgreSQL.",
      components: [
        { name: "Job Producer API", responsibility: "Validates and submits job requests to work queue", why: "Task submission entry" },
        { name: "RabbitMQ Work Queue", responsibility: "Distributes tasks across active worker instances", why: "Decoupled work distribution" },
        { name: "Worker Execution Pool", responsibility: "Executes task logic inside bounded thread pools with heartbeats", why: "Task execution" },
        { name: "Heartbeat & Recovery Sweeper", responsibility: "Re-queues jobs from crashed workers whose heartbeats expired", why: "Fault recovery" },
        { name: "Dead Letter Queue (DLQ)", responsibility: "Stores repeatedly failing jobs for manual investigation", why: "Poisonous task isolation" },
      ],
      communication: ["Client -> Producer API (REST)", "Producer API -> RabbitMQ (BasicPublish)", "Worker -> RabbitMQ (BasicConsume)"],
      keyDecisions: [
        { decision: "Bounded Thread Pool Queues with CallerRunsPolicy", reason: "Prevents worker node OutOfMemory errors during sudden job submission bursts", tradeOff: "Slows down producer thread when queue reaches max capacity" },
        { decision: "Redis TTL Worker Heartbeat Leases", reason: "Detects crashed worker nodes within 30 seconds without expensive database polling", tradeOff: "Requires periodic heartbeat thread in worker nodes" },
      ],
    },
    modules: [
      { name: "Job Execution Engine", purpose: "Executes background task callable.", responsibilities: ["Run task logic", "Update job status"], designConcerns: ["Catching Throwable exceptions"] },
      { name: "Worker Heartbeat Service", purpose: "Signals worker node health.", responsibilities: ["Refresh Redis TTL key every 10s"], designConcerns: ["Background thread failure"] },
      { name: "Failure Recovery Sweeper", purpose: "Reclaims abandoned jobs.", responsibilities: ["Re-queue lost jobs"], designConcerns: ["Preventing double execution"] },
    ],
    dataDesign: {
      databases: [
        {
          name: "Job Execution DB",
          type: "PostgreSQL",
          purpose: "Persistent job history and execution logs.",
          tables: [
            { name: "job_execution", purpose: "Job records", primaryKey: "id", columns: ["id: UUID", "job_type: VARCHAR", "status: VARCHAR", "worker_id: VARCHAR", "retry_count: INT", "created_at: TIMESTAMP"], indexes: ["idx_job_status"] },
          ],
        },
      ],
    },
    apiDesign: {
      apis: [
        { method: "POST", path: "/api/v1/jobs", purpose: "Submit background job", requestFields: ["jobType", "payload"], response: "{ jobId, status: 'SUBMITTED' }", errors: ["400 INVALID_PAYLOAD"] },
        { method: "GET", path: "/api/v1/jobs/{id}", purpose: "Get job status and result", requestFields: ["id"], response: "{ jobId, status, result, retryCount }", errors: ["404 JOB_NOT_FOUND"] },
      ],
    },
    eventDesign: {
      events: [
        { name: "JobFailedDLQEvent", producer: "Worker Engine", consumers: ["PagerDuty Alerting"], payload: ["jobId", "jobType", "errorTrace"], impact: "Alerts engineers to inspect poisonous payload." },
      ],
    },
    securityReliability: {
      security: ["Sanitize job payload input parameters."],
      reliability: ["ThreadPool backpressure queues.", "Dead Letter Queue routing after 3 retries."],
      observability: ["Prometheus metrics for active_worker_threads and queue_depth."],
    },
    engineeringChallenges: [
      { challenge: "A worker pod crashes mid-execution while processing a 10-minute video encoding job.", expectedDesignConcern: "Detect worker death and recover the unfinished job without manual intervention.", mitigationStrategy: "Workers send Redis heartbeats every 10s; a background recovery sweeper detects missing heartbeats and re-queues lost jobs." },
      { challenge: "A poisonous job payload causes the worker execution thread to throw NullPointerException repeatedly.", expectedDesignConcern: "Prevent a single poisonous job from infinite retry loops.", mitigationStrategy: "Increment retry_count on each failure and route job to Dead Letter Queue (DLQ) when retry_count >= 3." },
    ],
    buildPlan: [
      { phaseNumber: 1, title: "Phase 1 — Job Entity & State Machine", goal: "Define job model and status state transitions.", whatToBuild: ["JobExecution JPA entity", "JobStatus enum (SUBMITTED, IN_PROGRESS, COMPLETED, FAILED, DLQ)"], engineeringDecision: "Persist job audit history in PostgreSQL.", expectedOutcome: "Job state transition rules enforced." },
      { phaseNumber: 2, title: "Phase 2 — Work Queue & Dispatch Infrastructure", goal: "Set up RabbitMQ work queue topology.", whatToBuild: ["RabbitMQ Direct Exchange & Work Queue", "JobProducer API service"], engineeringDecision: "Configure persistent message delivery mode.", expectedOutcome: "Jobs queued reliably." },
      { phaseNumber: 3, title: "Phase 3 — Worker Thread Pool & Backpressure", goal: "Implement bounded worker execution pool.", whatToBuild: ["ThreadPoolTaskExecutor with Bounded Queue", "CallerRunsPolicy rejection handler"], engineeringDecision: "Prevent OOM with bounded queues.", expectedOutcome: "Worker node absorbs job bursts safely." },
      { phaseNumber: 4, title: "Phase 4 — Redis Heartbeat & Recovery Sweeper", goal: "Detect crashed worker nodes.", whatToBuild: ["WorkerHeartbeat thread sending Redis SETEX", "Recovery Sweeper re-queueing lost jobs"], engineeringDecision: "Set heartbeat TTL to 30 seconds.", expectedOutcome: "Crashed worker jobs automatically re-queued." },
      { phaseNumber: 5, title: "Phase 5 — DLQ Routing & Poisonous Job Handling", goal: "Isolate recurring job failures.", whatToBuild: ["DLQ Exchange & Queue", "Max retry threshold checker"], engineeringDecision: "Route to DLQ after 3 failures.", expectedOutcome: "Poisonous jobs isolated without stopping queue." },
      { phaseNumber: 6, title: "Phase 6 — Worker Crash & Fault Injection Testing", goal: "Verify resilience during worker pod kill.", whatToBuild: ["Worker process kill test script", "Grafana queue monitoring dashboard"], engineeringDecision: "Assert zero lost jobs after worker kill.", expectedOutcome: "100% fault-tolerant job execution." },
    ],
    interviewDiscussion: {
      elevatorPitch: "This lab is a distributed job processing system built with Spring Boot, RabbitMQ, and Redis. It handles asynchronous background task execution, manages worker node heartbeats to recover crashed jobs, and applies thread pool backpressure to prevent memory exhaustion.",
      prompts: [
        { topic: "Backpressure", question: "How do you prevent worker nodes from suffering OutOfMemory errors when 100,000 jobs are submitted in one minute?", discussionPoints: ["Use ThreadPoolExecutor with a bounded ArrayBlockingQueue", "Configure RejectedExecutionHandler to CallerRunsPolicy or throw 429 to client", "Scale worker pod instances horizontally based on queue depth metrics"] },
        { topic: "Worker Recovery", question: "How do you know if a worker node died versus a long-running job just taking extra time?", discussionPoints: ["Workers send heartbeats to Redis every 10 seconds with a 30s TTL", "If heartbeat key expires, worker is declared dead and its IN_PROGRESS jobs are re-queued", "Use fencing tokens on job completion to prevent late workers from overwriting results"] },
      ],
    },
  },

  // =========================================================================
  // LAB 7: DISTRIBUTED LOCK SERVICE
  // =========================================================================
  "distributed-lock": {
    id: "distributed-lock",
    title: "Distributed Lock Service",
    shortDescription: "Build a distributed locking library using Redis, atomic Lua scripts, and fencing tokens.",
    problemStatement: "When multiple microservice application instances execute critical section logic (such as daily batch billing or scheduled report generation), standard Java synchronized locks fail because they only synchronize threads within a single JVM. Design a distributed locking library using Redis, atomic Lua scripts, auto-renewal lease threads, and fencing tokens to prevent race conditions across distributed nodes.",
    interviewRelevance: "★★★★★ (Distributed Locking, Redlock, Lua Scripts, Fencing Tokens, Lease Expiration, Race Conditions)",
    relevanceRating: 5,
    difficulty: "Expert",
    estimatedScope: "2 - 3 Days",
    primarySkills: ["Redis", "Distributed Locking", "Redlock Algorithm", "Lua Scripts", "Lease Expiration", "Fencing Tokens", "Failure Scenarios", "Concurrency"],
    overview: "Implement a distributed locking library using Redis and atomic Lua scripts that prevents concurrent execution across multiple application instances while mitigating lease expiration bugs using fencing tokens.",
    requirements: {
      business: [
        "Prevent duplicate execution of critical background jobs across multi-instance server deployments.",
        "Guarantee lock release even if an application node crashes while holding a lock.",
        "Expose a clean Java AutoCloseable interface for developer lock usage (`try (DistributedLock lock = ...)`).",
      ],
      functional: [
        "Acquire lock atomically in Redis using SET key value NX PX ttl.",
        "Release lock atomically using a Lua script verifying lock owner UUID before calling DEL.",
        "Implement lock lease auto-renewal thread (watchdog timer) extending TTL while job executes.",
        "Generate monotonically increasing Fencing Tokens to invalidate stale writes at database level.",
      ],
      nonFunctional: [
        "Safety: Mutual exclusion guarantee — at most one node holds the lock at any time.",
        "Liveness: Deadlock free — expired TTL locks automatically release if node crashes.",
        "Performance: Lock acquisition latency < 3ms.",
      ],
    },
    technologies: [
      { category: "Backend", technology: "Java 21 + Redisson / Custom Redis Client", why: "Atomic Lua script execution and ScheduledExecutorService watchdog thread." },
      { category: "Datastore", technology: "Redis (Standalone / Cluster)", why: "In-memory atomic key-value operations with TTL." },
    ],
    architecture: {
      overview: "Application instances invoke the DistributedLock library, which executes atomic Lua scripts in Redis to acquire locks, start watchdog auto-renewal threads, and return fencing tokens.",
      components: [
        { name: "DistributedLock Manager", responsibility: "Provides Java Lock / AutoCloseable API to developers", why: "Developer abstraction" },
        { name: "Atomic Lua Executor", responsibility: "Executes acquire, release, and extend Lua scripts in Redis", why: "Atomicity" },
        { name: "Watchdog Auto-Renewal Thread", responsibility: "Periodically extends lock TTL while process thread is alive", why: "Prevents premature lock expiry" },
        { name: "Fencing Token Generator", responsibility: "Issues monotonically increasing sequence numbers with each lock acquisition", why: "Stale write protection" },
      ],
      communication: ["App Node A / B -> Redis (SET NX PX / EVAL Lua)"],
      keyDecisions: [
        { decision: "Atomic Owner UUID Verification on Lock Release", reason: "Prevents Node A from releasing a lock that has already expired and been acquired by Node B", tradeOff: "Requires Lua script instead of simple Redis DEL" },
        { decision: "Fencing Tokens for Database Writes", reason: "Protects against process pause (GC pause) where a thread wakes up after lock expiration and attempts DB write", tradeOff: "Database tables must check fencing_token > last_fencing_token" },
      ],
    },
    modules: [
      { name: "Lock Core", purpose: "Manages acquire/release lifecycle.", responsibilities: ["Call Redis SET NX PX"], designConcerns: ["Unique owner UUID per acquire call"] },
      { name: "Watchdog Engine", purpose: "Extends TTL for long jobs.", responsibilities: ["Schedule TTL renewal every TTL/3"], designConcerns: ["Stopping watchdog on lock close"] },
    ],
    dataDesign: {
      databases: [
        {
          name: "Redis Lock Store",
          type: "Redis Key-Value",
          purpose: "Stores lock owner UUIDs and TTL expiration.",
          tables: [
            { name: "lock:{resourceName}", purpose: "Distributed lock key", primaryKey: "lock:{resourceName}", columns: ["value: ownerUUID", "ttl: milliseconds"], indexes: ["SET NX PX", "EVAL Lua"] },
          ],
        },
      ],
    },
    apiDesign: {
      apis: [
        { method: "Java API", path: "DistributedLock.tryLock(resource, timeout, leaseTime)", purpose: "Acquire distributed lock", requestFields: ["resourceName", "waitTime", "leaseTime"], response: "{ acquired: true, fencingToken: 1042 }", errors: ["LOCK_ACQUISITION_TIMEOUT"] },
      ],
    },
    eventDesign: {
      events: [
        { name: "LockAcquisitionFailedEvent", producer: "Lock Manager", consumers: ["Metrics Exporter"], payload: ["resourceName", "nodeId", "waitTime"], impact: "Tracks lock contention spikes." },
      ],
    },
    securityReliability: {
      security: ["Use cryptographically secure random UUIDs for lock owner values."],
      reliability: ["Watchdog timer extending TTL every 10 seconds.", "Redlock multi-node quorum consensus."],
      observability: ["Prometheus metrics for lock_acquisition_latency_ms and lock_contention_total."],
    },
    engineeringChallenges: [
      { challenge: "Node A acquires a lock with a 30s TTL, suffers a Stop-The-World Full GC pause for 35 seconds, and then wakes up attempting to write to PostgreSQL.", expectedDesignConcern: "Prevent Node A from writing stale data after its lock expired and was acquired by Node B.", mitigationStrategy: "Generate a monotonically increasing Fencing Token on lock acquire; PostgreSQL rejects writes with fencing_token <= last_seen_token." },
      { challenge: "Node A attempts to release a lock, but its 30s TTL already expired and Node B acquired the lock.", expectedDesignConcern: "Prevent Node A from deleting Node B's lock.", mitigationStrategy: "Execute atomic Lua script on release: if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end." },
    ],
    buildPlan: [
      { phaseNumber: 1, title: "Phase 1 — Atomic Redis Lua Acquire & Release Scripts", goal: "Implement atomic Lua locking scripts.", whatToBuild: ["Redis SET NX PX acquire script", "Owner-verifying release Lua script"], engineeringDecision: "Pass unique UUID as lock value.", expectedOutcome: "Atomic lock acquisition and owner-safe release." },
      { phaseNumber: 2, title: "Phase 2 — Watchdog Auto-Renewal Engine", goal: "Prevent premature lock expiration during long tasks.", whatToBuild: ["Watchdog ScheduledExecutorService", "TTL renewal Lua script"], engineeringDecision: "Renew TTL every leaseTime / 3.", expectedOutcome: "Lock stays alive while worker thread executes." },
      { phaseNumber: 3, title: "Phase 3 — Java AutoCloseable Lock Wrapper", goal: "Expose clean Java try-with-resources API.", whatToBuild: ["DistributedLock implements AutoCloseable", "LockManager factory"], engineeringDecision: "Release lock automatically on try block exit.", expectedOutcome: "Clean developer usability." },
      { phaseNumber: 4, title: "Phase 4 — Fencing Token Integration", goal: "Protect DB writes against GC pauses.", whatToBuild: ["Atomic counter for fencing tokens in Redis", "DB write validator helper"], engineeringDecision: "Pass fencing token to DB UPDATE queries.", expectedOutcome: "Stale writes rejected by database." },
      { phaseNumber: 5, title: "Phase 5 — Distributed Concurrency & GC Simulation Test", goal: "Verify mutual exclusion under high thread contention.", whatToBuild: ["Multi-thread contention test script", "Simulated thread sleep GC pause test"], engineeringDecision: "Assert zero concurrent DB writes across 50 threads.", expectedOutcome: "100% mutual exclusion verified." },
    ],
    interviewDiscussion: {
      elevatorPitch: "This lab is a distributed locking library built with Redis and atomic Lua scripts. It enforces mutual exclusion across distributed microservices, auto-renews lock leases via watchdog threads, and protects database writes from GC pauses using fencing tokens.",
      prompts: [
        { topic: "Fencing Tokens", question: "What is a fencing token and why is a distributed lock alone insufficient to protect database writes?", discussionPoints: ["Explain Stop-The-World GC pauses or network delays causing a process to pause beyond lock TTL", "Process wakes up thinking it still owns lock and issues DB write", "Fencing token (monotonically increasing integer) causes DB to reject stale write (WHERE fencing_token > last_token)"] },
        { topic: "Redlock Algorithm", question: "How does the Redlock algorithm handle Redis master node crashes before replication completes?", discussionPoints: ["Standard Redis replication is asynchronous; master can crash before replicating lock to replica", "Redlock acquires lock independently across 5 N independent Redis masters", "Lock is considered acquired if majority (>= 3) nodes grant lock within timeout"] },
      ],
    },
  },

  // =========================================================================
  // LAB 8: SEARCH SERVICE
  // =========================================================================
  "search-service": {
    id: "search-service",
    title: "Search Service",
    shortDescription: "Build a full-text search and faceted filtering microservice with Elasticsearch and Kafka event sync.",
    problemStatement: "Relational database queries using LIKE '%term%' fail to scale for complex catalog search, full-text fuzzy matching, and multi-faceted filtering (category, price range, brand, rating). Design a high-performance Search microservice powered by Elasticsearch / OpenSearch that synchronizes data asynchronously from PostgreSQL using Kafka outbox events and supports zero-downtime index re-indexing.",
    interviewRelevance: "★★★★☆ (Elasticsearch DSL, Event-Driven Sync, Dual-Index Aliases, Faceted Filtering)",
    relevanceRating: 4,
    difficulty: "Advanced",
    estimatedScope: "3 - 4 Days",
    primarySkills: ["Elasticsearch/OpenSearch", "PostgreSQL", "Indexing", "Search Synchronization", "Full-Text Search", "Filtering", "Pagination", "Event-Driven Indexing"],
    overview: "Build a full-text search and faceted filtering microservice that synchronizes product data from PostgreSQL to Elasticsearch asynchronously via Kafka events.",
    requirements: {
      business: [
        "Deliver instant, fuzzy full-text product search with sub-50ms query response time.",
        "Support multi-faceted filtering (brand, category, price range, stock availability).",
        "Maintain eventual consistency between primary PostgreSQL catalog DB and Elasticsearch indices.",
      ],
      functional: [
        "Index product documents into Elasticsearch with custom analyzers (n-gram, lowercase, stemming).",
        "Synchronize PostgreSQL catalog changes to Elasticsearch via Kafka outbox consumers.",
        "Execute Elasticsearch Bool Queries combining match, term, and range filters with aggregations.",
        "Implement zero-downtime index re-indexing using Elasticsearch index aliases (product_v1 -> product_v2).",
      ],
      nonFunctional: [
        "Latency: p95 < 50ms for complex search and aggregation queries.",
        "Throughput: Handle 2,000 search queries per second.",
        "Consistency: Eventual sync lag < 1 second between DB write and search availability.",
      ],
    },
    technologies: [
      { category: "Backend", technology: "Java 21 + Spring Boot 3.3", why: "Spring Data Elasticsearch and Java High-Level REST Client." },
      { category: "Search Engine", technology: "Elasticsearch 8 / OpenSearch", why: "Inverted index, fuzzy text matching, and real-time faceted aggregations." },
      { category: "Database", technology: "PostgreSQL", why: "Primary transactional source of truth for product catalog." },
      { category: "Messaging", technology: "Apache Kafka", why: "Event-driven synchronization pipeline." },
    ],
    architecture: {
      overview: "Product updates in PostgreSQL emit Kafka events via Outbox; Search Sync Worker consumes events and updates Elasticsearch inverted indices; Search Controller serves REST queries.",
      components: [
        { name: "Search Controller", responsibility: "Processes REST search queries and executes Elasticsearch DSL searches", why: "Query entry" },
        { name: "Elasticsearch Cluster", responsibility: "Stores product documents in inverted indices and computes facets", why: "Full-text search engine" },
        { name: "Search Sync Worker", responsibility: "Consumes Kafka ProductUpdatedEvent records and updates Elasticsearch docs", why: "Asynchronous index sync" },
        { name: "Index Alias Manager", responsibility: "Swaps index aliases during schema migrations without downtime", why: "Zero-downtime maintenance" },
      ],
      communication: ["Client -> Search Service (REST)", "Search Sync Worker -> Kafka (Consumer)", "Search Service -> Elasticsearch (HTTP REST / Transport)"],
      keyDecisions: [
        { decision: "Event-Driven Async Sync over Direct Dual-Write in Catalog Service", reason: "Prevents Elasticsearch cluster latency from blocking primary catalog database transactions", tradeOff: "Brief eventual consistency lag before search index reflects DB changes" },
        { decision: "Elasticsearch Index Alias Pointer Pattern", reason: "Allows re-indexing millions of documents into a new index structure without downtime", tradeOff: "Requires managing alias pointer state" },
      ],
    },
    modules: [
      { name: "Search Query Builder", purpose: "Constructs Elasticsearch Bool Query DSL.", responsibilities: ["Build fuzzy match and filter queries", "Add terms aggregations for facets"], designConcerns: ["Preventing slow unindexed script queries"] },
      { name: "Index Sync Listener", purpose: "Keeps search index up-to-date.", responsibilities: ["Upsert product document in Elasticsearch"], designConcerns: ["Handling out-of-order event updates"] },
    ],
    dataDesign: {
      databases: [
        {
          name: "Elasticsearch Index",
          type: "Elasticsearch Inverted Index",
          purpose: "Full-text product search index with keyword facets.",
          tables: [
            { name: "products_v1 (alias: products)", purpose: "Product documents", primaryKey: "id", columns: ["id: keyword", "title: text (standard)", "description: text", "category_id: keyword", "price: double", "brand: keyword"], indexes: ["Inverted Index"] },
          ],
        },
      ],
    },
    apiDesign: {
      apis: [
        { method: "GET", path: "/api/v1/search", purpose: "Full-text search and faceted filtering", requestFields: ["q", "categoryId", "minPrice", "maxPrice", "brand", "page", "size"], response: "{ content: [ { id, title, price, brand } ], facets: { brands: [], categories: [] } }", errors: ["400 BAD_REQUEST"] },
      ],
    },
    eventDesign: {
      events: [
        { name: "ProductUpdatedEvent", producer: "Catalog Service", consumers: ["Search Service"], payload: ["productId", "title", "description", "price", "brand"], impact: "Updates document in Elasticsearch index." },
      ],
    },
    securityReliability: {
      security: ["Sanitize user search query strings to prevent Elasticsearch Query Injection."],
      reliability: ["Retries on Elasticsearch Bulk API indexing failures."],
      observability: ["Prometheus metrics for search_query_latency_ms and index_sync_lag_seconds."],
    },
    engineeringChallenges: [
      { challenge: "A network delay causes an older ProductUpdatedEvent (price=$50) to arrive after a newer event (price=$45).", expectedDesignConcern: "Prevent out-of-order events from overwriting fresh search index data.", mitigationStrategy: "Include version or updated_at timestamp in Elasticsearch document upsert parameters using external versioning." },
      { challenge: "Search index schema needs to change (e.g. adding edge-ngram analyzer) across 10 million products.", expectedDesignConcern: "Re-index millions of documents without search downtime.", mitigationStrategy: "Use Index Alias pointer (products -> products_v1); re-index into products_v2; atomically swap alias to products_v2." },
    ],
    buildPlan: [
      { phaseNumber: 1, title: "Phase 1 — Elasticsearch Index Mapping & Analyzers", goal: "Define index mapping with text analyzers.", whatToBuild: ["Elasticsearch index mapping JSON", "n-gram and lowercase analyzers"], engineeringDecision: "Configure keyword type for filter fields and text type for search fields.", expectedOutcome: "Optimized inverted index mapping created." },
      { phaseNumber: 2, title: "Phase 2 — Search Query Builder DSL", goal: "Build full-text and faceted search endpoint.", whatToBuild: ["SearchController REST endpoint", "Elasticsearch BoolQueryBuilder", "Faceted aggregations builder"], engineeringDecision: "Combine match query with filter clause for performance.", expectedOutcome: "Instant full-text search with facets." },
      { phaseNumber: 3, title: "Phase 3 — Asynchronous Kafka Index Sync Worker", goal: "Synchronize PostgreSQL changes to search index.", whatToBuild: ["Kafka ProductUpdatedEvent listener", "Elasticsearch bulk indexing worker"], engineeringDecision: "Use external versioning parameter on Elasticsearch upserts.", expectedOutcome: "Search index stays in sync with DB." },
      { phaseNumber: 4, title: "Phase 4 — Zero-Downtime Index Alias Swapper", goal: "Support schema migrations without downtime.", whatToBuild: ["IndexAliasService", "Re-index API runner", "Atomic alias swap script"], engineeringDecision: "Point application queries to alias rather than index name.", expectedOutcome: "Zero-downtime index re-indexing capability." },
      { phaseNumber: 5, title: "Phase 5 — Load & Sync Drift Benchmark", goal: "Validate sub-50ms latency under 2,000 req/sec.", whatToBuild: ["Gatling search load test", "Sync drift monitoring metric"], engineeringDecision: "Assert p95 search latency < 50ms.", expectedOutcome: "Verified search performance." },
    ],
    interviewDiscussion: {
      elevatorPitch: "This lab is a full-text search and faceted filtering microservice built with Spring Boot, Elasticsearch, and Kafka. It synchronizes catalog updates asynchronously from PostgreSQL, executes sub-50ms faceted DSL searches, and supports zero-downtime index migrations via alias swapping.",
      prompts: [
        { topic: "Elasticsearch vs SQL", question: "Why use Elasticsearch for product search instead of PostgreSQL LIKE queries or PostGIS?", discussionPoints: ["PostgreSQL LIKE '%term%' requires full table scans and cannot use B-Tree indexes efficiently", "Elasticsearch uses Inverted Indexes (mapping words to document IDs) for sub-50ms text lookups", "Elasticsearch provides native TF-IDF / BM25 relevance scoring and faceted aggregations"] },
        { topic: "Zero-Downtime Re-indexing", question: "How do you update Elasticsearch index mappings on 50 million documents without taking down customer search?", discussionPoints: ["Application queries alias 'products'", "Create new index 'products_v2' with updated mapping and re-index data in background", "Atomically swap alias 'products' from 'products_v1' to 'products_v2' via POST /_aliases"] },
      ],
    },
  },
};
